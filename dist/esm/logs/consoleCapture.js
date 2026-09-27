import { MAX_ERROR_LOG_LENGTH, MAX_LOG_LENGTH, formatConsoleArgs, formatError, formatValue, isError, truncateLog, } from './format';
export const MAX_CONSOLE_ENTRIES = 500;
const PATCHED_METHODS = {
    log: 'INFO',
    info: 'INFO',
    debug: 'INFO',
    warn: 'WARNING',
    error: 'ERROR',
};
/**
 * Records the WebView console. Methods are patched in place on the existing console object (never
 * replaced) and always call through to what was there before.
 */
export class ConsoleCapture {
    constructor(win, onChange) {
        this.win = win;
        this.onChange = onChange;
        this.entries = [];
        this.patched = [];
        this.active = false;
        this.isRecording = false;
        this.errorListener = null;
        this.rejectionListener = null;
    }
    install() {
        if (this.active) {
            return;
        }
        this.active = true;
        this.patchConsole();
        this.listenForUncaughtErrors();
    }
    /** Restores the console methods that are still ours, stops listening and drops what was recorded. */
    uninstall() {
        this.active = false;
        const console = this.win.console;
        for (const method of this.patched) {
            try {
                if (console[method.name] === method.wrapper) {
                    console[method.name] = method.original;
                }
            }
            catch (e) {
                // The inactive wrapper keeps calling through.
            }
        }
        this.patched = [];
        if (this.errorListener) {
            this.win.removeEventListener('error', this.errorListener);
            this.errorListener = null;
        }
        if (this.rejectionListener) {
            this.win.removeEventListener('unhandledrejection', this.rejectionListener);
            this.rejectionListener = null;
        }
        this.entries = [];
    }
    getEntries() {
        return this.entries.slice();
    }
    record(priority, text) {
        if (!this.active || !text) {
            return;
        }
        this.entries.push({
            date: new Date().toISOString(),
            priority,
            log: truncateLog(text, priority === 'ERROR' ? MAX_ERROR_LOG_LENGTH : MAX_LOG_LENGTH),
        });
        if (this.entries.length > MAX_CONSOLE_ENTRIES) {
            this.entries.splice(0, this.entries.length - MAX_CONSOLE_ENTRIES);
        }
        this.onChange();
    }
    /** Formats and records; re-entrant calls (a getter that logs while being formatted) are dropped. */
    recordArgs(priority, args, prefix = '') {
        if (!this.active || this.isRecording) {
            return;
        }
        this.isRecording = true;
        try {
            const budget = priority === 'ERROR' ? MAX_ERROR_LOG_LENGTH : MAX_LOG_LENGTH;
            const text = formatConsoleArgs(args, budget);
            this.record(priority, prefix ? (text ? `${prefix} ${text}` : prefix) : text);
        }
        catch (e) {
            // Logging must never break the app.
        }
        finally {
            this.isRecording = false;
        }
    }
    patchConsole() {
        const console = this.win.console;
        if (!console) {
            return;
        }
        const capture = this;
        for (const name of Object.keys(PATCHED_METHODS)) {
            const priority = PATCHED_METHODS[name];
            this.patchMethod(console, name, function (original, args) {
                capture.recordArgs(priority, args);
                return original.apply(this, args);
            });
        }
        this.patchMethod(console, 'assert', function (original, args) {
            if (!args[0]) {
                capture.recordArgs('ERROR', args.slice(1), 'Assertion failed:');
            }
            return original.apply(this, args);
        });
    }
    patchMethod(console, name, body) {
        const original = console[name];
        if (typeof original !== 'function') {
            return;
        }
        const target = console;
        const wrapper = function (...args) {
            return body.call(this === undefined ? target : this, original, args);
        };
        try {
            console[name] = wrapper;
        }
        catch (e) {
            return;
        }
        if (console[name] === wrapper) {
            this.patched.push({
                name,
                original: original,
                wrapper,
            });
        }
    }
    listenForUncaughtErrors() {
        this.errorListener = (event) => {
            try {
                const errorEvent = event;
                if (typeof ErrorEvent !== 'undefined' && !(event instanceof ErrorEvent) && !errorEvent.error) {
                    // Resource load errors are plain Events.
                    return;
                }
                this.recordUncaughtError(errorEvent);
            }
            catch (e) {
                // Ignore.
            }
        };
        this.rejectionListener = (event) => {
            try {
                const reason = event.reason;
                const text = isError(reason) ? formatError(reason) : formatValue(reason, MAX_ERROR_LOG_LENGTH);
                this.recordGuarded(`Unhandled promise rejection: ${text}`);
            }
            catch (e) {
                // Ignore.
            }
        };
        this.win.addEventListener('error', this.errorListener);
        this.win.addEventListener('unhandledrejection', this.rejectionListener);
    }
    recordUncaughtError(event) {
        let text;
        if (event.error && isError(event.error)) {
            text = formatError(event.error);
        }
        else {
            text = event.message || formatValue(event.error, MAX_ERROR_LOG_LENGTH);
            if (event.filename) {
                text += ` (${event.filename}:${event.lineno || 0}:${event.colno || 0})`;
            }
        }
        this.recordGuarded(text.indexOf('Uncaught') === 0 ? text : `Uncaught ${text}`);
    }
    recordGuarded(text) {
        if (this.isRecording) {
            return;
        }
        this.isRecording = true;
        try {
            this.record('ERROR', text);
        }
        finally {
            this.isRecording = false;
        }
    }
}
//# sourceMappingURL=consoleCapture.js.map