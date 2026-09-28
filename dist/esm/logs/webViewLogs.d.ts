import type { GleapConsoleLogEntry, GleapLogConfig, GleapNetworkLogEntry } from '../definitions';
/** Pushes are batched: at most one per channel every PUSH_DELAY_MS. */
export declare const PUSH_DELAY_MS = 500;
export interface LogTarget {
    attachConsoleLogs(options: {
        logs: GleapConsoleLogEntry[];
    }): Promise<unknown>;
    attachNetworkLogs(options: {
        logs: GleapNetworkLogEntry[];
    }): Promise<unknown>;
    addListener(eventName: 'logConfigLoaded', listenerFunc: (config: GleapLogConfig) => void): Promise<unknown>;
}
/**
 * Captures console output and fetch/XHR traffic inside the WebView of a native (iOS / Android) app
 * and hands them to the native SDK, which attaches them to tickets. The native SDKs cannot see
 * either: WebView requests do not go through URLSession / OkHttp, and console output only reaches
 * the native log in debug builds.
 */
export declare class WebViewLogCapture {
    private readonly win;
    private readonly target;
    private readonly platform;
    private consoleCapture;
    private readonly networkCapture;
    private readonly consoleChannel;
    private readonly networkChannel;
    private isNetworkEnabled;
    private remoteProps;
    private localProps;
    private remoteBlacklist;
    private localBlacklist;
    private rules;
    private rulesVersion;
    private redactedEntries;
    constructor(win: Window, target: LogTarget, platform: string);
    start(): void;
    /**
     * Android debug builds (Capacitor's loggingBehavior) write the WebView console to logcat, which the
     * Android SDK already reads: capturing it here too would log every line twice. On iOS, Capacitor
     * prints it to stdout as "⚡️  [level] - message"; the iOS SDK drops those lines for Capacitor apps
     * (application type CAPACITOR, set in initialize), so iOS always captures here.
     */
    private nativeLogsConsole;
    private listenForConfig;
    applyRemoteConfig(config: GleapLogConfig | null | undefined): void;
    setLocalPropsToIgnore(props: unknown): void;
    setLocalBlacklist(blacklist: unknown): void;
    /** disableConsoleLogOverwrite(): restore the console and drop what was recorded (also natively). */
    disableConsole(): void;
    onInitialize(): void;
    /** Pushes pending changes now (before a plugin call that can produce a report). */
    flushNow(): void;
    private updateRules;
    private canPush;
    private markDirty;
    private flushChannel;
    private onPushFailed;
    /** Redacted copies of the buffered entries; unchanged entries reuse their previous copy. */
    private buildNetworkLogs;
}
/**
 * Starts the WebView log capture on iOS and Android (not on web, where the JavaScript SDK records
 * the console and network itself). Safe to call more than once.
 */
export declare function installWebViewLogCapture(target: LogTarget): WebViewLogCapture | null;
/**
 * Wraps the registered plugin so the calls that affect the WebView capture reach it before they go
 * to native. Every other call passes through unchanged.
 */
export declare function wrapPluginWithLogCapture<T extends object>(plugin: T, capture: WebViewLogCapture): T;
