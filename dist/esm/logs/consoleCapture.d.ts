import type { GleapConsoleLogEntry } from '../definitions';
export declare const MAX_CONSOLE_ENTRIES = 500;
/**
 * Records the WebView console. Methods are patched in place on the existing console object (never
 * replaced) and always call through to what was there before.
 */
export declare class ConsoleCapture {
    private readonly win;
    private readonly onChange;
    private entries;
    private patched;
    private active;
    private isRecording;
    private errorListener;
    private rejectionListener;
    constructor(win: Window, onChange: () => void);
    install(): void;
    /** Restores the console methods that are still ours, stops listening and drops what was recorded. */
    uninstall(): void;
    getEntries(): GleapConsoleLogEntry[];
    private record;
    /** Formats and records; re-entrant calls (a getter that logs while being formatted) are dropped. */
    private recordArgs;
    private patchConsole;
    private patchMethod;
    private listenForUncaughtErrors;
    private recordUncaughtError;
    private recordGuarded;
}
