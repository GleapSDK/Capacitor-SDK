#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

// Define the plugin using the CAP_PLUGIN Macro, and
// each method the plugin supports using the CAP_PLUGIN_METHOD macro.
CAP_PLUGIN(GleapPlugin, "Gleap",
           CAP_PLUGIN_METHOD(initialize, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(setUserIdentity, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(clearUserIdentity, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(addCustomData, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(appendCustomData, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(removeCustomData, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(clearCustomData, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(logEvent, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(sendSilentBugReport, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(openWidget, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(startFeedbackFlow, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(setLanguage, CAPPluginReturnPromise);
)
