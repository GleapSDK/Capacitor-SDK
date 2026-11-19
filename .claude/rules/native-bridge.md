---
paths:
  - "src/definitions.ts"
  - "src/index.ts"
  - "src/web.ts"
  - "src/userJwtProvider.ts"
  - "src/projectId.ts"
  - "src/logs/webViewLogs.ts"
  - "ios/**/*.swift"
  - "android/src/**/*.java"
  - "Package.swift"
  - "CapacitorGleapPlugin.podspec"
  - "android/build.gradle"
---

# The bridge to the native SDKs

A call from the app crosses three layers: `src/` (TypeScript), Capacitor's bridge, and the plugin class on iOS (`GleapPlugin.swift`) or Android (`GleapPlugin.java`), which calls the native Gleap SDK. On the web, `src/web.ts` calls the Gleap JavaScript SDK instead. For new code and the code you change; do not rewrite old code to match.

## One call, every platform

- **A new call is added everywhere in the same PR:** the signature with JSDoc in the `GleapPlugin` interface of `definitions.ts`, the method in `web.ts`, an `@objc func name(_ call: CAPPluginCall)` in `GleapPlugin.swift` **and** its `CAPPluginMethod(name: "name", returnType: CAPPluginReturnPromise)` entry in `pluginMethods` (without it, iOS answers `UNIMPLEMENTED`), and a `@PluginMethod public void name(PluginCall call)` in `GleapPlugin.java`. `src/nativeParity.test.ts` fails when one is missing, and CI compiles both native files.
- **A call that never reaches native code** (Capacitor's `addListener`, the JavaScript-side `setUserJwtProvider`) is listed in `JAVASCRIPT_ONLY` in that test, with the reason.
- **Same names, same shapes:** an option key, a result key or an event's data has the same name and JSON type on iOS, Android and web. Read options with `call.getString`/`getBool`/`getObject` (Swift) and `call.getString`/`getBoolean`/`getObject` (Java), with the same defaults on both sides.
- **Events** go out through `notifyListeners("name", ...)` under a name declared as an `addListener(eventName: 'name', ...)` overload in `definitions.ts`. Never rename one: apps listen for it.

## Every call answers once

- Each call resolves or rejects exactly once, on every path, including when the SDK is not initialised. A call kept open for repeated results (`call.keepAlive = true`, `call.setKeepAlive(true)`) says why.
- Work of your own on views or UI state runs on the main thread: `DispatchQueue.main.async` on iOS, a main-looper `Handler` (`mainHandler` in `GleapPlugin.java`) on Android. Never block the bridge thread with a wait.
- Reject with a message the app's developer can act on. Never crash the app: no force unwraps (`!`) of call data in Swift, no unchecked casts in Java.

## Old native builds, new JavaScript

Apps update their web code over the air, so the newest `src/` can run against an older native plugin. A new call goes through `warnWhenUnimplemented` (`src/userJwtProvider.ts`) when an older native build lacks it and the app must keep working; a changed option keeps accepting the old one (as `initialize` does with `API_KEY` next to `projectId`, `src/projectId.ts`).

## Native SDK versions

The Gleap iOS SDK (`Package.swift`, `CapacitorGleapPlugin.podspec`, the CocoaPods snippet in `README.md`), the Android SDK (`android/build.gradle`) and `gleap` (`package.json`) move only in a release PR, all together, to the plugin's version (`CONTRIBUTING.md` → Releasing). Call only native API that the pinned version has. `Package.swift`, the podspec and `android/build.gradle` ship in the npm package: a change there is a stop-and-ask (`AGENTS.md`).
