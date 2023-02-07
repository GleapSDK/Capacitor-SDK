import Foundation
import Capacitor
import Gleap

/**
 * Please read the Capacitor iOS Plugin Development Guide
 * here: https://capacitorjs.com/docs/plugins/ios
 */
@objc(GleapPlugin)
public class GleapPlugin: CAPPlugin, GleapDelegate {
    enum CallType {
        case event
    }
    
    private var callQueue: [String: CallType] = [:]

    @objc func initialize(_ call: CAPPluginCall) {
        // Check if key is present
        guard let api_key = call.options["API_KEY"] as? String else {
            call.reject("Missing API Key")
            return;
        }
        
        // Initialize Gleap with API key
        Gleap.initialize(withToken: api_key)
        Gleap.setApplicationType(CAPACITOR)
        
        // Provide feedback that it has been success
        call.resolve([
            "initialized": true
        ])
    }
    
    @objc func identify(_ call: CAPPluginCall) {
        // If userId is empty, then pass back error
        guard let userId = call.options["userId"] as? String else {
            call.reject("Must provide an user ID")
            return;
        }
        
        // Map all values
        let userProperty = GleapUserProperty()
        if (call.getString("name") != nil) {
            userProperty.name = call.getString("name") ?? ""
        }
        if (call.getString("email") != nil) {
            userProperty.email = call.getString("email") ?? ""
        }
        if (call.getDouble("value") != nil) {
            userProperty.value = (call.getDouble("value") ?? 0.0) as NSNumber
        }
        if (call.getString("phone") != nil) {
            userProperty.phone = call.getString("phone") ?? ""
        }
        if (call.getObject("customData") != nil) {
            userProperty.customData = call.getObject("customData")!
        }
        
        if let userHash = call.getString("userHash") {
            Gleap.identifyUser(with: userId, andData:  userProperty, andUserHash: userHash)
        } else {
            Gleap.identifyUser(with: userId, andData: userProperty)
        }
        
        // Provide feedback that it has been success
        call.resolve([
            "identify": true
        ])
    }
    
    @objc func clearIdentity(_ call: CAPPluginCall) {
        // Clear User Identity in Gleap
        Gleap.clearIdentity()
        
        // Provide feedback that it has been success
        call.resolve([
            "clearIdentity": true
        ])
    }
    
    @objc func getIdentity(_ call: CAPPluginCall) {
        call.resolve([
            "identity": Gleap.getIdentity()
        ])
    }
    
    @objc func isUserIdentified(_ call: CAPPluginCall) {
        call.resolve([
            "isUserIdentified": Gleap.isUserIdentified()
        ])
    }
    
    @objc func disableConsoleLogOverwrite(_ call: CAPPluginCall) {
        call.resolve([
            "consoleLogDisabled": true
        ])
    }
    
    @objc func enableDebugConsoleLog(_ call: CAPPluginCall) {
        Gleap.enableDebugConsoleLog()
        
        call.resolve([
            "debugConsoleLogEnabled": true
        ])
    }
    
    @objc func showSurvey(_ call: CAPPluginCall) {
        guard let surveyId = call.options["surveyId"] as? String else {
            call.reject("Must provide a surveyId")
            return;
        }
        
        var surveyFormat = SURVEY
        if (call.getString("format") ?? "survey" == "survey") {
            surveyFormat = SURVEY_FULL
        }
        
        Gleap.showSurvey(surveyId, andFormat: surveyFormat)
        
        call.resolve([
            "opened": true
        ])
    }
    
    @objc func attachCustomData(_ call: CAPPluginCall) {
        // If key is empty, then pass back error
        guard let data = call.getObject("data") else {
            call.reject("Must provide data")
            return;
        }
        
        // Set custom data
        Gleap.attachCustomData(data)
        
        // Provide feedback that it has been success
        call.resolve([
            "addedCustomData": true
        ])
    }
    
    @objc func setTags(_ call: CAPPluginCall) {
        // If value is empty, then pass back error
        guard let tags = call.options["tags"] as? [String] else {
            call.reject("Must provide a tag array")
            return;
        }
        
        // Append custom data
        Gleap.setTags(tags)
        
        // Provide feedback that it has been success
        call.resolve([
            "tagsSet": true
        ])
    }
    
    @objc func setCustomData(_ call: CAPPluginCall) {
        // If key is empty, then pass back error
        guard let key = call.options["key"] as? String else {
            call.reject("Must provide a data key")
            return;
        }
        
        // If value is empty, then pass back error
        guard let value = call.options["value"] as? String else {
            call.reject("Must provide a data value")
            return;
        }
        
        // Append custom data
        Gleap.setCustomData(value, forKey: key)
        
        
        // Provide feedback that it has been success
        call.resolve([
            "setCustomData": true
        ])
    }
    
