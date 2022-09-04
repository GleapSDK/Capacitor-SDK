# Gleap Capacitor SDK

![Gleap Capacitor SDK Intro](https://raw.githubusercontent.com/GleapSDK/Gleap-iOS-SDK/main/Resources/GleapHeaderImage.png)

Gleap SDK for Capacitor is the easiest way to integrate Gleap into your Ionic apps! Achieve better app quality with comprehensive in-app bug reporting & customer feedback for your web-apps and websites.

Many thanks to *Stephan Nagel* (@stephannagel) for his work on the Gleap capacitor plugin.

## Install

```bash
npm install capacitor-gleap-plugin
npx cap sync
```

## API

<docgen-index>

* [`initialize(...)`](#initialize)
* [`identify(...)`](#identify)
* [`clearIdentity()`](#clearidentity)
* [`log(...)`](#log)
* [`attachCustomData(...)`](#attachcustomdata)
* [`setCustomData(...)`](#setcustomdata)
* [`removeCustomData(...)`](#removecustomdata)
* [`clearCustomData()`](#clearcustomdata)
* [`logEvent(...)`](#logevent)
* [`setEventCallback(...)`](#seteventcallback)
* [`sendSilentCrashReport(...)`](#sendsilentcrashreport)
* [`preFillForm(...)`](#prefillform)
* [`addAttachment(...)`](#addattachment)
* [`removeAllAttachments()`](#removeallattachments)
* [`open()`](#open)
* [`close()`](#close)
* [`isOpened()`](#isopened)
* [`startFeedbackFlow(...)`](#startfeedbackflow)
* [`setLanguage(...)`](#setlanguage)
* [`disableConsoleLogOverwrite()`](#disableconsolelogoverwrite)
* [`enableDebugConsoleLog()`](#enabledebugconsolelog)
* [Interfaces](#interfaces)

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
identify(options: { userId: string; userHash?: string; name?: string; email?: string; phone?: string; value?: number; }) => Promise<{ identify: boolean; }>
```

Set user identity

| Param         | Type                                                                                                               |
| ------------- | ------------------------------------------------------------------------------------------------------------------ |
| **`options`** | <code>{ userId: string; userHash?: string; name?: string; email?: string; phone?: string; value?: number; }</code> |

**Returns:** <code>Promise&lt;{ identify: boolean; }&gt;</code>

**Since:** 7.0.0

--------------------


### clearIdentity()

```typescript
clearIdentity() => Promise<{ clearIdentity: boolean; }>
```

Clear user identity

**Returns:** <code>Promise&lt;{ clearIdentity: boolean; }&gt;</code>

**Since:** 7.0.0

--------------------


### log(...)

```typescript
log(options: { message: string; logLevel?: "ERROR" | "WARNING" | "INFO"; }) => Promise<{ logged: boolean; }>
```

Submit a custom log message with the given level

| Param         | Type                                                                         |
| ------------- | ---------------------------------------------------------------------------- |
| **`options`** | <code>{ message: string; logLevel?: "ERROR" \| "WARNING" \| "INFO"; }</code> |

**Returns:** <code>Promise&lt;{ logged: boolean; }&gt;</code>

**Since:** 7.0.0

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


### logEvent(...)

```typescript
logEvent(options: { name: string; data?: any; }) => Promise<{ loggedEvent: boolean; }>
```

Log event to Gleap

| Param         | Type                                       |
| ------------- | ------------------------------------------ |
| **`options`** | <code>{ name: string; data?: any; }</code> |

**Returns:** <code>Promise&lt;{ loggedEvent: boolean; }&gt;</code>

**Since:** 7.0.0

--------------------


### setEventCallback(...)

```typescript
setEventCallback(callback: GleapEventCallback) => Promise<CallbackID>
```

| Param          | Type                                               |
| -------------- | -------------------------------------------------- |
| **`callback`** | <code>(name: string, data?: any) =&gt; void</code> |

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
| **`options`** | <code>{ description: string; severity?: "LOW" \| "MEDIUM" \| "HIGH"; dataExclusion?: { customData: <a href="#boolean">Boolean</a>; metaData: <a href="#boolean">Boolean</a>; attachments: <a href="#boolean">Boolean</a>; consoleLog: <a href="#boolean">Boolean</a>; networkLogs: <a href="#boolean">Boolean</a>; customEventLog: <a href="#boolean">Boolean</a>; screenshot: <a href="#boolean">Boolean</a>; replays: <a href="#boolean">Boolean</a>; }; }</code> |

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

Start Feedback flow

| Param         | Type                                                              |
| ------------- | ----------------------------------------------------------------- |
| **`options`** | <code>{ feedbackFlow?: string; showBackButton?: boolean; }</code> |

**Returns:** <code>Promise&lt;{ startedFeedbackFlow: boolean; }&gt;</code>

**Since:** 7.0.0

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


#### Boolean

| Method      | Signature        | Description                                          |
| ----------- | ---------------- | ---------------------------------------------------- |
| **valueOf** | () =&gt; boolean | Returns the primitive value of the specified object. |

</docgen-api>
