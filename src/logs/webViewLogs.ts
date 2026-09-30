import { Capacitor } from '@capacitor/core';

import type { GleapConsoleLogEntry, GleapLogConfig, GleapNetworkLogEntry } from '../definitions';

import { ConsoleCapture } from './consoleCapture';
import { NetworkCapture } from './networkCapture';
import type { RedactionRules } from './redaction';
import { createRedactionRules, isBlacklistedUrl, redactNetworkLogEntryOrStrip } from './redaction';
import { runOutsideZone } from './zone';

/** Pushes are batched: at most one per channel every PUSH_DELAY_MS. */
export const PUSH_DELAY_MS = 500;
/** A channel stops pushing after this many failed pushes in a row (e.g. an outdated native plugin). */
const MAX_FAILED_PUSHES = 3;
const GLOBAL_KEY = '__gleapWebViewLogCapture';

/** Plugin calls that can lead to a report: the latest logs are pushed right before them. */
const FLUSH_BEFORE_METHODS = [
  'sendSilentCrashReport',
  'open',
  'startFeedbackFlow',
  'startClassicForm',
  'startConversation',
  'openConversation',
  'openConversations',
  'startBot',
];

export interface LogTarget {
  attachConsoleLogs(options: { logs: GleapConsoleLogEntry[] }): Promise<unknown>;
  attachNetworkLogs(options: { logs: GleapNetworkLogEntry[] }): Promise<unknown>;
  addListener(eventName: 'logConfigLoaded', listenerFunc: (config: GleapLogConfig) => void): Promise<unknown>;
}

interface Channel {
  name: 'console' | 'network';
  isDirty: boolean;
  timer: ReturnType<typeof setTimeout> | null;
  failures: number;
  isStopped: boolean;
  /** Whether native currently holds a non-empty list (so an empty list must be pushed to clear it). */
  hasPushedLogs: boolean;
}

interface CachedEntry {
  version: number;
  rulesVersion: number;
  entry: GleapNetworkLogEntry | null;
}

const createChannel = (name: Channel['name']): Channel => ({
  name,
  isDirty: false,
  timer: null,
  failures: 0,
  isStopped: false,
  hasPushedLogs: false,
});

const toStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];

/**
 * Captures console output and fetch/XHR traffic inside the WebView of a native (iOS / Android) app
 * and hands them to the native SDK, which attaches them to tickets. The native SDKs cannot see
 * either: WebView requests do not go through URLSession / OkHttp, and console output only reaches
 * the native log in debug builds.
 */
export class WebViewLogCapture {
  private consoleCapture: ConsoleCapture | null = null;
  private readonly networkCapture: NetworkCapture;
  private readonly consoleChannel = createChannel('console');
  private readonly networkChannel = createChannel('network');
  private isNetworkEnabled = false;
  private remoteProps: string[] = [];
  private localProps: string[] = [];
  private remoteBlacklist: string[] = [];
  private localBlacklist: string[] = [];
  private rules: RedactionRules = createRedactionRules([], []);
  private rulesVersion = 0;
  private redactedEntries = new Map<number, CachedEntry>();

  constructor(
    private readonly win: Window,
    private readonly target: LogTarget,
    private readonly platform: string,
  ) {
    this.networkCapture = new NetworkCapture(win, () => this.markDirty(this.networkChannel));
  }

  start(): void {
    if (!this.nativeLogsConsole()) {
      this.consoleCapture = new ConsoleCapture(this.win, () => this.markDirty(this.consoleChannel));
      this.consoleCapture.install();
    }
    // Requests are buffered from the start; they are only pushed once the project config says
    // network logs are enabled.
    this.networkCapture.install();
    this.listenForConfig();
  }

