# Gleap Capacitor and Ionic SDK

Add AI-native customer support, live chat, in-app bug reporting, a help center and surveys to your Capacitor and Ionic apps with [Gleap](https://www.gleap.ai). Gleap is an Intercom alternative for software teams that connects customer conversations and feedback with product development.

This plugin supports Capacitor 7 and later (iOS via Swift Package Manager or CocoaPods). See the instructions below for earlier Capacitor versions.

Thanks to Stephan Nagel (congrapp) for his work on the Gleap Capacitor plugin.

[SDK documentation](https://docs.gleap.ai/documentation/ioniccapacitor/README) · [Website](https://www.gleap.ai) · [Plans and pricing](https://www.gleap.ai/pricing)

## Install

```bash
npm install capacitor-gleap-plugin
npx cap sync
```

### iOS

The plugin needs Capacitor 7 or later and an iOS deployment target of **15.0** or higher. On iOS it is a Swift package (`Package.swift`) and pulls the native [Gleap iOS SDK](https://github.com/GleapSDK/Gleap-iOS-SDK) from GitHub; it still ships a podspec for apps that use CocoaPods.

**Swift Package Manager (recommended).** New apps: `npx cap add ios --packagemanager SPM`. Existing CocoaPods apps can move with `npx cap spm-migration-assistant` once all their plugins support SPM (see [Capacitor: Swift Package Manager](https://capacitorjs.com/docs/ios/spm)). Set the app target's iOS deployment target to 15.0 in Xcode, then run `npx cap sync ios` again so `CapApp-SPM/Package.swift` declares iOS 15 as well (the plugin's package requires it).

**CocoaPods.** Set `platform :ios, '15.0'` in `ios/App/Podfile` and run `npx cap sync ios`. CocoaPods trunk becomes read-only on December 2, 2026, so Gleap iOS SDK versions released after that date are not on trunk. For those, `pod install` fails with `None of your spec sources contain Gleap (= X.Y.Z)`; add the SDK from GitHub to your app target in the Podfile, with the version the plugin requires (`s.dependency 'Gleap', 'X.Y.Z'` in `node_modules/capacitor-gleap-plugin/CapacitorGleapPlugin.podspec`):

```ruby
target 'App' do
  capacitor_pods
  # Add your Pods here
  pod 'Gleap', :git => 'https://github.com/GleapSDK/Gleap-iOS-SDK.git', :tag => '19.0.0'
end
```

Swift Package Manager is the recommended setup: after December 2, 2026 new Gleap iOS SDK versions are only released through GitHub and Swift Package Manager.

## Capacitor 6

Please install the plugin version from our capacitor-v6 brunch with `npm install GleapSDK/Capacitor-SDK#capacitor-v6 --save` if you are using capacitor 6.

## Capacitor 5

Please install the plugin version from our capacitor-v5 brunch with `npm install GleapSDK/Capacitor-SDK#capacitor-v5 --save` if you are using capacitor 5.

## Capacitor 4 or earlier

Please install the plugin version from our capacitor-v4 brunch with `npm install GleapSDK/Capacitor-SDK#capacitor-v4 --save` if you are using capacitor 4 or earlier.

## Data regions

Gleap projects live in a data region. The SDK talks to the EU region by default. If your project is hosted in the US region, set the region **before** calling `initialize`:

```typescript
import { Gleap } from "capacitor-gleap-plugin";

await Gleap.setRegion({ region: "us" });
await Gleap.initialize({ API_KEY: "YOUR_API_KEY" });
```

`setRegion` sets the API, websocket and realtime hosts at once (supported regions: `"eu"` and `"us"`). The static widget hosts (frame, banner, modal) are global and are not changed by the region.

For self-hosted or custom setups you can override single hosts with `setApiUrl({ url })`, `setWSApiUrl({ url })`, `setRealtimeHost({ host })`, `setFrameUrl({ url })`, `setBannerUrl({ url })` and `setModalUrl({ url })`. All of them must be called before `initialize`; a manual setter called after `setRegion` overrides that single host.

## Env data

With every ticket the SDK sends env data (device, OS, screen size, locale, URL, …), shown under the **Env data** tab in Gleap. Leave out individual keys or stop collecting env data entirely:

```typescript
await Gleap.setEnvDataPropsToIgnore({ propsToIgnore: ["deviceName", "batteryLevel"] });
await Gleap.setDisableEnvData({ disableEnvData: true });
```

Both can be called at any time and apply to the next ticket. Each `setEnvDataPropsToIgnore` call replaces the previous list, an empty array resets it. `setDisableEnvData({ disableEnvData: false })` turns the collection back on.

## Dark mode

Switch the widget between dark and light mode. `auto` follows the device appearance (on web: the page theme); if your app has its own theme toggle, pass `light` or `dark` explicitly and call it again whenever the theme changes:

```typescript
await Gleap.setColorScheme({ colorScheme: "auto" });
await Gleap.setColorScheme({ colorScheme: isDarkTheme ? "dark" : "light", darkBackgroundColor: "#121212" });
```

`setColorScheme` only takes effect when "Adapt to dark / light mode" is enabled in the Gleap dashboard; it then overrides the dashboard's color scheme. Before the first call the dashboard setting applies. In dark mode the widget uses the dark mode colors, logo, header image and composer glow set in the Gleap dashboard; without dark colors it keeps its normal colors. `lightBackgroundColor` / `darkBackgroundColor` override the background in light / dark mode. Can be called before or after `initialize`.

## Protected conversation files

With "Require authenticated file access" (Project settings → User identity), conversation files can only be opened by agents and by the verified customer the conversation belongs to. Identify the customer with a user hash (created on your server with the project's identity verification secret) on every app start:

```typescript
await Gleap.identify({ userId: "user-1", userHash: userHash, email: "jane@example.com" });
```

Email replies link attachments to your customer application URL with a `gleapFile` query parameter. If that URL opens your app (universal link / App Link), pass it to Gleap; the conversation opens once the customer is identified with a user hash:

```typescript
import { App } from "@capacitor/app";

const launch = await App.getLaunchUrl();
if (launch?.url) {
  await Gleap.openProtectedFileFromUrl({ url: launch.url });
}
App.addListener("appUrlOpen", ({ url }) => {
  Gleap.openProtectedFileFromUrl({ url });
});
```

`openProtectedFileFromUrl` resolves `{ opened: false }` when the URL has no valid `gleapFile` parameter. On web the JavaScript SDK opens `?gleapFile=` links on page load by itself.

## API

<docgen-index>

* [`initialize(...)`](#initialize)
* [`setRegion(...)`](#setregion)
* [`setApiUrl(...)`](#setapiurl)
* [`setWSApiUrl(...)`](#setwsapiurl)
* [`setRealtimeHost(...)`](#setrealtimehost)
* [`setFrameUrl(...)`](#setframeurl)
* [`setBannerUrl(...)`](#setbannerurl)
* [`setModalUrl(...)`](#setmodalurl)
* [`identify(...)`](#identify)
* [`updateContact(...)`](#updatecontact)
* [`clearIdentity()`](#clearidentity)
* [`getIdentity()`](#getidentity)
* [`isUserIdentified()`](#isuseridentified)
* [`log(...)`](#log)
* [`showSurvey(...)`](#showsurvey)
* [`attachCustomData(...)`](#attachcustomdata)
* [`setTags(...)`](#settags)
* [`setNetworkLogsBlacklist(...)`](#setnetworklogsblacklist)
* [`setNetworkLogPropsToIgnore(...)`](#setnetworklogpropstoignore)
* [`attachNetworkLogs(...)`](#attachnetworklogs)
* [`attachConsoleLogs(...)`](#attachconsolelogs)
* [`logsFlushed(...)`](#logsflushed)
* [`setEnvDataPropsToIgnore(...)`](#setenvdatapropstoignore)
* [`registerAgentTool(...)`](#registeragenttool)
* [`sendAgentToolResult(...)`](#sendagenttoolresult)
* [`addListener('agentToolExecution', ...)`](#addlisteneragenttoolexecution-)
* [`addListener('logConfigLoaded', ...)`](#addlistenerlogconfigloaded-)
* [`addListener('flushLogs', ...)`](#addlistenerflushlogs-)
* [`setTicketAttribute(...)`](#setticketattribute)
* [`unsetTicketAttribute(...)`](#unsetticketattribute)
* [`clearTicketAttributes()`](#clearticketattributes)
* [`setCustomData(...)`](#setcustomdata)
* [`removeCustomData(...)`](#removecustomdata)
* [`clearCustomData()`](#clearcustomdata)
* [`trackEvent(...)`](#trackevent)
* [`trackPage(...)`](#trackpage)
* [`setEventCallback(...)`](#seteventcallback)
* [`sendSilentCrashReport(...)`](#sendsilentcrashreport)
* [`preFillForm(...)`](#prefillform)
* [`addAttachment(...)`](#addattachment)
* [`removeAllAttachments()`](#removeallattachments)
* [`open()`](#open)
* [`openChecklists(...)`](#openchecklists)
* [`openChecklist(...)`](#openchecklist)
* [`startChecklist(...)`](#startchecklist)
* [`openNews(...)`](#opennews)
* [`openNewsArticle(...)`](#opennewsarticle)
* [`openHelpCenter(...)`](#openhelpcenter)
* [`openHelpCenterArticle(...)`](#openhelpcenterarticle)
* [`askAI(...)`](#askai)
* [`openHelpCenterCollection(...)`](#openhelpcentercollection)
* [`searchHelpCenter(...)`](#searchhelpcenter)
* [`openFeatureRequests(...)`](#openfeaturerequests)
* [`close()`](#close)
* [`isOpened()`](#isopened)
* [`startFeedbackFlow(...)`](#startfeedbackflow)
* [`startClassicForm(...)`](#startclassicform)
* [`startConversation(...)`](#startconversation)
* [`openConversation(...)`](#openconversation)
* [`openConversations(...)`](#openconversations)
* [`openProtectedFileFromUrl(...)`](#openprotectedfilefromurl)
* [`startBot(...)`](#startbot)
* [`showFeedbackButton(...)`](#showfeedbackbutton)
* [`setDisableInAppNotifications(...)`](#setdisableinappnotifications)
* [`setDisableEnvData(...)`](#setdisableenvdata)
* [`setColorScheme(...)`](#setcolorscheme)
* [`setCaptureEnabled(...)`](#setcaptureenabled)
* [`setRemoteLogCollectionEnabled(...)`](#setremotelogcollectionenabled)
* [`setLanguage(...)`](#setlanguage)
* [`disableConsoleLogOverwrite()`](#disableconsolelogoverwrite)
* [`enableDebugConsoleLog()`](#enabledebugconsolelog)
* [`setNotificationContainerOffset(...)`](#setnotificationcontaineroffset)
* [Interfaces](#interfaces)
* [Type Aliases](#type-aliases)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### initialize(...)

```typescript
initialize(options: { API_KEY: string; }) => Promise<{ initialized: boolean; }>
```

Initialize Gleap with an API key

| Param         | Type                              |
| ------------- | --------------------------------- |
| **`options`** | <code>{ API_KEY: string; }</code> |

**Returns:** <code>Promise&lt;{ initialized: boolean; }&gt;</code>

**Since:** 7.0.0

--------------------


### setRegion(...)

```typescript
setRegion(options: { region: 'eu' | 'us'; }) => Promise<{ region: string; }>
```

Set the data region of your Gleap project ("eu" is the default).
Sets the API, websocket and realtime hosts at once. Must be called before initialize.
A manual setter (setApiUrl, setWSApiUrl, setRealtimeHost) called afterwards overrides that single host.

| Param         | Type                                   |
| ------------- | -------------------------------------- |
| **`options`** | <code>{ region: 'eu' \| 'us'; }</code> |

**Returns:** <code>Promise&lt;{ region: string; }&gt;</code>

**Since:** 18.0.0

--------------------


### setApiUrl(...)

```typescript
setApiUrl(options: { url: string; }) => Promise<{ url: string; }>
```

Set a custom API url. Must be called before initialize.

| Param         | Type                          |
| ------------- | ----------------------------- |
| **`options`** | <code>{ url: string; }</code> |

**Returns:** <code>Promise&lt;{ url: string; }&gt;</code>

**Since:** 18.0.0

--------------------


### setWSApiUrl(...)

```typescript
setWSApiUrl(options: { url: string; }) => Promise<{ url: string; }>
```

Set a custom websocket API url. Must be called before initialize.

| Param         | Type                          |
| ------------- | ----------------------------- |
| **`options`** | <code>{ url: string; }</code> |

**Returns:** <code>Promise&lt;{ url: string; }&gt;</code>

**Since:** 18.0.0

--------------------


### setRealtimeHost(...)

```typescript
setRealtimeHost(options: { host: string; }) => Promise<{ host: string; }>
```

Set a custom realtime host (hostname only, without protocol or path). Must be called before initialize.

| Param         | Type                           |
| ------------- | ------------------------------ |
| **`options`** | <code>{ host: string; }</code> |

**Returns:** <code>Promise&lt;{ host: string; }&gt;</code>

**Since:** 18.0.0

--------------------


### setFrameUrl(...)

```typescript
setFrameUrl(options: { url: string; }) => Promise<{ url: string; }>
```

Set a custom widget frame url. Must be called before initialize.

| Param         | Type                          |
| ------------- | ----------------------------- |
| **`options`** | <code>{ url: string; }</code> |

**Returns:** <code>Promise&lt;{ url: string; }&gt;</code>

**Since:** 18.0.0

--------------------


### setBannerUrl(...)

```typescript
setBannerUrl(options: { url: string; }) => Promise<{ url: string; }>
```

Set a custom banner url. Must be called before initialize.

| Param         | Type                          |
| ------------- | ----------------------------- |
| **`options`** | <code>{ url: string; }</code> |

**Returns:** <code>Promise&lt;{ url: string; }&gt;</code>

**Since:** 18.0.0

--------------------


### setModalUrl(...)

```typescript
setModalUrl(options: { url: string; }) => Promise<{ url: string; }>
```

Set a custom modal url. Must be called before initialize.

| Param         | Type                          |
| ------------- | ----------------------------- |
| **`options`** | <code>{ url: string; }</code> |

**Returns:** <code>Promise&lt;{ url: string; }&gt;</code>

**Since:** 18.0.0

--------------------


### identify(...)

```typescript
identify(options: { userId: string; userHash?: string; name?: string; email?: string; phone?: string; companyId?: string; companyName?: string; avatar?: string; sla?: number; plan?: string; value?: number; customData?: Record<string, any>; }) => Promise<{ identify: boolean; }>
```

Set user identity

| Param         | Type                                                                                                                                                                                                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`options`** | <code>{ userId: string; userHash?: string; name?: string; email?: string; phone?: string; companyId?: string; companyName?: string; avatar?: string; sla?: number; plan?: string; value?: number; customData?: <a href="#record">Record</a>&lt;string, any&gt;; }</code> |

**Returns:** <code>Promise&lt;{ identify: boolean; }&gt;</code>

**Since:** 7.0.0

--------------------


### updateContact(...)

```typescript
updateContact(options: { name?: string; email?: string; phone?: string; companyId?: string; companyName?: string; avatar?: string; sla?: number; plan?: string; value?: number; customData?: Record<string, any>; }) => Promise<{ identify: boolean; }>
```

Update user properties

| Param         | Type                                                                                                                                                                                                                                  |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`options`** | <code>{ name?: string; email?: string; phone?: string; companyId?: string; companyName?: string; avatar?: string; sla?: number; plan?: string; value?: number; customData?: <a href="#record">Record</a>&lt;string, any&gt;; }</code> |

**Returns:** <code>Promise&lt;{ identify: boolean; }&gt;</code>

**Since:** 13.2.1

--------------------


### clearIdentity()

```typescript
clearIdentity() => Promise<{ clearIdentity: boolean; }>
```

Clear user identity

**Returns:** <code>Promise&lt;{ clearIdentity: boolean; }&gt;</code>

**Since:** 7.0.0

--------------------


### getIdentity()

```typescript
getIdentity() => Promise<{ identity: { userId: string; name?: string; email?: string; phone?: string; value?: number; }; }>
```

Get the current user identity

**Returns:** <code>Promise&lt;{ identity: { userId: string; name?: string; email?: string; phone?: string; value?: number; }; }&gt;</code>

**Since:** 8.1.0

--------------------


### isUserIdentified()

```typescript
isUserIdentified() => Promise<{ isUserIdentified: boolean; }>
```

User identified status.

**Returns:** <code>Promise&lt;{ isUserIdentified: boolean; }&gt;</code>

**Since:** 8.1.0

--------------------


### log(...)

```typescript
log(options: { message: string; logLevel?: "ERROR" | "WARNING" | "INFO"; }) => Promise<{ logged: boolean; }>
```

Submit a custom log message with the given level

| Param         | Type                                                                         |
| ------------- | ---------------------------------------------------------------------------- |
| **`options`** | <code>{ message: string; logLevel?: 'ERROR' \| 'WARNING' \| 'INFO'; }</code> |

**Returns:** <code>Promise&lt;{ logged: boolean; }&gt;</code>

**Since:** 7.0.0

--------------------


### showSurvey(...)

```typescript
showSurvey(options: { surveyId: string; format?: "survey" | "survey_full"; }) => Promise<{ opened: boolean; }>
```

Manually show a survey.

| Param         | Type                                                                   |
| ------------- | ---------------------------------------------------------------------- |
| **`options`** | <code>{ surveyId: string; format?: 'survey' \| 'survey_full'; }</code> |

**Returns:** <code>Promise&lt;{ opened: boolean; }&gt;</code>

**Since:** 8.5.1

--------------------


### attachCustomData(...)

```typescript
attachCustomData(options: { data: any; }) => Promise<{ attachedCustomData: boolean; }>
```

Add custom data

| Param         | Type                        |
| ------------- | --------------------------- |
| **`options`** | <code>{ data: any; }</code> |

**Returns:** <code>Promise&lt;{ attachedCustomData: boolean; }&gt;</code>

**Since:** 7.0.0

--------------------


### setTags(...)

```typescript
setTags(options: { tags: string[]; }) => Promise<{ tagsSet: boolean; }>
```

Set tags

| Param         | Type                             |
| ------------- | -------------------------------- |
| **`options`** | <code>{ tags: string[]; }</code> |

**Returns:** <code>Promise&lt;{ tagsSet: boolean; }&gt;</code>

**Since:** 8.6.0

--------------------


### setNetworkLogsBlacklist(...)

```typescript
setNetworkLogsBlacklist(options: { blacklist: string[]; }) => Promise<{ blacklistSet: boolean; }>
```

Set network logs blacklist

| Param         | Type                                  |
| ------------- | ------------------------------------- |
| **`options`** | <code>{ blacklist: string[]; }</code> |

**Returns:** <code>Promise&lt;{ blacklistSet: boolean; }&gt;</code>

**Since:** 13.2.1

--------------------


### setNetworkLogPropsToIgnore(...)

```typescript
setNetworkLogPropsToIgnore(options: { propsToIgnore: string[]; }) => Promise<{ propsToIgnoreSet: boolean; }>
```

Set network logs props to ignore

| Param         | Type                                      |
| ------------- | ----------------------------------------- |
| **`options`** | <code>{ propsToIgnore: string[]; }</code> |

**Returns:** <code>Promise&lt;{ propsToIgnoreSet: boolean; }&gt;</code>

**Since:** 13.2.1

--------------------


### attachNetworkLogs(...)

```typescript
attachNetworkLogs(options: { logs: GleapNetworkLogEntry[]; }) => Promise<{ networkLogsAttached: boolean; }>
```

Hands the network requests made inside the app's WebView (fetch and XMLHttpRequest) to the native SDK, so they
show up in the network logs of tickets. The plugin calls this for you on iOS and Android; each call replaces
the previously attached WebView network logs. No-op on web, where the JavaScript SDK records requests itself.

| Param         | Type                                           |
| ------------- | ---------------------------------------------- |
| **`options`** | <code>{ logs: GleapNetworkLogEntry[]; }</code> |

**Returns:** <code>Promise&lt;{ networkLogsAttached: boolean; }&gt;</code>

**Since:** 19.0.0

--------------------


### attachConsoleLogs(...)

```typescript
attachConsoleLogs(options: { logs: GleapConsoleLogEntry[]; }) => Promise<{ consoleLogsAttached: boolean; }>
```

Hands the console output of the app's WebView (console.log/info/warn/error/debug, uncaught errors and
unhandled promise rejections) to the native SDK, so it shows up in the console logs of tickets. The plugin
calls this for you on iOS and Android; each call replaces the previously attached WebView console logs.
No-op on web, where the JavaScript SDK records the console itself.

| Param         | Type                                           |
| ------------- | ---------------------------------------------- |
| **`options`** | <code>{ logs: GleapConsoleLogEntry[]; }</code> |

**Returns:** <code>Promise&lt;{ consoleLogsAttached: boolean; }&gt;</code>

**Since:** 19.0.0

--------------------


### logsFlushed(...)

```typescript
logsFlushed(options: { flushId: string; }) => Promise<void>
```

Answers a `flushLogs` event once the WebView console and network logs the plugin buffers were handed to the native
SDK, so it collects the logs for a capture request with them. The plugin calls this for you on iOS and Android.
No-op on web.

| Param         | Type                              |
| ------------- | --------------------------------- |
| **`options`** | <code>{ flushId: string; }</code> |

--------------------


### setEnvDataPropsToIgnore(...)

```typescript
setEnvDataPropsToIgnore(options: { propsToIgnore: string[]; }) => Promise<{ envDataPropsToIgnoreSet: boolean; }>
```

Set env data props to ignore. The given env data keys (exact and case-sensitive, e.g. "deviceName" or "currentUrl")
are removed before a ticket or conversation is sent. Each call replaces the previous list, an empty list resets it.
Can be called before or after initialize.

| Param         | Type                                      |
| ------------- | ----------------------------------------- |
| **`options`** | <code>{ propsToIgnore: string[]; }</code> |

**Returns:** <code>Promise&lt;{ envDataPropsToIgnoreSet: boolean; }&gt;</code>

**Since:** 18.1.0

--------------------


### registerAgentTool(...)

```typescript
registerAgentTool(options: { name: string; }) => Promise<void>
```

Registers a Frontend tool defined on your AI agent in the Gleap dashboard.
Prefer the `registerAgentTool(name, handler)` helper exported by this
package — it wires the agentToolExecution event and result round-trip for
you.

| Param         | Type                           |
| ------------- | ------------------------------ |
| **`options`** | <code>{ name: string; }</code> |

**Since:** 15.0.0

--------------------


### sendAgentToolResult(...)

```typescript
sendAgentToolResult(options: { executionId: string; result: string; }) => Promise<void>
```

Resolves a pending agent tool execution with the handler's result.
Used by the `registerAgentTool(name, handler)` helper.

| Param         | Type                                                  |
| ------------- | ----------------------------------------------------- |
| **`options`** | <code>{ executionId: string; result: string; }</code> |

**Since:** 15.0.0

--------------------


### addListener('agentToolExecution', ...)

```typescript
addListener(eventName: 'agentToolExecution', listenerFunc: (data: { executionId: string; name: string; params: any; }) => void) => Promise<PluginListenerHandle>
```

Called when a registered agent tool should execute.

| Param              | Type                                                                                |
| ------------------ | ----------------------------------------------------------------------------------- |
| **`eventName`**    | <code>'agentToolExecution'</code>                                                   |
| **`listenerFunc`** | <code>(data: { executionId: string; name: string; params: any; }) =&gt; void</code> |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Since:** 15.0.0

--------------------


### addListener('logConfigLoaded', ...)

```typescript
addListener(eventName: 'logConfigLoaded', listenerFunc: (config: GleapLogConfig) => void) => Promise<PluginListenerHandle>
```

Called on iOS and Android when the project config is loaded, with the network log settings the plugin's
WebView log capture needs (network logs are only recorded when they are enabled for your project).

| Param              | Type                                                                           |
| ------------------ | ------------------------------------------------------------------------------ |
| **`eventName`**    | <code>'logConfigLoaded'</code>                                                 |
| **`listenerFunc`** | <code>(config: <a href="#gleaplogconfig">GleapLogConfig</a>) =&gt; void</code> |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Since:** 19.0.0

--------------------


### addListener('flushLogs', ...)

```typescript
addListener(eventName: 'flushLogs', listenerFunc: (data: { flushId: string; }) => void) => Promise<PluginListenerHandle>
```

Called on iOS and Android right before the native SDK collects the logs for a capture request: the plugin's
WebView log capture hands over what it buffers (it pushes at most every 500 ms otherwise) and answers with
`logsFlushed`. The native SDK waits at most 500 ms for the answer. The plugin listens for you.

| Param              | Type                                                 |
| ------------------ | ---------------------------------------------------- |
| **`eventName`**    | <code>'flushLogs'</code>                             |
| **`listenerFunc`** | <code>(data: { flushId: string; }) =&gt; void</code> |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### setTicketAttribute(...)

```typescript
setTicketAttribute(options: { key: string; value: string; }) => Promise<{ setTicketAttribute: boolean; }>
```

Sets the value of a ticket attribute

| Param         | Type                                         |
| ------------- | -------------------------------------------- |
| **`options`** | <code>{ key: string; value: string; }</code> |

**Returns:** <code>Promise&lt;{ setTicketAttribute: boolean; }&gt;</code>

**Since:** 13.5.0

--------------------


### unsetTicketAttribute(...)

```typescript
unsetTicketAttribute(options: { key: string; }) => Promise<{ unsetTicketAttribute: boolean; }>
```

Unset a ticket attribute

| Param         | Type                          |
| ------------- | ----------------------------- |
| **`options`** | <code>{ key: string; }</code> |

**Returns:** <code>Promise&lt;{ unsetTicketAttribute: boolean; }&gt;</code>

**Since:** 14.1.0

--------------------


### clearTicketAttributes()

```typescript
clearTicketAttributes() => Promise<{ clearTicketAttributes: boolean; }>
```

Clear all ticket attributes

**Returns:** <code>Promise&lt;{ clearTicketAttributes: boolean; }&gt;</code>

**Since:** 14.1.0

--------------------


### setCustomData(...)

```typescript
setCustomData(options: { key: string; value: string; }) => Promise<{ setCustomData: boolean; }>
```

Set custom data

| Param         | Type                                         |
| ------------- | -------------------------------------------- |
| **`options`** | <code>{ key: string; value: string; }</code> |

**Returns:** <code>Promise&lt;{ setCustomData: boolean; }&gt;</code>

**Since:** 7.0.0

--------------------


### removeCustomData(...)

```typescript
removeCustomData(options: { key: string; }) => Promise<{ removedCustomData: boolean; }>
```

Remove custom data by key

| Param         | Type                          |
| ------------- | ----------------------------- |
| **`options`** | <code>{ key: string; }</code> |

**Returns:** <code>Promise&lt;{ removedCustomData: boolean; }&gt;</code>

**Since:** 7.0.0

--------------------


### clearCustomData()

```typescript
clearCustomData() => Promise<{ clearedCustomData: boolean; }>
```

Clear custom data

**Returns:** <code>Promise&lt;{ clearedCustomData: boolean; }&gt;</code>

**Since:** 7.0.0

--------------------


### trackEvent(...)

```typescript
trackEvent(options: { name: string; data?: any; }) => Promise<{ loggedEvent: boolean; }>
```

Log event to Gleap

| Param         | Type                                       |
| ------------- | ------------------------------------------ |
| **`options`** | <code>{ name: string; data?: any; }</code> |

**Returns:** <code>Promise&lt;{ loggedEvent: boolean; }&gt;</code>

**Since:** 8.0.0

--------------------


### trackPage(...)

```typescript
trackPage(options: { pageName: string; }) => Promise<{ trackedPage: boolean; }>
```

Track a page view

| Param         | Type                               |
| ------------- | ---------------------------------- |
| **`options`** | <code>{ pageName: string; }</code> |

**Returns:** <code>Promise&lt;{ trackedPage: boolean; }&gt;</code>

**Since:** 8.4.1

--------------------


### setEventCallback(...)

```typescript
setEventCallback(callback: GleapEventCallback) => Promise<CallbackID>
```

| Param          | Type                                                              |
| -------------- | ----------------------------------------------------------------- |
| **`callback`** | <code><a href="#gleapeventcallback">GleapEventCallback</a></code> |

**Returns:** <code>Promise&lt;string&gt;</code>

**Since:** 7.0.0

--------------------


### sendSilentCrashReport(...)

```typescript
sendSilentCrashReport(options: { description: string; severity?: "LOW" | "MEDIUM" | "HIGH"; dataExclusion?: { customData: Boolean; metaData: Boolean; attachments: Boolean; consoleLog: Boolean; networkLogs: Boolean; customEventLog: Boolean; screenshot: Boolean; replays: Boolean; }; }) => Promise<{ sentSilentBugReport: boolean; }>
```

Log event to Gleap

| Param         | Type                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`options`** | <code>{ description: string; severity?: 'LOW' \| 'MEDIUM' \| 'HIGH'; dataExclusion?: { customData: <a href="#boolean">Boolean</a>; metaData: <a href="#boolean">Boolean</a>; attachments: <a href="#boolean">Boolean</a>; consoleLog: <a href="#boolean">Boolean</a>; networkLogs: <a href="#boolean">Boolean</a>; customEventLog: <a href="#boolean">Boolean</a>; screenshot: <a href="#boolean">Boolean</a>; replays: <a href="#boolean">Boolean</a>; }; }</code> |

**Returns:** <code>Promise&lt;{ sentSilentBugReport: boolean; }&gt;</code>

**Since:** 7.0.0

--------------------


### preFillForm(...)

```typescript
preFillForm(options: { data: any; }) => Promise<{ preFilledForm: boolean; }>
```

Prefills the widget's form data

| Param         | Type                        |
| ------------- | --------------------------- |
| **`options`** | <code>{ data: any; }</code> |

**Returns:** <code>Promise&lt;{ preFilledForm: boolean; }&gt;</code>

**Since:** 7.0.0

--------------------


### addAttachment(...)

```typescript
addAttachment(options: { base64data: string; name: string; }) => Promise<{ attachmentAdded: boolean; }>
```

Add attachment as bas64 string

| Param         | Type                                               |
| ------------- | -------------------------------------------------- |
| **`options`** | <code>{ base64data: string; name: string; }</code> |

**Returns:** <code>Promise&lt;{ attachmentAdded: boolean; }&gt;</code>

**Since:** 7.0.0

--------------------


### removeAllAttachments()

```typescript
removeAllAttachments() => Promise<{ allAttachmentsRemoved: boolean; }>
```

All attachments removed

**Returns:** <code>Promise&lt;{ allAttachmentsRemoved: boolean; }&gt;</code>

**Since:** 7.0.0

--------------------


### open()

```typescript
open() => Promise<{ openedWidget: boolean; }>
```

Open widget

**Returns:** <code>Promise&lt;{ openedWidget: boolean; }&gt;</code>

**Since:** 7.0.0

--------------------


### openChecklists(...)

```typescript
openChecklists(options: { showBackButton?: boolean; }) => Promise<{ opened: boolean; }>
```

Open checklists

| Param         | Type                                       |
| ------------- | ------------------------------------------ |
| **`options`** | <code>{ showBackButton?: boolean; }</code> |

**Returns:** <code>Promise&lt;{ opened: boolean; }&gt;</code>

**Since:** 19.0.0

--------------------


### openChecklist(...)

```typescript
openChecklist(options: { checklistId: string; showBackButton?: boolean; }) => Promise<{ opened: boolean; }>
```

Open checklist

| Param         | Type                                                            |
| ------------- | --------------------------------------------------------------- |
| **`options`** | <code>{ checklistId: string; showBackButton?: boolean; }</code> |

**Returns:** <code>Promise&lt;{ opened: boolean; }&gt;</code>

**Since:** 19.0.0

--------------------


### startChecklist(...)

```typescript
startChecklist(options: { outboundId: string; showBackButton?: boolean; }) => Promise<{ opened: boolean; }>
```

Start checklist

| Param         | Type                                                           |
| ------------- | -------------------------------------------------------------- |
| **`options`** | <code>{ outboundId: string; showBackButton?: boolean; }</code> |

**Returns:** <code>Promise&lt;{ opened: boolean; }&gt;</code>

**Since:** 19.0.0

--------------------


### openNews(...)

```typescript
openNews(options: { showBackButton?: boolean; }) => Promise<{ openedNews: boolean; }>
```

Open news

| Param         | Type                                       |
| ------------- | ------------------------------------------ |
| **`options`** | <code>{ showBackButton?: boolean; }</code> |

**Returns:** <code>Promise&lt;{ openedNews: boolean; }&gt;</code>

**Since:** 8.4.0

--------------------


### openNewsArticle(...)

```typescript
openNewsArticle(options: { articleId: string; showBackButton?: boolean; }) => Promise<{ opened: boolean; }>
```

Open news article

| Param         | Type                                                          |
| ------------- | ------------------------------------------------------------- |
| **`options`** | <code>{ articleId: string; showBackButton?: boolean; }</code> |

**Returns:** <code>Promise&lt;{ opened: boolean; }&gt;</code>

**Since:** 8.4.0

--------------------


### openHelpCenter(...)

```typescript
openHelpCenter(options: { showBackButton?: boolean; }) => Promise<{ opened: boolean; }>
```

Open help center

| Param         | Type                                       |
| ------------- | ------------------------------------------ |
| **`options`** | <code>{ showBackButton?: boolean; }</code> |

**Returns:** <code>Promise&lt;{ opened: boolean; }&gt;</code>

**Since:** 8.4.0

--------------------


### openHelpCenterArticle(...)

```typescript
openHelpCenterArticle(options: { articleId: string; showBackButton?: boolean; }) => Promise<{ opened: boolean; }>
```

Open help center article

| Param         | Type                                                          |
| ------------- | ------------------------------------------------------------- |
| **`options`** | <code>{ articleId: string; showBackButton?: boolean; }</code> |

**Returns:** <code>Promise&lt;{ opened: boolean; }&gt;</code>

**Since:** 8.4.0

--------------------


### askAI(...)

```typescript
askAI(options: { question: string; showBackButton?: boolean; }) => Promise<{ opened: boolean; }>
```

Ask the AI a question

| Param         | Type                                                         |
| ------------- | ------------------------------------------------------------ |
| **`options`** | <code>{ question: string; showBackButton?: boolean; }</code> |

**Returns:** <code>Promise&lt;{ opened: boolean; }&gt;</code>

**Since:** 15.0.0

--------------------


### openHelpCenterCollection(...)

```typescript
openHelpCenterCollection(options: { collectionId: string; showBackButton?: boolean; }) => Promise<{ opened: boolean; }>
```

Open help center collection

| Param         | Type                                                             |
| ------------- | ---------------------------------------------------------------- |
| **`options`** | <code>{ collectionId: string; showBackButton?: boolean; }</code> |

**Returns:** <code>Promise&lt;{ opened: boolean; }&gt;</code>

**Since:** 8.4.0

--------------------


### searchHelpCenter(...)

```typescript
searchHelpCenter(options: { term: string; showBackButton?: boolean; }) => Promise<{ opened: boolean; }>
```

Search help center

| Param         | Type                                                     |
| ------------- | -------------------------------------------------------- |
| **`options`** | <code>{ term: string; showBackButton?: boolean; }</code> |

**Returns:** <code>Promise&lt;{ opened: boolean; }&gt;</code>

**Since:** 8.4.0

--------------------


### openFeatureRequests(...)

```typescript
openFeatureRequests(options: { showBackButton?: boolean; }) => Promise<{ openedFeatureRequests: boolean; }>
```

Open feature requests

| Param         | Type                                       |
| ------------- | ------------------------------------------ |
| **`options`** | <code>{ showBackButton?: boolean; }</code> |

**Returns:** <code>Promise&lt;{ openedFeatureRequests: boolean; }&gt;</code>

**Since:** 8.4.0

--------------------


### close()

```typescript
close() => Promise<{ closedWidget: boolean; }>
```

Close widget

**Returns:** <code>Promise&lt;{ closedWidget: boolean; }&gt;</code>

**Since:** 7.0.0

--------------------


### isOpened()

```typescript
isOpened() => Promise<{ isOpened: boolean; }>
```

Check widget status code

**Returns:** <code>Promise&lt;{ isOpened: boolean; }&gt;</code>

**Since:** 7.0.0

--------------------


### startFeedbackFlow(...)

```typescript
startFeedbackFlow(options: { feedbackFlow?: string; showBackButton?: boolean; }) => Promise<{ startedFeedbackFlow: boolean; }>
```

Start feedback flow

| Param         | Type                                                              |
| ------------- | ----------------------------------------------------------------- |
| **`options`** | <code>{ feedbackFlow?: string; showBackButton?: boolean; }</code> |

**Returns:** <code>Promise&lt;{ startedFeedbackFlow: boolean; }&gt;</code>

**Since:** 7.0.0

--------------------


### startClassicForm(...)

```typescript
startClassicForm(options: { formId?: string; showBackButton?: boolean; }) => Promise<{ classicFormStarted: boolean; }>
```

Start a classic form

| Param         | Type                                                        |
| ------------- | ----------------------------------------------------------- |
| **`options`** | <code>{ formId?: string; showBackButton?: boolean; }</code> |

**Returns:** <code>Promise&lt;{ classicFormStarted: boolean; }&gt;</code>

**Since:** 13.1.0

--------------------


### startConversation(...)

```typescript
startConversation(options: { showBackButton?: boolean; }) => Promise<{ conversationStarted: boolean; }>
```

Start a new conversation

| Param         | Type                                       |
| ------------- | ------------------------------------------ |
| **`options`** | <code>{ showBackButton?: boolean; }</code> |

**Returns:** <code>Promise&lt;{ conversationStarted: boolean; }&gt;</code>

**Since:** 13.1.0

--------------------


### openConversation(...)

```typescript
openConversation(options: { showBackButton?: boolean; }) => Promise<{ conversationsOpened: boolean; }>
```

Opens the conversations tab.

| Param         | Type                                       |
| ------------- | ------------------------------------------ |
| **`options`** | <code>{ showBackButton?: boolean; }</code> |

**Returns:** <code>Promise&lt;{ conversationsOpened: boolean; }&gt;</code>

**Since:** 13.9.0

--------------------


### openConversations(...)

```typescript
openConversations(options: { showBackButton?: boolean; }) => Promise<{ conversationsOpened: boolean; }>
```

Opens the conversations tab (same as openConversation).

| Param         | Type                                       |
| ------------- | ------------------------------------------ |
| **`options`** | <code>{ showBackButton?: boolean; }</code> |

**Returns:** <code>Promise&lt;{ conversationsOpened: boolean; }&gt;</code>

**Since:** 19.0.0

--------------------


### openProtectedFileFromUrl(...)

```typescript
openProtectedFileFromUrl(options: { url: string; }) => Promise<{ opened: boolean; }>
```

Open the conversation of a protected file from an emailed link.
With "Require authenticated file access" enabled, email replies link attachments to your customer
application URL with a `gleapFile` query parameter. If that URL opens your app (for example as a
universal link / App Link), pass it here, e.g. from `App.addListener('appUrlOpen')` or
`App.getLaunchUrl()` of `@capacitor/app`. `opened` is true when the URL carries a Gleap file reference.
The conversation opens once the customer is identified with a user hash (`identify` with `userHash`);
the link alone grants nothing. On web the JavaScript SDK handles `?gleapFile=` automatically on page load,
so this resolves `{ opened: false }` there.

| Param         | Type                          |
| ------------- | ----------------------------- |
| **`options`** | <code>{ url: string; }</code> |

**Returns:** <code>Promise&lt;{ opened: boolean; }&gt;</code>

**Since:** 19.0.1

--------------------


### startBot(...)

```typescript
startBot(options: { botId?: string; showBackButton?: boolean; }) => Promise<{ startedBot: boolean; }>
```

Start bot

| Param         | Type                                                       |
| ------------- | ---------------------------------------------------------- |
| **`options`** | <code>{ botId?: string; showBackButton?: boolean; }</code> |

**Returns:** <code>Promise&lt;{ startedBot: boolean; }&gt;</code>

**Since:** 10.0.3

--------------------


### showFeedbackButton(...)

```typescript
showFeedbackButton(options: { show?: boolean; }) => Promise<{ feedbackButtonShown: boolean; }>
```

Show or hide the feedback button.

| Param         | Type                             |
| ------------- | -------------------------------- |
| **`options`** | <code>{ show?: boolean; }</code> |

**Returns:** <code>Promise&lt;{ feedbackButtonShown: boolean; }&gt;</code>

**Since:** 8.0.0

--------------------


### setDisableInAppNotifications(...)

```typescript
setDisableInAppNotifications(options: { disableInAppNotifications?: boolean; }) => Promise<{ inAppNotificationsDisabled: boolean; }>
```

Disable in app notifications.

| Param         | Type                                                  |
| ------------- | ----------------------------------------------------- |
| **`options`** | <code>{ disableInAppNotifications?: boolean; }</code> |

**Returns:** <code>Promise&lt;{ inAppNotificationsDisabled: boolean; }&gt;</code>

**Since:** 8.6.1

--------------------


### setDisableEnvData(...)

```typescript
setDisableEnvData(options: { disableEnvData: boolean; }) => Promise<{ envDataDisabled: boolean; }>
```

Disable env data. While disabled (true), no env data (device, OS, screen size, locale, URL, ...) is collected
and tickets are sent without it. Pass false to collect env data again. Can be called before or after initialize.

| Param         | Type                                      |
| ------------- | ----------------------------------------- |
| **`options`** | <code>{ disableEnvData: boolean; }</code> |

**Returns:** <code>Promise&lt;{ envDataDisabled: boolean; }&gt;</code>

**Since:** 18.1.0

--------------------


### setColorScheme(...)

```typescript
setColorScheme(options: { colorScheme: 'auto' | 'light' | 'dark'; lightBackgroundColor?: string; darkBackgroundColor?: string; }) => Promise<{ colorScheme: string; }>
```

Set the color scheme of the widget. Overrides the color scheme configured in the Gleap dashboard.
Only takes effect when "Adapt to dark / light mode" is enabled in the dashboard; otherwise the widget
always keeps its normal colors. Before the first call the dashboard setting applies.
"auto" follows the device appearance (dark/light mode) on iOS and Android, and the page theme on web.
Apps with their own in-app theme toggle should pass "light" / "dark" explicitly and call it again whenever
the theme changes.
In dark mode the widget uses the dark mode colors, logo, header image and composer glow set in the Gleap dashboard;
without dark colors it keeps its normal colors. lightBackgroundColor / darkBackgroundColor override the background.
Can be called before or after initialize and applies live.

| Param         | Type                                                                                                                    |
| ------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **`options`** | <code>{ colorScheme: 'auto' \| 'light' \| 'dark'; lightBackgroundColor?: string; darkBackgroundColor?: string; }</code> |

**Returns:** <code>Promise&lt;{ colorScheme: string; }&gt;</code>

**Since:** 19.0.0

--------------------


### setCaptureEnabled(...)

```typescript
setCaptureEnabled(options: { enabled: boolean; }) => Promise<{ captureEnabled: boolean; }>
```

Enable or disable screenshots and screen recordings for capture requests: when a workflow, an AI agent or a
teammate asks the user in the widget to show the issue, the widget steps aside, a small bar lets the user go to
the right screen, and the SDK captures the app once they tap Capture (or records it between Start and Stop).
Nothing is captured without that tap. While disabled, the widget only offers to upload a file.
Enabled by default. Works on iOS, Android and web and can be called before or after initialize.

| Param         | Type                               |
| ------------- | ---------------------------------- |
| **`options`** | <code>{ enabled: boolean; }</code> |

**Returns:** <code>Promise&lt;{ captureEnabled: boolean; }&gt;</code>

--------------------


### setRemoteLogCollectionEnabled(...)

```typescript
setRemoteLogCollectionEnabled(options: { enabled: boolean; }) => Promise<{ remoteLogCollectionEnabled: boolean; }>
```

Enable or disable sending the app's logs for capture requests: a workflow or an AI agent can ask for the logs
while the app runs (no user action), and screenshots and recordings can bring the logs around them. The logs are
what a bug report carries (console and network logs, custom data, env data, custom events; the replay only when
it is asked for and enabled in the dashboard), and the existing settings still apply (e.g. setDisableEnvData).
While disabled, log requests are answered as not supported and captures are sent without logs.
Enabled by default. Works on iOS, Android and web and can be called before or after initialize.

| Param         | Type                               |
| ------------- | ---------------------------------- |
| **`options`** | <code>{ enabled: boolean; }</code> |

**Returns:** <code>Promise&lt;{ remoteLogCollectionEnabled: boolean; }&gt;</code>

--------------------


### setLanguage(...)

```typescript
setLanguage(options: { languageCode: string; }) => Promise<{ setLanguage: string; }>
```

Set Language

| Param         | Type                                   |
| ------------- | -------------------------------------- |
| **`options`** | <code>{ languageCode: string; }</code> |

**Returns:** <code>Promise&lt;{ setLanguage: string; }&gt;</code>

**Since:** 7.0.0

--------------------


### disableConsoleLogOverwrite()

```typescript
disableConsoleLogOverwrite() => Promise<{ consoleLogDisabled: boolean; }>
```

Disable console log overwrite: stops recording the console output of the app's WebView
(console methods are restored) and drops the WebView console logs recorded so far.

**Returns:** <code>Promise&lt;{ consoleLogDisabled: boolean; }&gt;</code>

**Since:** 7.0.0

--------------------


### enableDebugConsoleLog()

```typescript
enableDebugConsoleLog() => Promise<{ debugConsoleLogEnabled: boolean; }>
```

Enable debug console log

**Returns:** <code>Promise&lt;{ debugConsoleLogEnabled: boolean; }&gt;</code>

**Since:** 7.0.0

--------------------


### setNotificationContainerOffset(...)

```typescript
setNotificationContainerOffset(options: { x: number; y: number; }) => Promise<{ notificationContainerOffsetSet: boolean; }>
```

Set the notification container offset

| Param         | Type                                   |
| ------------- | -------------------------------------- |
| **`options`** | <code>{ x: number; y: number; }</code> |

**Returns:** <code>Promise&lt;{ notificationContainerOffsetSet: boolean; }&gt;</code>

**Since:** 15.2.0

--------------------


### Interfaces


#### GleapNetworkLogEntry

A network log entry (fetch / XMLHttpRequest) as the plugin hands it to the native SDK.

| Prop           | Type                                                                                                                                     | Description                                                                                    |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **`date`**     | <code>string</code>                                                                                                                      | ISO-8601 UTC timestamp of the request start.                                                   |
| **`type`**     | <code>string</code>                                                                                                                      | HTTP method, uppercase.                                                                        |
| **`url`**      | <code>string</code>                                                                                                                      |                                                                                                |
| **`duration`** | <code>number</code>                                                                                                                      | Milliseconds from the request start to the response headers (or the failure).                  |
| **`success`**  | <code>boolean</code>                                                                                                                     | true when an HTTP response arrived (any status), false on a transport error, abort or timeout. |
| **`request`**  | <code>{ headers?: { [name: string]: string; }; payload?: string; }</code>                                                                |                                                                                                |
| **`response`** | <code>{ status?: number; statusText?: string; headers?: { [name: string]: string; }; responseText?: string; errorText?: string; }</code> |                                                                                                |


#### GleapConsoleLogEntry

A console log entry as the plugin hands it to the native SDK.

| Prop           | Type                                        | Description                               |
| -------------- | ------------------------------------------- | ----------------------------------------- |
| **`date`**     | <code>string</code>                         | ISO-8601 UTC timestamp with milliseconds. |
| **`priority`** | <code>'ERROR' \| 'WARNING' \| 'INFO'</code> |                                           |
| **`log`**      | <code>string</code>                         |                                           |


#### PluginListenerHandle

| Prop         | Type                                      |
| ------------ | ----------------------------------------- |
| **`remove`** | <code>() =&gt; Promise&lt;void&gt;</code> |


#### GleapLogConfig

The network log settings of your Gleap project, sent by the native SDK once its config is loaded.

| Prop                          | Type                  |
| ----------------------------- | --------------------- |
| **`enableNetworkLogs`**       | <code>boolean</code>  |
| **`networkLogPropsToIgnore`** | <code>string[]</code> |
| **`networkLogBlacklist`**     | <code>string[]</code> |


#### GleapEventMessage

| Prop       | Type                |
| ---------- | ------------------- |
| **`name`** | <code>string</code> |
| **`data`** | <code>any</code>    |


#### Boolean

| Method      | Signature        | Description                                          |
| ----------- | ---------------- | ---------------------------------------------------- |
| **valueOf** | () =&gt; boolean | Returns the primitive value of the specified object. |


### Type Aliases


#### Record

Construct a type with a set of properties K of type T

<code>{
 [P in K]: T;
 }</code>


#### GleapEventCallback

<code>(message: <a href="#gleapeventmessage">GleapEventMessage</a> | null, err?: any): void</code>


#### CallbackID

<code>string</code>

</docgen-api>
