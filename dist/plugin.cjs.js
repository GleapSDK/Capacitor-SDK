'use strict';

var core = require('@capacitor/core');
var Gleap$1 = require('gleap');

const Gleap = core.registerPlugin('Gleap', {
    web: () => Promise.resolve().then(function () { return web; }).then(m => new m.GleapWeb()),
});

class GleapWeb extends core.WebPlugin {
    async initialize(options) {
        if (GleapWeb.initialized) {
            return { initialized: true };
        }
        Gleap$1.initialize(options.API_KEY);
        GleapWeb.initialized = true;
        this.registerCallbackListeners();
        return { initialized: true };
    }
    registerCallbackListeners() {
        Gleap$1.on('open', () => {
            this.notifyCallbacks('open', {});
        });
        Gleap$1.on('initialized', () => {
            this.notifyCallbacks('initialized', {});
        });
        Gleap$1.on('close', () => {
            this.notifyCallbacks('close', {});
        });
        Gleap$1.on('feedback-sent', formData => {
            this.notifyCallbacks('feedback-sent', formData);
        });
        Gleap$1.on('outbound-sent', formData => {
            this.notifyCallbacks('outbound-sent', formData);
        });
        Gleap$1.on('tool-execution', toolExecution => {
            this.notifyCallbacks('tool-execution', toolExecution);
        });
        Gleap$1.on('flow-started', flow => {
            this.notifyCallbacks('flow-started', flow);
        });
        Gleap$1.on('error-while-sending', () => {
            this.notifyCallbacks('error-while-sending', {});
        });
        Gleap$1.on('unregister-pushmessage-group', groupName => {
            this.notifyCallbacks('unregister-pushmessage-group', groupName);
        });
        Gleap$1.on('register-pushmessage-group', groupName => {
            this.notifyCallbacks('register-pushmessage-group', groupName);
        });
        Gleap$1.on('unread-count-changed', groupName => {
            this.notifyCallbacks('notification-count-updated', groupName);
        });
        Gleap$1.registerCustomAction(customAction => {
            this.notifyCallbacks('custom-action-called', customAction);
        });
    }
    async setAiTools(options) {
        Gleap$1.setAiTools(options.tools);
        return { aiToolsSet: true };
    }
    async setTicketAttribute(options) {
        Gleap$1.setTicketAttribute(options.key, options.value);
        return { setTicketAttribute: true };
    }
    async unsetTicketAttribute(options) {
        Gleap$1.unsetTicketAttribute(options.key);
        return { unsetTicketAttribute: true };
    }
    async clearTicketAttributes() {
        Gleap$1.clearTicketAttributes();
        return { clearTicketAttributes: true };
    }
    notifyCallbacks(event, data) {
        if (!GleapWeb.callbacks) {
            return;
        }
        for (var callbackId in GleapWeb.callbacks) {
            GleapWeb.callbacks[callbackId]({
                name: event,
                data,
            });
        }
    }
    async startClassicForm(options) {
        var _a;
        Gleap$1.startClassicForm((_a = options.formId) !== null && _a !== void 0 ? _a : '', options.showBackButton);
        return { classicFormStarted: true };
    }
    async startConversation(options) {
        Gleap$1.startConversation(options.showBackButton);
        return { conversationStarted: true };
    }
    async openConversation(options) {
        Gleap$1.openConversations(options.showBackButton);
        return { conversationsOpened: true };
    }
    async showSurvey(options) {
        Gleap$1.showSurvey(options.surveyId, options.format);
        return { opened: true };
    }
    async showFeedbackButton(options) {
        Gleap$1.showFeedbackButton(options.show ? true : false);
        return { feedbackButtonShown: true };
    }
    async setDisableInAppNotifications(options) {
        var _a;
        Gleap$1.setDisableInAppNotifications((_a = options.disableInAppNotifications) !== null && _a !== void 0 ? _a : false);
        return { inAppNotificationsDisabled: true };
    }
    async identify(options) {
        var userData = {
            name: options.name,
            email: options.email,
            phone: options.phone,
            companyId: options.companyId,
            companyName: options.companyName,
            avatar: options.avatar,
            sla: options.sla,
            plan: options.plan,
            value: options.value,
            customData: options.customData,
        };
        if (options.userHash) {
            Gleap$1.identify(options.userId, userData, options.userHash);
        }
        else {
            Gleap$1.identify(options.userId, userData);
        }
        return { identify: true };
    }
    async updateContact(options) {
        Gleap$1.updateContact(options);
        return { identify: true };
    }
    async setNetworkLogsBlacklist(options) {
        Gleap$1.setNetworkLogsBlacklist(options.blacklist);
        return { blacklistSet: true };
    }
    async setNetworkLogPropsToIgnore(options) {
        Gleap$1.setNetworkLogPropsToIgnore(options.propsToIgnore);
        return { propsToIgnoreSet: true };
    }
    async setTags(options) {
        Gleap$1.setTags(options.tags);
        return { tagsSet: true };
    }
    async clearIdentity() {
        Gleap$1.clearIdentity();
        return { clearIdentity: true };
    }
    async getIdentity() {
        return { identity: Gleap$1.getIdentity() };
    }
    async isUserIdentified() {
        return { isUserIdentified: Gleap$1.isUserIdentified() };
    }
    async attachCustomData(options) {
        Gleap$1.attachCustomData(options.data);
        return { attachedCustomData: true };
    }
    async setCustomData(options) {
        Gleap$1.setCustomData(options.key, options.value);
        return { setCustomData: true };
    }
    async removeCustomData(options) {
        Gleap$1.removeCustomData(options.key);
        return { removedCustomData: true };
    }
    async clearCustomData() {
        Gleap$1.clearCustomData();
        return { clearedCustomData: true };
    }
    async trackEvent(options) {
        Gleap$1.trackEvent(options.name, options.data);
        return { loggedEvent: true };
    }
    async trackPage(options) {
        Gleap$1.trackEvent('pageView', {
            page: options.pageName,
        });
        return { trackedPage: true };
    }
    async startFeedbackFlow(options) {
        var _a;
        if (!options.feedbackFlow) ;
        Gleap$1.startFeedbackFlow((_a = options.feedbackFlow) !== null && _a !== void 0 ? _a : 'bugreporting', options.showBackButton);
        return { startedFeedbackFlow: true };
    }
    async startBot(options) {
        var _a;
        if (!options.botId) ;
        Gleap$1.startBot((_a = options.botId) !== null && _a !== void 0 ? _a : '', options.showBackButton);
        return { startedBot: true };
    }
    async setLanguage(options) {
        Gleap$1.setLanguage(options.languageCode);
        return { setLanguage: options.languageCode };
    }
    async log(options) {
        Gleap$1.log(options.message, options.logLevel);
        return { logged: true };
    }
    async setEventCallback(callback) {
        var callbackId = this.makeid(10);
        GleapWeb.callbacks[callbackId] = callback;
        return callbackId;
    }
    async sendSilentCrashReport(options) {
        Gleap$1.sendSilentCrashReport(options.description, options.severity, options.dataExclusion);
        return { sentSilentBugReport: true };
    }
    async open() {
        Gleap$1.open();
        return { openedWidget: true };
    }
    async openFeatureRequests(options) {
        Gleap$1.openFeatureRequests(options.showBackButton);
        return { openedFeatureRequests: true };
    }
    async openNews(options) {
        Gleap$1.openNews(options.showBackButton);
        return { openedNews: true };
    }
    async openNewsArticle(options) {
        Gleap$1.openNewsArticle(options.articleId, options.showBackButton);
        return { opened: true };
    }
    async openHelpCenter(options) {
        Gleap$1.openHelpCenter(options.showBackButton);
        return { opened: true };
    }
    async openHelpCenterArticle(options) {
        Gleap$1.openHelpCenterArticle(options.articleId, options.showBackButton);
        return { opened: true };
    }
    async openHelpCenterCollection(options) {
        Gleap$1.openHelpCenterCollection(options.collectionId, options.showBackButton);
        return { opened: true };
    }
    async searchHelpCenter(options) {
        Gleap$1.searchHelpCenter(options.term, options.showBackButton);
        return { opened: true };
    }
    async close() {
        Gleap$1.close();
        return { closedWidget: true };
    }
    async isOpened() {
        return { isOpened: Gleap$1.isOpened() };
    }
    async disableConsoleLogOverwrite() {
        Gleap$1.disableConsoleLogOverwrite();
        return { consoleLogDisabled: true };
    }
    async enableDebugConsoleLog() {
        return { debugConsoleLogEnabled: true };
    }
    async preFillForm(options) {
        Gleap$1.preFillForm(options.data);
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

var web = /*#__PURE__*/Object.freeze({
    __proto__: null,
    GleapWeb: GleapWeb
});

exports.Gleap = Gleap;
//# sourceMappingURL=plugin.cjs.js.map
