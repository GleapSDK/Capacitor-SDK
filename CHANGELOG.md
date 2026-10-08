# Changelog

## 19.2.0
Updated native iOS dependency to 19.2.0
Updated native Android dependency to 19.2.0
Updated the web (JavaScript) dependency to 19.2.0 (Surveys 2.0)
Surveys 2.0: the feedback sent and outbound sent callbacks (and on Android feedback will be sent) now also fire when a Surveys 2.0 survey is completed in the native SDKs, with the survey's answers; server-triggered surveys keep their resume data, and full-screen and card surveys look right on Android (native SDK 19.2.0).

## 19.1.0
Updated native iOS dependency to 19.1.0
Updated native Android dependency to 19.1.0
Updated the web (JavaScript) dependency to 19.1.0
New `Gleap.setCaptureEnabled({ enabled })` and `Gleap.setRemoteLogCollectionEnabled({ enabled })` for capture requests: in-app screenshots and screen recordings that workflows, AI agents and teammates ask for in a conversation, and background log collection. The WebView's console and network logs are handed to the native SDK before it collects logs for a request.

## 19.0.1
Native iOS and Android dependencies stay on 19.0.0, the web (JavaScript) dependency on 19.0.0
(protected conversation files: new `Gleap.openProtectedFileFromUrl({ url })` opens the conversation of a file linked in an email reply. With "Require authenticated file access" enabled, emails link attachments to your customer application URL with a `gleapFile` query parameter; when that URL opens your app (universal link / App Link), pass it on, e.g. from `App.addListener('appUrlOpen')` or `App.getLaunchUrl()` of `@capacitor/app`. Resolves `{ opened: true }` when the URL carries a Gleap file reference; the conversation opens once the customer is identified with a user hash. On web the JavaScript SDK handles `?gleapFile=` links on page load itself, so it resolves `{ opened: false }` there)

