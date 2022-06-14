import Foundation
import Capacitor
import Gleap

/**
 * Please read the Capacitor iOS Plugin Development Guide
 * here: https://capacitorjs.com/docs/plugins/ios
 */
@objc(GleapPlugin)
public class GleapPlugin: CAPPlugin {
    // private var implementation = Gleap()

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
    
    @objc func setUserIdentity(_ call: CAPPluginCall) {
        
        // If userId is empty, then pass back error
        guard let UserId = call.options["UserId"] as? String else {
            call.reject("Must provide an user ID")
            return;
        }
        
        if ((call.getString("userName") != nil) && (call.getString("userEmail") != nil)) {
            
            // Create user Props
            let userProperty = GleapUserProperty()
            userProperty.name = call.getString("userName") ?? ""
            userProperty.email = call.getString("userEmail") ?? ""

            // Set user Props
            Gleap.identifyUser(with: UserId, andData: userProperty)
        } else if (call.getString("userName") != nil) {
            
            // Create user Props
            let userProperty = GleapUserProperty()
            userProperty.name = call.getString("userName") ?? ""
            
            // Set user Props
            Gleap.identifyUser(with: UserId, andData: userProperty)
        } else if (call.getString("userEmail") != nil) {

            // Create user Props
            let userProperty = GleapUserProperty()
            userProperty.email = call.getString("userEmail") ?? ""
            
            // Set user Props
            Gleap.identifyUser(with: UserId, andData: userProperty)
        } else {
            
            // Create user Props
            let userProperty = GleapUserProperty()
            
            // Set User Identity with ID
            Gleap.identifyUser(with: UserId, andData: userProperty)
        }
        
        
        // Provide feedback that it has been success
        call.resolve([
            "setUserIdentity": true
        ])
    }
    
    @objc func clearUserIdentity(_ call: CAPPluginCall) {
        
        // Clear User Identity in Gleap
        Gleap.clearIdentity()
        
        // Provide feedback that it has been success
        call.resolve([
            "clearIdentity": true
        ])
    }
    
    @objc func addCustomData(_ call: CAPPluginCall) {
        
        // If dataKey is empty, then pass back error
        guard let dataKey = call.options["dataKey"] as? String else {
            call.reject("Must provide a data key")
            return;
        }
        
        // If dataValue is empty, then pass back error
        guard let dataValue = call.options["dataValue"] as? String else {
            call.reject("Must provide a data value")
            return;
        }
        
        // Set custom data
        Gleap.attachCustomData(["value": dataValue, "type": dataKey])
        
        
        // Provide feedback that it has been success
        call.resolve([
            "addCustomData": true
        ])
    }
    
    @objc func appendCustomData(_ call: CAPPluginCall) {
        
        // If dataKey is empty, then pass back error
        guard let dataKey = call.options["dataKey"] as? String else {
            call.reject("Must provide a data key")
            return;
        }
        
        // If dataValue is empty, then pass back error
        guard let dataValue = call.options["dataValue"] as? String else {
            call.reject("Must provide a data value")
            return;
        }
        
        // Append custom data
        Gleap.setCustomData(dataValue, forKey: dataKey)
        
        
        // Provide feedback that it has been success
        call.resolve([
            "appendCustomData": true
        ])
    }
    
    @objc func removeCustomData(_ call: CAPPluginCall) {
        
        // If dataKey is empty, then pass back error
        guard let dataKey = call.options["dataKey"] as? String else {
            call.reject("Must provide a data key")
            return;
        }
        
        // remove custom data
        Gleap.removeCustomData(forKey: dataKey)
        
        
        // Provide feedback that it has been success
        call.resolve([
            "removeCustomData": true
        ])
    }
    
    @objc func clearCustomData(_ call: CAPPluginCall) {
        
        // clear custom data
        Gleap.clearCustomData()
        
        // Provide feedback that it has been success
        call.resolve([
            "clearCustomData": true
        ])
    }
    
    
    @objc func logEvent(_ call: CAPPluginCall) {
        
        let logEventData = call.getObject("logEventData") ?? [:]
        
        // If logEventSubject is empty, then pass back error
        guard let logEventSubject = call.options["logEventSubject"] as? String else {
            call.reject("No event log subject provided")
            return;
        }
        
        // If logEventData is empty call for function without data
        if (call.getString("logEventData") == nil) {
            Gleap.logEvent(logEventSubject)
        } else {
            Gleap.logEvent(logEventSubject, withData: logEventData)
        }
        
        // Provide feedback that it has been success
        call.resolve([
            "logEvent": true
        ])
    }
    
    @objc func sendSilentBugReport(_ call: CAPPluginCall) {
        
        let silentBugReportSeverity = call.getString("silentBugReportSeverity") ?? "low"
        
        // If logEventSubject is empty, then pass back error
        guard let silentBugReportInfo = call.options["silentBugReportInfo"] as? String else {
            call.reject("No silent bug report description provided")
            return;
        }
        
        // If severity is set then apply the right gleap severity
        if (silentBugReportSeverity == "high") {
            Gleap.sendSilentBugReport(with: silentBugReportInfo, andSeverity: HIGH)
        } else if (silentBugReportSeverity == "medium") {
            Gleap.sendSilentBugReport(with: silentBugReportInfo, andSeverity: MEDIUM)
        } else {
            Gleap.sendSilentBugReport(with: silentBugReportInfo, andSeverity: LOW)
        }
        
        // Provide feedback that it has been success
        call.resolve([
            "sendSilentBugReport": true
        ])
    }
    
    @objc func openWidget(_ call: CAPPluginCall) {
        
        // Open widget
        Gleap.open()
        
        // Provide feedback that it has been success
        call.resolve([
            "openWidget": true
        ])
    }
    
    @objc func startFeedbackFlow(_ call: CAPPluginCall) {
        
        let feedbackType = call.getString("feedbackType") ?? ""
        
        // If severity is set then apply the right gleap severity
        if (feedbackType == "bugreporting") {
            Gleap.startFeedbackFlow(feedbackType)
        } else if (feedbackType == "featurerequests") {
            Gleap.startFeedbackFlow(feedbackType)
        } else if (feedbackType == "rating") {
            Gleap.startFeedbackFlow(feedbackType)
        } else if (feedbackType == "contact") {
            Gleap.startFeedbackFlow(feedbackType)
        } else {
            Gleap.startFeedbackFlow()
        }
        
        // Provide feedback that it has been success
        call.resolve([
            "startFeedbackFlow": true
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
    
}