    @objc func removeCustomData(_ call: CAPPluginCall) {
        // If key is empty, then pass back error
        guard let key = call.options["key"] as? String else {
            call.reject("Must provide a data key")
            return;
        }
        
        // Remove custom data
        Gleap.removeCustomData(forKey: key)
        
        
        // Provide feedback that it has been success
        call.resolve([
            "removedCustomData": true
        ])
    }
    
    @objc func clearCustomData(_ call: CAPPluginCall) {
        // Clear custom data
        Gleap.clearCustomData()
        
        // Provide feedback that it has been success
        call.resolve([
            "clearedCustomData": true
        ])
    }
    
    @objc func preFillForm(_ call: CAPPluginCall) {
        // If key is empty, then pass back error
        guard let data = call.getObject("data") else {
            call.reject("Must provide data")
            return;
        }
        
        // Prefill the form
        Gleap.preFillForm(data)
        
        // Provide feedback that it has been success
        call.resolve([
            "preFilledForm": true
        ])
    }
    
    @objc func trackEvent(_ call: CAPPluginCall) {
        guard let eventName = call.options["name"] as? String else {
            call.reject("No event log subject provided")
            return;
        }
        
        if let eventData = call.getObject("data") {
            Gleap.trackEvent(eventName, withData: eventData)
        } else {
            Gleap.trackEvent(eventName)
        }
        
        // Provide feedback that it has been success
        call.resolve([
            "trackedEvent": true
        ])
    }
    
    @objc func trackPage(_ call: CAPPluginCall) {
        guard let pageName = call.options["pageName"] as? String else {
            call.reject("No page name provided")
            return;
        }
        
        Gleap.trackEvent("pageView", withData: [
            "page": pageName
        ])
        
        // Provide feedback that it has been success
        call.resolve([
            "trackedPage": true
        ])
    }
    
    @objc func addAttachment(_ call: CAPPluginCall) {
        guard let base64data = call.options["base64data"] as? String else {
            call.reject("No base64 file data provided")
            return;
        }
        
        guard let name = call.options["name"] as? String else {
            call.reject("No file name provided")
            return;
        }
        
        guard let fileData = Data(base64Encoded: base64data, options: .ignoreUnknownCharacters) else {
            call.reject("Invalid file data")
            return;
        }
        
        Gleap.addAttachment(with: fileData, andName: name)
        
        // Provide feedback that it has been success
        call.resolve([
            "attachmentAdded": true
        ])
    }
    
    @objc func setDisableInAppNotifications(_ call: CAPPluginCall) {
        let disableInAppNotifications = call.getBool("disableInAppNotifications") ?? false

        Gleap.setDisableInAppNotifications(disableInAppNotifications)
        
        // Provide feedback that it has been success
        call.resolve([
            "inAppNotificationsDisabled": true
        ])
    }
    
    @objc func showFeedbackButton(_ call: CAPPluginCall) {
        let showFeedbackButton = call.getBool("show") ?? false

        Gleap.showFeedbackButton(showFeedbackButton)
        
        // Provide feedback that it has been success
        call.resolve([
            "feedbackButtonShown": true
        ])
    }
    
    @objc func removeAllAttachments(_ call: CAPPluginCall) {
        Gleap.removeAllAttachments()
        
        // Provide feedback that it has been success
        call.resolve([
            "allAttachmentsRemoved": true
        ])
    }
    
    @objc func sendSilentCrashReport(_ call: CAPPluginCall) {
        let dataExclusion = call.getObject("dataExclusion") ?? [:]
        let severity = call.getString("severity") ?? "low"
        
        guard let description = call.options["description"] as? String else {
            call.reject("No silent bug report description provided")
            return;
        }
        
        var severityType = MEDIUM
        if (severity == "HIGH") {
            severityType = HIGH
        } else if (severity == "MEDIUM") {
            severityType = MEDIUM
        } else {
            severityType = LOW
        }
        
        Gleap.sendSilentCrashReport(with: description, andSeverity:  severityType, andDataExclusion:  dataExclusion) { success in
            call.resolve([
                "sentSilentBugReport": success
            ])
        }
    }
    
    @objc func setEventCallback(_ call: CAPPluginCall) {
        call.keepAlive = true
        callQueue[call.callbackId] = .event

        DispatchQueue.main.async {
            Gleap.sharedInstance().delegate = self
        }
    }

    @objc func open(_ call: CAPPluginCall) {
        // Open widget
        Gleap.open()
        
        // Provide feedback that it has been success
        call.resolve([
            "openedWidget": true
        ])
    }
    
    @objc func openNews(_ call: CAPPluginCall) {
        // Open news
        Gleap.openNews()
        
        // Provide feedback that it has been success
        call.resolve([
            "openedNews": true
        ])
    }
    
