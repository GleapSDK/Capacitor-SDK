import type { GleapNetworkLogEntry } from '../definitions';

import {
  BINARY_BODY_OMITTED,
  BODY_NOT_CAPTURED,
  BODY_PENDING,
  MAX_BODY_SIZE,
  STREAMING_BODY_OMITTED,
  bytesToBodyText,
  capBodyText,
  captureRequestBody,
  classifyContentType,
  isBlob,
  isUrlSearchParams,
  markerForKind,
  readBlobHead,
  readStreamHead,
  stringifyJsonHead,
  toBytes,
} from './body';
import { DEFAULT_NETWORK_LOG_BLACKLIST } from './redaction';
import { runOutsideZone } from './zone';

export const MAX_NETWORK_ENTRIES = 30;

type HeaderMap = { [name: string]: string };
type AnyFunction = (...args: unknown[]) => unknown;

interface NetworkRecord {
  id: number;
  /** Bumped on every change, so the pusher can reuse the redacted copy of unchanged entries. */
  version: number;
  startedAt: number;
  entry: GleapNetworkLogEntry;
}

export interface NetworkLogSnapshot {
  id: number;
  version: number;
  entry: GleapNetworkLogEntry;
}

interface XhrState {
  method: string;
  url: string;
  headers: HeaderMap;
  record: NetworkRecord | null;
  headersAt: number | null;
  failure: 'abort' | 'timeout' | 'error' | null;
  loaded: boolean;
}

const now = (): number =>
  typeof performance !== 'undefined' && typeof performance.now === 'function' ? performance.now() : Date.now();

/**
 * Records fetch and XMLHttpRequest calls made inside the WebView. The hooks never alter or delay the
 * request: they only read what the app passes in and what comes back, and every hook is guarded so
 * a logging failure cannot break the app's networking.
 */
export class NetworkCapture {
  private records: NetworkRecord[] = [];
  private nextId = 1;
  private active = false;
  private isInstalled = false;
  private xhrStates = new WeakMap<object, XhrState>();
  private xhrsWithListeners = new WeakSet<object>();

  constructor(
    private readonly win: Window,
    private readonly onChange: () => void,
  ) {}

  install(): void {
    this.active = true;
    if (this.isInstalled) {
      return;
    }
    this.isInstalled = true;
    try {
      this.patchFetch();
    } catch (e) {
      // Ignore.
    }
    try {
      this.patchXhr();
    } catch (e) {
      // Ignore.
    }
  }

  /** Inactive: the hooks stay in place but only call through, and the buffer is dropped. */
  setActive(active: boolean): void {
    this.active = active;
    if (!active) {
      this.records = [];
    }
  }

  getSnapshots(): NetworkLogSnapshot[] {
    return this.records.map((record) => ({
      id: record.id,
      version: record.version,
      entry: record.entry,
    }));
  }

  // ---------------------------------------------------------------- fetch

  private patchFetch(): void {
    const win = this.win as unknown as { fetch?: AnyFunction };
    const originalFetch = win.fetch;
    if (typeof originalFetch !== 'function') {
      return;
    }
    const capture = this;
    win.fetch = function gleapFetch(this: unknown): unknown {
      // eslint-disable-next-line prefer-rest-params
      const args = arguments;
      let record: NetworkRecord | null = null;
      if (capture.active) {
        try {
          record = capture.startFetch(args[0], args[1]);
        } catch (e) {
          record = null;
        }
      }
      let result: unknown;
      try {
        result = originalFetch.apply(this, args as unknown as unknown[]);
      } catch (error) {
        if (record) {
          capture.fail(record, error);
        }
        throw error;
      }
      const promise = result as Promise<Response> | null;
      if (!record || !promise || typeof promise.then !== 'function') {
        return result;
      }
      const tracked = record;
      return promise.then(
        (response) => {
          capture.completeFetch(tracked, response);
          return response;
        },
        (error) => {
          capture.fail(tracked, error);
          throw error;
        },
      );
    };
  }

  private startFetch(input: unknown, init: unknown): NetworkRecord | null {
    const url = this.resolveUrl(isRequest(input) ? input.url : isUrl(input) ? input.href : input);
    if (!this.shouldCapture(url)) {
      return null;
    }
    const request = isRequest(input) ? input : null;
    const options = init && typeof init === 'object' ? (init as RequestInit) : undefined;
    const method = String(options?.method || request?.method || 'GET').toUpperCase();
    const headers = normalizeHeaders(
      options?.headers !== undefined ? options.headers : request ? request.headers : undefined,
    );

    let payload: string | Promise<string> = '';
    if (options?.body !== undefined && options?.body !== null) {
      payload = this.requestPayload(options.body, headers);
    } else if (request && method !== 'GET' && method !== 'HEAD') {
      payload = this.requestObjectPayload(request, headers);
    }
    return this.createRecord(method, url, headers, payload);
  }

