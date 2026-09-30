/** Maximum captured size per body (request payload or response text). */
export const MAX_BODY_SIZE = 150000;
export const BINARY_BODY_OMITTED = '[binary body omitted]';
export const STREAMING_BODY_OMITTED = '[streaming body omitted]';
export const BODY_NOT_CAPTURED = '[body not captured]';
export const BODY_PENDING = '[body pending]';
const STREAMING_TYPES = [
    'text/event-stream',
    'application/x-ndjson',
    'application/stream+json',
    'multipart/x-mixed-replace',
    'grpc',
];
const TEXT_TYPES = ['json', 'xml', 'text/', 'javascript', 'x-www-form-urlencoded', 'graphql'];
export function classifyContentType(contentType) {
    if (typeof contentType !== 'string' || contentType.trim() === '') {
        return 'unknown';
    }
    const lower = contentType.toLowerCase();
    for (const type of STREAMING_TYPES) {
        if (lower.indexOf(type) > -1) {
            return 'streaming';
        }
    }
    for (const type of TEXT_TYPES) {
        if (lower.indexOf(type) > -1) {
            return 'text';
        }
    }
    return 'binary';
}
export function markerForKind(kind) {
    if (kind === 'streaming') {
        return STREAMING_BODY_OMITTED;
    }
    if (kind === 'binary') {
        return BINARY_BODY_OMITTED;
    }
    return null;
}
/** UTF-8 byte length without allocating an encoded copy. */
export function utf8ByteLength(text) {
    let bytes = 0;
    for (let i = 0; i < text.length; i++) {
        const code = text.charCodeAt(i);
        if (code < 0x80) {
            bytes += 1;
        }
        else if (code < 0x800) {
            bytes += 2;
        }
        else if (code >= 0xd800 && code <= 0xdbff && i + 1 < text.length) {
            bytes += 4;
            i++;
        }
        else {
            bytes += 3;
        }
    }
    return bytes;
}
/** Cuts a string at max chars without splitting a surrogate pair. */
export function sliceHead(text, max) {
    if (text.length <= max) {
        return text;
    }
    let end = max;
    const last = text.charCodeAt(end - 1);
    if (last >= 0xd800 && last <= 0xdbff) {
        end--;
    }
    return text.slice(0, end);
}
export function truncationMarker(totalBytes) {
    return `\n… [truncated, ${totalBytes !== null && totalBytes > MAX_BODY_SIZE ? totalBytes : `more than ${MAX_BODY_SIZE}`} bytes]`;
}
/** Caps a text body at MAX_BODY_SIZE chars: keeps the head and appends the truncation marker. */
export function capBodyText(text) {
    if (text.length <= MAX_BODY_SIZE) {
        return text;
    }
    return sliceHead(text, MAX_BODY_SIZE) + truncationMarker(utf8ByteLength(text));
}
/**
 * Decodes bytes as UTF-8. With fatal (unknown content type) invalid UTF-8 yields null, so the caller
 * can mark the body as binary. A cut-off (incomplete) body keeps a split trailing character pending
 * instead of failing on it.
 */
export function decodeUtf8(bytes, fatal, complete) {
    if (typeof TextDecoder === 'undefined') {
        return null;
    }
    try {
        return new TextDecoder('utf-8', { fatal }).decode(bytes, {
            stream: !complete,
        });
    }
    catch (e) {
        return null;
    }
}
/**
 * Turns (at most MAX_BODY_SIZE) bytes into the logged text: decoded, capped, marked as truncated
 * when the body was longer, or the binary marker when it is not UTF-8 text.
 */
export function bytesToBodyText(bytes, kind, complete, totalBytes) {
    const head = bytes.byteLength > MAX_BODY_SIZE ? bytes.subarray(0, MAX_BODY_SIZE) : bytes;
    const cut = !complete || bytes.byteLength > MAX_BODY_SIZE;
    const text = decodeUtf8(head, kind === 'unknown', !cut);
    if (text === null) {
        return kind === 'unknown' ? BINARY_BODY_OMITTED : BODY_NOT_CAPTURED;
    }
    return cut ? text + truncationMarker(totalBytes) : text;
}
/**
 * Reads at most MAX_BODY_SIZE bytes (plus the rest of the chunk that crossed it) and cancels the
 * stream after that, so an endless or huge body is never read into memory.
 */
