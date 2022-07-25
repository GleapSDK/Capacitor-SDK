import { WebPlugin } from '@capacitor/core';
import type { GleapEventCallback, GleapPlugin } from './definitions';
export declare class GleapWeb extends WebPlugin implements GleapPlugin {
    initialize(_options: {
        API_KEY: string;
    }): Promise<{
        initialized: boolean;
    }>;
    identify(_options: {
        userId: string;
        userName?: string;
        userEmail?: string;
    }): Promise<{
        identify: boolean;
    }>;
    clearIdentity(): Promise<{
        clearIdentity: boolean;
    }>;
    addCustomData(_options: {
        key: string;
        value: string;
    }): Promise<{
        addedCustomData: boolean;
    }>;
    setCustomData(_options: {
        key: string;
        value: string;
    }): Promise<{
        setCustomData: boolean;
    }>;
    removeCustomData(_options: {
        key: string;
    }): Promise<{
        removedCustomData: boolean;
    }>;
    clearCustomData(): Promise<{
        clearedCustomData: boolean;
    }>;
    logEvent(_options: {
        name: string;
        data?: any;
    }): Promise<{
        loggedEvent: boolean;
    }>;
    sendSilentBugReport(_options: {
        silentBugReportInfo: string;
        silentBugReportSeverity: string;
    }): Promise<{
        sendSilentBugReport: boolean;
    }>;
    openWidget(): Promise<{
        openWidget: boolean;
    }>;
    startFeedbackFlow(_options: {
        feedbackFlow?: string | undefined;
        showBackButton?: boolean | undefined;
    }): Promise<{
        startFeedbackFlow: boolean;
    }>;
    setLanguage(_options: {
        languageCode: string;
    }): Promise<{
        setLanguage: string;
    }>;
    log(_options: {
        message: string;
        logLevel?: 'ERROR' | 'WARNING' | 'INFO' | undefined;
    }): Promise<{
        logged: boolean;
    }>;
    setEventCallback(_callback: GleapEventCallback): Promise<string>;
    sendSilentCrashReport(_options: {
        description: string;
        severity?: 'LOW' | 'MEDIUM' | 'HIGH' | undefined;
        dataExclusion?: {
            customData?: Boolean | undefined;
            metaData?: Boolean | undefined;
            attachments?: Boolean | undefined;
            consoleLog?: Boolean | undefined;
            networkLogs?: Boolean | undefined;
            customEventLog?: Boolean | undefined;
            screenshot?: Boolean | undefined;
            replays?: Boolean | undefined;
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
    preFillForm(_options: {
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
}
