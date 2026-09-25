# Changelog

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
