import { Capacitor } from '@capacitor/core';
import { ConsoleCapture } from './consoleCapture';
import { NetworkCapture } from './networkCapture';
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
    'startBot',
];
const createChannel = (name) => ({
    name,
    isDirty: false,
    timer: null,
    failures: 0,
    isStopped: false,
    hasPushedLogs: false,
});
const toStringArray = (value) => Array.isArray(value) ? value.filter((item) => typeof item === 'string') : [];
/**
 * Captures console output and fetch/XHR traffic inside the WebView of a native (iOS / Android) app
 * and hands them to the native SDK, which attaches them to tickets. The native SDKs cannot see
 * either: WebView requests do not go through URLSession / OkHttp, and console output only reaches
 * the native log in debug builds.
 */
export class WebViewLogCapture {
    constructor(win, target, platform) {
        this.win = win;
        this.target = target;
        this.platform = platform;
        this.consoleCapture = null;
        this.consoleChannel = createChannel('console');
        this.networkChannel = createChannel('network');
        this.isNetworkEnabled = false;
        this.remoteProps = [];
        this.localProps = [];
        this.remoteBlacklist = [];
        this.localBlacklist = [];
        this.rules = createRedactionRules([], []);
        this.rulesVersion = 0;
        this.redactedEntries = new Map();
        this.networkCapture = new NetworkCapture(win, () => this.markDirty(this.networkChannel));
    }
    start() {
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
    nativeLogsConsole() {
        const capacitor = this.win.Capacitor;
        return this.platform === 'android' && !!capacitor && capacitor.isLoggingEnabled === true;
    }
    listenForConfig() {
        try {
            const handle = this.target.addListener('logConfigLoaded', (config) => this.applyRemoteConfig(config));
            if (handle && typeof handle.catch === 'function') {
                handle.catch(() => undefined);
            }
        }
        catch (e) {
            // The native side predates the event: network logs stay off.
        }
    }
    applyRemoteConfig(config) {
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
        }
        catch (e) {
            // Ignore.
        }
    }
    setLocalPropsToIgnore(props) {
        this.localProps = toStringArray(props);
        this.updateRules();
    }
    setLocalBlacklist(blacklist) {
        this.localBlacklist = toStringArray(blacklist);
        this.updateRules();
    }
    /** disableConsoleLogOverwrite(): restore the console and drop what was recorded (also natively). */
    disableConsole() {
        try {
            if (this.consoleCapture) {
                this.consoleCapture.uninstall();
                this.consoleCapture = null;
            }
            this.markDirty(this.consoleChannel);
            this.flushChannel(this.consoleChannel);
        }
        catch (e) {
            // Ignore.
        }
    }
    onInitialize() {
        this.markDirty(this.consoleChannel);
        this.markDirty(this.networkChannel);
    }
    /** Pushes pending changes now (before a plugin call that can produce a report). */
    flushNow() {
        try {
            this.flushChannel(this.consoleChannel);
            this.flushChannel(this.networkChannel);
        }
        catch (e) {
            // Ignore.
        }
    }
    updateRules() {
        this.rules = createRedactionRules([...this.remoteProps, ...this.localProps], [...this.remoteBlacklist, ...this.localBlacklist]);
        this.rulesVersion++;
        this.markDirty(this.networkChannel);
    }
    canPush(channel) {
        if (channel.isStopped) {
            return false;
        }
        if (channel.name === 'network') {
            return this.isNetworkEnabled || channel.hasPushedLogs;
        }
        return true;
    }
    markDirty(channel) {
        channel.isDirty = true;
        if (channel.timer !== null || !this.canPush(channel)) {
            return;
        }
        try {
            channel.timer = runOutsideZone(() => setTimeout(() => {
                channel.timer = null;
                this.flushChannel(channel);
            }, PUSH_DELAY_MS));
        }
        catch (e) {
            channel.timer = null;
        }
    }
    flushChannel(channel) {
        if (channel.timer !== null) {
            clearTimeout(channel.timer);
            channel.timer = null;
        }
        if (!channel.isDirty || !this.canPush(channel)) {
            return;
        }
        channel.isDirty = false;
        let push;
        if (channel.name === 'console') {
            const logs = this.consoleCapture ? this.consoleCapture.getEntries() : [];
            if (logs.length === 0 && !channel.hasPushedLogs) {
                return;
            }
            channel.hasPushedLogs = logs.length > 0;
            push = runOutsideZone(() => this.target.attachConsoleLogs({ logs }));
        }
        else {
            const logs = this.isNetworkEnabled ? this.buildNetworkLogs() : [];
            if (logs.length === 0 && !channel.hasPushedLogs) {
                return;
            }
            channel.hasPushedLogs = logs.length > 0;
            push = runOutsideZone(() => this.target.attachNetworkLogs({ logs }));
        }
        try {
            Promise.resolve(push).then(() => {
                channel.failures = 0;
            }, () => this.onPushFailed(channel));
        }
        catch (e) {
            this.onPushFailed(channel);
        }
    }
    onPushFailed(channel) {
        channel.failures++;
        if (channel.failures >= MAX_FAILED_PUSHES) {
            channel.isStopped = true;
            return;
        }
        this.markDirty(channel);
    }
    /** Redacted copies of the buffered entries; unchanged entries reuse their previous copy. */
    buildNetworkLogs() {
        const logs = [];
        const cache = new Map();
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
export function installWebViewLogCapture(target) {
    try {
        if (typeof window === 'undefined' || !Capacitor.isNativePlatform()) {
            return null;
        }
        const win = window;
        const existing = win[GLOBAL_KEY];
        if (existing) {
            return existing;
        }
        const capture = new WebViewLogCapture(window, target, Capacitor.getPlatform());
        win[GLOBAL_KEY] = capture;
        capture.start();
        return capture;
    }
    catch (e) {
        return null;
    }
}
/**
 * Wraps the registered plugin so the calls that affect the WebView capture reach it before they go
 * to native. Every other call passes through unchanged.
 */
export function wrapPluginWithLogCapture(plugin, capture) {
    return new Proxy(plugin, {
        get(target, property, receiver) {
            const value = Reflect.get(target, property, receiver);
            if (typeof property !== 'string' || typeof value !== 'function') {
                return value;
            }
            const method = value;
            const before = (hook) => (...args) => {
                try {
                    const options = args[0];
                    hook(options && typeof options === 'object' ? options : {});
                }
                catch (e) {
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
//# sourceMappingURL=webViewLogs.js.map