  /**
   * Android debug builds (Capacitor's loggingBehavior) write the WebView console to logcat, which the
   * Android SDK already reads: capturing it here too would log every line twice. On iOS, Capacitor
   * prints it to stdout as "⚡️  [level] - message"; the iOS SDK drops those lines for Capacitor apps
   * (application type CAPACITOR, set in initialize), so iOS always captures here.
   */
  private nativeLogsConsole(): boolean {
    const capacitor = (
      this.win as unknown as {
        Capacitor?: { isLoggingEnabled?: unknown };
      }
    ).Capacitor;
    return this.platform === 'android' && !!capacitor && capacitor.isLoggingEnabled === true;
  }

  private listenForConfig(): void {
    try {
      const handle = this.target.addListener('logConfigLoaded', (config) => this.applyRemoteConfig(config));
      if (handle && typeof handle.catch === 'function') {
        handle.catch(() => undefined);
      }
    } catch (e) {
      // The native side predates the event: network logs stay off.
    }
  }

  applyRemoteConfig(config: GleapLogConfig | null | undefined): void {
    try {
      if (!config || typeof config !== 'object') {
        return;
      }
      this.remoteProps = toStringArray(config.networkLogPropsToIgnore);
      this.remoteBlacklist = toStringArray(config.networkLogBlacklist);
      this.updateRules();
      this.isNetworkEnabled = config.enableNetworkLogs === true;
      this.networkCapture.setActive(this.isNetworkEnabled);
      this.markDirty(this.networkChannel);
    } catch (e) {
      // Ignore.
    }
  }

  setLocalPropsToIgnore(props: unknown): void {
    this.localProps = toStringArray(props);
    this.updateRules();
  }

  setLocalBlacklist(blacklist: unknown): void {
    this.localBlacklist = toStringArray(blacklist);
    this.updateRules();
  }

  /** disableConsoleLogOverwrite(): restore the console and drop what was recorded (also natively). */
  disableConsole(): void {
    try {
      if (this.consoleCapture) {
        this.consoleCapture.uninstall();
        this.consoleCapture = null;
      }
      this.markDirty(this.consoleChannel);
      this.flushChannel(this.consoleChannel);
    } catch (e) {
      // Ignore.
    }
  }

  onInitialize(): void {
    this.markDirty(this.consoleChannel);
    this.markDirty(this.networkChannel);
  }

  /** Pushes pending changes now (before a plugin call that can produce a report). */
  flushNow(): void {
    try {
      this.flushChannel(this.consoleChannel);
      this.flushChannel(this.networkChannel);
    } catch (e) {
      // Ignore.
    }
  }

  private updateRules(): void {
    this.rules = createRedactionRules(
      [...this.remoteProps, ...this.localProps],
      [...this.remoteBlacklist, ...this.localBlacklist],
    );
    this.rulesVersion++;
    this.markDirty(this.networkChannel);
  }

  private canPush(channel: Channel): boolean {
    if (channel.isStopped) {
      return false;
    }
    if (channel.name === 'network') {
      return this.isNetworkEnabled || channel.hasPushedLogs;
    }
    return true;
  }

  private markDirty(channel: Channel): void {
    channel.isDirty = true;
    if (channel.timer !== null || !this.canPush(channel)) {
      return;
    }
    try {
      channel.timer = runOutsideZone(() =>
        setTimeout(() => {
          channel.timer = null;
          this.flushChannel(channel);
        }, PUSH_DELAY_MS),
      );
    } catch (e) {
      channel.timer = null;
    }
  }

  private flushChannel(channel: Channel): void {
    if (channel.timer !== null) {
      clearTimeout(channel.timer);
      channel.timer = null;
    }
    if (!channel.isDirty || !this.canPush(channel)) {
      return;
    }
    channel.isDirty = false;

    let push: Promise<unknown>;
    if (channel.name === 'console') {
      const logs = this.consoleCapture ? this.consoleCapture.getEntries() : [];
      if (logs.length === 0 && !channel.hasPushedLogs) {
        return;
      }
      channel.hasPushedLogs = logs.length > 0;
      push = runOutsideZone(() => this.target.attachConsoleLogs({ logs }));
    } else {
      const logs = this.isNetworkEnabled ? this.buildNetworkLogs() : [];
      if (logs.length === 0 && !channel.hasPushedLogs) {
        return;
      }
      channel.hasPushedLogs = logs.length > 0;
      push = runOutsideZone(() => this.target.attachNetworkLogs({ logs }));
    }

    try {
      Promise.resolve(push).then(
        () => {
          channel.failures = 0;
        },
        () => this.onPushFailed(channel),
      );
    } catch (e) {
      this.onPushFailed(channel);
    }
  }