export async function readStreamHead(stream) {
    const reader = stream.getReader();
    const chunks = [];
    let received = 0;
    let complete = false;
    try {
        while (received <= MAX_BODY_SIZE) {
            const result = await reader.read();
            if (result.done) {
                complete = true;
                break;
            }
            const chunk = result.value;
            if (chunk && chunk.byteLength > 0) {
                chunks.push(chunk);
                received += chunk.byteLength;
            }
        }
    }
    finally {
        if (!complete) {
            try {
                reader.cancel().catch(() => undefined);
            }
            catch (e) {
                // Ignore.
            }
        }
    }
    const bytes = new Uint8Array(Math.min(received, MAX_BODY_SIZE + 1));
    let offset = 0;
    for (const chunk of chunks) {
        if (offset >= bytes.byteLength) {
            break;
        }
        const part = chunk.subarray(0, bytes.byteLength - offset);
        bytes.set(part, offset);
        offset += part.byteLength;
    }
    return { bytes, complete };
}
/** Reads the head of a blob (never the whole blob) and turns it into the logged text. */
export async function readBlobHead(blob, kind) {
    const head = blob.slice(0, MAX_BODY_SIZE);
    if (typeof head.arrayBuffer !== 'function') {
        return BODY_NOT_CAPTURED;
    }
    const buffer = await head.arrayBuffer();
    const complete = blob.size <= MAX_BODY_SIZE;
    return bytesToBodyText(new Uint8Array(buffer), kind, complete, complete ? null : blob.size);
}
export function isBlob(value) {
    return typeof Blob !== 'undefined' && value instanceof Blob;
}
export function isFormData(value) {
    return typeof FormData !== 'undefined' && value instanceof FormData;
}
export function isUrlSearchParams(value) {
    return typeof URLSearchParams !== 'undefined' && value instanceof URLSearchParams;
}
export function isReadableStream(value) {
    return typeof ReadableStream !== 'undefined' && value instanceof ReadableStream;
}
export function isDocument(value) {
    return typeof Document !== 'undefined' && value instanceof Document;
}
/** Byte view of an ArrayBuffer or ArrayBufferView, or null for anything else. */
export function toBytes(value) {
    if (typeof ArrayBuffer === 'undefined') {
        return null;
    }
    if (value instanceof ArrayBuffer) {
        return new Uint8Array(value);
    }
    if (ArrayBuffer.isView(value)) {
        return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
    }
    return null;
}
/**
 * The logged request payload for a fetch/XHR body. Strings and buffers are captured synchronously;
 * blobs are read asynchronously (head only). Form data, streams and documents are not captured.
 */
export function captureRequestBody(body, kind) {
    if (body === undefined || body === null) {
        return '';
    }
    if (isReadableStream(body)) {
        return STREAMING_BODY_OMITTED;
    }
    const marker = markerForKind(kind);
    if (marker) {
        return marker;
    }
    if (typeof body === 'string') {
        return capBodyText(body);
    }
    if (isUrlSearchParams(body)) {
        return capBodyText(body.toString());
    }
    if (isFormData(body) || isDocument(body)) {
        return BODY_NOT_CAPTURED;
    }
    if (isBlob(body)) {
        const blobKind = kind === 'unknown' ? classifyContentType(body.type) : kind;
        const blobMarker = markerForKind(blobKind);
        if (blobMarker) {
            return blobMarker;
        }
        return readBlobHead(body, blobKind).catch(() => BODY_NOT_CAPTURED);
    }
    const bytes = toBytes(body);
    if (bytes) {
        return bytesToBodyText(bytes, kind, bytes.byteLength <= MAX_BODY_SIZE, bytes.byteLength);
    }
    try {
        return capBodyText(String(body));
    }
    catch (e) {
        return BODY_NOT_CAPTURED;
    }
}
/**
 * JSON.stringify for a parsed JSON value (XHR responseType "json") that stops once the output
 * exceeds MAX_BODY_SIZE, so a huge response is not serialised in full.
 */
export function stringifyJsonHead(value) {
    const parts = [];
    let length = 0;
    let full = false;
    const push = (text) => {
        if (full) {
            return;
        }
        parts.push(text);
        length += text.length;
        if (length > MAX_BODY_SIZE) {
            full = true;
        }
    };
    const write = (node) => {
        if (full) {
            return;
        }
        if (node === null || typeof node !== 'object') {
            const text = JSON.stringify(node);
            push(text === undefined ? 'null' : text);
            return;
        }
        if (Array.isArray(node)) {
            push('[');
            for (let i = 0; i < node.length && !full; i++) {
                if (i > 0) {
                    push(',');
                }
                write(node[i]);
            }
            push(']');
            return;
        }
        push('{');
        let first = true;
        const record = node;
        for (const key of Object.keys(record)) {
            if (full) {
                break;
            }
            const child = record[key];
            if (child === undefined || typeof child === 'function') {
                continue;
            }
            push(`${first ? '' : ','}${JSON.stringify(key)}:`);
            first = false;
            write(child);
        }
        push('}');
    };
    write(value);
    const text = parts.join('');
    if (!full) {
        return text;
    }
    return sliceHead(text, MAX_BODY_SIZE) + truncationMarker(null);
}
//# sourceMappingURL=body.js.map