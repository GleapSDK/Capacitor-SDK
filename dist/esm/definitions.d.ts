export interface GleapPlugin {
    /**
    * Initialize Gleap with an API key
    *
    * @since 0.0.1
    */
    initialize(options: {
        API_KEY: string;
    }): Promise<{
        initialized: boolean;
    }>;
    /**
    * Set user identity
    *
    * @since 0.0.1
    */
    setUserIdentity(options: {
        userId: string;
        userName?: string;
        userEmail?: string;
    }): Promise<{
        setUserIdentity: boolean;
    }>;
    /**
    * Clear user identity
    *
    * @since 0.0.1
    */
    clearUserIdentity(): Promise<{
        clearIdentity: boolean;
    }>;
    /**
    * Add custom data to logging
    *
    * @since 0.0.1
    */
    addCustomData(options: {
        dataKey: string;
        dataValue: string;
    }): Promise<{
        addCustomData: boolean;
    }>;
    /**
    * Append custom data
    *
    * @since 0.0.1
    */
    appendCustomData(options: {
        dataKey: string;
        dataValue: string;
    }): Promise<{
        appendCustomData: boolean;
    }>;
    /**
    * Append custom data
    *
    * @since 0.0.1
    */
    removeCustomData(options: {
        dataKey: string;
    }): Promise<{
        removeCustomData: boolean;
    }>;
    /**
    * Clear custom data
    *
    * @since 0.0.1
    */
    clearCustomData(options: {
        dataKey: string;
    }): Promise<{
        clearCustomData: boolean;
    }>;
    /**
    * Log event to Gleap
    *
    * @since 0.0.1
    */
    logEvent(options: {
        logEventSubject: string;
        logEventData?: string;
    }): Promise<{
        logEvent: boolean;
    }>;
    /**
   * Log event to Gleap
   *
   * @since 0.0.1
   */
    sendSilentBugReport(options: {
        silentBugReportInfo: string;
        silentBugReportSeverity: string;
    }): Promise<{
        sendSilentBugReport: boolean;
    }>;
    /**
    * Open Widget
    *
    * @since 0.0.1
    */
    openWidget(): Promise<{
        openWidget: boolean;
    }>;
    /**
   * Start Feedback flow
   *
   * @since 0.0.1
   */
    startFeedbackFlow(options: {
        feedbackType?: string;
    }): Promise<{
        startFeedbackFlow: boolean;
    }>;
    /**
   * Set Language
   *
   * @since 0.0.1
   */
    setLanguage(options: {
        languageCode: string;
    }): Promise<{
        setLanguage: string;
    }>;
}