  private onPushFailed(channel: Channel): void {
    channel.failures++;
    if (channel.failures >= MAX_FAILED_PUSHES) {
      channel.isStopped = true;
      return;
    }
    this.markDirty(channel);
  }

  /** Redacted copies of the buffered entries; unchanged entries reuse their previous copy. */
  private buildNetworkLogs(): GleapNetworkLogEntry[] {
    const logs: GleapNetworkLogEntry[] = [];
    const cache = new Map<number, CachedEntry>();
    for (const snapshot of this.networkCapture.getSnapshots()) {
      let cached = this.redactedEntries.get(snapshot.id);
      if (!cached || cached.version !== snapshot.version || cached.rulesVersion !== this.rulesVersion) {
        cached = {
          version: snapshot.version,
          rulesVersion: this.rulesVersion,
          entry: isBlacklistedUrl(snapshot.entry.url, this.rules)
            ? null
            : redactNetworkLogEntryOrStrip(snapshot.entry, this.rules),
        };
      }
      cache.set(snapshot.id, cached);
      if (cached.entry) {
        logs.push(cached.entry);
      }
    }
    this.redactedEntries = cache;
    return logs;
  }
}

/**
 * Starts the WebView log capture on iOS and Android (not on web, where the JavaScript SDK records
 * the console and network itself). Safe to call more than once.
 */
export function installWebViewLogCapture(target: LogTarget): WebViewLogCapture | null {
  try {
    if (typeof window === 'undefined' || !Capacitor.isNativePlatform()) {
      return null;
    }
    const win = window as unknown as { [GLOBAL_KEY]?: WebViewLogCapture };
    const existing = win[GLOBAL_KEY];
    if (existing) {
      return existing;
    }
    const capture = new WebViewLogCapture(window, target, Capacitor.getPlatform());
    win[GLOBAL_KEY] = capture;
    capture.start();
    return capture;
  } catch (e) {
    return null;
  }
}

/**
 * Wraps the registered plugin so the calls that affect the WebView capture reach it before they go
 * to native. Every other call passes through unchanged.
 */
export function wrapPluginWithLogCapture<T extends object>(plugin: T, capture: WebViewLogCapture): T {
  return new Proxy(plugin, {
    get(target, property, receiver) {
      const value = Reflect.get(target, property, receiver);
      if (typeof property !== 'string' || typeof value !== 'function') {
        return value;
      }
      const method = value as (...args: unknown[]) => unknown;
      const before =
        (hook: (options: { [key: string]: unknown }) => void) =>
        (...args: unknown[]) => {
          try {
            const options = args[0];
            hook(options && typeof options === 'object' ? (options as { [key: string]: unknown }) : {});
          } catch (e) {
            // Never break the plugin call.
          }
          return method(...args);
        };

      switch (property) {
        case 'initialize':
          return before(() => capture.onInitialize());
        case 'setNetworkLogPropsToIgnore':
          return before((options) => capture.setLocalPropsToIgnore(options.propsToIgnore));
        case 'setNetworkLogsBlacklist':
          return before((options) => capture.setLocalBlacklist(options.blacklist));
        case 'disableConsoleLogOverwrite':
          return before(() => capture.disableConsole());
        default:
          if (FLUSH_BEFORE_METHODS.indexOf(property) > -1) {
            return before(() => capture.flushNow());
          }
          return value;
      }
    },
  });
}