    @objc func openNewsArticle(_ call: CAPPluginCall) {
        let articleId = call.getString("articleId") ?? ""
        let showBackButton = call.getBool("showBackButton") ?? false
        
        // Open news
        Gleap.openNewsArticle(articleId, andShowBackButton: showBackButton)
        
        // Provide feedback that it has been success
        call.resolve([
            "opened": true
        ])
    }
    
    @objc func openHelpCenter(_ call: CAPPluginCall) {
        let showBackButton = call.getBool("showBackButton") ?? false
        
        // Open news
        Gleap.openHelpCenter(showBackButton)
        
        // Provide feedback that it has been success
        call.resolve([
            "opened": true
        ])
    }
    
    @objc func openHelpCenterArticle(_ call: CAPPluginCall) {
        let articleId = call.getString("articleId") ?? ""
        let showBackButton = call.getBool("showBackButton") ?? false
        
        // Open news
        Gleap.openHelpCenterArticle(articleId, andShowBackButton: showBackButton)
        
        // Provide feedback that it has been success
        call.resolve([
            "opened": true
        ])
    }
    
    @objc func openHelpCenterCollection(_ call: CAPPluginCall) {
        let collectionId = call.getString("collectionId") ?? ""
        let showBackButton = call.getBool("showBackButton") ?? false
        
        // Open news
        Gleap.openHelpCenterCollection(collectionId, andShowBackButton: showBackButton)
        
        // Provide feedback that it has been success
        call.resolve([
            "opened": true
        ])
    }
    
    @objc func searchHelpCenter(_ call: CAPPluginCall) {
        let term = call.getString("term") ?? ""
        let showBackButton = call.getBool("showBackButton") ?? false
        
        // Open news
        Gleap.searchHelpCenter(term, andShowBackButton: showBackButton)
        
        // Provide feedback that it has been success
        call.resolve([
            "opened": true
        ])
    }
    
    @objc func openFeatureRequests(_ call: CAPPluginCall) {
        let showBackButton = call.getBool("showBackButton") ?? false
        
        // Open news
        Gleap.openFeatureRequests(showBackButton)
        
        // Provide feedback that it has been success
        call.resolve([
            "openedFeatureRequests": true
        ])
    }
    
    @objc func close(_ call: CAPPluginCall) {
        // Open widget
        Gleap.close()
        
        // Provide feedback that it has been success
        call.resolve([
            "closedWidget": true
        ])
    }
    
    @objc func isOpened(_ call: CAPPluginCall) {
        // Provide feedback that it has been success
        call.resolve([
            "isOpened": Gleap.isOpened()
        ])
    }
    
    @objc func startFeedbackFlow(_ call: CAPPluginCall) {
        let feedbackFlow = call.getString("feedbackFlow") ?? "bugreporting"
        let showBackButton = call.getBool("showBackButton") ?? false
        
        Gleap.startFeedbackFlow(feedbackFlow, showBackButton: showBackButton)
        
        // Provide feedback that it has been success
        call.resolve([
            "startedFeedbackFlow": true
        ])
    }
    
    @objc func setLanguage(_ call: CAPPluginCall) {
        
        // If languageCode is empty, then pass back error
        guard let languageCode = call.options["languageCode"] as? String else {
            call.reject("No language provided")
            return;
        }
        
        // set language in Gleap
        Gleap.setLanguage(languageCode)
        
        // Provide feedback that it has been success
        call.resolve([
            "setLanguage": languageCode
        ])
    }
    
    func notifyEventUpdate(name: String, data: Any?) {
        var eventData: PluginCallResultData = [
            "name": name
        ];
        if let data = data {
            eventData["data"] = data
        }
        for (id, callType) in callQueue {
            if let call = bridge?.savedCall(withID: id), callType == .event {
                call.resolve(eventData)
            }
        }
    }
    
    public func customActionCalled(_ customAction: String) {
        notifyEventUpdate(name: "custom-action-called", data: nil)
    }
    
    public func widgetClosed() {
        notifyEventUpdate(name: "widget-closed", data: nil)
    }
    
    public func widgetOpened() {
        notifyEventUpdate(name: "widget-opened", data: nil)
    }
    
    public func feedbackFlowStarted(_ feedbackAction: [AnyHashable : Any]) {
        notifyEventUpdate(name: "flow-started", data: feedbackAction)
    }
    
    public func feedbackSent(_ data: [AnyHashable : Any]) {
        notifyEventUpdate(name: "feedback-sent", data: data)
    }
    
    public func feedbackSendingFailed() {
        notifyEventUpdate(name: "error-while-sending", data: nil)
    }
    
    public func registerPushMessageGroup(_ pushMessageGroup: String) {
        notifyEventUpdate(name: "register-pushmessage-group", data: pushMessageGroup)
    }
    
    public func unregisterPushMessageGroup(_ pushMessageGroup: String) {
        notifyEventUpdate(name: "unregister-pushmessage-group", data: pushMessageGroup)
    }
}
