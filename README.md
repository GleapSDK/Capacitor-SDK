# Capacitor Gleap Plugin

Gleap SDK for Capacitor is the easiest way to integrate Gleap into your Ionic apps! Achieve better app quality with comprehensive in-app bug reporting & customer feedback for your web-apps and websites. Many thanks to Stephan Nagel (congrapp) for his work on the Gleap capacitor plugin.

This plugin supports capacitor 7. See the instructions below for earlier capacitor versions.

## Install

```bash
npm install capacitor-gleap-plugin
npx cap sync
```

## Capacitor 6

Please install the plugin version from our capacitor-v6 brunch with `npm install GleapSDK/Capacitor-SDK#capacitor-v6 --save` if you are using capacitor 6.

## Capacitor 5

Please install the plugin version from our capacitor-v5 brunch with `npm install GleapSDK/Capacitor-SDK#capacitor-v5 --save` if you are using capacitor 5.

## Capacitor 4 or earlier

Please install the plugin version from our capacitor-v4 brunch with `npm install GleapSDK/Capacitor-SDK#capacitor-v4 --save` if you are using capacitor 4 or earlier.

## API

<docgen-index>

* [`initialize(...)`](#initialize)
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
* [`setAiTools(...)`](#setaitools)
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
* [`openNews(...)`](#opennews)
* [`openNewsArticle(...)`](#opennewsarticle)
* [`openHelpCenter(...)`](#openhelpcenter)
* [`openHelpCenterArticle(...)`](#openhelpcenterarticle)
* [`openHelpCenterCollection(...)`](#openhelpcentercollection)
* [`searchHelpCenter(...)`](#searchhelpcenter)
* [`openFeatureRequests(...)`](#openfeaturerequests)
* [`close()`](#close)
* [`isOpened()`](#isopened)
* [`startFeedbackFlow(...)`](#startfeedbackflow)
* [`startClassicForm(...)`](#startclassicform)
* [`startConversation(...)`](#startconversation)
* [`openConversation(...)`](#openconversation)
* [`startBot(...)`](#startbot)
* [`showFeedbackButton(...)`](#showfeedbackbutton)
* [`setDisableInAppNotifications(...)`](#setdisableinappnotifications)
* [`setLanguage(...)`](#setlanguage)
* [`disableConsoleLogOverwrite()`](#disableconsolelogoverwrite)
* [`enableDebugConsoleLog()`](#enabledebugconsolelog)
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


### identify(...)

```typescript
identify(options: { userId: string; userHash?: string; name?: string; email?: string; phone?: string; companyId?: string; companyName?: string; avatar?: string; sla?: number; plan?: string; value?: number; customData?: Object; }) => Promise<{ identify: boolean; }>
```

Set user identity

| Param         | Type                                                                                                                                                                                                                                                  |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`options`** | <code>{ userId: string; userHash?: string; name?: string; email?: string; phone?: string; companyId?: string; companyName?: string; avatar?: string; sla?: number; plan?: string; value?: number; customData?: <a href="#object">Object</a>; }</code> |

**Returns:** <code>Promise&lt;{ identify: boolean; }&gt;</code>

**Since:** 7.0.0

--------------------


### updateContact(...)

```typescript
updateContact(options: { name?: string; email?: string; phone?: string; companyId?: string; companyName?: string; avatar?: string; sla?: number; plan?: string; value?: number; customData?: Object; }) => Promise<{ identify: boolean; }>
```

Update user properties

| Param         | Type                                                                                                                                                                                                               |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`options`** | <code>{ name?: string; email?: string; phone?: string; companyId?: string; companyName?: string; avatar?: string; sla?: number; plan?: string; value?: number; customData?: <a href="#object">Object</a>; }</code> |

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


### setAiTools(...)

```typescript
setAiTools(options: { tools: { name: string; description: string; response: string; executionType: "auto" | "button"; parameters: { name: string; description: string; type: "string" | "number" | "boolean"; required: boolean; enums?: string[]; }[]; }[]; }) => Promise<{ aiToolsSet: boolean; }>
```

Sets the AI tools to use

| Param         | Type                                                                                                                                                                                                                                                       |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`options`** | <code>{ tools: { name: string; description: string; response: string; executionType: 'auto' \| 'button'; parameters: { name: string; description: string; type: 'string' \| 'number' \| 'boolean'; required: boolean; enums?: string[]; }[]; }[]; }</code> |

**Returns:** <code>Promise&lt;{ aiToolsSet: boolean; }&gt;</code>

**Since:** 13.5.0

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

Disable console log overwrite

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


### Interfaces


#### Object

Provides functionality common to all JavaScript objects.

| Prop              | Type                                          | Description                                                                                                                                |
| ----------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **`constructor`** | <code><a href="#function">Function</a></code> | The initial value of <a href="#object">Object</a>.prototype.constructor is the standard built-in <a href="#object">Object</a> constructor. |

| Method                   | Signature                                                 | Description                                                              |
| ------------------------ | --------------------------------------------------------- | ------------------------------------------------------------------------ |
| **toString**             | () =&gt; string                                           | Returns a string representation of an object.                            |
| **toLocaleString**       | () =&gt; string                                           | Returns a date converted to a string using the current locale.           |
| **valueOf**              | () =&gt; <a href="#object">Object</a>                     | Returns the primitive value of the specified object.                     |
| **hasOwnProperty**       | (v: <a href="#propertykey">PropertyKey</a>) =&gt; boolean | Determines whether an object has a property with the specified name.     |
| **isPrototypeOf**        | (v: <a href="#object">Object</a>) =&gt; boolean           | Determines whether an object exists in another object's prototype chain. |
| **propertyIsEnumerable** | (v: <a href="#propertykey">PropertyKey</a>) =&gt; boolean | Determines whether a specified property is enumerable.                   |


#### Function

Creates a new function.

| Prop            | Type                                          |
| --------------- | --------------------------------------------- |
| **`prototype`** | <code>any</code>                              |
| **`length`**    | <code>number</code>                           |
| **`arguments`** | <code>any</code>                              |
| **`caller`**    | <code><a href="#function">Function</a></code> |

| Method       | Signature                                                                            | Description                                                                                                                                                                                                              |
| ------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **apply**    | (this: <a href="#function">Function</a>, thisArg: any, argArray?: any) =&gt; any     | Calls the function, substituting the specified object for the this value of the function, and the specified array for the arguments of the function.                                                                     |
| **call**     | (this: <a href="#function">Function</a>, thisArg: any, ...argArray: any[]) =&gt; any | Calls a method of an object, substituting another object for the current object.                                                                                                                                         |
| **bind**     | (this: <a href="#function">Function</a>, thisArg: any, ...argArray: any[]) =&gt; any | For a given function, creates a bound function that has the same body as the original function. The this object of the bound function is associated with the specified object, and has the specified initial parameters. |
| **toString** | () =&gt; string                                                                      | Returns a string representation of a function.                                                                                                                                                                           |


#### FunctionDeclaration

| Prop     | Type                                              | Description                                                                                 |
| -------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| **`id`** | <code><a href="#identifier">Identifier</a></code> | It is null when a function declaration is a part of the `export default function` statement |


#### Identifier

| Prop       | Type                                                |
| ---------- | --------------------------------------------------- |
| **`type`** | <code>'<a href="#identifier">Identifier</a>'</code> |
| **`name`** | <code>string</code>                                 |


#### FunctionExpression

| Prop       | Type                                                                |
| ---------- | ------------------------------------------------------------------- |
| **`id`**   | <code><a href="#identifier">Identifier</a> \| null</code>           |
| **`type`** | <code>'<a href="#functionexpression">FunctionExpression</a>'</code> |
| **`body`** | <code><a href="#blockstatement">BlockStatement</a></code>           |


#### BlockStatement

| Prop                | Type                                                        |
| ------------------- | ----------------------------------------------------------- |
| **`type`**          | <code>'<a href="#blockstatement">BlockStatement</a>'</code> |
| **`body`**          | <code>Statement[]</code>                                    |
| **`innerComments`** | <code>Comment[]</code>                                      |


#### ExpressionStatement

| Prop             | Type                                                                  |
| ---------------- | --------------------------------------------------------------------- |
| **`type`**       | <code>'<a href="#expressionstatement">ExpressionStatement</a>'</code> |
| **`expression`** | <code><a href="#expression">Expression</a></code>                     |


#### ExpressionMap

| Prop                           | Type                                                                          |
| ------------------------------ | ----------------------------------------------------------------------------- |
| **`ArrayExpression`**          | <code><a href="#arrayexpression">ArrayExpression</a></code>                   |
| **`ArrowFunctionExpression`**  | <code><a href="#arrowfunctionexpression">ArrowFunctionExpression</a></code>   |
| **`AssignmentExpression`**     | <code><a href="#assignmentexpression">AssignmentExpression</a></code>         |
| **`AwaitExpression`**          | <code><a href="#awaitexpression">AwaitExpression</a></code>                   |
| **`BinaryExpression`**         | <code><a href="#binaryexpression">BinaryExpression</a></code>                 |
| **`CallExpression`**           | <code><a href="#callexpression">CallExpression</a></code>                     |
| **`ChainExpression`**          | <code><a href="#chainexpression">ChainExpression</a></code>                   |
| **`ClassExpression`**          | <code><a href="#classexpression">ClassExpression</a></code>                   |
| **`ConditionalExpression`**    | <code><a href="#conditionalexpression">ConditionalExpression</a></code>       |
| **`FunctionExpression`**       | <code><a href="#functionexpression">FunctionExpression</a></code>             |
| **`Identifier`**               | <code><a href="#identifier">Identifier</a></code>                             |
| **`ImportExpression`**         | <code><a href="#importexpression">ImportExpression</a></code>                 |
| **`Literal`**                  | <code><a href="#literal">Literal</a></code>                                   |
| **`LogicalExpression`**        | <code><a href="#logicalexpression">LogicalExpression</a></code>               |
| **`MemberExpression`**         | <code><a href="#memberexpression">MemberExpression</a></code>                 |
| **`MetaProperty`**             | <code><a href="#metaproperty">MetaProperty</a></code>                         |
| **`NewExpression`**            | <code><a href="#newexpression">NewExpression</a></code>                       |
| **`ObjectExpression`**         | <code><a href="#objectexpression">ObjectExpression</a></code>                 |
| **`SequenceExpression`**       | <code><a href="#sequenceexpression">SequenceExpression</a></code>             |
| **`TaggedTemplateExpression`** | <code><a href="#taggedtemplateexpression">TaggedTemplateExpression</a></code> |
| **`TemplateLiteral`**          | <code><a href="#templateliteral">TemplateLiteral</a></code>                   |
| **`ThisExpression`**           | <code><a href="#thisexpression">ThisExpression</a></code>                     |
| **`UnaryExpression`**          | <code><a href="#unaryexpression">UnaryExpression</a></code>                   |
| **`UpdateExpression`**         | <code><a href="#updateexpression">UpdateExpression</a></code>                 |
| **`YieldExpression`**          | <code><a href="#yieldexpression">YieldExpression</a></code>                   |


#### ArrayExpression

| Prop           | Type                                                                                                                                      |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **`type`**     | <code>'<a href="#arrayexpression">ArrayExpression</a>'</code>                                                                             |
| **`elements`** | <code><a href="#array">Array</a>&lt;<a href="#expression">Expression</a> \| <a href="#spreadelement">SpreadElement</a> \| null&gt;</code> |


#### Array

| Prop         | Type                | Description                                                                                            |
| ------------ | ------------------- | ------------------------------------------------------------------------------------------------------ |
| **`length`** | <code>number</code> | Gets or sets the length of the array. This is a number one higher than the highest index in the array. |

| Method             | Signature                                                                                                                     | Description                                                                                                                                                                                                                                 |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **toString**       | () =&gt; string                                                                                                               | Returns a string representation of an array.                                                                                                                                                                                                |
| **toLocaleString** | () =&gt; string                                                                                                               | Returns a string representation of an array. The elements are converted to string using their toLocalString methods.                                                                                                                        |
| **pop**            | () =&gt; T \| undefined                                                                                                       | Removes the last element from an array and returns it. If the array is empty, undefined is returned and the array is not modified.                                                                                                          |
| **push**           | (...items: T[]) =&gt; number                                                                                                  | Appends new elements to the end of an array, and returns the new length of the array.                                                                                                                                                       |
| **concat**         | (...items: <a href="#concatarray">ConcatArray</a>&lt;T&gt;[]) =&gt; T[]                                                       | Combines two or more arrays. This method returns a new array without modifying any existing arrays.                                                                                                                                         |
| **concat**         | (...items: (T \| <a href="#concatarray">ConcatArray</a>&lt;T&gt;)[]) =&gt; T[]                                                | Combines two or more arrays. This method returns a new array without modifying any existing arrays.                                                                                                                                         |
| **join**           | (separator?: string \| undefined) =&gt; string                                                                                | Adds all the elements of an array into a string, separated by the specified separator string.                                                                                                                                               |
| **reverse**        | () =&gt; T[]                                                                                                                  | Reverses the elements in an array in place. This method mutates the array and returns a reference to the same array.                                                                                                                        |
| **shift**          | () =&gt; T \| undefined                                                                                                       | Removes the first element from an array and returns it. If the array is empty, undefined is returned and the array is not modified.                                                                                                         |
| **slice**          | (start?: number \| undefined, end?: number \| undefined) =&gt; T[]                                                            | Returns a copy of a section of an array. For both start and end, a negative index can be used to indicate an offset from the end of the array. For example, -2 refers to the second to last element of the array.                           |
| **sort**           | (compareFn?: ((a: T, b: T) =&gt; number) \| undefined) =&gt; this                                                             | Sorts an array in place. This method mutates the array and returns a reference to the same array.                                                                                                                                           |
| **splice**         | (start: number, deleteCount?: number \| undefined) =&gt; T[]                                                                  | Removes elements from an array and, if necessary, inserts new elements in their place, returning the deleted elements.                                                                                                                      |
| **splice**         | (start: number, deleteCount: number, ...items: T[]) =&gt; T[]                                                                 | Removes elements from an array and, if necessary, inserts new elements in their place, returning the deleted elements.                                                                                                                      |
| **unshift**        | (...items: T[]) =&gt; number                                                                                                  | Inserts new elements at the start of an array, and returns the new length of the array.                                                                                                                                                     |
| **indexOf**        | (searchElement: T, fromIndex?: number \| undefined) =&gt; number                                                              | Returns the index of the first occurrence of a value in an array, or -1 if it is not present.                                                                                                                                               |
| **lastIndexOf**    | (searchElement: T, fromIndex?: number \| undefined) =&gt; number                                                              | Returns the index of the last occurrence of a specified value in an array, or -1 if it is not present.                                                                                                                                      |
| **every**          | &lt;S extends T&gt;(predicate: (value: T, index: number, array: T[]) =&gt; value is S, thisArg?: any) =&gt; this is S[]       | Determines whether all the members of an array satisfy the specified test.                                                                                                                                                                  |
| **every**          | (predicate: (value: T, index: number, array: T[]) =&gt; unknown, thisArg?: any) =&gt; boolean                                 | Determines whether all the members of an array satisfy the specified test.                                                                                                                                                                  |
| **some**           | (predicate: (value: T, index: number, array: T[]) =&gt; unknown, thisArg?: any) =&gt; boolean                                 | Determines whether the specified callback function returns true for any element of an array.                                                                                                                                                |
| **forEach**        | (callbackfn: (value: T, index: number, array: T[]) =&gt; void, thisArg?: any) =&gt; void                                      | Performs the specified action for each element in an array.                                                                                                                                                                                 |
| **map**            | &lt;U&gt;(callbackfn: (value: T, index: number, array: T[]) =&gt; U, thisArg?: any) =&gt; U[]                                 | Calls a defined callback function on each element of an array, and returns an array that contains the results.                                                                                                                              |
| **filter**         | &lt;S extends T&gt;(predicate: (value: T, index: number, array: T[]) =&gt; value is S, thisArg?: any) =&gt; S[]               | Returns the elements of an array that meet the condition specified in a callback function.                                                                                                                                                  |
| **filter**         | (predicate: (value: T, index: number, array: T[]) =&gt; unknown, thisArg?: any) =&gt; T[]                                     | Returns the elements of an array that meet the condition specified in a callback function.                                                                                                                                                  |
| **reduce**         | (callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) =&gt; T) =&gt; T                           | Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.                      |
| **reduce**         | (callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) =&gt; T, initialValue: T) =&gt; T          |                                                                                                                                                                                                                                             |
| **reduce**         | &lt;U&gt;(callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) =&gt; U, initialValue: U) =&gt; U | Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.                      |
| **reduceRight**    | (callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) =&gt; T) =&gt; T                           | Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function. |
| **reduceRight**    | (callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) =&gt; T, initialValue: T) =&gt; T          |                                                                                                                                                                                                                                             |
| **reduceRight**    | &lt;U&gt;(callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) =&gt; U, initialValue: U) =&gt; U | Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function. |


#### ConcatArray

| Prop         | Type                |
| ------------ | ------------------- |
| **`length`** | <code>number</code> |

| Method    | Signature                                                          |
| --------- | ------------------------------------------------------------------ |
| **join**  | (separator?: string \| undefined) =&gt; string                     |
| **slice** | (start?: number \| undefined, end?: number \| undefined) =&gt; T[] |


#### SpreadElement

| Prop           | Type                                                      |
| -------------- | --------------------------------------------------------- |
| **`type`**     | <code>'<a href="#spreadelement">SpreadElement</a>'</code> |
| **`argument`** | <code><a href="#expression">Expression</a></code>         |


#### ArrowFunctionExpression

| Prop             | Type                                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------- |
| **`type`**       | <code>'<a href="#arrowfunctionexpression">ArrowFunctionExpression</a>'</code>                     |
| **`expression`** | <code>boolean</code>                                                                              |
| **`body`**       | <code><a href="#expression">Expression</a> \| <a href="#blockstatement">BlockStatement</a></code> |


#### AssignmentExpression

| Prop           | Type                                                                    |
| -------------- | ----------------------------------------------------------------------- |
| **`type`**     | <code>'<a href="#assignmentexpression">AssignmentExpression</a>'</code> |
| **`operator`** | <code><a href="#assignmentoperator">AssignmentOperator</a></code>       |
| **`left`**     | <code><a href="#pattern">Pattern</a></code>                             |
| **`right`**    | <code><a href="#expression">Expression</a></code>                       |


#### ObjectPattern

| Prop             | Type                                                                                                                                          |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **`type`**       | <code>'<a href="#objectpattern">ObjectPattern</a>'</code>                                                                                     |
| **`properties`** | <code><a href="#array">Array</a>&lt;<a href="#assignmentproperty">AssignmentProperty</a> \| <a href="#restelement">RestElement</a>&gt;</code> |


#### AssignmentProperty

| Prop         | Type                                        |
| ------------ | ------------------------------------------- |
| **`value`**  | <code><a href="#pattern">Pattern</a></code> |
| **`kind`**   | <code>'init'</code>                         |
| **`method`** | <code>boolean</code>                        |


#### RestElement

| Prop           | Type                                                  |
| -------------- | ----------------------------------------------------- |
| **`type`**     | <code>'<a href="#restelement">RestElement</a>'</code> |
| **`argument`** | <code><a href="#pattern">Pattern</a></code>           |


#### ArrayPattern

| Prop           | Type                                                                                  |
| -------------- | ------------------------------------------------------------------------------------- |
| **`type`**     | <code>'<a href="#arraypattern">ArrayPattern</a>'</code>                               |
| **`elements`** | <code><a href="#array">Array</a>&lt;<a href="#pattern">Pattern</a> \| null&gt;</code> |


#### AssignmentPattern

| Prop        | Type                                                              |
| ----------- | ----------------------------------------------------------------- |
| **`type`**  | <code>'<a href="#assignmentpattern">AssignmentPattern</a>'</code> |
| **`left`**  | <code><a href="#pattern">Pattern</a></code>                       |
| **`right`** | <code><a href="#expression">Expression</a></code>                 |


#### MemberExpression

| Prop           | Type                                                                                                    |
| -------------- | ------------------------------------------------------------------------------------------------------- |
| **`type`**     | <code>'<a href="#memberexpression">MemberExpression</a>'</code>                                         |
| **`object`**   | <code><a href="#expression">Expression</a> \| <a href="#super">Super</a></code>                         |
| **`property`** | <code><a href="#expression">Expression</a> \| <a href="#privateidentifier">PrivateIdentifier</a></code> |
| **`computed`** | <code>boolean</code>                                                                                    |
| **`optional`** | <code>boolean</code>                                                                                    |


#### Super

| Prop       | Type                                      |
| ---------- | ----------------------------------------- |
| **`type`** | <code>'<a href="#super">Super</a>'</code> |


#### PrivateIdentifier

| Prop       | Type                                                              |
| ---------- | ----------------------------------------------------------------- |
| **`type`** | <code>'<a href="#privateidentifier">PrivateIdentifier</a>'</code> |
| **`name`** | <code>string</code>                                               |


#### AwaitExpression

| Prop           | Type                                                          |
| -------------- | ------------------------------------------------------------- |
| **`type`**     | <code>'<a href="#awaitexpression">AwaitExpression</a>'</code> |
| **`argument`** | <code><a href="#expression">Expression</a></code>             |


#### BinaryExpression

| Prop           | Type                                                                                                    |
| -------------- | ------------------------------------------------------------------------------------------------------- |
| **`type`**     | <code>'<a href="#binaryexpression">BinaryExpression</a>'</code>                                         |
| **`operator`** | <code><a href="#binaryoperator">BinaryOperator</a></code>                                               |
| **`left`**     | <code><a href="#expression">Expression</a> \| <a href="#privateidentifier">PrivateIdentifier</a></code> |
| **`right`**    | <code><a href="#expression">Expression</a></code>                                                       |


#### SimpleCallExpression

| Prop           | Type                                                        |
| -------------- | ----------------------------------------------------------- |
| **`type`**     | <code>'<a href="#callexpression">CallExpression</a>'</code> |
| **`optional`** | <code>boolean</code>                                        |


#### NewExpression

| Prop       | Type                                                      |
| ---------- | --------------------------------------------------------- |
| **`type`** | <code>'<a href="#newexpression">NewExpression</a>'</code> |


#### ChainExpression

| Prop             | Type                                                          |
| ---------------- | ------------------------------------------------------------- |
| **`type`**       | <code>'<a href="#chainexpression">ChainExpression</a>'</code> |
| **`expression`** | <code><a href="#chainelement">ChainElement</a></code>         |


#### ClassExpression

| Prop       | Type                                                          |
| ---------- | ------------------------------------------------------------- |
| **`type`** | <code>'<a href="#classexpression">ClassExpression</a>'</code> |
| **`id`**   | <code><a href="#identifier">Identifier</a> \| null</code>     |


#### ConditionalExpression

| Prop             | Type                                                                      |
| ---------------- | ------------------------------------------------------------------------- |
| **`type`**       | <code>'<a href="#conditionalexpression">ConditionalExpression</a>'</code> |
| **`test`**       | <code><a href="#expression">Expression</a></code>                         |
| **`alternate`**  | <code><a href="#expression">Expression</a></code>                         |
| **`consequent`** | <code><a href="#expression">Expression</a></code>                         |


#### ImportExpression

| Prop          | Type                                                            |
| ------------- | --------------------------------------------------------------- |
| **`type`**    | <code>'<a href="#importexpression">ImportExpression</a>'</code> |
| **`source`**  | <code><a href="#expression">Expression</a></code>               |
| **`options`** | <code><a href="#expression">Expression</a> \| null</code>       |


#### SimpleLiteral

| Prop        | Type                                             |
| ----------- | ------------------------------------------------ |
| **`type`**  | <code>'<a href="#literal">Literal</a>'</code>    |
| **`value`** | <code>string \| number \| boolean \| null</code> |
| **`raw`**   | <code>string</code>                              |


#### RegExpLiteral

| Prop        | Type                                              |
| ----------- | ------------------------------------------------- |
| **`type`**  | <code>'<a href="#literal">Literal</a>'</code>     |
| **`value`** | <code><a href="#regexp">RegExp</a> \| null</code> |
| **`regex`** | <code>{ pattern: string; flags: string; }</code>  |
| **`raw`**   | <code>string</code>                               |


#### RegExp

| Prop             | Type                 | Description                                                                                                                                                          |
| ---------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`source`**     | <code>string</code>  | Returns a copy of the text of the regular expression pattern. Read-only. The regExp argument is a Regular expression object. It can be a variable name or a literal. |
| **`global`**     | <code>boolean</code> | Returns a <a href="#boolean">Boolean</a> value indicating the state of the global flag (g) used with a regular expression. Default is false. Read-only.              |
| **`ignoreCase`** | <code>boolean</code> | Returns a <a href="#boolean">Boolean</a> value indicating the state of the ignoreCase flag (i) used with a regular expression. Default is false. Read-only.          |
| **`multiline`**  | <code>boolean</code> | Returns a <a href="#boolean">Boolean</a> value indicating the state of the multiline flag (m) used with a regular expression. Default is false. Read-only.           |
| **`lastIndex`**  | <code>number</code>  |                                                                                                                                                                      |

| Method      | Signature                                                                     | Description                                                                                                                   |
| ----------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **exec**    | (string: string) =&gt; <a href="#regexpexecarray">RegExpExecArray</a> \| null | Executes a search on a string using a regular expression pattern, and returns an array containing the results of that search. |
| **test**    | (string: string) =&gt; boolean                                                | Returns a <a href="#boolean">Boolean</a> value that indicates whether or not a pattern exists in a searched string.           |
| **compile** | () =&gt; this                                                                 |                                                                                                                               |


#### RegExpExecArray

| Prop        | Type                |
| ----------- | ------------------- |
| **`index`** | <code>number</code> |
| **`input`** | <code>string</code> |


#### BigIntLiteral

| Prop         | Type                                          |
| ------------ | --------------------------------------------- |
| **`type`**   | <code>'<a href="#literal">Literal</a>'</code> |
| **`value`**  | <code>bigint \| null</code>                   |
| **`bigint`** | <code>string</code>                           |
| **`raw`**    | <code>string</code>                           |


#### LogicalExpression

| Prop           | Type                                                              |
| -------------- | ----------------------------------------------------------------- |
| **`type`**     | <code>'<a href="#logicalexpression">LogicalExpression</a>'</code> |
| **`operator`** | <code><a href="#logicaloperator">LogicalOperator</a></code>       |
| **`left`**     | <code><a href="#expression">Expression</a></code>                 |
| **`right`**    | <code><a href="#expression">Expression</a></code>                 |


#### MetaProperty

| Prop           | Type                                                    |
| -------------- | ------------------------------------------------------- |
| **`type`**     | <code>'<a href="#metaproperty">MetaProperty</a>'</code> |
| **`meta`**     | <code><a href="#identifier">Identifier</a></code>       |
| **`property`** | <code><a href="#identifier">Identifier</a></code>       |


#### ObjectExpression

| Prop             | Type                                                                                                                          |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **`type`**       | <code>'<a href="#objectexpression">ObjectExpression</a>'</code>                                                               |
| **`properties`** | <code><a href="#array">Array</a>&lt;<a href="#property">Property</a> \| <a href="#spreadelement">SpreadElement</a>&gt;</code> |


#### Property

| Prop            | Type                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`type`**      | <code>'<a href="#property">Property</a>'</code>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **`key`**       | <code><a href="#expression">Expression</a> \| <a href="#privateidentifier">PrivateIdentifier</a></code>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| **`value`**     | <code><a href="#classexpression">ClassExpression</a> \| <a href="#arrayexpression">ArrayExpression</a> \| <a href="#arrowfunctionexpression">ArrowFunctionExpression</a> \| <a href="#assignmentexpression">AssignmentExpression</a> \| <a href="#awaitexpression">AwaitExpression</a> \| <a href="#binaryexpression">BinaryExpression</a> \| <a href="#simplecallexpression">SimpleCallExpression</a> \| <a href="#newexpression">NewExpression</a> \| <a href="#chainexpression">ChainExpression</a> \| <a href="#conditionalexpression">ConditionalExpression</a> \| <a href="#functionexpression">FunctionExpression</a> \| <a href="#identifier">Identifier</a> \| <a href="#importexpression">ImportExpression</a> \| <a href="#simpleliteral">SimpleLiteral</a> \| <a href="#regexpliteral">RegExpLiteral</a> \| <a href="#bigintliteral">BigIntLiteral</a> \| <a href="#logicalexpression">LogicalExpression</a> \| <a href="#memberexpression">MemberExpression</a> \| <a href="#metaproperty">MetaProperty</a> \| <a href="#objectexpression">ObjectExpression</a> \| <a href="#sequenceexpression">SequenceExpression</a> \| <a href="#taggedtemplateexpression">TaggedTemplateExpression</a> \| <a href="#templateliteral">TemplateLiteral</a> \| <a href="#thisexpression">ThisExpression</a> \| <a href="#unaryexpression">UnaryExpression</a> \| <a href="#updateexpression">UpdateExpression</a> \| <a href="#yieldexpression">YieldExpression</a> \| <a href="#objectpattern">ObjectPattern</a> \| <a href="#arraypattern">ArrayPattern</a> \| <a href="#restelement">RestElement</a> \| <a href="#assignmentpattern">AssignmentPattern</a></code> |
| **`kind`**      | <code>'init' \| 'get' \| 'set'</code>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **`method`**    | <code>boolean</code>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| **`shorthand`** | <code>boolean</code>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| **`computed`**  | <code>boolean</code>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |


#### SequenceExpression

| Prop              | Type                                                                |
| ----------------- | ------------------------------------------------------------------- |
| **`type`**        | <code>'<a href="#sequenceexpression">SequenceExpression</a>'</code> |
| **`expressions`** | <code>Expression[]</code>                                           |


#### TaggedTemplateExpression

| Prop        | Type                                                                            |
| ----------- | ------------------------------------------------------------------------------- |
| **`type`**  | <code>'<a href="#taggedtemplateexpression">TaggedTemplateExpression</a>'</code> |
| **`tag`**   | <code><a href="#expression">Expression</a></code>                               |
| **`quasi`** | <code><a href="#templateliteral">TemplateLiteral</a></code>                     |


#### TemplateLiteral

| Prop              | Type                                                          |
| ----------------- | ------------------------------------------------------------- |
| **`type`**        | <code>'<a href="#templateliteral">TemplateLiteral</a>'</code> |
| **`quasis`**      | <code>TemplateElement[]</code>                                |
| **`expressions`** | <code>Expression[]</code>                                     |


#### TemplateElement

| Prop        | Type                                                          |
| ----------- | ------------------------------------------------------------- |
| **`type`**  | <code>'<a href="#templateelement">TemplateElement</a>'</code> |
| **`tail`**  | <code>boolean</code>                                          |
| **`value`** | <code>{ cooked?: string \| null; raw: string; }</code>        |


#### ThisExpression

| Prop       | Type                                                        |
| ---------- | ----------------------------------------------------------- |
| **`type`** | <code>'<a href="#thisexpression">ThisExpression</a>'</code> |


#### UnaryExpression

| Prop           | Type                                                          |
| -------------- | ------------------------------------------------------------- |
| **`type`**     | <code>'<a href="#unaryexpression">UnaryExpression</a>'</code> |
| **`operator`** | <code><a href="#unaryoperator">UnaryOperator</a></code>       |
| **`prefix`**   | <code>true</code>                                             |
| **`argument`** | <code><a href="#expression">Expression</a></code>             |


#### UpdateExpression

| Prop           | Type                                                            |
| -------------- | --------------------------------------------------------------- |
| **`type`**     | <code>'<a href="#updateexpression">UpdateExpression</a>'</code> |
| **`operator`** | <code><a href="#updateoperator">UpdateOperator</a></code>       |
| **`argument`** | <code><a href="#expression">Expression</a></code>               |
| **`prefix`**   | <code>boolean</code>                                            |


#### YieldExpression

| Prop           | Type                                                          |
| -------------- | ------------------------------------------------------------- |
| **`type`**     | <code>'<a href="#yieldexpression">YieldExpression</a>'</code> |
| **`argument`** | <code><a href="#expression">Expression</a> \| null</code>     |
| **`delegate`** | <code>boolean</code>                                          |


#### StaticBlock

| Prop       | Type                                                  |
| ---------- | ----------------------------------------------------- |
| **`type`** | <code>'<a href="#staticblock">StaticBlock</a>'</code> |


#### EmptyStatement

| Prop       | Type                                                        |
| ---------- | ----------------------------------------------------------- |
| **`type`** | <code>'<a href="#emptystatement">EmptyStatement</a>'</code> |


#### DebuggerStatement

| Prop       | Type                                                              |
| ---------- | ----------------------------------------------------------------- |
| **`type`** | <code>'<a href="#debuggerstatement">DebuggerStatement</a>'</code> |


#### WithStatement

| Prop         | Type                                                      |
| ------------ | --------------------------------------------------------- |
| **`type`**   | <code>'<a href="#withstatement">WithStatement</a>'</code> |
| **`object`** | <code><a href="#expression">Expression</a></code>         |
| **`body`**   | <code><a href="#statement">Statement</a></code>           |


#### ReturnStatement

| Prop           | Type                                                          |
| -------------- | ------------------------------------------------------------- |
| **`type`**     | <code>'<a href="#returnstatement">ReturnStatement</a>'</code> |
| **`argument`** | <code><a href="#expression">Expression</a> \| null</code>     |


#### LabeledStatement

| Prop        | Type                                                            |
| ----------- | --------------------------------------------------------------- |
| **`type`**  | <code>'<a href="#labeledstatement">LabeledStatement</a>'</code> |
| **`label`** | <code><a href="#identifier">Identifier</a></code>               |
| **`body`**  | <code><a href="#statement">Statement</a></code>                 |


#### BreakStatement

| Prop        | Type                                                        |
| ----------- | ----------------------------------------------------------- |
| **`type`**  | <code>'<a href="#breakstatement">BreakStatement</a>'</code> |
| **`label`** | <code><a href="#identifier">Identifier</a> \| null</code>   |


#### ContinueStatement

| Prop        | Type                                                              |
| ----------- | ----------------------------------------------------------------- |
| **`type`**  | <code>'<a href="#continuestatement">ContinueStatement</a>'</code> |
| **`label`** | <code><a href="#identifier">Identifier</a> \| null</code>         |


#### IfStatement

| Prop             | Type                                                    |
| ---------------- | ------------------------------------------------------- |
| **`type`**       | <code>'<a href="#ifstatement">IfStatement</a>'</code>   |
| **`test`**       | <code><a href="#expression">Expression</a></code>       |
| **`consequent`** | <code><a href="#statement">Statement</a></code>         |
| **`alternate`**  | <code><a href="#statement">Statement</a> \| null</code> |


#### SwitchStatement

| Prop               | Type                                                          |
| ------------------ | ------------------------------------------------------------- |
| **`type`**         | <code>'<a href="#switchstatement">SwitchStatement</a>'</code> |
| **`discriminant`** | <code><a href="#expression">Expression</a></code>             |
| **`cases`**        | <code>SwitchCase[]</code>                                     |


#### SwitchCase

| Prop             | Type                                                      |
| ---------------- | --------------------------------------------------------- |
| **`type`**       | <code>'<a href="#switchcase">SwitchCase</a>'</code>       |
| **`test`**       | <code><a href="#expression">Expression</a> \| null</code> |
| **`consequent`** | <code>Statement[]</code>                                  |


#### ThrowStatement

| Prop           | Type                                                        |
| -------------- | ----------------------------------------------------------- |
| **`type`**     | <code>'<a href="#throwstatement">ThrowStatement</a>'</code> |
| **`argument`** | <code><a href="#expression">Expression</a></code>           |


#### TryStatement

| Prop            | Type                                                              |
| --------------- | ----------------------------------------------------------------- |
| **`type`**      | <code>'<a href="#trystatement">TryStatement</a>'</code>           |
| **`block`**     | <code><a href="#blockstatement">BlockStatement</a></code>         |
| **`handler`**   | <code><a href="#catchclause">CatchClause</a> \| null</code>       |
| **`finalizer`** | <code><a href="#blockstatement">BlockStatement</a> \| null</code> |


#### CatchClause

| Prop        | Type                                                      |
| ----------- | --------------------------------------------------------- |
| **`type`**  | <code>'<a href="#catchclause">CatchClause</a>'</code>     |
| **`param`** | <code><a href="#pattern">Pattern</a> \| null</code>       |
| **`body`**  | <code><a href="#blockstatement">BlockStatement</a></code> |


#### WhileStatement

| Prop       | Type                                                        |
| ---------- | ----------------------------------------------------------- |
| **`type`** | <code>'<a href="#whilestatement">WhileStatement</a>'</code> |
| **`test`** | <code><a href="#expression">Expression</a></code>           |
| **`body`** | <code><a href="#statement">Statement</a></code>             |


#### DoWhileStatement

| Prop       | Type                                                            |
| ---------- | --------------------------------------------------------------- |
| **`type`** | <code>'<a href="#dowhilestatement">DoWhileStatement</a>'</code> |
| **`body`** | <code><a href="#statement">Statement</a></code>                 |
| **`test`** | <code><a href="#expression">Expression</a></code>               |


#### ForStatement

| Prop         | Type                                                                                                                |
| ------------ | ------------------------------------------------------------------------------------------------------------------- |
| **`type`**   | <code>'<a href="#forstatement">ForStatement</a>'</code>                                                             |
| **`init`**   | <code><a href="#expression">Expression</a> \| <a href="#variabledeclaration">VariableDeclaration</a> \| null</code> |
| **`test`**   | <code><a href="#expression">Expression</a> \| null</code>                                                           |
| **`update`** | <code><a href="#expression">Expression</a> \| null</code>                                                           |
| **`body`**   | <code><a href="#statement">Statement</a></code>                                                                     |


#### VariableDeclaration

| Prop               | Type                                                                  |
| ------------------ | --------------------------------------------------------------------- |
| **`type`**         | <code>'<a href="#variabledeclaration">VariableDeclaration</a>'</code> |
| **`declarations`** | <code>VariableDeclarator[]</code>                                     |
| **`kind`**         | <code>'var' \| 'let' \| 'const'</code>                                |


#### VariableDeclarator

| Prop       | Type                                                                |
| ---------- | ------------------------------------------------------------------- |
| **`type`** | <code>'<a href="#variabledeclarator">VariableDeclarator</a>'</code> |
| **`id`**   | <code><a href="#pattern">Pattern</a></code>                         |
| **`init`** | <code><a href="#expression">Expression</a> \| null</code>           |


#### ForInStatement

| Prop       | Type                                                        |
| ---------- | ----------------------------------------------------------- |
| **`type`** | <code>'<a href="#forinstatement">ForInStatement</a>'</code> |


#### ForOfStatement

| Prop        | Type                                                        |
| ----------- | ----------------------------------------------------------- |
| **`type`**  | <code>'<a href="#forofstatement">ForOfStatement</a>'</code> |
| **`await`** | <code>boolean</code>                                        |


#### ClassDeclaration

| Prop     | Type                                              | Description                                                                           |
| -------- | ------------------------------------------------- | ------------------------------------------------------------------------------------- |
| **`id`** | <code><a href="#identifier">Identifier</a></code> | It is null when a class declaration is a part of the `export default class` statement |


#### Comment

| Prop        | Type                           |
| ----------- | ------------------------------ |
| **`type`**  | <code>'Line' \| 'Block'</code> |
| **`value`** | <code>string</code>            |


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


#### PropertyKey

<code>string | number | symbol</code>


#### Function

<code><a href="#functiondeclaration">FunctionDeclaration</a> | <a href="#functionexpression">FunctionExpression</a> | <a href="#arrowfunctionexpression">ArrowFunctionExpression</a></code>


#### Statement

<code><a href="#expressionstatement">ExpressionStatement</a> | <a href="#blockstatement">BlockStatement</a> | <a href="#staticblock">StaticBlock</a> | <a href="#emptystatement">EmptyStatement</a> | <a href="#debuggerstatement">DebuggerStatement</a> | <a href="#withstatement">WithStatement</a> | <a href="#returnstatement">ReturnStatement</a> | <a href="#labeledstatement">LabeledStatement</a> | <a href="#breakstatement">BreakStatement</a> | <a href="#continuestatement">ContinueStatement</a> | <a href="#ifstatement">IfStatement</a> | <a href="#switchstatement">SwitchStatement</a> | <a href="#throwstatement">ThrowStatement</a> | <a href="#trystatement">TryStatement</a> | <a href="#whilestatement">WhileStatement</a> | <a href="#dowhilestatement">DoWhileStatement</a> | <a href="#forstatement">ForStatement</a> | <a href="#forinstatement">ForInStatement</a> | <a href="#forofstatement">ForOfStatement</a> | <a href="#declaration">Declaration</a></code>


#### Expression

<code>ExpressionMap[keyof ExpressionMap]</code>


#### AssignmentOperator

<code>"=" | "+=" | "-=" | "*=" | "/=" | "%=" | "**=" | "&lt;&lt;=" | "&gt;&gt;=" | "&gt;&gt;&gt;=" | "|=" | "^=" | "&=" | "||=" | "&&=" | "??="</code>


#### Pattern

<code><a href="#identifier">Identifier</a> | <a href="#objectpattern">ObjectPattern</a> | <a href="#arraypattern">ArrayPattern</a> | <a href="#restelement">RestElement</a> | <a href="#assignmentpattern">AssignmentPattern</a> | <a href="#memberexpression">MemberExpression</a></code>


#### BinaryOperator

<code>"==" | "!=" | "===" | "!==" | "&lt;" | "&lt;=" | "&gt;" | "&gt;=" | "&lt;&lt;" | "&gt;&gt;" | "&gt;&gt;&gt;" | "+" | "-" | "*" | "/" | "%" | "**" | "|" | "^" | "&" | "in" | "instanceof"</code>


#### CallExpression

<code><a href="#simplecallexpression">SimpleCallExpression</a> | <a href="#newexpression">NewExpression</a></code>


#### ChainElement

<code><a href="#simplecallexpression">SimpleCallExpression</a> | <a href="#memberexpression">MemberExpression</a></code>


#### Literal

<code><a href="#simpleliteral">SimpleLiteral</a> | <a href="#regexpliteral">RegExpLiteral</a> | <a href="#bigintliteral">BigIntLiteral</a></code>


#### LogicalOperator

<code>"||" | "&&" | "??"</code>


#### UnaryOperator

<code>"-" | "+" | "!" | "~" | "typeof" | "void" | "delete"</code>


#### UpdateOperator

<code>"++" | "--"</code>


#### Declaration

<code><a href="#functiondeclaration">FunctionDeclaration</a> | <a href="#variabledeclaration">VariableDeclaration</a> | <a href="#classdeclaration">ClassDeclaration</a></code>


#### GleapEventCallback

<code>(message: <a href="#gleapeventmessage">GleapEventMessage</a> | null, err?: any): void</code>


#### CallbackID

<code>string</code>

</docgen-api>
