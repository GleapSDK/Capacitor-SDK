# capacitor-gleap-plugin

Capacitor gleap.io integration

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

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### initialize(...)

```typescript
initialize(options: { API_KEY: string; }) => any
```

Initialize Gleap with an API key

| Param         | Type                              |
| ------------- | --------------------------------- |
| **`options`** | <code>{ API_KEY: string; }</code> |

**Returns:** <code>any</code>

**Since:** 7.0.0

--------------------


### identify(...)

```typescript
identify(options: { userId: string; userHash?: string; name?: string; email?: string; phone?: string; value?: number; }) => any
```

Set user identity

| Param         | Type                                                                                                               |
| ------------- | ------------------------------------------------------------------------------------------------------------------ |
| **`options`** | <code>{ userId: string; userHash?: string; name?: string; email?: string; phone?: string; value?: number; }</code> |

**Returns:** <code>any</code>

**Since:** 7.0.0

--------------------


### clearIdentity()

```typescript
clearIdentity() => any
```

Clear user identity

**Returns:** <code>any</code>

**Since:** 7.0.0

--------------------


### log(...)

```typescript
log(options: { message: string; logLevel?: "ERROR" | "WARNING" | "INFO"; }) => any
```

Submit a custom log message with the given level

| Param         | Type                                                                         |
| ------------- | ---------------------------------------------------------------------------- |
| **`options`** | <code>{ message: string; logLevel?: "ERROR" \| "WARNING" \| "INFO"; }</code> |

**Returns:** <code>any</code>

**Since:** 7.0.0

--------------------


### attachCustomData(...)

```typescript
attachCustomData(options: { data: any; }) => any
```

Add custom data

| Param         | Type                        |
| ------------- | --------------------------- |
| **`options`** | <code>{ data: any; }</code> |

**Returns:** <code>any</code>

**Since:** 7.0.0

--------------------


### setCustomData(...)

```typescript
setCustomData(options: { key: string; value: string; }) => any
```

Set custom data

| Param         | Type                                         |
| ------------- | -------------------------------------------- |
| **`options`** | <code>{ key: string; value: string; }</code> |

**Returns:** <code>any</code>

**Since:** 7.0.0

--------------------


### removeCustomData(...)

```typescript
removeCustomData(options: { key: string; }) => any
```

Remove custom data by key

| Param         | Type                          |
| ------------- | ----------------------------- |
| **`options`** | <code>{ key: string; }</code> |

**Returns:** <code>any</code>

**Since:** 7.0.0

--------------------


### clearCustomData()

```typescript
clearCustomData() => any
```

Clear custom data

**Returns:** <code>any</code>

**Since:** 7.0.0

--------------------


### logEvent(...)

```typescript
logEvent(options: { name: string; data?: any; }) => any
```

Log event to Gleap

| Param         | Type                                       |
| ------------- | ------------------------------------------ |
| **`options`** | <code>{ name: string; data?: any; }</code> |

**Returns:** <code>any</code>

**Since:** 7.0.0

--------------------


### setEventCallback(...)

```typescript
setEventCallback(callback: GleapEventCallback) => any
```

| Param          | Type                                               |
| -------------- | -------------------------------------------------- |
| **`callback`** | <code>(name: string, data?: any) =&gt; void</code> |

**Returns:** <code>any</code>

**Since:** 7.0.0

--------------------


### sendSilentCrashReport(...)

```typescript
sendSilentCrashReport(options: { description: string; severity?: "LOW" | "MEDIUM" | "HIGH"; dataExclusion?: { customData?: Boolean; metaData?: Boolean; attachments?: Boolean; consoleLog?: Boolean; networkLogs?: Boolean; customEventLog?: Boolean; screenshot?: Boolean; replays?: Boolean; }; }) => any
```

Log event to Gleap

| Param         | Type                                                                                                                                                                                                                                                |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`options`** | <code>{ description: string; severity?: "LOW" \| "MEDIUM" \| "HIGH"; dataExclusion?: { customData?: any; metaData?: any; attachments?: any; consoleLog?: any; networkLogs?: any; customEventLog?: any; screenshot?: any; replays?: any; }; }</code> |

**Returns:** <code>any</code>

**Since:** 7.0.0

--------------------


### preFillForm(...)

```typescript
preFillForm(options: { data: any; }) => any
```

Prefills the widget's form data

| Param         | Type                        |
| ------------- | --------------------------- |
| **`options`** | <code>{ data: any; }</code> |

**Returns:** <code>any</code>

**Since:** 7.0.0

--------------------


### addAttachment(...)

```typescript
addAttachment(options: { base64data: string; name: string; }) => any
```

Add attachment as bas64 string

| Param         | Type                                               |
| ------------- | -------------------------------------------------- |
| **`options`** | <code>{ base64data: string; name: string; }</code> |

**Returns:** <code>any</code>

**Since:** 7.0.0

--------------------


### removeAllAttachments()

```typescript
removeAllAttachments() => any
```

All attachments removed

**Returns:** <code>any</code>

**Since:** 7.0.0

--------------------


### open()

```typescript
open() => any
```

Open widget

**Returns:** <code>any</code>

**Since:** 7.0.0

--------------------


### close()

```typescript
close() => any
```

Close widget

**Returns:** <code>any</code>

**Since:** 7.0.0

--------------------


### isOpened()

```typescript
isOpened() => any
```

Check widget status code

**Returns:** <code>any</code>

**Since:** 7.0.0

--------------------


### startFeedbackFlow(...)

```typescript
startFeedbackFlow(options: { feedbackFlow?: string; showBackButton?: boolean; }) => any
```

Start Feedback flow

| Param         | Type                                                              |
| ------------- | ----------------------------------------------------------------- |
| **`options`** | <code>{ feedbackFlow?: string; showBackButton?: boolean; }</code> |

**Returns:** <code>any</code>

**Since:** 7.0.0

--------------------


### setLanguage(...)

```typescript
setLanguage(options: { languageCode: string; }) => any
```

Set Language

| Param         | Type                                   |
| ------------- | -------------------------------------- |
| **`options`** | <code>{ languageCode: string; }</code> |

**Returns:** <code>any</code>

**Since:** 7.0.0

--------------------


### disableConsoleLogOverwrite()

```typescript
disableConsoleLogOverwrite() => any
```

Disable console log overwrite

**Returns:** <code>any</code>

**Since:** 7.0.0

--------------------


### enableDebugConsoleLog()

```typescript
enableDebugConsoleLog() => any
```

Enable debug console log

**Returns:** <code>any</code>

**Since:** 7.0.0

--------------------

</docgen-api>
