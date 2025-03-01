var capacitorGleap = (function (exports, core, Gleap$1) {
    'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var Gleap__default = /*#__PURE__*/_interopDefaultLegacy(Gleap$1);

    const Gleap = core.registerPlugin('Gleap', {
        web: () => Promise.resolve().then(function () { return web; }).then(m => new m.GleapWeb()),
    });

    class GleapWeb extends core.WebPlugin {
        async initialize(options) {
            if (GleapWeb.initialized) {
                return { initialized: true };
            }
            Gleap__default["default"].initialize(options.API_KEY);
            GleapWeb.initialized = true;
            this.registerCallbackListeners();
            return { initialized: true };
        }
        registerCallbackListeners() {
            Gleap__default["default"].on('open', () => {
                this.notifyCallbacks('open', {});
            });
            Gleap__default["default"].on('initialized', () => {
                this.notifyCallbacks('initialized', {});
            });
            Gleap__default["default"].on('close', () => {
                this.notifyCallbacks('close', {});
            });
            Gleap__default["default"].on('feedback-sent', formData => {
                this.notifyCallbacks('feedback-sent', formData);
            });
            Gleap__default["default"].on('outbound-sent', formData => {
                this.notifyCallbacks('outbound-sent', formData);
            });
            Gleap__default["default"].on('tool-execution', toolExecution => {
                this.notifyCallbacks('tool-execution', toolExecution);
            });
            Gleap__default["default"].on('flow-started', flow => {
                this.notifyCallbacks('flow-started', flow);
            });
            Gleap__default["default"].on('error-while-sending', () => {
                this.notifyCallbacks('error-while-sending', {});
            });
            Gleap__default["default"].on('unregister-pushmessage-group', groupName => {
                this.notifyCallbacks('unregister-pushmessage-group', groupName);
            });
            Gleap__default["default"].on('register-pushmessage-group', groupName => {
                this.notifyCallbacks('register-pushmessage-group', groupName);
            });
            Gleap__default["default"].on('unread-count-changed', groupName => {
                this.notifyCallbacks('notification-count-updated', groupName);
            });
            Gleap__default["default"].registerCustomAction(customAction => {
                this.notifyCallbacks('custom-action-called', customAction);
            });
        }
        async setAiTools(options) {
            Gleap__default["default"].setAiTools(options.tools);
            return { aiToolsSet: true };
        }
        async setTicketAttribute(options) {
            Gleap__default["default"].setTicketAttribute(options.key, options.value);
            return { setTicketAttribute: true };
        }
        async unsetTicketAttribute(options) {
            Gleap__default["default"].unsetTicketAttribute(options.key);
            return { unsetTicketAttribute: true };
        }
        async clearTicketAttributes() {
            Gleap__default["default"].clearTicketAttributes();
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
            Gleap__default["default"].startClassicForm((_a = options.formId) !== null && _a !== void 0 ? _a : '', options.showBackButton);
            return { classicFormStarted: true };
        }
        async startConversation(options) {
            Gleap__default["default"].startConversation(options.showBackButton);
            return { conversationStarted: true };
        }
        async openConversation(options) {
            Gleap__default["default"].openConversations(options.showBackButton);
            return { conversationsOpened: true };
        }
        async showSurvey(options) {
            Gleap__default["default"].showSurvey(options.surveyId, options.format);
            return { opened: true };
        }
        async showFeedbackButton(options) {
            Gleap__default["default"].showFeedbackButton(options.show ? true : false);
            return { feedbackButtonShown: true };
        }
        async setDisableInAppNotifications(options) {
            var _a;
            Gleap__default["default"].setDisableInAppNotifications((_a = options.disableInAppNotifications) !== null && _a !== void 0 ? _a : false);
            return { inAppNotificationsDisabled: true };
        }
        async identify(options) {
            var userData = {
                name: options.name,
                email: options.email,
                phone: options.phone,
                companyId: options.companyId,
                companyName: options.companyName,
                sla: options.sla,
                plan: options.plan,
                value: options.value,
                customData: options.customData,
            };
            if (options.userHash) {
                Gleap__default["default"].identify(options.userId, userData, options.userHash);
            }
            else {
                Gleap__default["default"].identify(options.userId, userData);
            }
            return { identify: true };
        }
        async updateContact(options) {
            Gleap__default["default"].updateContact(options);
            return { identify: true };
        }
        async setNetworkLogsBlacklist(options) {
            Gleap__default["default"].setNetworkLogsBlacklist(options.blacklist);
            return { blacklistSet: true };
        }
        async setNetworkLogPropsToIgnore(options) {
            Gleap__default["default"].setNetworkLogPropsToIgnore(options.propsToIgnore);
            return { propsToIgnoreSet: true };
        }
        async setTags(options) {
            Gleap__default["default"].setTags(options.tags);
            return { tagsSet: true };
        }
        async clearIdentity() {
            Gleap__default["default"].clearIdentity();
            return { clearIdentity: true };
        }
        async getIdentity() {
            return { identity: Gleap__default["default"].getIdentity() };
        }
        async isUserIdentified() {
            return { isUserIdentified: Gleap__default["default"].isUserIdentified() };
        }
        async attachCustomData(options) {
            Gleap__default["default"].attachCustomData(options.data);
            return { attachedCustomData: true };
        }
        async setCustomData(options) {
            Gleap__default["default"].setCustomData(options.key, options.value);
            return { setCustomData: true };
        }
        async removeCustomData(options) {
            Gleap__default["default"].removeCustomData(options.key);
            return { removedCustomData: true };
        }
        async clearCustomData() {
            Gleap__default["default"].clearCustomData();
            return { clearedCustomData: true };
        }
        async trackEvent(options) {
            Gleap__default["default"].trackEvent(options.name, options.data);
            return { loggedEvent: true };
        }
        async trackPage(options) {
            Gleap__default["default"].trackEvent('pageView', {
                page: options.pageName,
            });
            return { trackedPage: true };
        }
        async startFeedbackFlow(options) {
            var _a;
            if (!options.feedbackFlow) ;
            Gleap__default["default"].startFeedbackFlow((_a = options.feedbackFlow) !== null && _a !== void 0 ? _a : 'bugreporting', options.showBackButton);
            return { startedFeedbackFlow: true };
        }
        async startBot(options) {
            var _a;
            if (!options.botId) ;
            Gleap__default["default"].startBot((_a = options.botId) !== null && _a !== void 0 ? _a : '', options.showBackButton);
            return { startedBot: true };
        }
        async setLanguage(options) {
            Gleap__default["default"].setLanguage(options.languageCode);
            return { setLanguage: options.languageCode };
        }
        async log(options) {
            Gleap__default["default"].log(options.message, options.logLevel);
            return { logged: true };
        }
        async setEventCallback(callback) {
            var callbackId = this.makeid(10);
            GleapWeb.callbacks[callbackId] = callback;
            return callbackId;
        }
        async sendSilentCrashReport(options) {
            Gleap__default["default"].sendSilentCrashReport(options.description, options.severity, options.dataExclusion);
            return { sentSilentBugReport: true };
        }
        async open() {
            Gleap__default["default"].open();
            return { openedWidget: true };
        }
        async openFeatureRequests(options) {
            Gleap__default["default"].openFeatureRequests(options.showBackButton);
            return { openedFeatureRequests: true };
        }
        async openNews(options) {
            Gleap__default["default"].openNews(options.showBackButton);
            return { openedNews: true };
        }
        async openNewsArticle(options) {
            Gleap__default["default"].openNewsArticle(options.articleId, options.showBackButton);
            return { opened: true };
        }
        async openHelpCenter(options) {
            Gleap__default["default"].openHelpCenter(options.showBackButton);
            return { opened: true };
        }
        async openHelpCenterArticle(options) {
            Gleap__default["default"].openHelpCenterArticle(options.articleId, options.showBackButton);
            return { opened: true };
        }
        async openHelpCenterCollection(options) {
            Gleap__default["default"].openHelpCenterCollection(options.collectionId, options.showBackButton);
            return { opened: true };
        }
        async searchHelpCenter(options) {
            Gleap__default["default"].searchHelpCenter(options.term, options.showBackButton);
            return { opened: true };
        }
        async close() {
            Gleap__default["default"].close();
            return { closedWidget: true };
        }
        async isOpened() {
            return { isOpened: Gleap__default["default"].isOpened() };
        }
        async disableConsoleLogOverwrite() {
            Gleap__default["default"].disableConsoleLogOverwrite();
            return { consoleLogDisabled: true };
        }
        async enableDebugConsoleLog() {
            return { debugConsoleLogEnabled: true };
        }
        async preFillForm(options) {
            Gleap__default["default"].preFillForm(options.data);
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

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({}, capacitorExports, Gleap$1);
//# sourceMappingURL=plugin.js.map
