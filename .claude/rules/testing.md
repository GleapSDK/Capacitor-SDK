---
paths:
  - "src/**/*.ts"
  - "ios/**/*.swift"
  - "android/src/**/*.java"
---

# Testing

Tests come first and stay fixed while the code is written: an agent that may change a test will change it to get green.

- **New behaviour or a bug fix:** write the test first, from the requirement and not from the code. Use the `test-writer` subagent if you can start one. See it fail for the expected reason and commit it on its own, then write the code without touching it. A new module may start as a file with its exported signatures throwing `not implemented`.
- **Refactor without a behaviour change:** tests stay unchanged. A move may change a test's import path, never its assertions. Nothing covers the code? Pin today's behaviour with a test first.
- **Never edit, skip or delete an existing test to make a change pass,** and never detect test inputs or hardcode answers. No `.skip`, `.only`, `todo`, retries or sleeps. If a test looks wrong, stop and report `BLOCKED` with the reason. A test changes only when the required behaviour changed; say so in the PR.

## How

Jest 30 with `@swc/jest`, in node, configured in `package.json`. Tests are `src/<name>.test.ts` beside the module. They import `describe`, `it`, `expect` and `jest` from `@jest/globals`. Swift and Java have no unit tests here: CI compiles them (`verify:ios`, `verify:android`), and `src/nativeParity.test.ts` reads their sources.

| What changed | Test |
|---|---|
| Logic in `src/` without the plugin object | `<name>.test.ts` beside it, the module alone, time and I/O passed in or faked |
| A wrapper around the plugin (`projectId.ts`, `userJwtProvider.ts`, `index.ts`) | a fake plugin object with `jest.fn()` methods, as `fakePlugin()` in `src/userJwtProvider.test.ts` does |
| What `index.ts` does at import | `jest.mock('@capacitor/core', ...)` returning a fake `registerPlugin` and `Capacitor`, then `jest.isolateModules` to import it fresh. A plain object, never a `Proxy`: Capacitor's plugins are proxies already |
| A new call, a renamed call, a new event | `src/nativeParity.test.ts` covers the names on all platforms; the call's own behaviour on web still needs a test |
| `src/web.ts` | `jest.mock('gleap', ...)` with the methods the call uses, and assert what reached the Gleap JavaScript SDK |
| Log capture (`src/logs/`) | the module with a fake `console`, `fetch` or `XMLHttpRequest` the test drives, as `src/logs/redaction.test.ts` does for redaction |
| Swift or Java only | nothing in Jest; CI's `verify-ios` and `verify-android`. Say in your report that only the compile checked it |
| Copy, JSDoc or README only | nothing |

Tests run in node: there is no DOM. A test that needs one needs `jest-environment-jsdom`, a new dev dependency: stop and ask.

Fake only the edges: the plugin object, `@capacitor/core`, the `gleap` package, time (`jest.useFakeTimers()`, with `jest.useRealTimers()` after each test) and the network. Do not mock the module under test or its helpers. Assert behaviour, not that code ran.

## What to run

- While you work: `npx jest --no-watchman <file>`.
- Before you finish: `npx jest --no-watchman` (all of it takes about a second) and `npx tsc --noEmit -p tsconfig.json`. The stop hook runs both.
- After a change to `tools/`: `node --test tools/quality/check.test.mjs tools/lint/check.test.mjs`.

If no test reaches the code you changed, that is not a pass: say in your report what no test covered.
