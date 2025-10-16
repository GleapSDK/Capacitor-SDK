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
        if (call.getString("plan") != nil) {
            userProperty.plan = call.getString("plan") ?? ""
        }
        if (call.getDouble("sla") != nil) {
            userProperty.sla = (call.getDouble("sla") ?? 0.0) as NSNumber
        }
        if (call.getString("companyName") != nil) {
            userProperty.companyName = call.getString("companyName") ?? ""
        }
        if (call.getString("companyId") != nil) {
            userProperty.companyId = call.getString("companyId") ?? ""
        }
        if (call.getString("avatar") != nil) {
            userProperty.avatar = call.getString("avatar") ?? ""
        }
        if (call.getObject("customData") != nil) {
            userProperty.customData = call.getObject("customData")!
        }
        
        if let userHash = call.getString("userHash") {
            Gleap.identifyContact(userId, andData:  userProperty, andUserHash: userHash)
        } else {
            Gleap.identifyContact(userId, andData: userProperty)
        }
        
        // Provide feedback that it has been success
        call.resolve([
            "identify": true
        ])
    }
    
    @objc func updateContact(_ call: CAPPluginCall) {
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
        if (call.getString("plan") != nil) {
            userProperty.plan = call.getString("plan") ?? ""
        }
        if (call.getDouble("sla") != nil) {
            userProperty.sla = (call.getDouble("sla") ?? 0.0) as NSNumber
        }
        if (call.getString("companyName") != nil) {
            userProperty.companyName = call.getString("companyName") ?? ""
        }
        if (call.getString("companyId") != nil) {
            userProperty.companyId = call.getString("companyId") ?? ""
        }
        if (call.getString("avatar") != nil) {
            userProperty.avatar = call.getString("avatar") ?? ""
        }
        if (call.getObject("customData") != nil) {
            userProperty.customData = call.getObject("customData")!
        }
        
        Gleap.updateContact(userProperty)
        
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
    
    @objc func setNetworkLogsBlacklist(_ call: CAPPluginCall) {
        // If value is empty, then pass back error
        guard let blacklist = call.options["blacklist"] as? [String] else {
            call.reject("Must provide a blacklist array")
            return;
        }
        
        // Append custom data
        Gleap.setNetworkLogsBlacklist(blacklist)
        
        // Provide feedback that it has been success
        call.resolve([
            "blacklistSet": true
        ])
    }
    
    @objc func setNetworkLogPropsToIgnore(_ call: CAPPluginCall) {
        // If value is empty, then pass back error
        guard let propsToIgnore = call.options["propsToIgnore"] as? [String] else {
            call.reject("Must provide a propsToIgnore array")
            return;
        }
        
        // Append custom data
        Gleap.setNetworkLogPropsToIgnore(propsToIgnore)
        
        // Provide feedback that it has been success
        call.resolve([
            "propsToIgnoreSet": true
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

    @objc func setAiTools(_ call: CAPPluginCall) {
        guard let toolsArray = call.options["tools"] as? [[String: Any]] else {
            call.reject("Must provide a toolsArray")
            return
        }
        
        var aiTools = [GleapAiTool]()
        
        for toolDict in toolsArray {
            guard let name = toolDict["name"] as? String,
                  let toolDescription = toolDict["description"] as? String,
                  let response = toolDict["response"] as? String,
                  let executionType = toolDict["executionType"] as? String,
                  let parametersArray = toolDict["parameters"] as? [[String: Any]] else {
                // If any of the required properties are missing, skip this tool
                continue
            }
            
            var parameters = [GleapAiToolParameter]()
            
            for paramDict in parametersArray {
                guard let paramName = paramDict["name"] as? String,
                      let paramDescription = paramDict["description"] as? String,
                      let type = paramDict["type"] as? String,
                      let required = paramDict["required"] as? Bool else {
                    // If any of the required properties are missing, skip this parameter
                    continue
                }
                
                let enums = paramDict["enum"] as? [String] ?? []
                let parameter = GleapAiToolParameter(
                    name: paramName,
                    parameterDescription: paramDescription,
                    type: type,
                    required: required,
                    enums: enums
                )
                
                parameters.append(parameter)
            }
            
            let aiTool = GleapAiTool(
                name: name,
                toolDescription: toolDescription,
                response: response,
                executionType: executionType,
                parameters: parameters
            )
            
            aiTools.append(aiTool)
        }
        
        // Set AI tools using your specific method to interact with the Gleap SDK
        Gleap.setAiTools(aiTools)
        
        // Provide feedback that the AI tools have been successfully set
        call.resolve([
            "aiToolsSet": true
        ])
    }
    
    @objc func setTicketAttribute(_ call: CAPPluginCall) {
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
        
        // Set ticket attribute
        Gleap.setTicketAttributeWithKey(key, value: value)
        
        // Provide feedback that it has been success
        call.resolve([
            "setTicketAttribute": true
        ])
    }

    @objc func unsetTicketAttribute(_ call: CAPPluginCall) {
        // If key is empty, then pass back error
        guard let key = call.options["key"] as? String else {
            call.reject("Must provide a data key")
            return;
        }
        
        // Unset ticket attribute
        Gleap.unsetTicketAttribute(withKey: key)

        // Provide feedback that it has been success
        call.resolve([
            "unsetTicketAttribute": true
        ])
    }

    @objc func clearTicketAttributes(_ call: CAPPluginCall) {
        // Clear ticket attributes
        Gleap.clearTicketAttributes()

        // Provide feedback that it has been success
        call.resolve([
            "clearTicketAttributes": true
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
    
    @objc func openChecklists(_ call: CAPPluginCall) {
        let showBackButton = call.getBool("showBackButton") ?? true

        // Open news
        Gleap.openChecklists(showBackButton)
        
        // Provide feedback that it has been success
        call.resolve([
            "opened": true
        ])
    }
    
    @objc func openChecklist(_ call: CAPPluginCall) {
        let checklistId = call.getString("checklistId") ?? ""
        let showBackButton = call.getBool("showBackButton") ?? true
        
        // Open news
        Gleap.openNewsArticle(checklistId, andShowBackButton: showBackButton)
        
        // Provide feedback that it has been success
        call.resolve([
            "opened": true
        ])
    }
    
    @objc func startChecklist(_ call: CAPPluginCall) {
        let outboundId = call.getString("outboundId") ?? ""
        let showBackButton = call.getBool("showBackButton") ?? true
        
        // Open news
        Gleap.openNewsArticle(outboundId, andShowBackButton: showBackButton)
        
        // Provide feedback that it has been success
        call.resolve([
            "opened": true
        ])
    }
    
    @objc func openNews(_ call: CAPPluginCall) {
        // Open news
        Gleap.openNews()
        
        // Provide feedback that it has been success
        call.resolve([
            "opened": true
        ])
    }
    
    @objc func openNewsArticle(_ call: CAPPluginCall) {
        let articleId = call.getString("articleId") ?? ""
        let showBackButton = call.getBool("showBackButton") ?? true
        
        // Open news
        Gleap.openNewsArticle(articleId, andShowBackButton: showBackButton)
        
        // Provide feedback that it has been success
        call.resolve([
            "opened": true
        ])
    }
    
    @objc func openHelpCenter(_ call: CAPPluginCall) {
        let showBackButton = call.getBool("showBackButton") ?? true
        
        // Open news
        Gleap.openHelpCenter(showBackButton)
        
        // Provide feedback that it has been success
        call.resolve([
            "opened": true
        ])
    }
    
    @objc func askAI(_ call: CAPPluginCall) {
        let question = call.getString("question") ?? ""
        let showBackButton = call.getBool("showBackButton") ?? true
        
        // Open news
        Gleap.askAI(question, andShowBackButton: showBackButton)
        
        // Provide feedback that it has been success
        call.resolve([
            "opened": true
        ])
    }
    
    @objc func openHelpCenterArticle(_ call: CAPPluginCall) {
        let articleId = call.getString("articleId") ?? ""
        let showBackButton = call.getBool("showBackButton") ?? true
        
        // Open news
        Gleap.openHelpCenterArticle(articleId, andShowBackButton: showBackButton)
        
        // Provide feedback that it has been success
        call.resolve([
            "opened": true
        ])
    }
    
    @objc func openHelpCenterCollection(_ call: CAPPluginCall) {
        let collectionId = call.getString("collectionId") ?? ""
        let showBackButton = call.getBool("showBackButton") ?? true
        
        // Open news
        Gleap.openHelpCenterCollection(collectionId, andShowBackButton: showBackButton)
        
        // Provide feedback that it has been success
        call.resolve([
            "opened": true
        ])
    }
    
    @objc func searchHelpCenter(_ call: CAPPluginCall) {
        let term = call.getString("term") ?? ""
        let showBackButton = call.getBool("showBackButton") ?? true
        
        // Open news
        Gleap.searchHelpCenter(term, andShowBackButton: showBackButton)
        
        // Provide feedback that it has been success
        call.resolve([
            "opened": true
        ])
    }
    
    @objc func openFeatureRequests(_ call: CAPPluginCall) {
        let showBackButton = call.getBool("showBackButton") ?? true
        
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
    
    @objc func startBot(_ call: CAPPluginCall) {
        let botId = call.getString("botId") ?? ""
        let showBackButton = call.getBool("showBackButton") ?? true
        
        Gleap.startBot(botId, showBackButton: showBackButton)
        
        // Provide feedback that it has been success
        call.resolve([
            "startedBot": true
        ])
    }
    
    @objc func startClassicForm(_ call: CAPPluginCall) {
        let formId = call.getString("formId") ?? "bugreporting"
        let showBackButton = call.getBool("showBackButton") ?? true
        
        Gleap.startClassicForm(formId, showBackButton: showBackButton)
        
        // Provide feedback that it has been success
        call.resolve([
            "classicFormStarted": true
        ])
    }
    
    @objc func startConversation(_ call: CAPPluginCall) {
        let showBackButton = call.getBool("showBackButton") ?? true
        
        Gleap.startConversation(showBackButton)
        
        // Provide feedback that it has been success
        call.resolve([
            "conversationStarted": true
        ])
    }
    
    @objc func openConversations(_ call: CAPPluginCall) {
        let showBackButton = call.getBool("showBackButton") ?? true
        
        Gleap.openConversations(showBackButton)
        
        // Provide feedback that it has been success
        call.resolve([
            "conversationsOpened": true
        ])
    }
    
    @objc func startFeedbackFlow(_ call: CAPPluginCall) {
        let feedbackFlow = call.getString("feedbackFlow") ?? "bugreporting"
        let showBackButton = call.getBool("showBackButton") ?? true
        
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
        notifyEventUpdate(name: name, data: data, shareToken: nil)
    }
    
    func notifyEventUpdate(name: String, data: Any?, shareToken: String?) {
        var eventData: PluginCallResultData = [
            "name": name
        ];
        if let data = data {
            eventData["data"] = data
        }
        if let shareToken = shareToken {
            eventData["shareToken"] = shareToken
        }
        for (id, callType) in callQueue {
            if let call = bridge?.savedCall(withID: id), callType == .event {
                call.resolve(eventData)
            }
        }
    }
    
    public func customActionCalled(_ customAction: String, withShareToken shareToken: String?) {
        notifyEventUpdate(name: "custom-action-called", data: customAction, shareToken: shareToken)
    }
    
    public func widgetClosed() {
        notifyEventUpdate(name: "widget-closed", data: nil)
    }
    
    public func initialized() {
        notifyEventUpdate(name: "initialized", data: nil)
    }
    
    public func widgetOpened() {
        notifyEventUpdate(name: "widget-opened", data: nil)
    }

    public func notificationCountUpdated(_ count: Int32) {
        notifyEventUpdate(name: "notification-count-updated", data: count)
    }
    
    public func onToolExecution(_ toolExecution: [AnyHashable : Any]) {
        notifyEventUpdate(name: "tool-execution", data: toolExecution)
    }
    
    public func feedbackFlowStarted(_ feedbackAction: [AnyHashable : Any]) {
        notifyEventUpdate(name: "flow-started", data: feedbackAction)
    }
    
    public func feedbackSent(_ data: [AnyHashable : Any]) {
        notifyEventUpdate(name: "feedback-sent", data: data)
    }
    
    public func outboundSent(_ data: [AnyHashable : Any]) {
        notifyEventUpdate(name: "outbound-sent", data: data)
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
