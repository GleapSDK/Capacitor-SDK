/** URLs containing one of these are never logged, in addition to the configured blacklist. */
export const DEFAULT_NETWORK_LOG_BLACKLIST = ['gleap.io', 'gleap.ai'];
export const REDACTED_VALUE = '[REDACTED]';
export const BODY_NOT_CAPTURED = '[body not captured]';
/** Credential headers whose value is always masked (the header itself is kept). */
const ALWAYS_MASKED_HEADERS = ['authorization', 'proxy-authorization', 'cookie', 'set-cookie'];
/**
 * Builds the redaction rules from the props to ignore and the blacklist (remote config and local
 * setter calls combined by the caller). Entries are trimmed, lowercased and deduplicated.
 */
export function createRedactionRules(propsToIgnore, blacklist) {
    const props = new Set();
    const paths = [];
    for (const raw of propsToIgnore || []) {
        if (typeof raw !== 'string') {
            continue;
        }
        const prop = raw.trim().toLowerCase();
        if (!prop || props.has(prop)) {
            continue;
        }
        props.add(prop);
        if (prop.indexOf('.') > -1) {
            const segments = prop.split('.').filter((segment) => segment.length > 0);
            if (segments.length > 1) {
                paths.push(segments);
            }
        }
    }
    const blacklistEntries = [];
    for (const raw of [...DEFAULT_NETWORK_LOG_BLACKLIST, ...(blacklist || [])]) {
        if (typeof raw !== 'string') {
            continue;
        }
        const entry = raw.trim().toLowerCase();
        if (entry && blacklistEntries.indexOf(entry) < 0) {
            blacklistEntries.push(entry);
        }
    }
    return { props, paths, blacklist: blacklistEntries };
}
/** Substring match (case-insensitive) against the blacklist, incl. the default Gleap hosts. */
export function isBlacklistedUrl(url, rules) {
    if (typeof url !== 'string') {
        return false;
    }
    const lowerUrl = url.toLowerCase();
    for (const entry of rules.blacklist) {
        if (lowerUrl.indexOf(entry) > -1) {
            return true;
        }
    }
    return false;
}
/**
 * Removes headers named like a prop (case-insensitive) and masks the credential headers.
 * Returns a new object; the input is not modified.
 */
export function redactHeaders(headers, rules) {
    if (!headers || typeof headers !== 'object') {
        return headers;
    }
    const result = {};
    for (const name of Object.keys(headers)) {
        const lowerName = name.toLowerCase();
        if (rules.props.has(lowerName)) {
            continue;
        }
        result[name] = ALWAYS_MASKED_HEADERS.indexOf(lowerName) > -1 ? REDACTED_VALUE : headers[name];
    }
    return result;
}
/**
 * Removes matching keys from a JSON body: every key equal to a prop at any depth (objects inside
 * arrays too), and dotted props additionally as a path from the root. Returns the body untouched
 * when it is not JSON (e.g. truncated) or when nothing matched; otherwise re-serialises compactly.
 */
export function redactJsonBody(body, rules) {
    if (!body || rules.props.size === 0) {
        return body;
    }
    const firstChar = firstNonWhitespaceChar(body);
    if (firstChar !== '{' && firstChar !== '[') {
        return body;
    }
    let parsed;
    try {
        parsed = JSON.parse(body);
    }
    catch (e) {
        return body;
    }
    let changed = removeKeysAtAnyDepth(parsed, rules.props);
    for (const path of rules.paths) {
        if (removePath(parsed, path, 0)) {
            changed = true;
        }
    }
    return changed ? JSON.stringify(parsed) : body;
}
/**
 * Removes form fields (application/x-www-form-urlencoded) named like a prop. Kept fields keep their
 * original encoding; the body is returned untouched when nothing matched.
 */
export function redactFormBody(body, rules) {
    if (!body || rules.props.size === 0) {
        return body;
    }
    const filtered = filterParams(body, rules);
    return filtered === null ? body : filtered;
}
/** Removes query parameters named like a prop. The URL is returned untouched when nothing matched. */
export function redactUrl(url, rules) {
    if (typeof url !== 'string' || rules.props.size === 0) {
        return url;
    }
    const hashIndex = url.indexOf('#');
    const main = hashIndex > -1 ? url.slice(0, hashIndex) : url;
    const hash = hashIndex > -1 ? url.slice(hashIndex) : '';
    const queryIndex = main.indexOf('?');
    if (queryIndex < 0) {
        return url;
    }
    const filtered = filterParams(main.slice(queryIndex + 1), rules);
    if (filtered === null) {
        return url;
    }
    return main.slice(0, queryIndex) + (filtered ? `?${filtered}` : '') + hash;
}
/** Redacts one entry. Returns a new entry; the input is not modified. */
export function redactNetworkLogEntry(entry, rules) {
    const result = Object.assign({}, entry);
    result.url = redactUrl(entry.url, rules);
    if (entry.request) {
        const request = Object.assign({}, entry.request);
        const contentType = getHeader(entry.request.headers, 'content-type');
        request.headers = redactHeaders(entry.request.headers, rules);
        if (typeof request.payload === 'string') {
            request.payload = redactBody(request.payload, contentType, rules);
        }
        result.request = request;
    }
    if (entry.response) {
        const response = Object.assign({}, entry.response);
        const contentType = getHeader(entry.response.headers, 'content-type');
        if (response.headers) {
            response.headers = redactHeaders(response.headers, rules);
        }
        if (typeof response.responseText === 'string') {
            response.responseText = redactBody(response.responseText, contentType, rules);
        }
        result.response = response;
    }
    return result;
}
/**
 * Drops blacklisted entries and redacts the rest. An entry that cannot be redacted (e.g. JSON nested
 * too deeply) is sent without bodies, headers and query instead of unredacted.
 */
