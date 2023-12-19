#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

// Define the plugin using the CAP_PLUGIN Macro, and
// each method the plugin supports using the CAP_PLUGIN_METHOD macro.
CAP_PLUGIN(GleapPlugin, "Gleap",
           CAP_PLUGIN_METHOD(initialize, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(identify, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(clearIdentity, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(attachCustomData, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(setCustomData, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(removeCustomData, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(clearCustomData, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(trackEvent, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(trackPage, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(sendSilentCrashReport, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(openChecklists, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(openChecklist, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(startChecklist, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(open, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(openNews, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(showSurvey, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(openNewsArticle, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(openHelpCenter, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(openHelpCenterArticle, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(openHelpCenterCollection, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(searchHelpCenter, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(openFeatureRequests, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(close, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(isOpened, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(showFeedbackButton, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(enableDebugConsoleLog, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(log, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(disableConsoleLogOverwrite, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(startFeedbackFlow, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(startBot, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(setLanguage, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(setEventCallback, CAPPluginReturnCallback);
           CAP_PLUGIN_METHOD(preFillForm, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(addAttachment, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(removeAllAttachments, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(getIdentity, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(isUserIdentified, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(setTags, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(setDisableInAppNotifications, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(startClassicForm, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(startConversation, CAPPluginReturnPromise);
)
