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
    showSurvey(options: {
        surveyId: string;
        format?: 'survey' | 'survey_full' | undefined;
    }): Promise<{
        opened: boolean;
    }>;
    showFeedbackButton(options: {
        show: boolean;
    }): Promise<{
        feedbackButtonShown: boolean;
    }>;
    setDisableInAppNotifications(options: {
        disableInAppNotifications?: boolean | undefined;
    }): Promise<{
        inAppNotificationsDisabled: boolean;
    }>;
    identify(options: {
        userId: string;
        userHash?: string | undefined;
        customData?: Object | undefined;
        name?: string | undefined;
        email?: string | undefined;
        phone?: string | undefined;
        value?: number | undefined;
    }): Promise<{
        identify: boolean;
    }>;
    setTags(options: {
        tags: string[];
    }): Promise<{
        tagsSet: boolean;
    }>;
    clearIdentity(): Promise<{
        clearIdentity: boolean;
    }>;
    getIdentity(): Promise<{
        identity: {
            userId: string;
            name?: string | undefined;
            email?: string | undefined;
            phone?: string | undefined;
            value?: number | undefined;
        };
    }>;
    isUserIdentified(): Promise<{
        isUserIdentified: boolean;
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
    trackEvent(options: {
        name: string;
        data?: any;
    }): Promise<{
        loggedEvent: boolean;
    }>;
    trackPage(options: {
        pageName: string;
    }): Promise<{
        trackedPage: boolean;
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
    openFeatureRequests(options: {
        showBackButton?: boolean | undefined;
    }): Promise<{
        openedFeatureRequests: boolean;
    }>;
    openNews(options: {
        showBackButton?: boolean | undefined;
    }): Promise<{
        openedNews: boolean;
    }>;
    openNewsArticle(options: {
        articleId: string;
        showBackButton?: boolean | undefined;
    }): Promise<{
        opened: boolean;
    }>;
    openHelpCenter(options: {
        showBackButton?: boolean | undefined;
    }): Promise<{
        opened: boolean;
    }>;
    openHelpCenterArticle(options: {
        articleId: string;
        showBackButton?: boolean | undefined;
    }): Promise<{
        opened: boolean;
    }>;
    openHelpCenterCollection(options: {
        collectionId: string;
        showBackButton?: boolean | undefined;
    }): Promise<{
        opened: boolean;
    }>;
    searchHelpCenter(options: {
        term: string;
        showBackButton?: boolean | undefined;
    }): Promise<{
        opened: boolean;
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
