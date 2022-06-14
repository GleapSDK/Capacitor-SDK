import { WebPlugin } from '@capacitor/core';
import type { GleapPlugin } from './definitions';
export declare class GleapWeb extends WebPlugin implements GleapPlugin {
    initialize(_options: {
        API_KEY: string;
    }): Promise<{
        initialized: boolean;
    }>;
    setUserIdentity(_options: {
        userId: string;
        userName?: string;
        userEmail?: string;
    }): Promise<{
        setUserIdentity: boolean;
    }>;
    clearUserIdentity(): Promise<{
        clearIdentity: boolean;
    }>;
    addCustomData(_options: {
        dataKey: string;
        dataValue: string;
    }): Promise<{
        addCustomData: boolean;
    }>;
    appendCustomData(_options: {
        dataKey: string;
        dataValue: string;
    }): Promise<{
        appendCustomData: boolean;
    }>;
    removeCustomData(_options: {
        dataKey: string;
    }): Promise<{
        removeCustomData: boolean;
    }>;
    clearCustomData(_options: {
        dataKey: string;
    }): Promise<{
        clearCustomData: boolean;
    }>;
    logEvent(_options: {
        logEventSubject: string;
        logEventData?: string;
    }): Promise<{
        logEvent: boolean;
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
        feedbackType?: string;
    }): Promise<{
        startFeedbackFlow: boolean;
    }>;
    setLanguage(_options: {
        languageCode: string;
    }): Promise<{
        setLanguage: string;
    }>;
}
