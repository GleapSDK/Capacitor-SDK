# CLAUDE.md

This file provides guidance to Claude Code when working in this repository.

## Commands

```bash
npm run build           # TypeScript + Rollup
npm run verify          # Verify all platforms (iOS, Android, Web)
npm run verify:ios      # xcodebuild of the Swift package (Package.swift)
npm run verify:android  # Gradle clean build test
npm run verify:web      # Build only
npm run lint            # ESLint + Prettier + SwiftLint
npm run fmt             # Auto-fix all linters
```

## Architecture

**Gleap Capacitor Plugin** — cross-platform wrapper (iOS/Android/Web) using Capacitor's `registerPlugin` pattern.

### Key Files

- `src/index.ts` — plugin registration and re-exports
- `src/definitions.ts` — typed `GleapPlugin` interface
- `src/web.ts` — web fallback implementation
- `Package.swift` + `ios/Sources/GleapPlugin/` — iOS plugin (Swift Package Manager; `CapacitorGleapPlugin.podspec` is the CocoaPods fallback)
- `android/` — Android plugin
