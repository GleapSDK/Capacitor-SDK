package io.gleapplugins.capacitor;

import android.Manifest;
import android.os.Build;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import io.gleap.APPLICATIONTYPE;
import io.gleap.Gleap;
import io.gleap.GleapAiTool;
import io.gleap.GleapAiToolParameter;
import io.gleap.GleapLogLevel;
import io.gleap.GleapNotInitialisedException;
import io.gleap.GleapSessionProperties;
import io.gleap.SurveyType;
import io.gleap.callbacks.AiToolExecutedCallback;
import io.gleap.callbacks.InitializedCallback;
import io.gleap.callbacks.ConfigLoadedCallback;
import io.gleap.callbacks.CustomActionCallback;
import io.gleap.callbacks.FeedbackFlowStartedCallback;
import io.gleap.callbacks.FeedbackSendingFailedCallback;
import io.gleap.callbacks.FeedbackSentCallback;
import io.gleap.callbacks.OutboundSentCallback;
import io.gleap.callbacks.RegisterPushMessageGroupCallback;
import io.gleap.callbacks.UnRegisterPushMessageGroupCallback;
import io.gleap.callbacks.WidgetClosedCallback;
import io.gleap.callbacks.WidgetOpenedCallback;
import io.gleap.callbacks.NotificationUnreadCountUpdatedCallback;
import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.json.JSONArray;
import org.json.JSONObject;

@CapacitorPlugin(
    name = "Gleap",
    permissions = {
        @Permission(strings = { Manifest.permission.ACCESS_NETWORK_STATE }, alias = "network"),
        @Permission(strings = { Manifest.permission.INTERNET }, alias = "internet"),
        @Permission(strings = { Manifest.permission.WAKE_LOCK }, alias = "wakelock")
    }
)
public class GleapPlugin extends Plugin {

    private Gleap implementation;

    @Override
    public void load() {
        implementation = Gleap.getInstance();
    }

