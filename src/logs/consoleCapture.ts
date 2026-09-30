import type { GleapConsoleLogEntry } from '../definitions';

import {
  MAX_ERROR_LOG_LENGTH,
  MAX_LOG_LENGTH,
  formatConsoleArgs,
  formatError,
  formatValue,
  isError,
  truncateLog,
} from './format';

export const MAX_CONSOLE_ENTRIES = 500;

type Priority = GleapConsoleLogEntry['priority'];

const PATCHED_METHODS: { [method: string]: Priority } = {
  log: 'INFO',
  info: 'INFO',
  debug: 'INFO',
  warn: 'WARNING',
  error: 'ERROR',
};

interface PatchedMethod {
  name: string;
  original: (...args: unknown[]) => unknown;
  wrapper: (...args: unknown[]) => unknown;
}

/**
 * Records the WebView console. Methods are patched in place on the existing console object (never
 * replaced) and always call through to what was there before.
 */
export class ConsoleCapture {
  private entries: GleapConsoleLogEntry[] = [];
  private patched: PatchedMethod[] = [];
  private active = false;
  private isRecording = false;
  private errorListener: ((event: Event) => void) | null = null;
  private rejectionListener: ((event: Event) => void) | null = null;

  constructor(
    private readonly win: Window,
    private readonly onChange: () => void,
  ) {}

  install(): void {
    if (this.active) {
      return;
    }
    this.active = true;
    this.patchConsole();
    this.listenForUncaughtErrors();
  }

  /** Restores the console methods that are still ours, stops listening and drops what was recorded. */
  uninstall(): void {
    this.active = false;
    const console = (this.win as unknown as { console: unknown }).console as { [method: string]: unknown };
    for (const method of this.patched) {
      try {
        if (console[method.name] === method.wrapper) {
          console[method.name] = method.original;
        }
      } catch (e) {
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

  getEntries(): GleapConsoleLogEntry[] {
    return this.entries.slice();
  }

  private record(priority: Priority, text: string): void {
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
  private recordArgs(priority: Priority, args: ArrayLike<unknown>, prefix = ''): void {
    if (!this.active || this.isRecording) {
      return;
    }
    this.isRecording = true;
    try {
      const budget = priority === 'ERROR' ? MAX_ERROR_LOG_LENGTH : MAX_LOG_LENGTH;
      const text = formatConsoleArgs(args, budget);
      this.record(priority, prefix ? (text ? `${prefix} ${text}` : prefix) : text);
    } catch (e) {
      // Logging must never break the app.
    } finally {
      this.isRecording = false;
    }
  }

  private patchConsole(): void {
    const console = (this.win as unknown as { console: unknown }).console as { [method: string]: unknown };
    if (!console) {
      return;
    }
    const capture = this;
    for (const name of Object.keys(PATCHED_METHODS)) {
      const priority = PATCHED_METHODS[name];
      this.patchMethod(
        console,
        name,
        function (this: unknown, original: (...args: unknown[]) => unknown, args: unknown[]) {
          capture.recordArgs(priority, args);
          return original.apply(this, args);
        },
      );
    }
    this.patchMethod(
      console,
      'assert',
      function (this: unknown, original: (...args: unknown[]) => unknown, args: unknown[]) {
        if (!args[0]) {
          capture.recordArgs('ERROR', args.slice(1), 'Assertion failed:');
        }
        return original.apply(this, args);
      },
    );
  }

  private patchMethod(
    console: { [method: string]: unknown },
    name: string,
    body: (this: unknown, original: (...args: unknown[]) => unknown, args: unknown[]) => unknown,
  ): void {
    const original = console[name];
    if (typeof original !== 'function') {
      return;
    }
    const target = console;
    const wrapper = function (this: unknown, ...args: unknown[]): unknown {
      return body.call(this === undefined ? target : this, original as (...args: unknown[]) => unknown, args);
    };
    try {
      console[name] = wrapper;
    } catch (e) {
      return;
    }
    if (console[name] === wrapper) {
      this.patched.push({
        name,
        original: original as (...args: unknown[]) => unknown,
        wrapper,
      });
    }
  }

  private listenForUncaughtErrors(): void {
    this.errorListener = (event: Event) => {
      try {
        const errorEvent = event as ErrorEvent;
        if (typeof ErrorEvent !== 'undefined' && !(event instanceof ErrorEvent) && !errorEvent.error) {
          // Resource load errors are plain Events.
          return;
        }
        this.recordUncaughtError(errorEvent);
      } catch (e) {
        // Ignore.
      }
    };
    this.rejectionListener = (event: Event) => {
      try {
        const reason = (event as PromiseRejectionEvent).reason;
        const text = isError(reason) ? formatError(reason) : formatValue(reason, MAX_ERROR_LOG_LENGTH);
        this.recordGuarded(`Unhandled promise rejection: ${text}`);
      } catch (e) {
        // Ignore.
      }
    };
    this.win.addEventListener('error', this.errorListener);
    this.win.addEventListener('unhandledrejection', this.rejectionListener);
  }

  private recordUncaughtError(event: ErrorEvent): void {
    let text: string;
    if (event.error && isError(event.error)) {
      text = formatError(event.error);
    } else {
      text = event.message || formatValue(event.error, MAX_ERROR_LOG_LENGTH);
      if (event.filename) {
        text += ` (${event.filename}:${event.lineno || 0}:${event.colno || 0})`;
      }
    }
    this.recordGuarded(text.indexOf('Uncaught') === 0 ? text : `Uncaught ${text}`);
  }

  private recordGuarded(text: string): void {
    if (this.isRecording) {
      return;
    }
    this.isRecording = true;
    try {
      this.record('ERROR', text);
    } finally {
      this.isRecording = false;
    }
  }
}
