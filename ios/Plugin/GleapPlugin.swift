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
    
    @objc func log(_ call: CAPPluginCall) {
        guard let message = call.options["message"] as? String else {
            call.reject("Must provide a log message")
            return;
        }
        
        var logLevel = INFO
        switch call.getString("logLevel") ?? "INFO" {
        case "INFO":
            logLevel = INFO

        case "WARNING":
            logLevel = WARNING

        case "ERROR":
            logLevel = INFO

        default:
            logLevel = INFO
        }
        
        Gleap.log(message, with: logLevel)
        
        call.resolve([
            "logged": true
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
    
    @objc func logEvent(_ call: CAPPluginCall) {
        guard let eventName = call.options["name"] as? String else {
            call.reject("No event log subject provided")
            return;
        }
        
        if let eventData = call.getObject("data") {
            Gleap.logEvent(eventName, withData: eventData)
        } else {
            Gleap.logEvent(eventName)
        }
        
        // Provide feedback that it has been success
        call.resolve([
            "loggedEvent": true
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
        
        // If logEventSubject is empty, then pass back error
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
}
