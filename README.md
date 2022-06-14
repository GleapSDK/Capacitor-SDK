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
* [`setUserIdentity(...)`](#setuseridentity)
* [`clearUserIdentity()`](#clearuseridentity)
* [`addCustomData(...)`](#addcustomdata)
* [`appendCustomData(...)`](#appendcustomdata)
* [`removeCustomData(...)`](#removecustomdata)
* [`clearCustomData(...)`](#clearcustomdata)
* [`logEvent(...)`](#logevent)
* [`sendSilentBugReport(...)`](#sendsilentbugreport)
* [`openWidget()`](#openwidget)
* [`startFeedbackFlow(...)`](#startfeedbackflow)
* [`setLanguage(...)`](#setlanguage)

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

**Since:** 0.0.1

--------------------


### setUserIdentity(...)

```typescript
setUserIdentity(options: { userId: string; userName?: string; userEmail?: string; }) => any
```

Set user identity

| Param         | Type                                                                    |
| ------------- | ----------------------------------------------------------------------- |
| **`options`** | <code>{ userId: string; userName?: string; userEmail?: string; }</code> |

**Returns:** <code>any</code>

**Since:** 0.0.1

--------------------


### clearUserIdentity()

```typescript
clearUserIdentity() => any
```

Clear user identity

**Returns:** <code>any</code>

**Since:** 0.0.1

--------------------


### addCustomData(...)

```typescript
addCustomData(options: { dataKey: string; dataValue: string; }) => any
```

Add custom data to logging

| Param         | Type                                                 |
| ------------- | ---------------------------------------------------- |
| **`options`** | <code>{ dataKey: string; dataValue: string; }</code> |

**Returns:** <code>any</code>

**Since:** 0.0.1

--------------------


### appendCustomData(...)

```typescript
appendCustomData(options: { dataKey: string; dataValue: string; }) => any
```

Append custom data

| Param         | Type                                                 |
| ------------- | ---------------------------------------------------- |
| **`options`** | <code>{ dataKey: string; dataValue: string; }</code> |

**Returns:** <code>any</code>

**Since:** 0.0.1

--------------------


### removeCustomData(...)

```typescript
removeCustomData(options: { dataKey: string; }) => any
```

Append custom data

| Param         | Type                              |
| ------------- | --------------------------------- |
| **`options`** | <code>{ dataKey: string; }</code> |

**Returns:** <code>any</code>

**Since:** 0.0.1

--------------------


### clearCustomData(...)

```typescript
clearCustomData(options: { dataKey: string; }) => any
```

Clear custom data

| Param         | Type                              |
| ------------- | --------------------------------- |
| **`options`** | <code>{ dataKey: string; }</code> |

**Returns:** <code>any</code>

**Since:** 0.0.1

--------------------


### logEvent(...)

```typescript
logEvent(options: { logEventSubject: string; logEventData?: string; }) => any
```

Log event to Gleap

| Param         | Type                                                             |
| ------------- | ---------------------------------------------------------------- |
| **`options`** | <code>{ logEventSubject: string; logEventData?: string; }</code> |

**Returns:** <code>any</code>

**Since:** 0.0.1

--------------------


### sendSilentBugReport(...)

```typescript
sendSilentBugReport(options: { silentBugReportInfo: string; silentBugReportSeverity: string; }) => any
```

Log event to Gleap

| Param         | Type                                                                           |
| ------------- | ------------------------------------------------------------------------------ |
| **`options`** | <code>{ silentBugReportInfo: string; silentBugReportSeverity: string; }</code> |

**Returns:** <code>any</code>

**Since:** 0.0.1

--------------------


### openWidget()

```typescript
openWidget() => any
```

Open Widget

**Returns:** <code>any</code>

**Since:** 0.0.1

--------------------


### startFeedbackFlow(...)

```typescript
startFeedbackFlow(options: { feedbackType?: string; }) => any
```

Start Feedback flow

| Param         | Type                                    |
| ------------- | --------------------------------------- |
| **`options`** | <code>{ feedbackType?: string; }</code> |

**Returns:** <code>any</code>

**Since:** 0.0.1

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

**Since:** 0.0.1

--------------------

</docgen-api>
