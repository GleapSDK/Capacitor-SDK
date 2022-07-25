package com.congrapp.b2c.plugins.gleap;

import android.Manifest;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;

import io.gleap.Gleap;
import io.gleap.GleapNotInitialisedException;
import io.gleap.GleapUserProperties;

@CapacitorPlugin(name = "Gleap", permissions = {
    @Permission(strings = { Manifest.permission.ACCESS_NETWORK_STATE }, alias = "network"),
    @Permission(strings = { Manifest.permission.INTERNET }, alias = "internet"),
    @Permission(strings = { Manifest.permission.WAKE_LOCK }, alias = "wakelock")
})
public class GleapPlugin extends Plugin {

    private Gleap implementation;

    @Override
    public void load() {
        implementation = Gleap.getInstance();
    }

    @PluginMethod()
    public void initialize(PluginCall call) {
        String api_key = call.getString("API_KEY");

        // If API_KEY is empty, then pass back error
        if (!call.getData().has("API_KEY")) {
            call.reject("Must provide an API Key");
            return;
        }

        // Initialize Gleap with API Key
        Gleap.initialize(api_key, getActivity().getApplication());

        // Build Json object and resolve success
        JSObject ret = new JSObject();
        ret.put("initialized", true);
        call.resolve(ret);
    }

    @PluginMethod()
    public void identify(PluginCall call) {

        String userId = call.getString("userId");
        String userName = call.getString("userName");
        String userEmail = call.getString("userEmail");

        // If userId is empty, then pass back error
        if (!call.getData().has("userId")) {
            call.reject("Must provide an user ID");
            return;
        }

        // If logEventData is empty call for function without data
        if (call.getData().has("userName") && call.getData().has("userEmail")) {

            // Create user Props
            GleapUserProperties userProperties = new GleapUserProperties(userName, userEmail);

            // Set user Props
            implementation.identifyUser(userId, userProperties);
        } else if (call.getData().has("userName")) {

            // Create user Props
            GleapUserProperties userProperties = new GleapUserProperties(userName, "");

            // Set user Props
            implementation.identifyUser(userId, userProperties);
        } else if (call.getData().has("userEmail")) {

            // Create user Props
            GleapUserProperties userProperties = new GleapUserProperties("", userEmail);

            // Set user Props
            implementation.identifyUser(userId, userProperties);
        } else {

            // Set User Identity with ID
            implementation.identifyUser(userId);
        }

        // Build Json object and resolve success
        JSObject ret = new JSObject();
        ret.put("identify", true);
        call.resolve(ret);
    }

    @PluginMethod()
    public void clearIdentity(PluginCall call) {

        // Clear User Identity in Gleap
        implementation.clearIdentity();

        // Build Json object and resolve success
        JSObject ret = new JSObject();
        ret.put("clearIdentity", true);
        call.resolve(ret);
    }

    @PluginMethod()
    public void addCustomData(PluginCall call) {

        String key = call.getString("key");
        String value = call.getString("value");

        // If key is empty, then pass back error
        if (!call.getData().has("key")) {
            call.reject("Must provide a data key");
            return;
        }

        // If value is empty, then pass back error
        if (!call.getData().has("value")) {
            call.reject("Must provide a data value");
            return;
        }

        // Set custom data
        implementation.setCustomData(key, value);

        // Build Json object and resolve success
        JSObject ret = new JSObject();
        ret.put("addCustomData", true);
        call.resolve(ret);
    }

    @PluginMethod()
    public void attachCustomData(PluginCall call) {
        // If key is empty, then pass back error
        if (!call.getData().has("data")) {
            call.reject("No data is provided");
            return;
        }

        // Append custom data
        implementation.attachCustomData(call.getObject("data"));

        // Build Json object and resolve success
        JSObject ret = new JSObject();
        ret.put("attachedCustomData", true);
        call.resolve(ret);
    }

    @PluginMethod()
    public void removeCustomData(PluginCall call) {

        String key = call.getString("key");

        // If key is empty, then pass back error
        if (!call.getData().has("key")) {
            call.reject("Must provide a data key");
            return;
        }

        implementation.removeCustomDataForKey(key);

        // Build Json object and resolve success
        JSObject ret = new JSObject();
        ret.put("removeCustomData", key);
        call.resolve(ret);
    }

    @PluginMethod()
    public void clearCustomData(PluginCall call) {

        implementation.clearCustomData();

        // Build Json object and resolve success
        JSObject ret = new JSObject();
        ret.put("clearCustomData", true);
        call.resolve(ret);
    }

    @PluginMethod()
    public void logEvent(PluginCall call) {

        String logEventSubject = call.getString("logEventSubject");
        JSObject logEventData = call.getObject("logEventData");

        // If logEventSubject is empty, then pass back error
        if (!call.getData().has("logEventSubject")) {
            call.reject("No event log subject provided");
            return;
        }

        // If logEventData is empty call for function without data
        if (!call.getData().has("logEventData")) {
            implementation.logEvent(logEventSubject);
        } else {
            implementation.logEvent(logEventSubject, logEventData);
        }

        // Build Json object and resolve success
        JSObject ret = new JSObject();
        ret.put("logEvent", true);
        call.resolve(ret);
    }

    @PluginMethod()
    public void sendSilentCrashReport(PluginCall call) {
        if (!call.getData().has("description")) {
            call.reject("No description provided");
            return;
        }

        String description = call.getString("description");
        String severity = call.getString("severity");

        Gleap.SEVERITY severityObj = Gleap.SEVERITY.HIGH;
        if (severity == "high") {
            severityObj = Gleap.SEVERITY.HIGH;
        } else if (severity == "medium") {
            severityObj = Gleap.SEVERITY.MEDIUM;
        } else {
            severityObj = Gleap.SEVERITY.LOW;
        }

        String dataExclusion = call.getData("dataExclusion");

        implementation.sendSilentCrashReport(description, severityObj);

        // Build Json object and resolve success
        JSObject ret = new JSObject();
        ret.put("sentSilentBugReport", true);
        call.resolve(ret);
    }

    @PluginMethod()
    public void openWidget(PluginCall call) throws GleapNotInitialisedException {

        // Open widget
        implementation.open();

        // Build Json object and resolve success
        JSObject ret = new JSObject();
        ret.put("openWidget", true);
        call.resolve(ret);
    }

    @PluginMethod()
    public void startFeedbackFlow(PluginCall call) throws GleapNotInitialisedException {

        String feedbackType = call.getString("feedbackType");

        // If severity is set then apply the right gleap severity
        if (feedbackType == "bugreporting") {
            implementation.startFeedbackFlow(feedbackType);
        } else if (feedbackType == "featurerequests") {
            implementation.startFeedbackFlow(feedbackType);
        } else if (feedbackType == "rating") {
            implementation.startFeedbackFlow(feedbackType);
        } else if (feedbackType == "contact") {
            implementation.startFeedbackFlow(feedbackType);
        } else {
            implementation.startFeedbackFlow();
        }

        // Build Json object and resolve success
        JSObject ret = new JSObject();
        ret.put("startFeedbackFlow", true);
        call.resolve(ret);
    }

    @PluginMethod()
    public void setLanguage(PluginCall call) {

        String languageCode = call.getString("languageCode");

        // If languageCode is empty, then pass back error
        if (!call.getData().has("languageCode")) {
            call.reject("No language provided");
            return;
        }

        // set language in Gleap
        implementation.setLanguage(languageCode);

        // Build Json object and resolve success
        JSObject ret = new JSObject();
        ret.put("setLanguage", languageCode);
        call.resolve(ret);
    }
}
