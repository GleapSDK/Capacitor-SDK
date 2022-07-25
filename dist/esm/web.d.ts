import { WebPlugin } from '@capacitor/core';
import type { GleapEventCallback, GleapPlugin } from './definitions';
export declare class GleapWeb extends WebPlugin implements GleapPlugin {
    static callbacks: {
        [key: string]: GleapEventCallback;
    };
    static initialized: boolean;
    initialize(options: {
        API_KEY: string;
    }): Promise<{
        initialized: boolean;
    }>;
    registerCallbackListeners(): void;
    notifyCallbacks(event: string, data: any): void;
    identify(options: {
        userId: string;
        userHash?: string | undefined;
        name?: string | undefined;
        email?: string | undefined;
        phone?: string | undefined;
        value?: number | undefined;
    }): Promise<{
        identify: boolean;
    }>;
    clearIdentity(): Promise<{
        clearIdentity: boolean;
    }>;
    attachCustomData(options: {
        data: any;
    }): Promise<{
        attachedCustomData: boolean;
    }>;
    setCustomData(options: {
        key: string;
        value: string;
    }): Promise<{
        setCustomData: boolean;
    }>;
    removeCustomData(options: {
        key: string;
    }): Promise<{
        removedCustomData: boolean;
    }>;
    clearCustomData(): Promise<{
        clearedCustomData: boolean;
    }>;
    logEvent(options: {
        name: string;
        data?: any;
    }): Promise<{
        loggedEvent: boolean;
    }>;
    startFeedbackFlow(options: {
        feedbackFlow?: string | undefined;
        showBackButton?: boolean | undefined;
    }): Promise<{
        startedFeedbackFlow: boolean;
    }>;
    setLanguage(options: {
        languageCode: string;
    }): Promise<{
        setLanguage: string;
    }>;
    log(options: {
        message: string;
        logLevel?: 'ERROR' | 'WARNING' | 'INFO' | undefined;
    }): Promise<{
        logged: boolean;
    }>;
    setEventCallback(callback: GleapEventCallback): Promise<string>;
    sendSilentCrashReport(options: {
        description: string;
        severity?: 'LOW' | 'MEDIUM' | 'HIGH' | undefined;
        dataExclusion?: {
            customData: Boolean;
            metaData: Boolean;
            attachments: Boolean;
            consoleLog: Boolean;
            networkLogs: Boolean;
            customEventLog: Boolean;
            screenshot: Boolean;
            replays: Boolean;
        } | undefined;
    }): Promise<{
        sentSilentBugReport: boolean;
    }>;
    open(): Promise<{
        openedWidget: boolean;
    }>;
    close(): Promise<{
        closedWidget: boolean;
    }>;
    isOpened(): Promise<{
        isOpened: boolean;
    }>;
    disableConsoleLogOverwrite(): Promise<{
        consoleLogDisabled: boolean;
    }>;
    enableDebugConsoleLog(): Promise<{
        debugConsoleLogEnabled: boolean;
    }>;
    preFillForm(options: {
        data: any;
    }): Promise<{
        preFilledForm: boolean;
    }>;
    addAttachment(_options: {
        base64data: string;
        name: string;
    }): Promise<{
        attachmentAdded: boolean;
    }>;
    removeAllAttachments(): Promise<{
        allAttachmentsRemoved: boolean;
    }>;
    private makeid;
}