## 19.0.0
Updated native iOS dependency to 19.0.0
Updated native Android dependency to 19.0.0
Updated the web (JavaScript) dependency to 19.0.0
(iOS via Swift Package Manager: CocoaPods trunk becomes read-only on December 2, 2026, so the plugin now ships a `Package.swift` that pulls the Gleap iOS SDK from GitHub (`from: "19.0.0"`). Apps that use SPM (`npx cap add ios --packagemanager SPM`, or `npx cap spm-migration-assistant` for existing apps) get it with `npx cap sync ios`. Requires Capacitor 7 or later and an iOS deployment target of 15.0: raise it in Xcode and run `npx cap sync ios` again so `CapApp-SPM` picks it up. CocoaPods apps keep working through the podspec (Podfile `platform :ios, '15.0'`); for Gleap iOS SDK versions released after December 2, 2026 they add `pod 'Gleap', :git => 'https://github.com/GleapSDK/Gleap-iOS-SDK.git', :tag => '<version>'` to their Podfile, see README → iOS. The plugin registers through `CAPBridgedPlugin` now; its Objective-C bridge file is gone)
(dark mode: new `Gleap.setColorScheme({ colorScheme: "auto" | "light" | "dark", lightBackgroundColor?, darkBackgroundColor? })` switches the widget between dark and light mode and overrides the color scheme set in the dashboard (only when "Adapt to dark / light mode" is enabled there). `auto` follows the device appearance on iOS and Android and the page theme on web; apps with their own in-app theme toggle should pass `light` / `dark` explicitly and call it again when the theme changes. Before the first call the dashboard setting applies. In dark mode the widget uses the dark mode colors, logo, header image and composer glow set in the Gleap dashboard; without dark colors it keeps its normal colors. `lightBackgroundColor` / `darkBackgroundColor` override the background in light / dark mode. Works on iOS, Android and web and can be called before or after `initialize`)
(console and network logs from your app's WebView: on iOS and Android, tickets now include the WebView's console output — `console.log`, `info`, `warn`, `error` and `debug`, uncaught errors and unhandled promise rejections — and, when network logs are enabled for your project, its `fetch` and `XMLHttpRequest` calls with status, timing, headers and text bodies. Until now the native SDKs could not see either, so tickets from release builds had no WebView console or network logs at all. Console recording starts as soon as the plugin is imported, network recording once the project config enabling network logs has loaded; bodies are kept up to 150 KB, streaming and binary bodies are skipped, credential headers are masked, and `setNetworkLogPropsToIgnore` / `setNetworkLogsBlacklist` apply together with your project's settings. `disableConsoleLogOverwrite()` stops the console recording. Android debug builds already forward the console to logcat, so there only network requests are added. On web nothing changes: the JavaScript SDK records both itself)
(fixes: `openConversation` now opens the conversations on iOS and Android too, where it was not implemented and its promise never settled. iOS: `log` did nothing and its promise never settled, and `showSurvey` swapped the `survey` and `survey_full` formats. Android: `updateContact` was not implemented, `log` sent every message as INFO, `sendSilentCrashReport` sent every report with LOW severity, and leaving out the optional `showBackButton`, `show` or `disableInAppNotifications` option crashed the app)
(API: `openChecklists`, `openChecklist`, `startChecklist` and `openConversations`, which already existed on iOS and Android, are now part of the TypeScript API and work on web. Return values now match the TypeScript types on every platform: `trackEvent` resolves `{ loggedEvent }` (iOS and Android returned `trackedEvent`), `openNews` resolves `{ openedNews }` (iOS and Android returned `opened`) and `attachCustomData` resolves `{ attachedCustomData }` on iOS too (was `addedCustomData`). The `showBackButton` option of `openNews` on iOS and of `startFeedbackFlow` on Android was ignored and now applies. Android: the `setEventCallback` callback no longer receives a spurious `widget-opened` event, carrying the project config, when the config loads)

## 18.1.0
Updated native iOS dependency to 18.1.0
Updated native Android dependency to 18.1.0
Updated the web (JavaScript) dependency to 18.1.0
(env data controls: new `Gleap.setEnvDataPropsToIgnore({ propsToIgnore: ["deviceName", "currentUrl"] })` drops individual env data fields before a ticket or conversation is sent, and `Gleap.setDisableEnvData({ disableEnvData: true })` stops collecting env data entirely. Both work on iOS, Android and web and can be called before or after `initialize`)

## 18.0.0
Updated native iOS dependency to 18.0.0
Updated native Android dependency to 18.0.0
Updated the web (JavaScript) dependency to 18.0.0
(data regions: new `Gleap.setRegion({ region: "us" })` points the SDK at the region your Gleap project lives in — it sets the API, websocket and realtime hosts at once, "eu" stays the default. New host overrides `setApiUrl`, `setWSApiUrl`, `setRealtimeHost`, `setFrameUrl`, `setBannerUrl` and `setModalUrl` on all three platforms; a manual setter called after `setRegion` overrides that single host. All of them must be called before `initialize`)

## 17.0.0
Updated native iOS dependency to 17.0.0
Updated native Android dependency to 17.0.0
Updated the web (JavaScript) dependency to 16.4.7
(Android: remote images are now downsampled to their destination size and served from a memory-pressure-aware cache, replacing the manual full-size bitmap decodes flagged by Google Play's new Android Vitals bitmap-optimization advisory; both platforms: calling setLanguage() after initialize() now reloads the widget config, so server-translated copy switches language immediately)

## 16.4.5
Updated native iOS dependency to 16.4.5
Updated native Android dependency to 16.4.5
Updated the web (JavaScript) dependency to 16.4.5
(redesigned in-app notifications: contained cards with the sender and time inside the card, a collapsible notification stack, and the rounded-square bot avatar — on all three platforms)

## 16.4.3
Updated native iOS dependency to 16.4.3
(fixes info cards scrolling in two places at once, and flickering in portrait, when the content is taller than the screen)
Updated the web (JavaScript) dependency to 16.4.3
(fixes the info card losing its footer buttons on short browser windows)
Native Android dependency stays on 16.4.2 (unaffected)

## 16.4.2
Updated native iOS dependency to 16.4.2
Updated native Android dependency to 16.4.2
(shows the app background while the widget is loading and raises the attachment file size limit)
Updated the web (JavaScript) dependency to 16.3.6

## 16.4.0
Updated native iOS dependency to 16.4.0
Updated native Android dependency to 16.4.0
(fixes Gleap not responding when the app is launched without an internet connection)

## 15.3.4
Updated native iOS dependency to 15.3.4 (fixes the feedback button disappearing after launch on iOS in apps where the key window changes)