  /** The body of a Request object: read from a clone (made before fetch consumes it), head only. */
  private requestObjectPayload(request: Request, headers: HeaderMap): string | Promise<string> {
    const kind = classifyContentType(headers['content-type']);
    const marker = markerForKind(kind);
    if (marker) {
      return marker;
    }
    if (typeof Request === 'undefined' || !('body' in Request.prototype)) {
      return BODY_NOT_CAPTURED;
    }
    if (request.body === null) {
      return '';
    }
    let copy: Request;
    try {
      copy = request.clone();
    } catch (e) {
      return BODY_NOT_CAPTURED;
    }
    const stream = copy.body;
    if (!stream || typeof stream.getReader !== 'function') {
      return BODY_NOT_CAPTURED;
    }
    return runOutsideZone(() =>
      readStreamHead(stream).then(
        ({ bytes, complete }) => bytesToBodyText(bytes, kind, complete, null),
        () => BODY_NOT_CAPTURED,
      ),
    );
  }

  private completeFetch(record: NetworkRecord, response: Response): void {
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
    } catch (e) {
      // Ignore.
    }
  }

  /**
   * Streaming and binary responses are never cloned. Text responses are cloned synchronously (before
   * the app sees the response) and only the head of the clone is read, then the clone is cancelled.
   */
  private fetchResponseBody(response: Response, headers: HeaderMap): string | Promise<string> {
    const kind = classifyContentType(headers['content-type']);
    const marker = markerForKind(kind);
    if (marker) {
      return marker;
    }
    if (response.type === 'opaque' || response.type === 'opaqueredirect') {
      return BODY_NOT_CAPTURED;
    }
    const body = response.body;
    if (body === null) {
      return '';
    }
    if (!body || typeof body.getReader !== 'function' || typeof response.clone !== 'function') {
      return BODY_NOT_CAPTURED;
    }
    let copy: Response;
    try {
      copy = response.clone();
    } catch (e) {
      return BODY_NOT_CAPTURED;
    }
    const stream = copy.body;
    if (!stream) {
      return '';
    }
    const totalBytes = identityContentLength(headers);
    return runOutsideZone(() =>
      readStreamHead(stream).then(
        ({ bytes, complete }) => bytesToBodyText(bytes, kind, complete, complete ? null : totalBytes),
        () => BODY_NOT_CAPTURED,
      ),
    );
  }

  // ------------------------------------------------------------------ XHR

  private patchXhr(): void {
    const win = this.win as unknown as {
      XMLHttpRequest?: unknown;
      CapacitorWebXMLHttpRequest?: { fullObject?: unknown };
    };
    const Xhr = win.XMLHttpRequest as (AnyFunction & { prototype?: { [name: string]: unknown } }) | undefined;
    if (typeof Xhr !== 'function' || !Xhr || !Xhr.prototype) {
      return;
    }
    const capacitorXhr = win.CapacitorWebXMLHttpRequest;
    if (capacitorXhr?.fullObject && Xhr !== capacitorXhr.fullObject) {
      // CapacitorHttp replaced the constructor and re-assigns the prototype methods on every
      // construction, so the methods are hooked per instance instead.
      this.wrapXhrConstructor(Xhr);
      return;
    }
    const proto = Xhr.prototype;
    const originals: { [name: string]: unknown } = {
      open: proto.open,
      send: proto.send,
      setRequestHeader: proto.setRequestHeader,
    };
    if (
      typeof originals.open !== 'function' ||
      typeof originals.send !== 'function' ||
      typeof originals.setRequestHeader !== 'function'
    ) {
      return;
    }
    this.hookXhrMethods(proto, (_xhr, name) => originals[name] as AnyFunction);
  }

  private wrapXhrConstructor(Factory: AnyFunction): void {
    const capture = this;
    const Wrapped = function GleapXMLHttpRequest(): unknown {
      const xhr = new (Factory as unknown as new () => object)();
      try {
        capture.hookXhrMethods(
          xhr as { [name: string]: unknown },
          (instance, name) => (Object.getPrototypeOf(instance) as { [name: string]: unknown })[name] as AnyFunction,
        );
      } catch (e) {
        // Ignore.
      }
      return xhr;
    } as unknown as { [name: string]: unknown; prototype: unknown };
    try {
      Object.assign(Wrapped, Factory);
    } catch (e) {
      // Ignore.
    }
    Wrapped.prototype = (Factory as unknown as { prototype: unknown }).prototype;
    (this.win as unknown as { XMLHttpRequest: unknown }).XMLHttpRequest = Wrapped;
  }

  private hookXhrMethods(
    target: { [name: string]: unknown },
    original: (xhr: object, name: string) => AnyFunction,
  ): void {
    const capture = this;
    target.open = function (this: object): unknown {
      // eslint-disable-next-line prefer-rest-params
      const args = arguments;
      try {
        capture.onXhrOpen(this, args[0], args[1]);
      } catch (e) {
        // Ignore.
      }
      return original(this, 'open').apply(this, args as unknown as unknown[]);
    };
    target.setRequestHeader = function (this: object): unknown {
      // eslint-disable-next-line prefer-rest-params
      const args = arguments;
      try {
        capture.onXhrHeader(this, args[0], args[1]);
      } catch (e) {
        // Ignore.
      }
      return original(this, 'setRequestHeader').apply(this, args as unknown as unknown[]);
    };
    target.send = function (this: object): unknown {
      // eslint-disable-next-line prefer-rest-params
      const args = arguments;
      let record: NetworkRecord | null = null;
      try {
        record = capture.onXhrSend(this, args[0]);
      } catch (e) {
        record = null;
      }
      try {
        return original(this, 'send').apply(this, args as unknown as unknown[]);
      } catch (error) {
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

  private onXhrOpen(xhr: object, method: unknown, url: unknown): void {
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

  private onXhrHeader(xhr: object, name: unknown, value: unknown): void {
    const state = this.xhrStates.get(xhr);
    if (state && typeof name === 'string') {
      addHeader(state.headers, name, String(value));
    }
  }

  private onXhrSend(xhr: object, body: unknown): NetworkRecord | null {
    if (!this.active) {
      return null;
    }
    const state = this.xhrStates.get(xhr);
    if (!state || !this.shouldCapture(state.url)) {
      return null;
    }
    this.listenToXhr(xhr as XMLHttpRequest);
    state.failure = null;
    state.loaded = false;
    state.headersAt = null;
    const headers: HeaderMap = { ...state.headers };
    const payload = state.method === 'GET' || state.method === 'HEAD' ? '' : this.requestPayload(body, headers);
    state.record = this.createRecord(state.method, state.url, headers, payload);
    return state.record;
  }

  private listenToXhr(xhr: XMLHttpRequest): void {
    if (this.xhrsWithListeners.has(xhr)) {
      return;
    }
    this.xhrsWithListeners.add(xhr);
    const state = () => this.xhrStates.get(xhr);
    const guard = (fn: (current: XhrState) => void) => () => {
      try {
        const current = state();
        if (current?.record) {
          fn(current);
        }
      } catch (e) {
        // Ignore.
      }
    };
    xhr.addEventListener(
      'readystatechange',
      guard((current) => {
        if (current.headersAt === null && xhr.readyState >= 2) {
          current.headersAt = now();
        }
      }),
    );
    xhr.addEventListener(
      'load',
      guard((current) => (current.loaded = true)),
    );
    xhr.addEventListener(
      'abort',
      guard((current) => (current.failure = 'abort')),
    );
    xhr.addEventListener(
      'timeout',
      guard((current) => (current.failure = 'timeout')),
    );
    xhr.addEventListener(
      'error',
      guard((current) => (current.failure = 'error')),
    );
    xhr.addEventListener(
      'loadend',
      guard((current) => this.onXhrLoadEnd(xhr, current)),
    );
  }

  private onXhrLoadEnd(xhr: XMLHttpRequest, state: XhrState): void {
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
      } else if (state.failure === 'timeout') {
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
    } catch (e) {
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
    let body: string | Promise<string>;
    try {
      body = this.xhrResponseBody(xhr, headers);
    } catch (e) {
      body = BODY_NOT_CAPTURED;
    }
    this.setResponseText(record, body);
  }

  /** The response is already in memory; only a bounded part of it is turned into text. */
  private xhrResponseBody(xhr: XMLHttpRequest, headers: HeaderMap): string | Promise<string> {
    const kind = classifyContentType(headers['content-type']);
    if (kind === 'streaming') {
      return STREAMING_BODY_OMITTED;
    }
    const responseType = xhr.responseType || '';
    if (kind === 'binary') {
      return BINARY_BODY_OMITTED;
    }
    if (responseType === '' || responseType === 'text') {
      const text: unknown = xhr.responseText;
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
      const value: unknown = xhr.response;
      if (value === null || value === undefined) {
        return BODY_NOT_CAPTURED;
      }
      return typeof value === 'string' ? capBodyText(value) : stringifyJsonHead(value);
    }
    if (responseType === 'arraybuffer') {
      const bytes = toBytes(xhr.response);
      if (!bytes) {
        return BODY_NOT_CAPTURED;
      }
      return bytesToBodyText(bytes, kind, bytes.byteLength <= MAX_BODY_SIZE, bytes.byteLength);
    }
    if (responseType === 'blob') {
      const blob: unknown = xhr.response;
      if (!isBlob(blob)) {
        return BODY_NOT_CAPTURED;
      }
      return runOutsideZone(() => readBlobHead(blob, kind).catch(() => BODY_NOT_CAPTURED));
    }
    return BODY_NOT_CAPTURED;
  }

  // --------------------------------------------------------------- shared

  private requestPayload(body: unknown, headers: HeaderMap): string | Promise<string> {
    if (isUrlSearchParams(body) && !hasOwn(headers, 'content-type')) {
      // Sent with this content type by the browser; recorded so form fields can be redacted.
      headers['content-type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
    }
    const kind = classifyContentType(headers['content-type']);
    return runOutsideZone(() => captureRequestBody(body, kind));
  }

  private createRecord(
    method: string,
    url: string,
    headers: HeaderMap,
    payload: string | Promise<string>,
  ): NetworkRecord {
    const record: NetworkRecord = {
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
      const setPayload = (text: string) =>
        this.update(record, (entry) => {
          if (entry.request) {
            entry.request.payload = text;
          }
        });
      runOutsideZone(() => payload.then(setPayload, () => setPayload(BODY_NOT_CAPTURED)));
    }
    this.records.push(record);
    if (this.records.length > MAX_NETWORK_ENTRIES) {
      this.records.splice(0, this.records.length - MAX_NETWORK_ENTRIES);
    }
    this.onChange();
    return record;
  }

  private setResponseText(record: NetworkRecord, body: string | Promise<string>): void {
    const apply = (text: string) =>
      this.update(record, (entry) => {
        if (entry.response && entry.response.errorText === undefined) {
          entry.response.responseText = text;
        }
      });
    if (typeof body === 'string') {
      apply(body);
      return;
    }
    runOutsideZone(() => body.then(apply, () => apply(BODY_NOT_CAPTURED)));
  }

  private fail(record: NetworkRecord, error: unknown): void {
    try {
      this.update(record, (entry) => {
        entry.duration = Math.round(now() - record.startedAt);
        entry.success = false;
        entry.response = { errorText: describeError(error) };
      });
    } catch (e) {
      // Ignore.
    }
  }

  private update(record: NetworkRecord, mutate: (entry: GleapNetworkLogEntry) => void): void {
    try {
      mutate(record.entry);
    } catch (e) {
      // Ignore.
    }
    record.version++;
    if (this.active && this.records.indexOf(record) > -1) {
      this.onChange();
    }
  }

  private resolveUrl(url: unknown): string {
    const raw = typeof url === 'string' ? url : String(url);
    try {
      const doc = this.win.document;
      const base = doc?.baseURI || this.win.location.href;
      return new URL(raw, base).href;
    } catch (e) {
      return raw;
    }
  }

  /**
   * Only real network traffic: http(s) URLs that are not Gleap's own and not the app's bundled files
   * served by Capacitor's local server (http(s)://localhost on Android; capacitor:// on iOS).
   */
  private shouldCapture(url: string): boolean {
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
    } catch (e) {
      // Ignore.
    }
    return true;
  }
}

function isRequest(value: unknown): value is Request {
  return typeof Request !== 'undefined' && value instanceof Request;
}

function isUrl(value: unknown): value is URL {
  return typeof URL !== 'undefined' && value instanceof URL;
}

function hasOwn(object: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function addHeader(headers: HeaderMap, name: string, value: string): void {
  const key = name.trim().toLowerCase();
  if (!key || key === '__proto__') {
    return;
  }
  headers[key] = hasOwn(headers, key) ? `${headers[key]}, ${value}` : value;
}

/** Headers | [name, value][] | record -> { lowercased name: value }, repeated names joined with ", ". */
export function normalizeHeaders(headers: unknown): HeaderMap {
  const result: HeaderMap = {};
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
      const record = headers as { [name: string]: unknown };
      for (const name of Object.keys(record)) {
        const value = record[name];
        if (value !== undefined && value !== null) {
          addHeader(result, name, String(value));
        }
      }
    }
  } catch (e) {
    // Ignore.
  }
  return result;
}

function parseRawHeaders(raw: string): HeaderMap {
  const result: HeaderMap = {};
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
function identityContentLength(headers: HeaderMap): number | null {
  const encoding = (headers['content-encoding'] || '').trim().toLowerCase();
  if (encoding && encoding !== 'identity') {
    return null;
  }
  const length = parseInt(headers['content-length'] || '', 10);
  return isFinite(length) && length >= 0 ? length : null;
}

function describeError(error: unknown): string {
  try {
    if (error && typeof error === 'object') {
      const { name, message } = error as { name?: unknown; message?: unknown };
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
  } catch (e) {
    return 'Request failed';
  }
}
