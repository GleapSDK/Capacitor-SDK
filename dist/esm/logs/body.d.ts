/** Maximum captured size per body (request payload or response text). */
export declare const MAX_BODY_SIZE = 150000;
export declare const BINARY_BODY_OMITTED = "[binary body omitted]";
export declare const STREAMING_BODY_OMITTED = "[streaming body omitted]";
export declare const BODY_NOT_CAPTURED = "[body not captured]";
export declare const BODY_PENDING = "[body pending]";
/**
 * text: capture; unknown (no content type): capture when it decodes as UTF-8;
 * streaming / binary: never read, only a marker.
 */
export declare type BodyKind = 'text' | 'unknown' | 'streaming' | 'binary';
export declare function classifyContentType(contentType: unknown): BodyKind;
export declare function markerForKind(kind: BodyKind): string | null;
/** UTF-8 byte length without allocating an encoded copy. */
export declare function utf8ByteLength(text: string): number;
/** Cuts a string at max chars without splitting a surrogate pair. */
export declare function sliceHead(text: string, max: number): string;
export declare function truncationMarker(totalBytes: number | null): string;
/** Caps a text body at MAX_BODY_SIZE chars: keeps the head and appends the truncation marker. */
export declare function capBodyText(text: string): string;
/**
 * Decodes bytes as UTF-8. With fatal (unknown content type) invalid UTF-8 yields null, so the caller
 * can mark the body as binary. A cut-off (incomplete) body keeps a split trailing character pending
 * instead of failing on it.
 */
export declare function decodeUtf8(bytes: Uint8Array, fatal: boolean, complete: boolean): string | null;
/**
 * Turns (at most MAX_BODY_SIZE) bytes into the logged text: decoded, capped, marked as truncated
 * when the body was longer, or the binary marker when it is not UTF-8 text.
 */
export declare function bytesToBodyText(bytes: Uint8Array, kind: BodyKind, complete: boolean, totalBytes: number | null): string;
/**
 * Reads at most MAX_BODY_SIZE bytes (plus the rest of the chunk that crossed it) and cancels the
 * stream after that, so an endless or huge body is never read into memory.
 */
export declare function readStreamHead(stream: ReadableStream<Uint8Array>): Promise<{
    bytes: Uint8Array;
    complete: boolean;
}>;
/** Reads the head of a blob (never the whole blob) and turns it into the logged text. */
export declare function readBlobHead(blob: Blob, kind: BodyKind): Promise<string>;
export declare function isBlob(value: unknown): value is Blob;
export declare function isFormData(value: unknown): boolean;
export declare function isUrlSearchParams(value: unknown): value is URLSearchParams;
export declare function isReadableStream(value: unknown): boolean;
export declare function isDocument(value: unknown): boolean;
/** Byte view of an ArrayBuffer or ArrayBufferView, or null for anything else. */
export declare function toBytes(value: unknown): Uint8Array | null;
/**
 * The logged request payload for a fetch/XHR body. Strings and buffers are captured synchronously;
 * blobs are read asynchronously (head only). Form data, streams and documents are not captured.
 */
export declare function captureRequestBody(body: unknown, kind: BodyKind): string | Promise<string>;
/**
 * JSON.stringify for a parsed JSON value (XHR responseType "json") that stops once the output
 * exceeds MAX_BODY_SIZE, so a huge response is not serialised in full.
 */
export declare function stringifyJsonHead(value: unknown): string;
