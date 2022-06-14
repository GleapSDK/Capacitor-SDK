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
    public void setUserIdentity(PluginCall call) {

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
        ret.put("setUserIdentity", true);
        call.resolve(ret);
    }

    @PluginMethod()
    public void clearUserIdentity(PluginCall call) {

        // Clear User Identity in Gleap
        implementation.clearIdentity();

        // Build Json object and resolve success
        JSObject ret = new JSObject();
        ret.put("clearIdentity", true);
        call.resolve(ret);
    }

    @PluginMethod()
    public void addCustomData(PluginCall call) {

        String dataKey = call.getString("dataKey");
        String dataValue = call.getString("dataValue");

        // If dataKey is empty, then pass back error
        if (!call.getData().has("dataKey")) {
            call.reject("Must provide a data key");
            return;
        }

        // If dataValue is empty, then pass back error
        if (!call.getData().has("dataValue")) {
            call.reject("Must provide a data value");
            return;
        }

        // Set custom data
        implementation.setCustomData(dataKey, dataValue);

        // Build Json object and resolve success
        JSObject ret = new JSObject();
        ret.put("addCustomData", true);
        call.resolve(ret);
    }

    @PluginMethod()
    public void appendCustomData(PluginCall call) {

        JSObject customData = call.getObject("customData");

        // If customData is empty, then pass back error
        if (!call.getData().has("customData")) {
            call.reject("No custom data is provided");
            return;
        }

        // Append custom data
        implementation.appendCustomData(customData);

        // Build Json object and resolve success
        JSObject ret = new JSObject();
        ret.put("appendCustomData", true);
        call.resolve(ret);
    }

    @PluginMethod()
    public void removeCustomData(PluginCall call) {

        String dataKey = call.getString("dataKey");

        // If dataKey is empty, then pass back error
        if (!call.getData().has("dataKey")) {
            call.reject("Must provide a data key");
            return;
        }

        implementation.removeCustomDataForKey(dataKey);

        // Build Json object and resolve success
        JSObject ret = new JSObject();
        ret.put("removeCustomData", dataKey);
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
    public void sendSilentBugReport(PluginCall call) {

        String silentBugReportInfo = call.getString("silentBugReportInfo");
        String silentBugReportSeverity = call.getString("silentBugReportSeverity");

        // If silentBugReportInfo is empty, then pass back error
        if (!call.getData().has("silentBugReportInfo")) {
            call.reject("No silent bug report description provided");
            return;
        }

        // If severity is set then apply the right gleap severity
        if (silentBugReportSeverity == "high") {
            implementation.sendSilentBugReport(silentBugReportInfo, Gleap.SEVERITY.HIGH);
        } else if (silentBugReportSeverity == "medium") {
            implementation.sendSilentBugReport(silentBugReportInfo, Gleap.SEVERITY.MEDIUM);
        } else {
            implementation.sendSilentBugReport(silentBugReportInfo, Gleap.SEVERITY.LOW);
        }

        // Build Json object and resolve success
        JSObject ret = new JSObject();
        ret.put("sendSilentBugReport", true);
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
