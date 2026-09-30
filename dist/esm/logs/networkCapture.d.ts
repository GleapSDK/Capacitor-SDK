import type { GleapNetworkLogEntry } from '../definitions';
export declare const MAX_NETWORK_ENTRIES = 30;
declare type HeaderMap = {
    [name: string]: string;
};
export interface NetworkLogSnapshot {
    id: number;
    version: number;
    entry: GleapNetworkLogEntry;
}
/**
 * Records fetch and XMLHttpRequest calls made inside the WebView. The hooks never alter or delay the
 * request: they only read what the app passes in and what comes back, and every hook is guarded so
 * a logging failure cannot break the app's networking.
 */
export declare class NetworkCapture {
    private readonly win;
    private readonly onChange;
    private records;
    private nextId;
    private active;
    private isInstalled;
    private xhrStates;
    private xhrsWithListeners;
    constructor(win: Window, onChange: () => void);
    /** Installs the hooks inactive: nothing is recorded until setActive(true). */
    install(): void;
    /** Inactive: the hooks stay in place but only call through, and the buffer is dropped. */
    setActive(active: boolean): void;
    getSnapshots(): NetworkLogSnapshot[];
    private patchFetch;
    private startFetch;
    /** The body of a Request object: read from a clone (made before fetch consumes it), head only. */
    private requestObjectPayload;
    private completeFetch;
    /**
     * Streaming and binary responses are never cloned. Text responses are cloned synchronously (before
     * the app sees the response) and only the head of the clone is read, then the clone is cancelled.
     */
    private fetchResponseBody;
    private patchXhr;
    private wrapXhrConstructor;
    private hookXhrMethods;
    private onXhrOpen;
    private onXhrHeader;
    private onXhrSend;
    private listenToXhr;
    private onXhrLoadEnd;
    /** The response is already in memory; only a bounded part of it is turned into text. */
    private xhrResponseBody;
    private requestPayload;
    private createRecord;
    private setResponseText;
    private fail;
    private update;
    private resolveUrl;
    /**
     * Only real network traffic: http(s) URLs that are not Gleap's own and not the app's bundled files
     * served by Capacitor's local server (http(s)://localhost on Android; capacitor:// on iOS).
     */
    private shouldCapture;
}
/** Headers | [name, value][] | record -> { lowercased name: value }, repeated names joined with ", ". */
export declare function normalizeHeaders(headers: unknown): HeaderMap;
export {};
