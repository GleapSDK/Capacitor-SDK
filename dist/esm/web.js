import { WebPlugin } from '@capacitor/core';
import Gleap from 'gleap';
export class GleapWeb extends WebPlugin {
    async initialize(options) {
        if (GleapWeb.initialized) {
            return { initialized: true };
        }
        Gleap.initialize(options.API_KEY);
        GleapWeb.initialized = true;
        this.registerCallbackListeners();
        return { initialized: true };
    }
    registerCallbackListeners() {
        Gleap.on('open', () => {
            this.notifyCallbacks('open', {});
        });
        Gleap.on('initialized', () => {
            this.notifyCallbacks('initialized', {});
        });
        Gleap.on('close', () => {
            this.notifyCallbacks('close', {});
        });
        Gleap.on('feedback-sent', formData => {
            this.notifyCallbacks('feedback-sent', formData);
        });
        Gleap.on('flow-started', flow => {
            this.notifyCallbacks('flow-started', flow);
        });
        Gleap.on('error-while-sending', () => {
            this.notifyCallbacks('error-while-sending', {});
        });
        Gleap.on('unregister-pushmessage-group', groupName => {
            this.notifyCallbacks('unregister-pushmessage-group', groupName);
        });
        Gleap.on('register-pushmessage-group', groupName => {
            this.notifyCallbacks('register-pushmessage-group', groupName);
        });
        Gleap.on('unread-count-changed', groupName => {
            this.notifyCallbacks('notification-count-updated', groupName);
        });
        Gleap.registerCustomAction(customAction => {
            this.notifyCallbacks('custom-action-called', customAction);
        });
    }
    notifyCallbacks(event, data) {
        if (!GleapWeb.callbacks) {
            return;
        }
        for (var callbackId in GleapWeb.callbacks) {
            GleapWeb.callbacks[callbackId](event, data);
        }
    }
    async startClassicForm(options) {
        var _a;
        Gleap.startClassicForm((_a = options.formId) !== null && _a !== void 0 ? _a : '', options.showBackButton);
        return { classicFormStarted: true };
    }
    async startConversation(options) {
        Gleap.startConversation(options.showBackButton);
        return { conversationStarted: true };
    }
    async showSurvey(options) {
        Gleap.showSurvey(options.surveyId, options.format);
        return { opened: true };
    }
    async showFeedbackButton(options) {
        Gleap.showFeedbackButton(options.show ? true : false);
        return { feedbackButtonShown: true };
    }
    async setDisableInAppNotifications(options) {
        var _a;
        Gleap.setDisableInAppNotifications((_a = options.disableInAppNotifications) !== null && _a !== void 0 ? _a : false);
        return { inAppNotificationsDisabled: true };
    }
    async identify(options) {
        var userData = {
            name: options.name,
            email: options.email,
            phone: options.phone,
            companyId: options.companyId,
            companyName: options.companyName,
            plan: options.plan,
            value: options.value,
            customData: options.customData,
        };
        if (options.userHash) {
            Gleap.identify(options.userId, userData, options.userHash);
        }
        else {
            Gleap.identify(options.userId, userData);
        }
        return { identify: true };
    }
    async setTags(options) {
        Gleap.setTags(options.tags);
        return { tagsSet: true };
    }
    async clearIdentity() {
        Gleap.clearIdentity();
        return { clearIdentity: true };
    }
    async getIdentity() {
        return { identity: Gleap.getIdentity() };
    }
    async isUserIdentified() {
        return { isUserIdentified: Gleap.isUserIdentified() };
    }
    async attachCustomData(options) {
        Gleap.attachCustomData(options.data);
        return { attachedCustomData: true };
    }
    async setCustomData(options) {
        Gleap.setCustomData(options.key, options.value);
        return { setCustomData: true };
    }
    async removeCustomData(options) {
        Gleap.removeCustomData(options.key);
        return { removedCustomData: true };
    }
    async clearCustomData() {
        Gleap.clearCustomData();
        return { clearedCustomData: true };
    }
    async trackEvent(options) {
        Gleap.trackEvent(options.name, options.data);
        return { loggedEvent: true };
    }
    async trackPage(options) {
        Gleap.trackEvent('pageView', {
            page: options.pageName,
        });
        return { trackedPage: true };
    }
    async startFeedbackFlow(options) {
        var _a;
        if (!options.feedbackFlow) {
        }
        Gleap.startFeedbackFlow((_a = options.feedbackFlow) !== null && _a !== void 0 ? _a : 'bugreporting', options.showBackButton);
        return { startedFeedbackFlow: true };
    }
    async startBot(options) {
        var _a;
        if (!options.botId) {
        }
        Gleap.startBot((_a = options.botId) !== null && _a !== void 0 ? _a : '', options.showBackButton);
        return { startedBot: true };
    }
    async setLanguage(options) {
        Gleap.setLanguage(options.languageCode);
        return { setLanguage: options.languageCode };
    }
    async log(options) {
        Gleap.log(options.message, options.logLevel);
        return { logged: true };
    }
    async setEventCallback(callback) {
        var callbackId = this.makeid(10);
        GleapWeb.callbacks[callbackId] = callback;
        return callbackId;
    }
    async sendSilentCrashReport(options) {
        Gleap.sendSilentCrashReport(options.description, options.severity, options.dataExclusion);
        return { sentSilentBugReport: true };
    }
    async open() {
        Gleap.open();
        return { openedWidget: true };
    }
    async openFeatureRequests(options) {
        Gleap.openFeatureRequests(options.showBackButton);
        return { openedFeatureRequests: true };
    }
    async openNews(options) {
        Gleap.openNews(options.showBackButton);
        return { openedNews: true };
    }
    async openNewsArticle(options) {
        Gleap.openNewsArticle(options.articleId, options.showBackButton);
        return { opened: true };
    }
    async openHelpCenter(options) {
        Gleap.openHelpCenter(options.showBackButton);
        return { opened: true };
    }
    async openHelpCenterArticle(options) {
        Gleap.openHelpCenterArticle(options.articleId, options.showBackButton);
        return { opened: true };
    }
    async openHelpCenterCollection(options) {
        Gleap.openHelpCenterCollection(options.collectionId, options.showBackButton);
        return { opened: true };
    }
    async searchHelpCenter(options) {
        Gleap.searchHelpCenter(options.term, options.showBackButton);
        return { opened: true };
    }
    async close() {
        Gleap.close();
        return { closedWidget: true };
    }
    async isOpened() {
        return { isOpened: Gleap.isOpened() };
    }
    async disableConsoleLogOverwrite() {
        Gleap.disableConsoleLogOverwrite();
        return { consoleLogDisabled: true };
    }
    async enableDebugConsoleLog() {
        return { debugConsoleLogEnabled: true };
    }
    async preFillForm(options) {
        Gleap.preFillForm(options.data);
        return { preFilledForm: true };
    }
    async addAttachment(_options) {
        throw this.unavailable('addAttachment not available for browsers');
    }
    async removeAllAttachments() {
        throw this.unavailable('removeAllAttachments not available for browsers');
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
//# sourceMappingURL=web.js.map