# Contributing

This guide provides instructions for contributing to this Capacitor plugin.

## Developing

### Local Setup

1. Fork and clone the repo.
1. Install the dependencies.

    ```shell
    npm install
    ```

1. Install SwiftLint if you're on macOS.

    ```shell
    brew install swiftlint
    ```

### Scripts

#### `npm run build`

Build the plugin web assets and generate plugin API documentation using [`@capacitor/docgen`](https://github.com/ionic-team/capacitor-docgen).

It will compile the TypeScript code from `src/` into ESM JavaScript in `dist/esm/`. These files are used in apps with bundlers when your plugin is imported.

Then, Rollup will bundle the code into a single file at `dist/plugin.js`. This file is used in apps without bundlers by including it as a script in `index.html`.

#### `npm run verify`

Build and validate the web and native projects.

This is useful to run in CI to verify that the plugin builds for all platforms.

`npm run verify:ios` builds the Swift package in `Package.swift` (`xcodebuild build -scheme CapacitorGleapPlugin -destination generic/platform=iOS`); it needs Xcode, no CocoaPods. The iOS sources live in `ios/Sources/GleapPlugin/`, and `GleapPlugin.swift` registers every plugin method in `pluginMethods` (`CAPBridgedPlugin`): add a `CAPPluginMethod` entry there for each new `@objc func`. SPM resolves the Gleap iOS SDK from its git tags, so it only passes once the pinned native version is tagged; to build against an unreleased native SDK, point the dependency at `branch: "main"` locally and do not commit that.

#### `npm run lint` / `npm run fmt`

Check formatting and code quality, autoformat/autofix if possible.

This template is integrated with ESLint, Prettier, and SwiftLint. Using these tools is completely optional, but the [Capacitor Community](https://github.com/capacitor-community/) strives to have consistent code style and structure for easier cooperation.

## Releasing

Releases are published by GitHub Actions ([`.github/workflows/release.yml`](.github/workflows/release.yml)) when a version tag is pushed. The tag is the plain version (`18.2.0`, no `v`), the same across all Gleap SDKs. Nobody runs `npm publish` by hand.

1. In a PR, bump the version:
   - `version` in `package.json`, and the `gleap` (JavaScript SDK) dependency if the web SDK moved; then `npm install` so `package-lock.json` and `node_modules/gleap` match
   - the native pins (the Gleap iOS SDK tag `X.Y.Z` must already exist, SPM resolves it from GitHub):
     - Swift Package Manager: `.package(url: "https://github.com/GleapSDK/Gleap-iOS-SDK.git", from: "X.Y.Z")` in `Package.swift`
     - CocoaPods fallback: `s.dependency 'Gleap', 'X.Y.Z'` in `CapacitorGleapPlugin.podspec`
     - Android: `gleap-android-sdk` in `android/build.gradle`
     - the `:tag => 'X.Y.Z'` of the CocoaPods snippet in `README.md` → iOS
   - a `## X.Y.Z` section at the top of `CHANGELOG.md` (it becomes the GitHub Release notes)
   - `npm run build` and commit `dist/` and the regenerated API part of `README.md`
2. Merge the PR into `main`.
3. Tag the merge commit and push the tag:

   ```shell
   git switch main && git pull --ff-only
   git tag X.Y.Z && git push origin X.Y.Z
   ```

The workflow checks that the tag equals `package.json`'s version, runs `npm ci`, `npm run build` and `npm pack --dry-run`, then `npm publish` (its `prepublishOnly` hook builds again) via [npm trusted publishing](https://docs.npmjs.com/trusted-publishers) (OIDC, no npm token, provenance attached), and finally creates the GitHub Release. A prerelease tag such as `18.2.0-beta.1` publishes to the `next` dist-tag. [`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs the same checks on every pull request and push to `main`.

**One-time setup** (npmjs.com → `capacitor-gleap-plugin` → Settings → Trusted publishing → GitHub Actions):

| Field | Value |
| --- | --- |
| Organization or user | `GleapSDK` |
| Repository | `Capacitor-SDK` |
| Workflow filename | `release.yml` |
| Environment name | _(leave empty)_ |

Optional, once the first automated release succeeded: set Publishing access to "Require two-factor authentication and disallow tokens" (npm's recommendation for trusted publishing).

> **Note**: The [`files`](https://docs.npmjs.com/cli/v7/configuring-npm/package-json#files) array in `package.json` specifies which files get published. If you rename files/directories or add files elsewhere, you may need to update it.
