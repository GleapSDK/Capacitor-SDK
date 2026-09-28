var capacitorGleap = (function (exports, core, Gleap$1) {
    'use strict';

    const MAX_LOG_LENGTH = 1000;
    const MAX_ERROR_LOG_LENGTH = 5000;
    const TRUNCATED_SUFFIX = '… [truncated]';
    const MAX_DEPTH = 5;
    const MAX_KEYS = 50;
    const MAX_ITEMS = 50;
    /** Keeps the head of a log line so the result (incl. the suffix) fits max chars. */
    function truncateLog(text, max) {
        if (text.length <= max) {
            return text;
        }
        let end = Math.max(0, max - TRUNCATED_SUFFIX.length);
        const last = text.charCodeAt(end - 1);
        if (last >= 0xd800 && last <= 0xdbff) {
            end--;
        }
        return text.slice(0, end) + TRUNCATED_SUFFIX;
    }
    /**
     * Formats console arguments like the browser console does (printf-style %s %d %i %f %o %O %c in
     * the first string), with objects as depth-limited JSON. Stops early once the text exceeds the
     * budget, so logging a huge object stays cheap.
     */
    function formatConsoleArgs(args, budget) {
        if (!args || args.length === 0) {
            return '';
        }
        let out = '';
        let index = 0;
        const first = args[0];
        if (typeof first === 'string' && first.indexOf('%') > -1 && args.length > 1) {
            index = 1;
            for (let i = 0; i < first.length && out.length <= budget; i++) {
                const char = first[i];
                if (char !== '%' || i + 1 >= first.length) {
                    out += char;
                    continue;
                }
                const specifier = first[i + 1];
                if (specifier === '%') {
                    out += '%';
                    i++;
                    continue;
                }
                if ('sdifoOc'.indexOf(specifier) < 0 || index >= args.length) {
                    out += char;
                    continue;
                }
                const arg = args[index++];
                i++;
                switch (specifier) {
                    case 's':
                        out += typeof arg === 'string' ? arg : formatValue(arg, budget);
                        break;
                    case 'd':
                    case 'i':
                        out += formatInteger(arg);
                        break;
                    case 'f':
                        out += formatFloat(arg);
                        break;
                    case 'o':
                    case 'O':
                        out += formatValue(arg, budget);
                        break;
                }
            }
        }
        for (; index < args.length && out.length <= budget; index++) {
            const arg = args[index];
            const text = typeof arg === 'string' ? arg : formatValue(arg, budget);
            out = out.length > 0 ? `${out} ${text}` : text;
        }
        return out;
    }
    function formatInteger(value) {
        if (typeof value === 'number') {
            return String(value < 0 ? Math.ceil(value) : Math.floor(value));
        }
        if (typeof value === 'bigint') {
            return String(value);
        }
        if (typeof value === 'string') {
            return String(parseInt(value, 10));
        }
        return 'NaN';
    }
    function formatFloat(value) {
        if (typeof value === 'number') {
            return String(value);
        }
        if (typeof value === 'string') {
            return String(parseFloat(value));
        }
        return 'NaN';
    }
    /** A single value as text: strings as they are, errors with their stack, objects as JSON. */
    function formatValue(value, budget) {
        try {
            if (typeof value === 'string') {
                return value;
            }
            if (isError(value)) {
                return formatError(value);
            }
            if (value === null || (typeof value !== 'object' && typeof value !== 'function')) {
                return formatPrimitive(value);
            }
            const serializer = new Serializer(budget);
            serializer.write(value, 0);
            return serializer.result();
        }
        catch (e) {
            return '[unserializable value]';
        }
    }
    /** "Name: message" followed by the stack (V8 stacks already start with that line). */
    function formatError(error) {
        try {
            const err = error;
            const name = typeof err.name === 'string' && err.name ? err.name : 'Error';
            const message = typeof err.message === 'string' ? err.message : '';
            const head = message ? `${name}: ${message}` : name;
            const stack = typeof err.stack === 'string' ? err.stack.trim() : '';
            if (!stack) {
                return head;
            }
            if (stack.indexOf(head) === 0) {
                return stack;
            }
            return `${head}\n${stack}`;
        }
        catch (e) {
            return 'Error';
        }
    }
    function isError(value) {
        if (!value || typeof value !== 'object') {
            return false;
        }
        if (typeof Error !== 'undefined' && value instanceof Error) {
            return true;
        }
        const candidate = value;
        return (typeof candidate.message === 'string' && typeof candidate.stack === 'string' && typeof candidate.name === 'string');
    }
    function formatPrimitive(value) {
        if (typeof value === 'bigint') {
            return `${value}n`;
        }
        if (typeof value === 'symbol') {
            return value.toString();
        }
        return String(value);
    }
    function describeFunction(value) {
        const name = value.name;
        return `[Function: ${typeof name === 'string' && name ? name : 'anonymous'}]`;
    }
    function describeNode(value) {
        if (typeof Node === 'undefined' || !(value instanceof Node)) {
            return null;
        }
        if (typeof Element !== 'undefined' && value instanceof Element) {
            let text = `<${value.tagName.toLowerCase()}`;
            if (value.id) {
                text += `#${value.id}`;
            }
            const className = value.getAttribute('class');
            if (className) {
                text += `.${className.trim().split(/\s+/).join('.')}`;
            }
            return `${text}>`;
        }
        return value.nodeName;
    }
    function constructorName(value) {
        try {
            const proto = Object.getPrototypeOf(value);
            if (!proto) {
                return '';
            }
            const ctor = proto.constructor;
            const name = ctor && typeof ctor.name === 'string' ? ctor.name : '';
            return name === 'Object' ? '' : name;
        }
        catch (e) {
            return '';
        }
    }
    /** JSON-like serialiser with depth, key and length limits and circular protection. */
    class Serializer {
        constructor(budget) {
            this.budget = budget;
            this.parts = [];
            this.length = 0;
            this.ancestors = [];
        }
        result() {
            return this.parts.join('');
        }
        isFull() {
            return this.length > this.budget;
        }
        push(text) {
            if (this.isFull()) {
                return;
            }
            this.parts.push(text);
            this.length += text.length;
        }
        write(value, depth) {
            if (this.isFull()) {
                return;
            }
            if (value === null || value === undefined) {
                this.push(String(value));
                return;
            }
            switch (typeof value) {
                case 'string':
                    this.push(JSON.stringify(value));
                    return;
                case 'number':
                case 'boolean':
                case 'bigint':
                case 'symbol':
                    this.push(formatPrimitive(value));
                    return;
                case 'function':
                    this.push(describeFunction(value));
                    return;
            }
            this.writeObject(value, depth);
        }
        writeObject(value, depth) {
            if (this.ancestors.indexOf(value) > -1) {
                this.push('[Circular]');
                return;
            }
            if (isError(value)) {
                this.push(JSON.stringify(formatError(value).split('\n')[0]));
                return;
            }
            if (value instanceof Date) {
                this.push(isNaN(value.getTime()) ? '"Invalid Date"' : JSON.stringify(value.toISOString()));
                return;
            }
            if (value instanceof RegExp) {
                this.push(String(value));
                return;
            }
            const node = describeNode(value);
            if (node !== null) {
                this.push(node);
                return;
            }
            if (typeof window !== 'undefined' && value === window) {
                this.push('[Window]');
                return;
            }
            if (typeof ArrayBuffer !== 'undefined') {
                if (value instanceof ArrayBuffer) {
                    this.push(`[ArrayBuffer(${value.byteLength})]`);
                    return;
                }
                if (ArrayBuffer.isView(value)) {
                    const length = value.length;
                    this.push(`[${constructorName(value) || 'ArrayBufferView'}(${typeof length === 'number' ? length : value.byteLength})]`);
                    return;
                }
            }
            if (typeof Promise !== 'undefined' && value instanceof Promise) {
                this.push('[Promise]');
                return;
            }
            const isArray = Array.isArray(value);
            if (depth >= MAX_DEPTH) {
                this.push(isArray ? `[Array(${value.length})]` : '[Object]');
                return;
            }
            this.ancestors.push(value);
            try {
                if (isArray) {
                    this.writeArray(value, depth);
                }
                else if (typeof Map !== 'undefined' && value instanceof Map) {
                    this.writeMap(value, depth);
                }
                else if (typeof Set !== 'undefined' && value instanceof Set) {
                    this.writeSet(value, depth);
                }
                else {
                    this.writePlainObject(value, depth);
                }
            }
            finally {
                this.ancestors.pop();
            }
        }
        writeArray(value, depth) {
            this.push('[');
            const count = Math.min(value.length, MAX_ITEMS);
            for (let i = 0; i < count && !this.isFull(); i++) {
                if (i > 0) {
                    this.push(',');
                }
                this.write(value[i], depth + 1);
            }
            if (value.length > MAX_ITEMS) {
                this.push(`,"… ${value.length - MAX_ITEMS} more"`);
            }
            this.push(']');
        }
        writeMap(value, depth) {
            this.push(`Map(${value.size}) {`);
            let count = 0;
            value.forEach((item, key) => {
                if (count >= MAX_ITEMS || this.isFull()) {
                    return;
                }
                if (count > 0) {
                    this.push(', ');
                }
                this.write(key, depth + 1);
                this.push(' => ');
                this.write(item, depth + 1);
                count++;
            });
            this.push('}');
        }
        writeSet(value, depth) {
            this.push(`Set(${value.size}) {`);
            let count = 0;
            value.forEach((item) => {
                if (count >= MAX_ITEMS || this.isFull()) {
                    return;
                }
                if (count > 0) {
                    this.push(', ');
                }
                this.write(item, depth + 1);
                count++;
            });
            this.push('}');
        }
        writePlainObject(value, depth) {
            const record = value;
            if (typeof record.toJSON === 'function') {
                let converted;
                try {
                    converted = record.toJSON();
                }
                catch (e) {
                    converted = undefined;
                }
                if (converted !== undefined && converted !== value) {
                    this.write(converted, depth + 1);
                    return;
                }
            }
            const name = constructorName(value);
            if (name) {
                this.push(`${name} `);
            }
            this.push('{');
            const keys = Object.keys(record);
            const count = Math.min(keys.length, MAX_KEYS);
            for (let i = 0; i < count && !this.isFull(); i++) {
                if (i > 0) {
                    this.push(',');
                }
                this.push(`${JSON.stringify(keys[i])}:`);
                let child;
                try {
                    child = record[keys[i]];
                }
                catch (e) {
                    child = '[getter threw]';
                }
                this.write(child, depth + 1);
            }
            if (keys.length > MAX_KEYS) {
                this.push(`,"…":"${keys.length - MAX_KEYS} more keys"`);
            }
            this.push('}');
        }
    }

    const MAX_CONSOLE_ENTRIES = 500;
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
    class ConsoleCapture {
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

    /** Maximum captured size per body (request payload or response text). */
    const MAX_BODY_SIZE = 150000;
    const BINARY_BODY_OMITTED = '[binary body omitted]';
    const STREAMING_BODY_OMITTED = '[streaming body omitted]';
    const BODY_NOT_CAPTURED$1 = '[body not captured]';
    const BODY_PENDING = '[body pending]';
    const STREAMING_TYPES = [
        'text/event-stream',
        'application/x-ndjson',
        'application/stream+json',
        'multipart/x-mixed-replace',
        'grpc',
    ];
    const TEXT_TYPES = ['json', 'xml', 'text/', 'javascript', 'x-www-form-urlencoded', 'graphql'];
    function classifyContentType(contentType) {
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
    function markerForKind(kind) {
        if (kind === 'streaming') {
            return STREAMING_BODY_OMITTED;
        }
        if (kind === 'binary') {
            return BINARY_BODY_OMITTED;
        }
        return null;
    }
    /** UTF-8 byte length without allocating an encoded copy. */
    function utf8ByteLength(text) {
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
    function sliceHead(text, max) {
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
    function truncationMarker(totalBytes) {
        return `\n… [truncated, ${totalBytes !== null && totalBytes > MAX_BODY_SIZE ? totalBytes : `more than ${MAX_BODY_SIZE}`} bytes]`;
    }
    /** Caps a text body at MAX_BODY_SIZE chars: keeps the head and appends the truncation marker. */
    function capBodyText(text) {
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
    function decodeUtf8(bytes, fatal, complete) {
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
    function bytesToBodyText(bytes, kind, complete, totalBytes) {
        const head = bytes.byteLength > MAX_BODY_SIZE ? bytes.subarray(0, MAX_BODY_SIZE) : bytes;
        const cut = !complete || bytes.byteLength > MAX_BODY_SIZE;
        const text = decodeUtf8(head, kind === 'unknown', !cut);
        if (text === null) {
            return kind === 'unknown' ? BINARY_BODY_OMITTED : BODY_NOT_CAPTURED$1;
        }
        return cut ? text + truncationMarker(totalBytes) : text;
    }
    /**
     * Reads at most MAX_BODY_SIZE bytes (plus the rest of the chunk that crossed it) and cancels the
     * stream after that, so an endless or huge body is never read into memory.
     */
    async function readStreamHead(stream) {
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
    async function readBlobHead(blob, kind) {
        const head = blob.slice(0, MAX_BODY_SIZE);
        if (typeof head.arrayBuffer !== 'function') {
            return BODY_NOT_CAPTURED$1;
        }
        const buffer = await head.arrayBuffer();
        const complete = blob.size <= MAX_BODY_SIZE;
        return bytesToBodyText(new Uint8Array(buffer), kind, complete, complete ? null : blob.size);
    }
    function isBlob(value) {
        return typeof Blob !== 'undefined' && value instanceof Blob;
    }
    function isFormData(value) {
        return typeof FormData !== 'undefined' && value instanceof FormData;
    }
    function isUrlSearchParams(value) {
        return typeof URLSearchParams !== 'undefined' && value instanceof URLSearchParams;
    }
    function isReadableStream(value) {
        return typeof ReadableStream !== 'undefined' && value instanceof ReadableStream;
    }
    function isDocument(value) {
        return typeof Document !== 'undefined' && value instanceof Document;
    }
    /** Byte view of an ArrayBuffer or ArrayBufferView, or null for anything else. */
    function toBytes(value) {
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
    function captureRequestBody(body, kind) {
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
            return BODY_NOT_CAPTURED$1;
        }
        if (isBlob(body)) {
            const blobKind = kind === 'unknown' ? classifyContentType(body.type) : kind;
            const blobMarker = markerForKind(blobKind);
            if (blobMarker) {
                return blobMarker;
            }
            return readBlobHead(body, blobKind).catch(() => BODY_NOT_CAPTURED$1);
        }
        const bytes = toBytes(body);
        if (bytes) {
            return bytesToBodyText(bytes, kind, bytes.byteLength <= MAX_BODY_SIZE, bytes.byteLength);
        }
        try {
            return capBodyText(String(body));
        }
        catch (e) {
            return BODY_NOT_CAPTURED$1;
        }
    }
    /**
     * JSON.stringify for a parsed JSON value (XHR responseType "json") that stops once the output
     * exceeds MAX_BODY_SIZE, so a huge response is not serialised in full.
     */
    function stringifyJsonHead(value) {
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

    /** URLs containing one of these are never logged, in addition to the configured blacklist. */
    const DEFAULT_NETWORK_LOG_BLACKLIST = ['gleap.io', 'gleap.ai'];
    const REDACTED_VALUE = '[REDACTED]';
    const BODY_NOT_CAPTURED = '[body not captured]';
    /** Credential headers whose value is always masked (the header itself is kept). */
    const ALWAYS_MASKED_HEADERS = ['authorization', 'proxy-authorization', 'cookie', 'set-cookie'];
    /**
     * Builds the redaction rules from the props to ignore and the blacklist (remote config and local
     * setter calls combined by the caller). Entries are trimmed, lowercased and deduplicated.
     */
    function createRedactionRules(propsToIgnore, blacklist) {
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
    function isBlacklistedUrl(url, rules) {
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
    function redactHeaders(headers, rules) {
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
     * arrays too), and dotted props additionally as a path from the root, then re-serialises compactly.
     * A body that looks like JSON but does not parse (e.g. cut at the size limit) gets the values of
     * matching keys masked in the text instead. Returns the body untouched when nothing matched.
     */
    function redactJsonBody(body, rules) {
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
            return maskJsonKeysInText(body, rules);
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
    function redactFormBody(body, rules) {
        if (!body || rules.props.size === 0) {
            return body;
        }
        const filtered = filterParams(body, rules);
        return filtered === null ? body : filtered;
    }
    /** Removes query parameters named like a prop. The URL is returned untouched when nothing matched. */
    function redactUrl(url, rules) {
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
    function redactNetworkLogEntry(entry, rules) {
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
    /** Like redactNetworkLogEntry, but never throws: falls back to an entry without any content. */
    function redactNetworkLogEntryOrStrip(entry, rules) {
        try {
            return redactNetworkLogEntry(entry, rules);
        }
        catch (e) {
            return stripNetworkLogEntry(entry);
        }
    }
    /** Keeps method, URL (without query), timing and status; drops headers and bodies. */
    function stripNetworkLogEntry(entry) {
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
    /**
     * Masks the values of matching keys in JSON text that does not parse: every prop as a whole plus the
     * last segment of each dotted prop, case-insensitive. A string cut off at the end is masked too;
     * object and array values are left alone (their inner keys are matched on their own).
     */
    function maskJsonKeysInText(body, rules) {
        const keys = new Set(rules.props);
        for (const path of rules.paths) {
            keys.add(path[path.length - 1]);
        }
        let result = body;
        keys.forEach((key) => {
            // A JSON string never contains a raw line break, so a string cut at the end stops before the
            // "\n… [truncated" marker instead of swallowing it.
            const pattern = new RegExp(`"(${escapeRegExp(key)})"(\\s*:\\s*)("(?:[^"\\\\\\r\\n]|\\\\.)*"?|-?\\d[0-9.eE+-]*|true|false|null)`, 'gi');
            result = result.replace(pattern, `"$1"$2"${REDACTED_VALUE}"`);
        });
        return result === body ? body : result;
    }
    function escapeRegExp(text) {
        return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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

    /**
     * Runs fn in zone.js' root zone when zone.js is loaded (Angular / Ionic apps), so the plugin's
     * timers and body reads do not trigger Angular change detection. Without zone.js it just runs fn.
     */
    function runOutsideZone(fn) {
        const zone = typeof globalThis !== 'undefined'
            ? globalThis.Zone
            : undefined;
        const root = zone === null || zone === void 0 ? void 0 : zone.root;
        if (root && typeof root.run === 'function') {
            return root.run(fn);
        }
        return fn();
    }

    const MAX_NETWORK_ENTRIES = 30;
    const now = () => typeof performance !== 'undefined' && typeof performance.now === 'function' ? performance.now() : Date.now();
    /**
     * Records fetch and XMLHttpRequest calls made inside the WebView. The hooks never alter or delay the
     * request: they only read what the app passes in and what comes back, and every hook is guarded so
     * a logging failure cannot break the app's networking.
     */
    class NetworkCapture {
        constructor(win, onChange) {
            this.win = win;
            this.onChange = onChange;
            this.records = [];
            this.nextId = 1;
            this.active = false;
            this.isInstalled = false;
            this.xhrStates = new WeakMap();
            this.xhrsWithListeners = new WeakSet();
        }
        install() {
            this.active = true;
            if (this.isInstalled) {
                return;
            }
            this.isInstalled = true;
            try {
                this.patchFetch();
            }
            catch (e) {
                // Ignore.
            }
            try {
                this.patchXhr();
            }
            catch (e) {
                // Ignore.
            }
        }
        /** Inactive: the hooks stay in place but only call through, and the buffer is dropped. */
        setActive(active) {
            this.active = active;
            if (!active) {
                this.records = [];
            }
        }
        getSnapshots() {
            return this.records.map((record) => ({
                id: record.id,
                version: record.version,
                entry: record.entry,
            }));
        }
        // ---------------------------------------------------------------- fetch
        patchFetch() {
            const win = this.win;
            const originalFetch = win.fetch;
            if (typeof originalFetch !== 'function') {
                return;
            }
            const capture = this;
            win.fetch = function gleapFetch() {
                // eslint-disable-next-line prefer-rest-params
                const args = arguments;
                let record = null;
                if (capture.active) {
                    try {
                        record = capture.startFetch(args[0], args[1]);
                    }
                    catch (e) {
                        record = null;
                    }
                }
                let result;
                try {
                    result = originalFetch.apply(this, args);
                }
                catch (error) {
                    if (record) {
                        capture.fail(record, error);
                    }
                    throw error;
                }
                const promise = result;
                if (!record || !promise || typeof promise.then !== 'function') {
                    return result;
                }
                const tracked = record;
                return promise.then((response) => {
                    capture.completeFetch(tracked, response);
                    return response;
                }, (error) => {
                    capture.fail(tracked, error);
                    throw error;
                });
            };
        }
        startFetch(input, init) {
            const url = this.resolveUrl(isRequest(input) ? input.url : isUrl(input) ? input.href : input);
            if (!this.shouldCapture(url)) {
                return null;
            }
            const request = isRequest(input) ? input : null;
            const options = init && typeof init === 'object' ? init : undefined;
            const method = String((options === null || options === void 0 ? void 0 : options.method) || (request === null || request === void 0 ? void 0 : request.method) || 'GET').toUpperCase();
            const headers = normalizeHeaders((options === null || options === void 0 ? void 0 : options.headers) !== undefined ? options.headers : request ? request.headers : undefined);
            let payload = '';
            if ((options === null || options === void 0 ? void 0 : options.body) !== undefined && (options === null || options === void 0 ? void 0 : options.body) !== null) {
                payload = this.requestPayload(options.body, headers);
            }
            else if (request && method !== 'GET' && method !== 'HEAD') {
                payload = this.requestObjectPayload(request, headers);
            }
            return this.createRecord(method, url, headers, payload);
        }
        /** The body of a Request object: read from a clone (made before fetch consumes it), head only. */
        requestObjectPayload(request, headers) {
            const kind = classifyContentType(headers['content-type']);
            const marker = markerForKind(kind);
            if (marker) {
                return marker;
            }
            if (typeof Request === 'undefined' || !('body' in Request.prototype)) {
                return BODY_NOT_CAPTURED$1;
            }
            if (request.body === null) {
                return '';
            }
            let copy;
            try {
                copy = request.clone();
            }
            catch (e) {
                return BODY_NOT_CAPTURED$1;
            }
            const stream = copy.body;
            if (!stream || typeof stream.getReader !== 'function') {
                return BODY_NOT_CAPTURED$1;
            }
            return runOutsideZone(() => readStreamHead(stream).then(({ bytes, complete }) => bytesToBodyText(bytes, kind, complete, null), () => BODY_NOT_CAPTURED$1));
        }
        completeFetch(record, response) {
            try {
                const headers = normalizeHeaders(response.headers);
                this.update(record, (entry) => {
                    entry.duration = Math.round(now() - record.startedAt);
                    entry.success = true;
                    entry.response = {
                        status: response.status,
                        statusText: response.statusText || '',
                        headers,
                        responseText: BODY_PENDING,
                    };
                });
                this.setResponseText(record, this.fetchResponseBody(response, headers));
            }
            catch (e) {
                // Ignore.
            }
        }
        /**
         * Streaming and binary responses are never cloned. Text responses are cloned synchronously (before
         * the app sees the response) and only the head of the clone is read, then the clone is cancelled.
         */
        fetchResponseBody(response, headers) {
            const kind = classifyContentType(headers['content-type']);
            const marker = markerForKind(kind);
            if (marker) {
                return marker;
            }
            if (response.type === 'opaque' || response.type === 'opaqueredirect') {
                return BODY_NOT_CAPTURED$1;
            }
            const body = response.body;
            if (body === null) {
                return '';
            }
            if (!body || typeof body.getReader !== 'function' || typeof response.clone !== 'function') {
                return BODY_NOT_CAPTURED$1;
            }
            let copy;
            try {
                copy = response.clone();
            }
            catch (e) {
                return BODY_NOT_CAPTURED$1;
            }
            const stream = copy.body;
            if (!stream) {
                return '';
            }
            const totalBytes = identityContentLength(headers);
            return runOutsideZone(() => readStreamHead(stream).then(({ bytes, complete }) => bytesToBodyText(bytes, kind, complete, complete ? null : totalBytes), () => BODY_NOT_CAPTURED$1));
        }
        // ------------------------------------------------------------------ XHR
        patchXhr() {
            const win = this.win;
            const Xhr = win.XMLHttpRequest;
            if (typeof Xhr !== 'function' || !Xhr || !Xhr.prototype) {
                return;
            }
            const capacitorXhr = win.CapacitorWebXMLHttpRequest;
            if ((capacitorXhr === null || capacitorXhr === void 0 ? void 0 : capacitorXhr.fullObject) && Xhr !== capacitorXhr.fullObject) {
                // CapacitorHttp replaced the constructor and re-assigns the prototype methods on every
                // construction, so the methods are hooked per instance instead.
                this.wrapXhrConstructor(Xhr);
                return;
            }
            const proto = Xhr.prototype;
            const originals = {
                open: proto.open,
                send: proto.send,
                setRequestHeader: proto.setRequestHeader,
            };
            if (typeof originals.open !== 'function' ||
                typeof originals.send !== 'function' ||
                typeof originals.setRequestHeader !== 'function') {
                return;
            }
            this.hookXhrMethods(proto, (_xhr, name) => originals[name]);
        }
        wrapXhrConstructor(Factory) {
            const capture = this;
            const Wrapped = function GleapXMLHttpRequest() {
                const xhr = new Factory();
                try {
                    capture.hookXhrMethods(xhr, (instance, name) => Object.getPrototypeOf(instance)[name]);
                }
                catch (e) {
                    // Ignore.
                }
                return xhr;
            };
            try {
                Object.assign(Wrapped, Factory);
            }
            catch (e) {
                // Ignore.
            }
            Wrapped.prototype = Factory.prototype;
            this.win.XMLHttpRequest = Wrapped;
        }
        hookXhrMethods(target, original) {
            const capture = this;
            target.open = function () {
                // eslint-disable-next-line prefer-rest-params
                const args = arguments;
                try {
                    capture.onXhrOpen(this, args[0], args[1]);
                }
                catch (e) {
                    // Ignore.
                }
                return original(this, 'open').apply(this, args);
            };
            target.setRequestHeader = function () {
                // eslint-disable-next-line prefer-rest-params
                const args = arguments;
                try {
                    capture.onXhrHeader(this, args[0], args[1]);
                }
                catch (e) {
                    // Ignore.
                }
                return original(this, 'setRequestHeader').apply(this, args);
            };
            target.send = function () {
                // eslint-disable-next-line prefer-rest-params
                const args = arguments;
                let record = null;
                try {
                    record = capture.onXhrSend(this, args[0]);
                }
                catch (e) {
                    record = null;
                }
                try {
                    return original(this, 'send').apply(this, args);
                }
                catch (error) {
                    if (record) {
                        capture.fail(record, error);
                        const state = capture.xhrStates.get(this);
                        if (state && state.record === record) {
                            state.record = null;
                        }
                    }
                    throw error;
                }
            };
        }
        onXhrOpen(xhr, method, url) {
            this.xhrStates.set(xhr, {
                method: String(method || 'GET').toUpperCase(),
                url: this.resolveUrl(isUrl(url) ? url.href : url),
                headers: {},
                record: null,
                headersAt: null,
                failure: null,
                loaded: false,
            });
        }
        onXhrHeader(xhr, name, value) {
            const state = this.xhrStates.get(xhr);
            if (state && typeof name === 'string') {
                addHeader(state.headers, name, String(value));
            }
        }
        onXhrSend(xhr, body) {
            if (!this.active) {
                return null;
            }
            const state = this.xhrStates.get(xhr);
            if (!state || !this.shouldCapture(state.url)) {
                return null;
            }
            this.listenToXhr(xhr);
            state.failure = null;
            state.loaded = false;
            state.headersAt = null;
            const headers = Object.assign({}, state.headers);
            const payload = state.method === 'GET' || state.method === 'HEAD' ? '' : this.requestPayload(body, headers);
            state.record = this.createRecord(state.method, state.url, headers, payload);
            return state.record;
        }
        listenToXhr(xhr) {
            if (this.xhrsWithListeners.has(xhr)) {
                return;
            }
            this.xhrsWithListeners.add(xhr);
            const state = () => this.xhrStates.get(xhr);
            const guard = (fn) => () => {
                try {
                    const current = state();
                    if (current === null || current === void 0 ? void 0 : current.record) {
                        fn(current);
                    }
                }
                catch (e) {
                    // Ignore.
                }
            };
            xhr.addEventListener('readystatechange', guard((current) => {
                if (current.headersAt === null && xhr.readyState >= 2) {
                    current.headersAt = now();
                }
            }));
            xhr.addEventListener('load', guard((current) => (current.loaded = true)));
            xhr.addEventListener('abort', guard((current) => (current.failure = 'abort')));
            xhr.addEventListener('timeout', guard((current) => (current.failure = 'timeout')));
            xhr.addEventListener('error', guard((current) => (current.failure = 'error')));
            xhr.addEventListener('loadend', guard((current) => this.onXhrLoadEnd(xhr, current)));
        }
        onXhrLoadEnd(xhr, state) {
            const record = state.record;
            if (!record) {
                return;
            }
            state.record = null;
            const finishedAt = now();
            if (state.failure || !state.loaded) {
                let errorText = 'Network request failed';
                if (state.failure === 'abort') {
                    errorText = 'Request aborted';
                }
                else if (state.failure === 'timeout') {
                    errorText = xhr.timeout > 0 ? `Request timed out after ${xhr.timeout} ms` : 'Request timed out';
                }
                this.update(record, (entry) => {
                    entry.duration = Math.round(finishedAt - record.startedAt);
                    entry.success = false;
                    entry.response = { errorText };
                });
                return;
            }
            let rawHeaders = '';
            try {
                rawHeaders = xhr.getAllResponseHeaders();
            }
            catch (e) {
                rawHeaders = '';
            }
            const headers = parseRawHeaders(rawHeaders);
            this.update(record, (entry) => {
                entry.duration = Math.round((state.headersAt !== null ? state.headersAt : finishedAt) - record.startedAt);
                entry.success = true;
                entry.response = {
                    status: xhr.status,
                    statusText: xhr.statusText || '',
                    headers,
                    responseText: BODY_PENDING,
                };
            });
            let body;
            try {
                body = this.xhrResponseBody(xhr, headers);
            }
            catch (e) {
                body = BODY_NOT_CAPTURED$1;
            }
            this.setResponseText(record, body);
        }
        /** The response is already in memory; only a bounded part of it is turned into text. */
        xhrResponseBody(xhr, headers) {
            const kind = classifyContentType(headers['content-type']);
            if (kind === 'streaming') {
                return STREAMING_BODY_OMITTED;
            }
            const responseType = xhr.responseType || '';
            if (kind === 'binary') {
                return BINARY_BODY_OMITTED;
            }
            if (responseType === '' || responseType === 'text') {
                const text = xhr.responseText;
                if (typeof text !== 'string') {
                    return text === null || text === undefined ? '' : stringifyJsonHead(text);
                }
                if (kind === 'unknown' && text.indexOf('�') > -1) {
                    // The browser had to replace invalid UTF-8: not a text body.
                    return BINARY_BODY_OMITTED;
                }
                return capBodyText(text);
            }
            if (responseType === 'json') {
                const value = xhr.response;
                if (value === null || value === undefined) {
                    return BODY_NOT_CAPTURED$1;
                }
                return typeof value === 'string' ? capBodyText(value) : stringifyJsonHead(value);
            }
            if (responseType === 'arraybuffer') {
                const bytes = toBytes(xhr.response);
                if (!bytes) {
                    return BODY_NOT_CAPTURED$1;
                }
                return bytesToBodyText(bytes, kind, bytes.byteLength <= MAX_BODY_SIZE, bytes.byteLength);
            }
            if (responseType === 'blob') {
                const blob = xhr.response;
                if (!isBlob(blob)) {
                    return BODY_NOT_CAPTURED$1;
                }
                return runOutsideZone(() => readBlobHead(blob, kind).catch(() => BODY_NOT_CAPTURED$1));
            }
            return BODY_NOT_CAPTURED$1;
        }
        // --------------------------------------------------------------- shared
        requestPayload(body, headers) {
            if (isUrlSearchParams(body) && !hasOwn(headers, 'content-type')) {
                // Sent with this content type by the browser; recorded so form fields can be redacted.
                headers['content-type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
            }
            const kind = classifyContentType(headers['content-type']);
            return runOutsideZone(() => captureRequestBody(body, kind));
        }
        createRecord(method, url, headers, payload) {
            const record = {
                id: this.nextId++,
                version: 0,
                startedAt: now(),
                entry: {
                    date: new Date().toISOString(),
                    type: method,
                    url,
                    request: {
                        headers,
                        payload: typeof payload === 'string' ? payload : BODY_PENDING,
                    },
                },
            };
            if (typeof payload !== 'string') {
                const setPayload = (text) => this.update(record, (entry) => {
                    if (entry.request) {
                        entry.request.payload = text;
                    }
                });
                runOutsideZone(() => payload.then(setPayload, () => setPayload(BODY_NOT_CAPTURED$1)));
            }
            this.records.push(record);
            if (this.records.length > MAX_NETWORK_ENTRIES) {
                this.records.splice(0, this.records.length - MAX_NETWORK_ENTRIES);
            }
            this.onChange();
            return record;
        }
        setResponseText(record, body) {
            const apply = (text) => this.update(record, (entry) => {
                if (entry.response && entry.response.errorText === undefined) {
                    entry.response.responseText = text;
                }
            });
            if (typeof body === 'string') {
                apply(body);
                return;
            }
            runOutsideZone(() => body.then(apply, () => apply(BODY_NOT_CAPTURED$1)));
        }
        fail(record, error) {
            try {
                this.update(record, (entry) => {
                    entry.duration = Math.round(now() - record.startedAt);
                    entry.success = false;
                    entry.response = { errorText: describeError(error) };
                });
            }
            catch (e) {
                // Ignore.
            }
        }
        update(record, mutate) {
            try {
                mutate(record.entry);
            }
            catch (e) {
                // Ignore.
            }
            record.version++;
            if (this.active && this.records.indexOf(record) > -1) {
                this.onChange();
            }
        }
        resolveUrl(url) {
            const raw = typeof url === 'string' ? url : String(url);
            try {
                const doc = this.win.document;
                const base = (doc === null || doc === void 0 ? void 0 : doc.baseURI) || this.win.location.href;
                return new URL(raw, base).href;
            }
            catch (e) {
                return raw;
            }
        }
        /**
         * Only real network traffic: http(s) URLs that are not Gleap's own and not the app's bundled files
         * served by Capacitor's local server (http(s)://localhost on Android; capacitor:// on iOS).
         */
        shouldCapture(url) {
            const lower = url.toLowerCase();
            if (lower.indexOf('http://') !== 0 && lower.indexOf('https://') !== 0) {
                return false;
            }
            for (const host of DEFAULT_NETWORK_LOG_BLACKLIST) {
                if (lower.indexOf(host) > -1) {
                    return false;
                }
            }
            try {
                const location = this.win.location;
                if (location.hostname === 'localhost' && !location.port) {
                    return new URL(url).origin !== location.origin;
                }
            }
            catch (e) {
                // Ignore.
            }
            return true;
        }
    }
    function isRequest(value) {
        return typeof Request !== 'undefined' && value instanceof Request;
    }
    function isUrl(value) {
        return typeof URL !== 'undefined' && value instanceof URL;
    }
    function hasOwn(object, key) {
        return Object.prototype.hasOwnProperty.call(object, key);
    }
    function addHeader(headers, name, value) {
        const key = name.trim().toLowerCase();
        if (!key || key === '__proto__') {
            return;
        }
        headers[key] = hasOwn(headers, key) ? `${headers[key]}, ${value}` : value;
    }
    /** Headers | [name, value][] | record -> { lowercased name: value }, repeated names joined with ", ". */
    function normalizeHeaders(headers) {
        const result = {};
        if (!headers) {
            return result;
        }
        try {
            if (typeof Headers !== 'undefined' && headers instanceof Headers) {
                headers.forEach((value, name) => addHeader(result, name, value));
                return result;
            }
            if (Array.isArray(headers)) {
                for (const pair of headers) {
                    if (pair && pair.length >= 2) {
                        addHeader(result, String(pair[0]), String(pair[1]));
                    }
                }
                return result;
            }
            if (typeof headers === 'object') {
                const record = headers;
                for (const name of Object.keys(record)) {
                    const value = record[name];
                    if (value !== undefined && value !== null) {
                        addHeader(result, name, String(value));
                    }
                }
            }
        }
        catch (e) {
            // Ignore.
        }
        return result;
    }
    function parseRawHeaders(raw) {
        const result = {};
        if (typeof raw !== 'string') {
            return result;
        }
        for (const line of raw.split(/\r?\n/)) {
            const index = line.indexOf(':');
            if (index > 0) {
                addHeader(result, line.slice(0, index), line.slice(index + 1).trim());
            }
        }
        return result;
    }
    /** content-length when it describes the decoded body (no content-encoding), else null. */
    function identityContentLength(headers) {
        const encoding = (headers['content-encoding'] || '').trim().toLowerCase();
        if (encoding && encoding !== 'identity') {
            return null;
        }
        const length = parseInt(headers['content-length'] || '', 10);
        return isFinite(length) && length >= 0 ? length : null;
    }
    function describeError(error) {
        try {
            if (error && typeof error === 'object') {
                const { name, message } = error;
                const text = typeof message === 'string' ? message : '';
                if (name === 'AbortError') {
                    return text ? `Request aborted (${text})` : 'Request aborted';
                }
                if (name === 'TimeoutError') {
                    return text ? `Request timed out (${text})` : 'Request timed out';
                }
                if (text) {
                    return typeof name === 'string' && name ? `${name}: ${text}` : text;
                }
            }
            const text = String(error);
            return text && text !== 'undefined' ? text : 'Request failed';
        }
        catch (e) {
            return 'Request failed';
        }
    }

    /** Pushes are batched: at most one per channel every PUSH_DELAY_MS. */
    const PUSH_DELAY_MS = 500;
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
    class WebViewLogCapture {
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
    function installWebViewLogCapture(target) {
        try {
            if (typeof window === 'undefined' || !core.Capacitor.isNativePlatform()) {
                return null;
            }
            const win = window;
            const existing = win[GLOBAL_KEY];
            if (existing) {
                return existing;
            }
            const capture = new WebViewLogCapture(window, target, core.Capacitor.getPlatform());
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
    function wrapPluginWithLogCapture(plugin, capture) {
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

    const GleapNative = core.registerPlugin('Gleap', {
        web: () => Promise.resolve().then(function () { return web; }).then(m => new m.GleapWeb()),
    });
    // On iOS and Android, record the WebView's console and fetch/XHR traffic from the moment the
    // plugin is imported, and hand it to the native SDK (which cannot see either on its own).
    const webViewLogCapture = installWebViewLogCapture(GleapNative);
    const Gleap = webViewLogCapture
        ? wrapPluginWithLogCapture(GleapNative, webViewLogCapture)
        : GleapNative;
    const registeredAgentTools = {};
    let agentToolListenerAttached = false;
    /**
     * Registers the handler for a Frontend tool defined on your AI agent in the
     * Gleap dashboard. The agent calls the handler with the configured parameters
     * and waits for the returned result (string or object, which gets
     * stringified).
     */
    const registerAgentTool = async (name, handler) => {
        if (!name || typeof handler !== 'function') {
            return;
        }
        registeredAgentTools[name] = handler;
        if (!agentToolListenerAttached) {
            agentToolListenerAttached = true;
            await Gleap.addListener('agentToolExecution', async (data) => {
                var _a;
                try {
                    const { executionId, name: toolName, params } = data !== null && data !== void 0 ? data : {};
                    if (!executionId || !toolName) {
                        return;
                    }
                    let result;
                    const toolHandler = registeredAgentTools[toolName];
                    if (!toolHandler) {
                        result = `No handler registered for tool '${toolName}' in the app. Register one via Gleap.registerAgentTool('${toolName}', handler).`;
                    }
                    else {
                        try {
                            const handlerResult = await toolHandler(params !== null && params !== void 0 ? params : {});
                            result =
                                typeof handlerResult === 'string'
                                    ? handlerResult
                                    : JSON.stringify(handlerResult !== null && handlerResult !== void 0 ? handlerResult : '');
                            if (!result) {
                                result = 'The action completed without returning a result.';
                            }
                        }
                        catch (error) {
                            result = `Tool execution failed: ${(_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : 'unknown error'}`;
                        }
                    }
                    await Gleap.sendAgentToolResult({ executionId, result });
                }
                catch (exp) {
                    // Ignore.
                }
            });
        }
        await Gleap.registerAgentTool({ name });
    };

    class GleapWeb extends core.WebPlugin {
        constructor() {
            super(...arguments);
            this.pendingAgentToolExecutions = {};
        }
        async initialize(options) {
            if (GleapWeb.initialized) {
                return { initialized: true };
            }
            Gleap$1.initialize(options.API_KEY);
            GleapWeb.initialized = true;
            this.registerCallbackListeners();
            return { initialized: true };
        }
        async setRegion(options) {
            if (!(options === null || options === void 0 ? void 0 : options.region)) {
                throw new Error('No region provided');
            }
            Gleap$1.setRegion(options.region);
            return { region: options.region };
        }
        async setApiUrl(options) {
            if (!(options === null || options === void 0 ? void 0 : options.url)) {
                throw new Error('No url provided');
            }
            Gleap$1.setApiUrl(options.url);
            return { url: options.url };
        }
        async setWSApiUrl(options) {
            if (!(options === null || options === void 0 ? void 0 : options.url)) {
                throw new Error('No url provided');
            }
            Gleap$1.setWSApiUrl(options.url);
            return { url: options.url };
        }
        async setRealtimeHost(options) {
            if (!(options === null || options === void 0 ? void 0 : options.host)) {
                throw new Error('No host provided');
            }
            Gleap$1.setRealtimeHost(options.host);
            return { host: options.host };
        }
        async setFrameUrl(options) {
            if (!(options === null || options === void 0 ? void 0 : options.url)) {
                throw new Error('No url provided');
            }
            Gleap$1.setFrameUrl(options.url);
            return { url: options.url };
        }
        async setBannerUrl(options) {
            if (!(options === null || options === void 0 ? void 0 : options.url)) {
                throw new Error('No url provided');
            }
            Gleap$1.setBannerUrl(options.url);
            return { url: options.url };
        }
        async setModalUrl(options) {
            if (!(options === null || options === void 0 ? void 0 : options.url)) {
                throw new Error('No url provided');
            }
            Gleap$1.setModalUrl(options.url);
            return { url: options.url };
        }
        registerCallbackListeners() {
            Gleap$1.on('open', () => {
                this.notifyCallbacks('open', {});
            });
            Gleap$1.on('initialized', () => {
                this.notifyCallbacks('initialized', {});
            });
            Gleap$1.on('close', () => {
                this.notifyCallbacks('close', {});
            });
            Gleap$1.on('feedback-sent', formData => {
                this.notifyCallbacks('feedback-sent', formData);
            });
            Gleap$1.on('outbound-sent', formData => {
                this.notifyCallbacks('outbound-sent', formData);
            });
            Gleap$1.on('tool-execution', toolExecution => {
                this.notifyCallbacks('tool-execution', toolExecution);
            });
            Gleap$1.on('flow-started', flow => {
                this.notifyCallbacks('flow-started', flow);
            });
            Gleap$1.on('error-while-sending', () => {
                this.notifyCallbacks('error-while-sending', {});
            });
            Gleap$1.on('unregister-pushmessage-group', groupName => {
                this.notifyCallbacks('unregister-pushmessage-group', groupName);
            });
            Gleap$1.on('register-pushmessage-group', groupName => {
                this.notifyCallbacks('register-pushmessage-group', groupName);
            });
            Gleap$1.on('unread-count-changed', groupName => {
                this.notifyCallbacks('notification-count-updated', groupName);
            });
            Gleap$1.registerCustomAction(customAction => {
                this.notifyCallbacks('custom-action-called', customAction);
            });
        }
        async registerAgentTool(options) {
            const gleapSdk = Gleap$1;
            if (typeof gleapSdk.registerAgentTool !== 'function') {
                console.warn('Gleap: registerAgentTool requires a newer version of the Gleap JS SDK.');
                return;
            }
            gleapSdk.registerAgentTool(options.name, (params) => new Promise(resolve => {
                const executionId = `web-${++GleapWeb.agentToolExecutionCounter}`;
                this.pendingAgentToolExecutions[executionId] = resolve;
                this.notifyListeners('agentToolExecution', {
                    executionId,
                    name: options.name,
                    params: params !== null && params !== void 0 ? params : {},
                });
            }));
        }
        async sendAgentToolResult(options) {
            const resolve = this.pendingAgentToolExecutions[options.executionId];
            if (resolve) {
                delete this.pendingAgentToolExecutions[options.executionId];
                resolve(options.result);
            }
        }
        async setTicketAttribute(options) {
            Gleap$1.setTicketAttribute(options.key, options.value);
            return { setTicketAttribute: true };
        }
        async unsetTicketAttribute(options) {
            Gleap$1.unsetTicketAttribute(options.key);
            return { unsetTicketAttribute: true };
        }
        async clearTicketAttributes() {
            Gleap$1.clearTicketAttributes();
            return { clearTicketAttributes: true };
        }
        notifyCallbacks(event, data) {
            if (!GleapWeb.callbacks) {
                return;
            }
            for (var callbackId in GleapWeb.callbacks) {
                GleapWeb.callbacks[callbackId]({
                    name: event,
                    data,
                });
            }
        }
        async startClassicForm(options) {
            var _a;
            Gleap$1.startClassicForm((_a = options.formId) !== null && _a !== void 0 ? _a : '', options.showBackButton);
            return { classicFormStarted: true };
        }
        async startConversation(options) {
            Gleap$1.startConversation(options.showBackButton);
            return { conversationStarted: true };
        }
        async openConversation(options) {
            Gleap$1.openConversations(options.showBackButton);
            return { conversationsOpened: true };
        }
        async showSurvey(options) {
            Gleap$1.showSurvey(options.surveyId, options.format);
            return { opened: true };
        }
        async showFeedbackButton(options) {
            Gleap$1.showFeedbackButton(options.show ? true : false);
            return { feedbackButtonShown: true };
        }
        async setDisableInAppNotifications(options) {
            var _a;
            Gleap$1.setDisableInAppNotifications((_a = options.disableInAppNotifications) !== null && _a !== void 0 ? _a : false);
            return { inAppNotificationsDisabled: true };
        }
        async setDisableEnvData(options) {
            var _a;
            Gleap$1.setDisableEnvData((_a = options.disableEnvData) !== null && _a !== void 0 ? _a : false);
            return { envDataDisabled: true };
        }
        async identify(options) {
            var userData = {
                name: options.name,
                email: options.email,
                phone: options.phone,
                companyId: options.companyId,
                companyName: options.companyName,
                avatar: options.avatar,
                sla: options.sla,
                plan: options.plan,
                value: options.value,
                customData: options.customData,
            };
            if (options.userHash) {
                Gleap$1.identify(options.userId, userData, options.userHash);
            }
            else {
                Gleap$1.identify(options.userId, userData);
            }
            return { identify: true };
        }
        async updateContact(options) {
            Gleap$1.updateContact(options);
            return { identify: true };
        }
        async setNetworkLogsBlacklist(options) {
            Gleap$1.setNetworkLogsBlacklist(options.blacklist);
            return { blacklistSet: true };
        }
        async setNetworkLogPropsToIgnore(options) {
            Gleap$1.setNetworkLogPropsToIgnore(options.propsToIgnore);
            return { propsToIgnoreSet: true };
        }
        async attachNetworkLogs() {
            // The JavaScript SDK records the page's requests itself on web.
            return { networkLogsAttached: false };
        }
        async attachConsoleLogs() {
            // The JavaScript SDK records the page's console itself on web.
            return { consoleLogsAttached: false };
        }
        async setEnvDataPropsToIgnore(options) {
            Gleap$1.setEnvDataPropsToIgnore(options.propsToIgnore);
            return { envDataPropsToIgnoreSet: true };
        }
        async setTags(options) {
            Gleap$1.setTags(options.tags);
            return { tagsSet: true };
        }
        async clearIdentity() {
            Gleap$1.clearIdentity();
            return { clearIdentity: true };
        }
        async getIdentity() {
            return { identity: Gleap$1.getIdentity() };
        }
        async isUserIdentified() {
            return { isUserIdentified: Gleap$1.isUserIdentified() };
        }
        async attachCustomData(options) {
            Gleap$1.attachCustomData(options.data);
            return { attachedCustomData: true };
        }
        async setCustomData(options) {
            Gleap$1.setCustomData(options.key, options.value);
            return { setCustomData: true };
        }
        async removeCustomData(options) {
            Gleap$1.removeCustomData(options.key);
            return { removedCustomData: true };
        }
        async clearCustomData() {
            Gleap$1.clearCustomData();
            return { clearedCustomData: true };
        }
        async trackEvent(options) {
            Gleap$1.trackEvent(options.name, options.data);
            return { loggedEvent: true };
        }
        async trackPage(options) {
            Gleap$1.trackEvent('pageView', {
                page: options.pageName,
            });
            return { trackedPage: true };
        }
        async startFeedbackFlow(options) {
            var _a;
            if (!options.feedbackFlow) ;
            Gleap$1.startFeedbackFlow((_a = options.feedbackFlow) !== null && _a !== void 0 ? _a : 'bugreporting', options.showBackButton);
            return { startedFeedbackFlow: true };
        }
        async startBot(options) {
            var _a;
            if (!options.botId) ;
            Gleap$1.startBot((_a = options.botId) !== null && _a !== void 0 ? _a : '', options.showBackButton);
            return { startedBot: true };
        }
        async setLanguage(options) {
            Gleap$1.setLanguage(options.languageCode);
            return { setLanguage: options.languageCode };
        }
        async log(options) {
            Gleap$1.log(options.message, options.logLevel);
            return { logged: true };
        }
        async setEventCallback(callback) {
            var callbackId = this.makeid(10);
            GleapWeb.callbacks[callbackId] = callback;
            return callbackId;
        }
        async sendSilentCrashReport(options) {
            Gleap$1.sendSilentCrashReport(options.description, options.severity, options.dataExclusion);
            return { sentSilentBugReport: true };
        }
        async open() {
            Gleap$1.open();
            return { openedWidget: true };
        }
        async openFeatureRequests(options) {
            Gleap$1.openFeatureRequests(options.showBackButton);
            return { openedFeatureRequests: true };
        }
        async openNews(options) {
            Gleap$1.openNews(options.showBackButton);
            return { openedNews: true };
        }
        async openNewsArticle(options) {
            Gleap$1.openNewsArticle(options.articleId, options.showBackButton);
            return { opened: true };
        }
        async openHelpCenter(options) {
            Gleap$1.openHelpCenter(options.showBackButton);
            return { opened: true };
        }
        async openHelpCenterArticle(options) {
            Gleap$1.openHelpCenterArticle(options.articleId, options.showBackButton);
            return { opened: true };
        }
        async askAI(options) {
            Gleap$1.askAI(options.question, options.showBackButton);
            return { opened: true };
        }
        async openHelpCenterCollection(options) {
            Gleap$1.openHelpCenterCollection(options.collectionId, options.showBackButton);
            return { opened: true };
        }
        async searchHelpCenter(options) {
            Gleap$1.searchHelpCenter(options.term, options.showBackButton);
            return { opened: true };
        }
        async close() {
            Gleap$1.close();
            return { closedWidget: true };
        }
        async isOpened() {
            return { isOpened: Gleap$1.isOpened() };
        }
        async disableConsoleLogOverwrite() {
            Gleap$1.disableConsoleLogOverwrite();
            return { consoleLogDisabled: true };
        }
        async enableDebugConsoleLog() {
            return { debugConsoleLogEnabled: true };
        }
        async preFillForm(options) {
            Gleap$1.preFillForm(options.data);
            return { preFilledForm: true };
        }
        async addAttachment(_options) {
            throw this.unavailable('addAttachment not available for browsers');
        }
        async removeAllAttachments() {
            throw this.unavailable('removeAllAttachments not available for browsers');
        }
        async setNotificationContainerOffset(_options) {
            return { notificationContainerOffsetSet: true };
        }
        makeid(length) {
            var result = '';
            var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            var charactersLength = characters.length;
            for (var i = 0; i < length; i++) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return result;
        }
    }
    GleapWeb.callbacks = {};
    GleapWeb.initialized = false;
    GleapWeb.agentToolExecutionCounter = 0;

    var web = /*#__PURE__*/Object.freeze({
        __proto__: null,
        GleapWeb: GleapWeb
    });

    exports.Gleap = Gleap;
    exports.registerAgentTool = registerAgentTool;

    return exports;

})({}, capacitorExports, Gleap$1);
//# sourceMappingURL=plugin.js.map
