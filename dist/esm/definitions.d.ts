export declare type CallbackID = string;
export declare type GleapEventCallback = (name: string, data?: any) => void;
export interface GleapPlugin {
    /**
    * Initialize Gleap with an API key
    *
    * @since 7.0.0
    */
    initialize(options: {
        API_KEY: string;
    }): Promise<{
        initialized: boolean;
    }>;
    /**
    * Set user identity
    *
    * @since 7.0.0
    */
    identify(options: {
        userId: string;
        userHash?: string;
        name?: string;
        email?: string;
        phone?: string;
        value?: number;
        customData?: Object;
    }): Promise<{
        identify: boolean;
    }>;
    /**
    * Clear user identity
    *
    * @since 7.0.0
    */
    clearIdentity(): Promise<{
        clearIdentity: boolean;
    }>;
    /**
    * Get the current user identity
    *
    * @since 8.1.0
    */
    getIdentity(): Promise<{
        identity: {
            userId: string;
            name?: string;
            email?: string;
            phone?: string;
            value?: number;
        };
    }>;
    /**
    * User identified status.
    *
    * @since 8.1.0
    */
    isUserIdentified(): Promise<{
        isUserIdentified: boolean;
    }>;
    /**
    * Submit a custom log message with the given level
    *
    * @since 7.0.0
    */
    log(options: {
        message: string;
        logLevel?: "ERROR" | "WARNING" | "INFO";
    }): Promise<{
        logged: boolean;
    }>;
    /**
    * Manually show a survey.
    *
    * @since 8.5.1
    */
    showSurvey(options: {
        surveyId: string;
        format?: "survey" | "survey_full";
    }): Promise<{
        opened: boolean;
    }>;
    /**
    * Add custom data
    *
    * @since 7.0.0
    */
    attachCustomData(options: {
        data: any;
    }): Promise<{
        attachedCustomData: boolean;
    }>;
    /**
    * Set custom data
    *
    * @since 7.0.0
    */
    setCustomData(options: {
        key: string;
        value: string;
    }): Promise<{
        setCustomData: boolean;
    }>;
    /**
    * Remove custom data by key
    *
    * @since 7.0.0
    */
    removeCustomData(options: {
        key: string;
    }): Promise<{
        removedCustomData: boolean;
    }>;
    /**
    * Clear custom data
    *
    * @since 7.0.0
    */
    clearCustomData(): Promise<{
        clearedCustomData: boolean;
    }>;
    /**
    * Log event to Gleap
    *
    * @since 8.0.0
    */
    trackEvent(options: {
        name: string;
        data?: any;
    }): Promise<{
        loggedEvent: boolean;
    }>;
    /**
    * Track a page view
    *
    * @since 8.4.1
    */
    trackPage(options: {
        pageName: string;
    }): Promise<{
        trackedPage: boolean;
    }>;
    /**
     *
     *
     * @since 7.0.0
     */
    setEventCallback(callback: GleapEventCallback): Promise<CallbackID>;
    /**
   * Log event to Gleap
   *
   * @since 7.0.0
   */
    sendSilentCrashReport(options: {
        description: string;
        severity?: "LOW" | "MEDIUM" | "HIGH";
        dataExclusion?: {
            customData: Boolean;
            metaData: Boolean;
            attachments: Boolean;
            consoleLog: Boolean;
            networkLogs: Boolean;
            customEventLog: Boolean;
            screenshot: Boolean;
            replays: Boolean;
        };
    }): Promise<{
        sentSilentBugReport: boolean;
    }>;
    /**
    * Prefills the widget's form data
    *
    * @since 7.0.0
    */
    preFillForm(options: {
        data: any;
    }): Promise<{
        preFilledForm: boolean;
    }>;
    /**
    * Add attachment as bas64 string
    *
    * @since 7.0.0
    */
    addAttachment(options: {
        base64data: string;
        name: string;
    }): Promise<{
        attachmentAdded: boolean;
    }>;
    /**
    * All attachments removed
    *
    * @since 7.0.0
    */
    removeAllAttachments(): Promise<{
        allAttachmentsRemoved: boolean;
    }>;
    /**
    * Open widget
    *
    * @since 7.0.0
    */
    open(): Promise<{
        openedWidget: boolean;
    }>;
    /**
    * Open news
    *
    * @since 8.4.0
    */
    openNews(options: {
        showBackButton?: boolean;
    }): Promise<{
        openedNews: boolean;
    }>;
    /**
    * Open news article
    *
    * @since 8.4.0
    */
    openNewsArticle(options: {
        articleId: string;
        showBackButton?: boolean;
    }): Promise<{
        opened: boolean;
    }>;
    /**
    * Open help center
    *
    * @since 8.4.0
    */
    openHelpCenter(options: {
        showBackButton?: boolean;
    }): Promise<{
        opened: boolean;
    }>;
    /**
    * Open help center article
    *
    * @since 8.4.0
    */
    openHelpCenterArticle(options: {
        articleId: string;
        showBackButton?: boolean;
    }): Promise<{
        opened: boolean;
    }>;
    /**
    * Open help center collection
    *
    * @since 8.4.0
    */
    openHelpCenterCollection(options: {
        collectionId: string;
        showBackButton?: boolean;
    }): Promise<{
        opened: boolean;
    }>;
    /**
    * Search help center
    *
    * @since 8.4.0
    */
    searchHelpCenter(options: {
        term: string;
        showBackButton?: boolean;
    }): Promise<{
        opened: boolean;
    }>;
    /**
    * Open feature requests
    *
    * @since 8.4.0
    */
    openFeatureRequests(options: {
        showBackButton?: boolean;
    }): Promise<{
        openedFeatureRequests: boolean;
    }>;
    /**
    * Close widget
    *
    * @since 7.0.0
    */
    close(): Promise<{
        closedWidget: boolean;
    }>;
    /**
    * Check widget status code
    *
    * @since 7.0.0
    */
    isOpened(): Promise<{
        isOpened: boolean;
    }>;
    /**
   * Start Feedback flow
   *
   * @since 7.0.0
   */
    startFeedbackFlow(options: {
        feedbackFlow?: string;
        showBackButton?: boolean;
    }): Promise<{
        startedFeedbackFlow: boolean;
    }>;
    /**
   * Show or hide the feedback button.
   *
   * @since 8.0.0
   */
    showFeedbackButton(options: {
        show?: boolean;
    }): Promise<{
        feedbackButtonShown: boolean;
    }>;
    /**
   * Set Language
   *
   * @since 7.0.0
   */
    setLanguage(options: {
        languageCode: string;
    }): Promise<{
        setLanguage: string;
    }>;
    /**
   * Disable console log overwrite
   *
   * @since 7.0.0
   */
    disableConsoleLogOverwrite(): Promise<{
        consoleLogDisabled: boolean;
    }>;
    /**
   * Enable debug console log
   *
   * @since 7.0.0
   */
    enableDebugConsoleLog(): Promise<{
        debugConsoleLogEnabled: boolean;
    }>;
}
