export declare const MAX_LOG_LENGTH = 1000;
export declare const MAX_ERROR_LOG_LENGTH = 5000;
export declare const TRUNCATED_SUFFIX = "\u2026 [truncated]";
/** Keeps the head of a log line so the result (incl. the suffix) fits max chars. */
export declare function truncateLog(text: string, max: number): string;
/**
 * Formats console arguments like the browser console does (printf-style %s %d %i %f %o %O %c in
 * the first string), with objects as depth-limited JSON. Stops early once the text exceeds the
 * budget, so logging a huge object stays cheap.
 */
export declare function formatConsoleArgs(args: ArrayLike<unknown>, budget: number): string;
/** A single value as text: strings as they are, errors with their stack, objects as JSON. */
export declare function formatValue(value: unknown, budget: number): string;
/** "Name: message" followed by the stack (V8 stacks already start with that line). */
export declare function formatError(error: unknown): string;
export declare function isError(value: unknown): boolean;
