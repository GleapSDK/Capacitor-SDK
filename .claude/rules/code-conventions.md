---
paths:
  - "src/**/*.ts"
---

# Code conventions

For new files and the code you change; do not rewrite other code to match. Old code here is no precedent: copy the examples below, not your neighbours. `node tools/quality/check.mjs` and `node tools/lint/check.mjs` check what they can see, and judge only what your branch adds.

- **Size:** aim for files under 400 lines and never write a new one over 700. Functions 80 lines, counted without blanks and comments. These are working values, not proven limits. Tests have none, and `src/definitions.ts` has none because docgen documents its one interface. A file or function already too big must not grow (`src/web.ts`, `src/logs/networkCapture.ts`, `src/logs/redaction.ts`, `src/logs/format.ts`, `src/logs/webViewLogs.ts`): put new logic in its own module and call it from there; `web.ts` keeps one short method per call. Split by responsibility; never squeeze code onto fewer lines.
- **Parameters:** at most 2 positional, from 3 on one object with named fields. Plugin calls take one options object, as Capacitor requires. Callbacks a browser API or Capacitor calls are exempt.
- **Modules:** one responsibility per file, named camelCase after it (`projectId.ts`, `logs/networkCapture.ts`), unique in the repo: no new `index`, `utils` or `helpers`. Named exports only. New logic is exported functions, with state in a class only when it has a lifecycle (install, uninstall), like `ConsoleCapture`.
- **Imports:** relative paths; type-only imports use `import type` (ESLint enforces it). Only `src/web.ts` imports `gleap`, the Gleap JavaScript SDK: `index.ts` loads `web.ts` lazily so native apps never run it, and the quality check fails on another import. No new package: it changes `package.json`, which ships (`AGENTS.md` → Stop and ask).
- **Values:** a closed set of values is an `as const` object or array with its union type, next to the code that owns it. Strings a native SDK or the Gleap API sends or reads (event names, option keys, `UNIMPLEMENTED`) keep their exact spelling: check the native plugin files before you compare one.
- **One definition:** before adding a helper or constant, search `src/` and extend what covers most of the need (the table below).
- **Errors:** no empty `catch`; a catch that deliberately falls back says why in one line. A public call rejects with a message the app's developer can act on; a listener or wrapper never throws into the app.
- **Noise:** no `console.log`; `console.warn` and `console.error` only for what the app's developer must act on, starting with `[Gleap]`, at most once per cause. No new `any`, `as` (except `as const`), `!` or `@ts-ignore`, unless the native data leaves no other way: then one `as` at the boundary. No commented-out code. A comment says why, in English, in one or two lines, and only where the code cannot. No ticket or PR numbers, people's names, dates or decision histories: those belong in the PR.
- **JSDoc:** every new method in `definitions.ts` gets JSDoc with what it does, its options and `@since`: docgen turns it into the README. Every new exported function gets one line on what it does.
- **Formatting:** Prettier with `@ionic/prettier-config` for new files and files that were formatted before (`npx prettier --write <file>`). Never `npm run fmt`: it rewrites every old file.

## One job, one system

Where the code has a helper for a job, new code uses it. Each one carries a rule the direct approach misses.

| Job | Use | Not in new code |
|---|---|---|
| A call a native build may not have yet | `warnWhenUnimplemented`, `isUnimplemented` (`src/userJwtProvider.ts`) | letting Capacitor's `UNIMPLEMENTED` reject into the app |
| The Project ID from the options | `resolveProjectId` (`src/projectId.ts`) | reading `projectId` or `API_KEY` directly |
| Redacting network logs | `redactNetworkLogEntry`, `createRedactionRules` (`src/logs/redaction.ts`) | logging headers, URLs or bodies unredacted |
| Formatting console values and errors | `formatConsoleArgs`, `formatError`, `truncateLog` (`src/logs/format.ts`) | `JSON.stringify` or `String()` of a logged value |
| Reading a request or response body | `captureRequestBody`, `capBodyText` and the size caps (`src/logs/body.ts`) | reading a whole body, or a stream twice |
| Wrapping `console`, `fetch` or `XMLHttpRequest` | `ConsoleCapture` (`src/logs/consoleCapture.ts`), `NetworkCapture` (`src/logs/networkCapture.ts`) | a second wrapper of your own |
| Timers and listeners the plugin starts in Angular apps | `runOutsideZone` (`src/logs/zone.ts`) | scheduling inside zone.js, which keeps change detection busy |

## Examples to copy

The closest we have today, so copy only what each line names.

- A small module of exported functions with its test beside it: `src/projectId.ts`, `src/projectId.test.ts`.
- A wrapper around the plugin object that keeps every other call untouched: `withProjectIdInitialize` in `src/projectId.ts`.
- A call that keeps working on an older native build: `warnWhenUnimplemented` in `src/userJwtProvider.ts`.
- A class with a lifecycle that undoes only its own patch: `uninstall()` in `src/logs/consoleCapture.ts`.
