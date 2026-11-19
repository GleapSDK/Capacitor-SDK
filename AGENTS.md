# Gleap Capacitor plugin

`capacitor-gleap-plugin` on npm: the Gleap SDK for Capacitor and Ionic apps. A thin bridge: `src/` (TypeScript) registers the plugin with Capacitor's `registerPlugin`, and each call goes to the native Gleap SDK on iOS and Android, or to the Gleap JavaScript SDK (`gleap`, the one runtime dependency) on the web.

Layout:

- `src/definitions.ts` is the public API: the `GleapPlugin` interface, whose JSDoc `@capacitor/docgen` turns into the API part of `README.md` and `dist/docs.json`.
- `src/index.ts` registers the plugin and wraps it: `projectId.ts` (`initialize({ projectId })`), `userJwtProvider.ts` (the JWT provider stays in JavaScript), `logs/` (on iOS and Android, the WebView's console and fetch/XHR traffic handed to the native SDK, redacted by `logs/redaction.ts`).
- `src/web.ts` is the web implementation, on top of `gleap`. `index.ts` loads it lazily, so native apps never run it.
- `ios/Sources/GleapPlugin/GleapPlugin.swift`: one Swift file, built through `Package.swift` (Swift Package Manager) or `CapacitorGleapPlugin.podspec` (CocoaPods fallback).
- `android/src/main/java/io/gleapplugins/capacitor/GleapPlugin.java`: one Java file, `android/build.gradle`.
- `example/` is a demo app for trying the plugin by hand. Nothing builds it in CI.

The native SDKs are pinned to the plugin's version: Gleap iOS SDK in `Package.swift` and the podspec, `io.gleap:gleap-android-sdk` in `android/build.gradle`, `gleap` in `package.json`. Capacitor 7 (`@capacitor/core` peer `>=7.0.0`), TypeScript 4.1 for the build, Node 24 in CI.

## Commands

```bash
npm ci                                   # install
npx jest --no-watchman                   # every test, about a second; or one file: npx jest --no-watchman src/projectId.test.ts
npx tsc --noEmit -p tsconfig.json        # typecheck the shipped sources
node tools/quality/check.mjs             # the quality check on what this branch adds (.claude/rules/code-conventions.md)
node tools/lint/check.mjs                # ESLint and Prettier on what this branch adds
npm run build                            # docgen + tsc + rollup: rewrites dist/ and the API part of README.md
npm run verify:android                   # Gradle build and unit tests: JDK 21, an Android SDK, node_modules/@capacitor/android
npm run verify:ios                       # xcodebuild of Package.swift: Xcode, and the pinned Gleap iOS SDK tag on GitHub
node --test tools/quality/check.test.mjs tools/lint/check.test.mjs   # the checks' own tests, about 45 seconds
```

Pass `--no-watchman` to Jest: a broken watchman install crashes it. `npm run lint` runs ESLint, Prettier and SwiftLint on every file and is red on old code, so it cannot judge a change; `tools/lint/check.mjs` runs the same ESLint and Prettier config on what the branch adds. Never run `npm run fmt`: it reformats every old file.

Done means the tests pass, the quality check and the lint check report nothing new, and CI is green. `.github/workflows/ci.yml` runs the tests, the build (and fails when `dist/` or `README.md` differ from what it writes), `npm pack --dry-run`, the checks' own tests, and `verify:android` and `verify:ios`; `.github/workflows/quality.yml` runs both checks on PRs. A change to `src/` needs `npm run build`, and its `dist/` and `README.md` changes go into the same commit. Say which commands you ran and what they printed.

New clone or worktree: `npm ci && npm ci --prefix tools/quality && sh .githooks/install.sh` (a Claude Code session does the last two at its start). `tools/quality/` has its own TypeScript 5.9: the check needs it, and the build's TypeScript cannot move without changing the shipped typings.

`git push` runs both checks on your branch (`.githooks/pre-push`). Fix what they report and push again; never `--no-verify`.

## Code

New files and the code you change follow `.claude/rules/code-conventions.md`, anything that crosses into native code follows `.claude/rules/native-bridge.md`, and tests follow `.claude/rules/testing.md`. Read them before your first edit: old code here is no precedent. `/review` reviews a branch against them.

## Public API

Everything an app can call or rely on is public: every method on `Gleap`, its option keys, results and defaults, `registerAgentTool`, the event names of `addListener` and `setEventCallback`, the exported types, and the `main`/`module`/`types`/`unpkg` entries.

- **Never remove, rename or change the meaning of any of it in a minor or patch version.** Add instead: an optional option, a new method. Deprecate with `@deprecated` and what to use instead in `definitions.ts`, and say so in `CHANGELOG.md`. Removal is a major version: stop and ask.
- **A new call exists on all three platforms in the same PR:** `definitions.ts`, `web.ts`, `GleapPlugin.swift` (an `@objc func` and its `CAPPluginMethod` entry) and `GleapPlugin.java` (`@PluginMethod`). `src/nativeParity.test.ts` fails when a platform misses one.
- **JavaScript may run on an older native build:** apps update their web code over the air without a new native build. A new call that the native side may not have yet must not break the app: see `warnWhenUnimplemented` in `src/userJwtProvider.ts`.
- **New behaviour is opted into:** a dashboard setting or a new call, never because the plugin was updated.

## Security

- The Project ID is not a secret; identity JWTs, auth tokens and the user's data are. Never log them, put them in a URL, or store them beyond what the native SDK does.
- Console and network logs leave the app only through `src/logs/redaction.ts` and the project's blacklist. A new capture path uses them.
- The plugin runs inside customers' apps: never throw into the app from a listener or a wrapper, and undo only your own patch (`uninstall()` in `src/logs/consoleCapture.ts`).

## Traps

- `dist/` is committed and is what `npm run build` writes from `src/`. Never edit it by hand (the edit hook refuses). A release builds again before publishing, so a stale `dist/` does not reach npm, but CI fails on one.
- `npm run build` runs docgen, which rewrites `README.md` between `<docgen-index>` and `</docgen-api>`. Edit the JSDoc in `definitions.ts`, not that part of the README.
- Rollup inlines the lazy `import('./web')` into the bundles: `dist/plugin.cjs.js` requires `gleap` when it loads, and the script-tag build `dist/plugin.js` expects a global `Gleap$1`. Old, and not changed by a normal PR.
- TypeScript stays at 4.1 for the build: TypeScript 5 writes the shipped `.d.ts` files differently. `tools/quality/` has its own TypeScript 5.9 for the check.
- `verify:ios` resolves the Gleap iOS SDK from its GitHub tags, so a version bump fails until the native tag exists. `verify:android` needs JDK 21; on Linux CI the committed `android/local.properties` (a developer's macOS SDK path) is overwritten in the runner.
- `android/local.properties`, `android/.gradle/`, `android/.idea/` and `.DS_Store` files are committed. Do not add more, and leave them for a cleanup of their own.
- `package.json` is in the published package, whole: any change to it, dev tooling too, changes what npm ships.

## Customer requests

A ticket is one customer's view, a bug report too. Before changing anything for it:

- **A feature or a change:** decide whether it is right for the product. Would most customers want it, or does it belong behind a setting every customer can use?
- **A bug report:** first check whether the code does something other than intended, from its tests, comments, docs and history. If it works as designed and the customer expected something else, it is not a bug: change nothing, and say so in your report, with what the customer can do instead. Changing intended behaviour is a product decision: stop and ask.
- **Never special-case one customer in code:** no project ids, organisation ids, customer names or domains in conditions. If the only fix that works is specific to one customer, stop and ask.

## Stop and ask

Keep going while a step needs no input. Stop and ask before merging; releasing (a version, a tag, a native SDK pin, `CHANGELOG.md` release sections); any change to `package.json` or `package-lock.json` (dependencies, dev tools, scripts, `files`); upgrading Capacitor, TypeScript or a lint config; changing `rollup.config.mjs`, `tsconfig.json`, `Package.swift`, the podspec, `android/build.gradle` or `.github/workflows/release.yml`; removing or changing anything public (above); or renaming an event or a field the native SDKs send.

## Releases

`.github/workflows/release.yml` publishes to npm (trusted publishing) when a version tag is pushed, and creates the GitHub Release from `CHANGELOG.md`; the steps are in `CONTRIBUTING.md` → Releasing. People do that: never run `npm publish`, `npm version`, `git tag` or `gh release`. An npm version cannot be republished: a broken release is fixed by a new version, and apps keep old versions for years.