export function redactNetworkLogs(entries, rules) {
    const result = [];
    for (const entry of entries) {
        if (!entry || isBlacklistedUrl(entry.url, rules)) {
            continue;
        }
        result.push(redactNetworkLogEntryOrStrip(entry, rules));
    }
    return result;
}
/** Like redactNetworkLogEntry, but never throws: falls back to an entry without any content. */
export function redactNetworkLogEntryOrStrip(entry, rules) {
    try {
        return redactNetworkLogEntry(entry, rules);
    }
    catch (e) {
        return stripNetworkLogEntry(entry);
    }
}
/** Keeps method, URL (without query), timing and status; drops headers and bodies. */
export function stripNetworkLogEntry(entry) {
    const url = typeof entry.url === 'string' ? entry.url.split(/[?#]/)[0] : '';
    const stripped = {
        date: entry.date,
        type: entry.type,
        url,
        duration: entry.duration,
        success: entry.success,
        request: { headers: {}, payload: BODY_NOT_CAPTURED },
    };
    if (entry.response) {
        stripped.response =
            typeof entry.response.errorText === 'string'
                ? { errorText: entry.response.errorText }
                : {
                    status: entry.response.status,
                    statusText: entry.response.statusText,
                    headers: {},
                    responseText: BODY_NOT_CAPTURED,
                };
    }
    return stripped;
}
function redactBody(body, contentType, rules) {
    if (!body || rules.props.size === 0) {
        return body;
    }
    const json = redactJsonBody(body, rules);
    if (json !== body) {
        return json;
    }
    const lowerContentType = (contentType || '').toLowerCase();
    if (lowerContentType.indexOf('x-www-form-urlencoded') > -1 || (!lowerContentType && looksLikeFormBody(body))) {
        return redactFormBody(body, rules);
    }
    return body;
}
function looksLikeFormBody(body) {
    return /^[^\s=&]+=[^\s&]*(?:&[^\s=&]*(?:=[^\s&]*)?)*$/.test(body);
}
function getHeader(headers, name) {
    if (!headers || typeof headers !== 'object') {
        return undefined;
    }
    for (const key of Object.keys(headers)) {
        if (key.toLowerCase() === name) {
            return headers[key];
        }
    }
    return undefined;
}
function firstNonWhitespaceChar(text) {
    const match = /\S/.exec(text);
    return match ? match[0] : '';
}
/** Removes every key equal to a prop at any depth. Iterative, so deep JSON cannot overflow the stack. */
function removeKeysAtAnyDepth(root, props) {
    let changed = false;
    const stack = [root];
    while (stack.length > 0) {
        const node = stack.pop();
        if (Array.isArray(node)) {
            for (const item of node) {
                if (item && typeof item === 'object') {
                    stack.push(item);
                }
            }
        }
        else if (node && typeof node === 'object') {
            const record = node;
            for (const key of Object.keys(record)) {
                if (props.has(key.toLowerCase())) {
                    delete record[key];
                    changed = true;
                }
                else {
                    const child = record[key];
                    if (child && typeof child === 'object') {
                        stack.push(child);
                    }
                }
            }
        }
    }
    return changed;
}
/** Removes a dotted path from the root; arrays on the way are applied to each element. */
function removePath(node, segments, index) {
    if (Array.isArray(node)) {
        let changed = false;
        for (const item of node) {
            if (removePath(item, segments, index)) {
                changed = true;
            }
        }
        return changed;
    }
    if (!node || typeof node !== 'object') {
        return false;
    }
    const record = node;
    const segment = segments[index];
    const isLast = index === segments.length - 1;
    let changed = false;
    for (const key of Object.keys(record)) {
        if (key.toLowerCase() !== segment) {
            continue;
        }
        if (isLast) {
            delete record[key];
            changed = true;
        }
        else if (removePath(record[key], segments, index + 1)) {
            changed = true;
        }
    }
    return changed;
}
/**
 * Filters an urlencoded parameter list (query string or form body). Returns null when nothing was
 * removed, so callers can keep the original string.
 */
function filterParams(params, rules) {
    const parts = params.split('&');
    const kept = [];
    let changed = false;
    for (const part of parts) {
        const equalsIndex = part.indexOf('=');
        const rawName = equalsIndex > -1 ? part.slice(0, equalsIndex) : part;
        if (rawName && paramNameMatches(decodeParamName(rawName), rules)) {
            changed = true;
            continue;
        }
        kept.push(part);
    }
    return changed ? kept.join('&') : null;
}
function decodeParamName(rawName) {
    try {
        return decodeURIComponent(rawName.replace(/\+/g, ' '));
    }
    catch (e) {
        return rawName;
    }
}
/**
 * A param matches when its whole name equals a prop. Bracket names (user[password]) are treated like
 * nested JSON keys: any segment equal to a prop, or a dotted prop matching the leading segments.
 */
function paramNameMatches(name, rules) {
    const lowerName = name.toLowerCase();
    if (rules.props.has(lowerName)) {
        return true;
    }
    if (lowerName.indexOf('[') < 0) {
        return false;
    }
    const segments = lowerName
        .replace(/\]/g, '')
        .split('[')
        .filter((segment) => segment.length > 0);
    if (segments.length < 2) {
        return false;
    }
    for (const segment of segments) {
        if (rules.props.has(segment)) {
            return true;
        }
    }
    for (const path of rules.paths) {
        if (path.length <= segments.length) {
            let matches = true;
            for (let i = 0; i < path.length; i++) {
                if (path[i] !== segments[i]) {
                    matches = false;
                    break;
                }
            }
            if (matches) {
                return true;
            }
        }
    }
    return false;
}
//# sourceMappingURL=redaction.js.map