    @PluginMethod
    public void initialize(PluginCall call) {
        String api_key = call.getString("API_KEY");

        // If API_KEY is empty, then pass back error
        if (!call.getData().has("API_KEY")) {
            call.reject("Must provide an API Key");
            return;
        }

        // Initialize Gleap with API Key
        Gleap.initialize(api_key, getActivity().getApplication());

        // Set the application type
        Gleap.getInstance().setApplicationType(APPLICATIONTYPE.CAPACITOR);

        // Build Json object and resolve success
        JSObject ret = new JSObject();
        ret.put("initialized", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void identify(PluginCall call) {
        // If userId is empty, then pass back error
        if (!call.getData().has("userId")) {
            call.reject("You must provide an user ID");
            return;
        }

        GleapSessionProperties sessionProperties = new GleapSessionProperties();
        if (call.getData().has("email")) {
            sessionProperties.setEmail(call.getString("email"));
        }
        if (call.getData().has("name")) {
            sessionProperties.setName(call.getString("name"));
        }
        if (call.getData().has("phone")) {
            sessionProperties.setPhone(call.getString("phone"));
        }
        if (call.getData().has("plan")) {
            sessionProperties.setPlan(call.getString("plan"));
        }
        if (call.getData().has("companyName")) {
            sessionProperties.setCompanyName(call.getString("companyName"));
        }
        if (call.getData().has("avatar")) {
            sessionProperties.setAvatar(call.getString("avatar"));
        }        
        if (call.getData().has("sla")) {
            sessionProperties.setSla(call.getDouble("sla"));
        }
        if (call.getData().has("companyId")) {
            sessionProperties.setCompanyId(call.getString("companyId"));
        }
        if (call.getData().has("value")) {
            sessionProperties.setValue(call.getDouble("value"));
        }
        if (call.getData().has("userHash")) {
            sessionProperties.setHash(call.getString("userHash"));
        }
        if (call.getData().has("customData")) {
            sessionProperties.setCustomData(call.getObject("customData"));
        }

        String userId = call.getString("userId");
        implementation.identifyContact(userId, sessionProperties);

        // Build Json object and resolve success
        JSObject ret = new JSObject();
        ret.put("identify", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void clearIdentity(PluginCall call) {
        // Clear User Identity in Gleap
        implementation.clearIdentity();

        // Build Json object and resolve success
        JSObject ret = new JSObject();
        ret.put("clearIdentity", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void getIdentity(PluginCall call) {
        // Build Json object and resolve success
        JSObject ret = new JSObject();

        try {
            GleapSessionProperties userProps = implementation.getIdentity();

            JSObject identityObj = new JSObject();
            if (userProps != null) {
                identityObj.put("userId", userProps.getUserId());
                identityObj.put("phone", userProps.getPhone());
                identityObj.put("email", userProps.getEmail());
                identityObj.put("name", userProps.getName());
                identityObj.put("companyId", userProps.getCompanyId());
                identityObj.put("companyName", userProps.getCompanyName());
                identityObj.put("avatar", userProps.getAvatar());
                identityObj.put("plan", userProps.getPlan());
                identityObj.put("value", userProps.getValue());
                identityObj.put("sla", userProps.getSla());
                ret.put("identity", identityObj);
            } else {
                ret.put("identity", null);
            }
        } catch (Exception ex) {
        }

        call.resolve(ret);
    }

    @PluginMethod
    public void isUserIdentified(PluginCall call) {
        // Build Json object and resolve success
        JSObject ret = new JSObject();
        try {
            ret.put("isUserIdentified", implementation.isUserIdentified());
        } catch (Exception ex) {
        }
        call.resolve(ret);
    }

    @PluginMethod
    public void setCustomData(PluginCall call) {
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
        String key = call.getString("key");
        String value = call.getString("value");
        implementation.setCustomData(key, value);

        // Build Json object and resolve success
        JSObject ret = new JSObject();
        ret.put("setCustomData", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void setTags(PluginCall call) {
        // If key is empty, then pass back error
        if (!call.getData().has("tags")) {
            call.reject("Must provide a tags array");
            return;
        }

        try {
            // Set custom data
            JSArray jsonTags = call.getArray("tags");
            String[] tags = new String[jsonTags.length()];
            for (int i = 0; i < jsonTags.length(); i++) {
                tags[i] = jsonTags.getString(i);
            }

            implementation.setTags(tags);
        } catch (Exception ex) {
        }

        // Build Json object and resolve success
        JSObject ret = new JSObject();
        ret.put("tagsSet", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void setNetworkLogsBlacklist(PluginCall call) {
        // If key is empty, then pass back error
        if (!call.getData().has("blacklist")) {
            call.reject("Must provide a blacklist array");
            return;
        }

        try {
            // Set custom data
            JSArray jsonBlacklist = call.getArray("blacklist");
            String[] blacklist = new String[jsonBlacklist.length()];
            for (int i = 0; i < jsonBlacklist.length(); i++) {
                blacklist[i] = jsonBlacklist.getString(i);
            }

            implementation.setNetworkLogsBlacklist(blacklist);
        } catch (Exception ex) {
        }

        // Build Json object and resolve success
        JSObject ret = new JSObject();
        ret.put("blacklistSet", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void setTicketAttribute(PluginCall call) {
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
        String key = call.getString("key");
        String value = call.getString("value");
        implementation.setTicketAttribute(key, value);

        // Build Json object and resolve success
        JSObject ret = new JSObject();
        ret.put("setTicketAttribute", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void unsetTicketAttribute(PluginCall call) {
        // If key is empty, then pass back error
        if (!call.getData().has("key")) {
            call.reject("Must provide a data key");
            return;
        }

        String key = call.getString("key");
        implementation.unsetTicketAttribute(key);

        // Build Json object and resolve success
        JSObject ret = new JSObject();
        ret.put("unsetTicketAttribute", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void clearTicketAttributes(PluginCall call) {
        implementation.clearTicketAttributes();

        // Build Json object and resolve success
        JSObject ret = new JSObject();
        ret.put("clearTicketAttributes", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void setAiTools(PluginCall call) {
        JSONArray toolsArray = call.getArray("tools");
        if (toolsArray == null) {
            call.reject("Must provide tools");
            return;
        }

        List<GleapAiTool> aiTools = new ArrayList<>();

        for (int i = 0; i < toolsArray.length(); i++) {
            JSONObject toolDict = toolsArray.optJSONObject(i);
            if (toolDict == null) {
                continue; // Skip if it's not a JSONObject
            }

            String name = toolDict.optString("name", null);
            String toolDescription = toolDict.optString("description", null);
            String response = toolDict.optString("response", null);
            String executionType = toolDict.optString("executionType", null);
            JSONArray parametersArray = toolDict.optJSONArray("parameters");

            if (name == null || toolDescription == null || response == null || parametersArray == null) {
                continue; // Skip if any required fields are missing
            }

            List<GleapAiToolParameter> parameters = new ArrayList<>();

            for (int j = 0; j < parametersArray.length(); j++) {
                JSONObject paramDict = parametersArray.optJSONObject(j);
                if (paramDict == null) {
                    continue; // Skip if it's not a JSONObject
                }

                String paramName = paramDict.optString("name", null);
                String paramDescription = paramDict.optString("description", null);
                String type = paramDict.optString("type", null);
                boolean required = paramDict.optBoolean("required", false);
                JSONArray enumArray = paramDict.optJSONArray
                        ("enum");
                String[] enums = null;
                if (enumArray != null) {
                    enums = new String[enumArray.length()];
                    for (int k = 0; k < enumArray.length(); k++) {
                        enums[k] = enumArray.optString(k);
                    }
                }

                if (paramName == null || paramDescription == null || type == null) {
                    continue; // Skip if any required parameter fields are missing
                }

                GleapAiToolParameter parameter = new GleapAiToolParameter(
                        paramName,
                        paramDescription,
                        type,
                        required,
                        enums
                );

                parameters.add(parameter);
            }

            GleapAiTool aiTool = new GleapAiTool(
                    name,
                    toolDescription,
                    response,
                    executionType,
                    parameters.toArray(new GleapAiToolParameter[0]) // Convert List to Array
            );

            aiTools.add(aiTool);
        }

        // Set the AI tools using the static method from Gleap SDK
        Gleap.getInstance().setAiTools(aiTools.toArray(new GleapAiTool[0])); // Convert List to Array

        // Build Json object and resolve success
        JSObject ret = new JSObject();
        ret.put("aiToolsSet", true);
        call.resolve(ret);
    }

    /**
     * Sets properties to be ignored in network logs.
     *
     * @since 13.2.1
     */
    @PluginMethod
    public void setNetworkLogPropsToIgnore(PluginCall call) {
        // Check if 'propsToIgnore' key is provided, return error if not
        if (!call.getData().has("propsToIgnore")) {
            call.reject("Must provide a propsToIgnore array");
            return;
        }

        try {
            // Retrieve and set the properties to be ignored
            JSArray jsonPropsToIgnore = call.getArray("propsToIgnore");
            String[] propsToIgnore = new String[jsonPropsToIgnore.length()];
            for (int i = 0; i < jsonPropsToIgnore.length(); i++) {
                propsToIgnore[i] = jsonPropsToIgnore.getString(i);
            }

            implementation.setNetworkLogPropsToIgnore(propsToIgnore);
        } catch (Exception ex) {
            // Handle exceptions if necessary
        }

        // Confirm successful setting of properties to ignore
        JSObject ret = new JSObject();
        ret.put("propsToIgnoreSet", true);
        call.resolve(ret);
    }

    @PluginMethod
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

    @PluginMethod
    public void removeCustomData(PluginCall call) {
        // If key is empty, then pass back error
        if (!call.getData().has("key")) {
            call.reject("Must provide a data key");
            return;
        }

        String key = call.getString("key");
        implementation.removeCustomDataForKey(key);

        // Build Json object and resolve success
        JSObject ret = new JSObject();
        ret.put("removedCustomData", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void clearCustomData(PluginCall call) {
        implementation.clearCustomData();

        // Build Json object and resolve success
        JSObject ret = new JSObject();
        ret.put("clearedCustomData", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void preFillForm(PluginCall call) {
        // If key is empty, then pass back error
        if (!call.getData().has("data")) {
            call.reject("No data is provided");
            return;
        }

        // Prefill form
        implementation.preFillForm(call.getObject("data"));

        // Build Json object and resolve success
        JSObject ret = new JSObject();
        ret.put("preFilledForm", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void log(PluginCall call) {
        if (!call.getData().has("message")) {
            call.reject("No log message provided");
            return;
        }

        String message = call.getString("message");
        String logLevel = call.getString("logLevel", "INFO");
        GleapLogLevel logLevelObj = GleapLogLevel.INFO;
        if (logLevel == "ERROR") {
            logLevelObj = GleapLogLevel.ERROR;
        } else if (logLevel == "WARNING") {
            logLevelObj = GleapLogLevel.WARNING;
        }

        // Forward log message to native implementation
        implementation.log(message, logLevelObj);

        // Build Json object and resolve success
        JSObject ret = new JSObject();
        ret.put("logged", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void showSurvey(PluginCall call) {
        if (!call.getData().has("surveyId")) {
            call.reject("No surveyId provided");
            return;
        }

        String surveyId = call.getString("surveyId");
        String format = call.getString("format", "survey");

        SurveyType surveyFormat = SurveyType.SURVEY;
        if ("survey_full".equalsIgnoreCase(format)) {
            surveyFormat = SurveyType.SURVEY_FULL;
        }

        // Forward log message to native implementation
        implementation.showSurvey(surveyId, surveyFormat);

        // Build Json object and resolve success
        JSObject ret = new JSObject();
        ret.put("opened", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void trackEvent(PluginCall call) {
        // If name is empty, then pass back error
        if (!call.getData().has("name")) {
            call.reject("No event name provided");
            return;
        }

        String name = call.getString("name");
        // If data is empty call for function without data
        if (!call.getData().has("data")) {
            implementation.trackEvent(name);
        } else {
            JSObject eventData = call.getObject("data");
            implementation.trackEvent(name, eventData);
        }

        // Build Json object and resolve success
        JSObject ret = new JSObject();
        ret.put("trackedEvent", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void trackPage(PluginCall call) {
        // If page name is empty, then pass back error
        if (!call.getData().has("pageName")) {
            call.reject("No page name provided");
            return;
        }

        try {
            String pageName = call.getString("pageName");
            JSONObject eventData = new JSONObject();
            eventData.put("page", pageName);
            implementation.trackEvent("pageView", eventData);
        } catch (Exception ignore) {}

        // Build Json object and resolve success
        JSObject ret = new JSObject();
        ret.put("trackedPage", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void addAttachment(PluginCall call) {
        if (!call.getData().has("base64data")) {
            call.reject("No base64 file data provided");
            return;
        }

        if (!call.getData().has("name")) {
            call.reject("No file name provided");
            return;
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            try {
                String fileName = call.getString("name");
                String base64file = call.getString("base64data");

                if (checkAllowedEndings(fileName)) {
                    String[] splittedBase64File = base64file.split(",");
                    byte[] data;
                    if (splittedBase64File.length == 2) {
                        data = Base64.getDecoder().decode(splittedBase64File[1]);
                    } else {
                        data = Base64.getDecoder().decode(splittedBase64File[0]);
                    }

                    String mimetype = extractMimeType(base64file);
                    String[] splitted = mimetype.split("/");
                    String fileNameConcated = fileName;
                    if (splitted.length == 2 && !fileName.contains(".")) {
                        fileNameConcated += "." + splitted[1];
                    }

                    File file = new File(getActivity().getApplication().getCacheDir() + "/" + fileNameConcated);
                    if (!file.exists()) {
                        file.createNewFile();
                    }
                    try (OutputStream stream = new FileOutputStream(file)) {
                        stream.write(data);
                    } catch (Exception e) {
                        e.printStackTrace();
                    }

                    if (file.exists()) {
                        implementation.addAttachment(file);
                    } else {
                        System.err.println("Gleap: The file does not exist.");
                    }
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        // Build Json object and resolve success
        JSObject ret = new JSObject();
        ret.put("attachmentAdded", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void setDisableInAppNotifications(PluginCall call) {
        boolean disableInAppNotifications = call.getBoolean("disableInAppNotifications");

        implementation.setDisableInAppNotifications(disableInAppNotifications);

        // Build Json object and resolve success
        JSObject ret = new JSObject();
        ret.put("inAppNotificationsDisabled", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void showFeedbackButton(PluginCall call) {
        boolean show = call.getBoolean("show");

        implementation.showFeedbackButton(show);

        // Build Json object and resolve success
        JSObject ret = new JSObject();
        ret.put("feedbackButtonShown", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void removeAllAttachments(PluginCall call) {
        implementation.removeAllAttachments();

        // Build Json object and resolve success
        JSObject ret = new JSObject();
        ret.put("allAttachmentsRemoved", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void disableConsoleLogOverwrite(PluginCall call) {
        // Build Json object and resolve success
        JSObject ret = new JSObject();
        ret.put("consoleLogDisabled", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void enableDebugConsoleLog(PluginCall call) {
        // Build Json object and resolve success
        JSObject ret = new JSObject();
        ret.put("debugConsoleLogEnabled", true);
        call.resolve(ret);
    }

    @PluginMethod
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

        JSONObject dataExclusion = call.getObject("dataExclusion");
        if (dataExclusion != null) {
            implementation.sendSilentCrashReport(description, severityObj, dataExclusion);
        } else {
            implementation.sendSilentCrashReport(description, severityObj);
        }

        // Build Json object and resolve success
        JSObject ret = new JSObject();
        ret.put("sentSilentBugReport", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void isOpened(PluginCall call) throws GleapNotInitialisedException {
        // Build Json object and resolve success
        JSObject ret = new JSObject();
        ret.put("isOpened", implementation.isOpened());
        call.resolve(ret);
    }

    @PluginMethod
    public void open(PluginCall call) throws GleapNotInitialisedException {
        // Open widget
        implementation.open();

        // Build Json object and resolve success
        JSObject ret = new JSObject();
        ret.put("openedWidget", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void openChecklists(PluginCall call) throws GleapNotInitialisedException {
        boolean showBackButton = call.getBoolean("showBackButton");

        implementation.openChecklists(showBackButton);

        // Build Json object and resolve success
        JSObject ret = new JSObject();
        ret.put("opened", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void openChecklist(PluginCall call) throws GleapNotInitialisedException {
        String checklistId = call.getString("checklistId");
        boolean showBackButton = call.getBoolean("showBackButton");

        implementation.openChecklist(checklistId, showBackButton);

        // Build Json object and resolve success
        JSObject ret = new JSObject();
        ret.put("opened", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void startChecklist(PluginCall call) throws GleapNotInitialisedException {
        String outboundId = call.getString("outboundId");
        boolean showBackButton = call.getBoolean("showBackButton");

        implementation.openChecklist(outboundId, showBackButton);

        // Build Json object and resolve success
        JSObject ret = new JSObject();
        ret.put("opened", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void openNews(PluginCall call) throws GleapNotInitialisedException {
        boolean showBackButton = call.getBoolean("showBackButton");

        implementation.openNews(showBackButton);

        // Build Json object and resolve success
        JSObject ret = new JSObject();
        ret.put("opened", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void openNewsArticle(PluginCall call) throws GleapNotInitialisedException {
        String articleId = call.getString("articleId");
        boolean showBackButton = call.getBoolean("showBackButton");

        implementation.openNewsArticle(articleId, showBackButton);

        // Build Json object and resolve success
        JSObject ret = new JSObject();
        ret.put("opened", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void openHelpCenter(PluginCall call) throws GleapNotInitialisedException {
        boolean showBackButton = call.getBoolean("showBackButton");

        implementation.openHelpCenter(showBackButton);

        // Build Json object and resolve success
        JSObject ret = new JSObject();
        ret.put("opened", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void askAI(PluginCall call) throws GleapNotInitialisedException {
        // Open news
        String question = call.getString("question");
        boolean showBackButton = call.getBoolean("showBackButton");

        implementation.askAI(question, showBackButton);

        // Build Json object and resolve success
        JSObject ret = new JSObject();
        ret.put("opened", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void openHelpCenterArticle(PluginCall call) throws GleapNotInitialisedException {
        // Open news
        String articleId = call.getString("articleId");
        boolean showBackButton = call.getBoolean("showBackButton");

        implementation.openHelpCenterArticle(articleId, showBackButton);

        // Build Json object and resolve success
        JSObject ret = new JSObject();
        ret.put("opened", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void openHelpCenterCollection(PluginCall call) throws GleapNotInitialisedException {
        // Open news
        String collectionId = call.getString("collectionId");
        boolean showBackButton = call.getBoolean("showBackButton");

        implementation.openHelpCenterCollection(collectionId, showBackButton);

        // Build Json object and resolve success
        JSObject ret = new JSObject();
        ret.put("opened", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void searchHelpCenter(PluginCall call) throws GleapNotInitialisedException {
        // Open news
        String term = call.getString("term");
        boolean showBackButton = call.getBoolean("showBackButton");

        implementation.searchHelpCenter(term, showBackButton);

        // Build Json object and resolve success
        JSObject ret = new JSObject();
        ret.put("opened", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void openFeatureRequests(PluginCall call) throws GleapNotInitialisedException {
        boolean showBackButton = call.getBoolean("showBackButton");

        // Open feature requests
        implementation.openFeatureRequests(showBackButton);

        // Build Json object and resolve success
        JSObject ret = new JSObject();
        ret.put("openedFeatureRequests", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void close(PluginCall call) throws GleapNotInitialisedException {
        // Open widget
        implementation.close();

        // Build Json object and resolve success
        JSObject ret = new JSObject();
        ret.put("closedWidget", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void startBot(PluginCall call) throws GleapNotInitialisedException {
        if (!call.getData().has("botId")) {
            call.reject("No feedback flow provided");
            return;
        }

        // Start bot
        String botId = call.getString("botId");
        boolean showBackButton = call.getBoolean("showBackButton");
        implementation.startBot(botId, showBackButton);

        // Build Json object and resolve success
        JSObject ret = new JSObject();
        ret.put("startedBot", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void startFeedbackFlow(PluginCall call) throws GleapNotInitialisedException {
        if (!call.getData().has("feedbackFlow")) {
            call.reject("No feedback flow provided");
            return;
        }

        // Start feedback flow
        String feedbackFlow = call.getString("feedbackFlow");
        implementation.startFeedbackFlow(feedbackFlow);

        // Build Json object and resolve success
        JSObject ret = new JSObject();
        ret.put("startedFeedbackFlow", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void startConversation(PluginCall call) throws GleapNotInitialisedException {
        boolean showBackButton = call.getBoolean("showBackButton");

        // Start conversation
        implementation.startConversation(showBackButton);

        // Build Json object and resolve success
        JSObject ret = new JSObject();
        ret.put("conversationStarted", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void openConversations(PluginCall call) throws GleapNotInitialisedException {
        boolean showBackButton = call.getBoolean("showBackButton");

        // Start conversation
        implementation.openConversations(showBackButton);

        // Build Json object and resolve success
        JSObject ret = new JSObject();
        ret.put("conversationsOpened", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void startClassicForm(PluginCall call) throws GleapNotInitialisedException {
        if (!call.getData().has("formId")) {
            call.reject("No formId provided");
            return;
        }

        // Start feedback flow
        boolean showBackButton = call.getBoolean("showBackButton");
        String formId = call.getString("formId");
        implementation.startClassicForm(formId, showBackButton);

        // Build Json object and resolve success
        JSObject ret = new JSObject();
        ret.put("classicFormStarted", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void setLanguage(PluginCall call) {
        // If languageCode is empty, then pass back error
        if (!call.getData().has("languageCode")) {
            call.reject("No language provided");
            return;
        }

        // Pass language
        String languageCode = call.getString("languageCode");
        implementation.setLanguage(languageCode);

        // Build Json object and resolve success
        JSObject ret = new JSObject();
        ret.put("setLanguage", languageCode);
        call.resolve(ret);
    }

    @PluginMethod(returnType = PluginMethod.RETURN_CALLBACK)
    public void setEventCallback(PluginCall call) {
        call.setKeepAlive(true);

        implementation.setWidgetOpenedCallback(
            new WidgetOpenedCallback() {
                @Override
                public void invoke() {
                    JSObject data = new JSObject();
                    data.put("name", "widget-opened");
                    call.resolve(data);
                }
            }
        );

        implementation.setNotificationUnreadCountUpdatedCallback(new NotificationUnreadCountUpdatedCallback() {
            @Override
            public void invoke(int count) {
                    // called when the sending of the feedback failed
                    JSObject data = new JSObject();
                    data.put("name", "notification-count-updated");
                    data.put("data", count);
                    call.resolve(data);
                }
            }
        );

        implementation.setWidgetClosedCallback(
            new WidgetClosedCallback() {
                @Override
                public void invoke() {
                    JSObject data = new JSObject();
                    data.put("name", "widget-closed");
                    call.resolve(data);
                }
            }
        );

        implementation.setInitializedCallback(
            new InitializedCallback() {
                @Override
                public void initialized() {
                    JSObject data = new JSObject();
                    data.put("name", "initialized");
                    call.resolve(data);
                }
            }
        );

        implementation.setConfigLoadedCallback(
            new ConfigLoadedCallback() {
                @Override
                public void configLoaded(JSONObject jsonObject) {
                    JSObject data = new JSObject();
                    data.put("name", "widget-opened");
                    data.put("data", jsonObject);
                    call.resolve(data);
                }
            }
        );

        implementation.setFeedbackSentCallback(
            new FeedbackSentCallback() {
                @Override
                public void invoke(JSONObject jsonObject) {
                    JSObject data = new JSObject();
                    data.put("name", "feedback-sent");
                    data.put("data", jsonObject);
                    call.resolve(data);
                }
            }
        );

        implementation.setOutboundSentCallback(
            new OutboundSentCallback() {
                @Override
                public void invoke(JSONObject jsonObject) {
                    JSObject data = new JSObject();
                    data.put("name", "outbound-sent");
                    data.put("data", jsonObject);
                    call.resolve(data);
                }
            }
        );

        implementation.setAiToolExecutedCallback(new AiToolExecutedCallback() {
            @Override
            public void aiToolExecuted(JSONObject jsonObject) {
                JSObject data = new JSObject();
                data.put("name", "tool-execution");
                data.put("data", jsonObject);
                call.resolve(data);
            }
        });

        implementation.setFeedbackSendingFailedCallback(
            new FeedbackSendingFailedCallback() {
                @Override
                public void invoke(String message) {
                    // called when the sending of the feedback failed
                    JSObject data = new JSObject();
                    data.put("name", "error-while-sending");
                    data.put("data", message);
                    call.resolve(data);
                }
            }
        );

        implementation.registerCustomAction(
            new CustomActionCallback() {
                @Override
                public void invoke(String message, String shareToken) {
                    // called when a custom action from the widget is issued
                    JSObject data = new JSObject();
                    data.put("name", "custom-action-called");
                    data.put("data", message);
                    data.put("shareToken", shareToken);
                    call.resolve(data);
                }
            }
        );

        implementation.setFeedbackFlowStartedCallback(
            new FeedbackFlowStartedCallback() {
                @Override
                public void invoke(String message) {
                    // called when the feedback flow ist started, not only the widget is opened
                    JSObject data = new JSObject();
                    data.put("name", "flow-started");
                    data.put("data", message);
                    call.resolve(data);
                }
            }
        );

        implementation.setRegisterPushMessageGroupCallback(
            new RegisterPushMessageGroupCallback() {
                @Override
                public void invoke(String pushMessageGroup) {
                    // called when the feedback flow ist started, not only the widget is opened
                    JSObject data = new JSObject();
                    data.put("name", "register-pushmessage-group");
                    data.put("data", pushMessageGroup);
                    call.resolve(data);
                }
            }
        );

        implementation.setUnRegisterPushMessageGroupCallback(
            new UnRegisterPushMessageGroupCallback() {
                @Override
                public void invoke(String pushMessageGroup) {
                    // called when the feedback flow ist started, not only the widget is opened
                    JSObject data = new JSObject();
                    data.put("name", "unregister-pushmessage-group");
                    data.put("data", pushMessageGroup);
                    call.resolve(data);
                }
            }
        );
    }

    /**
     * Extract the MIME type from a base64 string
     *
     * @param encoded Base64 string
     * @return MIME type string
     */
    private String extractMimeType(final String encoded) {
        final Pattern mime = Pattern.compile("^data:([a-zA-Z0-9]+/[a-zA-Z0-9]+).*,.*");
        final Matcher matcher = mime.matcher(encoded);
        if (!matcher.find()) return "";
        return matcher.group(1).toLowerCase();
    }

    private boolean checkAllowedEndings(String fileName) {
        String[] fileType = fileName.split("\\.");
        String[] allowedTypes = { "jpeg", "svg", "png", "mp4", "webp", "xml", "plain", "xml", "json" };
        if (fileType.length <= 1) {
            return false;
        }
        boolean found = false;
        for (String type : allowedTypes) {
            if (type.equals(fileType[1])) {
                found = true;
            }
        }

        return found;
    }
}
