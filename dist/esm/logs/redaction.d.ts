import type { GleapNetworkLogEntry } from '../definitions';
/** URLs containing one of these are never logged, in addition to the configured blacklist. */
export declare const DEFAULT_NETWORK_LOG_BLACKLIST: readonly string[];
export declare const REDACTED_VALUE = "[REDACTED]";
export declare const BODY_NOT_CAPTURED = "[body not captured]";
export interface RedactionRules {
    /** Lowercased props, matched as whole header names, JSON keys, form fields and query params. */
    props: Set<string>;
    /** Lowercased props containing a dot, split into a path that is applied from the JSON root. */
    paths: string[][];
    /** Lowercased blacklist entries, including the default Gleap hosts. */
    blacklist: string[];
}
/**
 * Builds the redaction rules from the props to ignore and the blacklist (remote config and local
 * setter calls combined by the caller). Entries are trimmed, lowercased and deduplicated.
 */
export declare function createRedactionRules(propsToIgnore?: readonly unknown[] | null, blacklist?: readonly unknown[] | null): RedactionRules;
/** Substring match (case-insensitive) against the blacklist, incl. the default Gleap hosts. */
export declare function isBlacklistedUrl(url: unknown, rules: RedactionRules): boolean;
/**
 * Removes headers named like a prop (case-insensitive) and masks the credential headers.
 * Returns a new object; the input is not modified.
 */
export declare function redactHeaders(headers: {
    [name: string]: string;
} | undefined, rules: RedactionRules): {
    [name: string]: string;
} | undefined;
/**
 * Removes matching keys from a JSON body: every key equal to a prop at any depth (objects inside
 * arrays too), and dotted props additionally as a path from the root, then re-serialises compactly.
 * A body that looks like JSON but does not parse (e.g. cut at the size limit) gets the values of
 * matching keys masked in the text instead. Returns the body untouched when nothing matched.
 */
export declare function redactJsonBody(body: string, rules: RedactionRules): string;
/**
 * Removes form fields (application/x-www-form-urlencoded) named like a prop. Kept fields keep their
 * original encoding; the body is returned untouched when nothing matched.
 */
export declare function redactFormBody(body: string, rules: RedactionRules): string;
/** Removes query parameters named like a prop. The URL is returned untouched when nothing matched. */
export declare function redactUrl(url: string, rules: RedactionRules): string;
/** Redacts one entry. Returns a new entry; the input is not modified. */
export declare function redactNetworkLogEntry(entry: GleapNetworkLogEntry, rules: RedactionRules): GleapNetworkLogEntry;
/**
 * Drops blacklisted entries and redacts the rest. An entry that cannot be redacted (e.g. JSON nested
 * too deeply) is sent without bodies, headers and query instead of unredacted.
 */
export declare function redactNetworkLogs(entries: readonly GleapNetworkLogEntry[], rules: RedactionRules): GleapNetworkLogEntry[];
/** Like redactNetworkLogEntry, but never throws: falls back to an entry without any content. */
export declare function redactNetworkLogEntryOrStrip(entry: GleapNetworkLogEntry, rules: RedactionRules): GleapNetworkLogEntry;
/** Keeps method, URL (without query), timing and status; drops headers and bodies. */
export declare function stripNetworkLogEntry(entry: GleapNetworkLogEntry): GleapNetworkLogEntry;
