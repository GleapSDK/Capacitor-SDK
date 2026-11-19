// Before a turn ends: the quality check, the typecheck of the plugin's sources and every Jest test, once per tree. Red
// means the turn is not done. All tests run: together they take a few seconds, and the parity test is the one that
// sees a native change. The build, the lint compare and the native builds stay with CI and AGENTS.md.
import { join } from 'node:path';

import { projectDirOf, runStopGate } from '../../tools/quality/hooks.mjs';

const TYPECHECK_TIMEOUT_MS = 120_000;
const TESTS_TIMEOUT_MS = 180_000;

const projectDir = projectDirOf(import.meta.url);

await runStopGate({
  projectDir,
  toolPath: join(projectDir, 'tools/quality/check.mjs'),
  isCode: (file) => /^(src|tools)\/.*\.[cm]?[jt]s$/.test(file) || /^(ios\/Sources\/.*\.swift|android\/src\/.*\.(java|kt))$/.test(file),
  stepsFor: () => [
    {
      name: 'typecheck (tsc --noEmit -p tsconfig.json)',
      command: 'npx',
      args: ['--no-install', 'tsc', '--noEmit', '-p', 'tsconfig.json', '--pretty', 'false'],
      requires: 'node_modules/.bin/tsc',
      timeout: TYPECHECK_TIMEOUT_MS,
    },
    {
      name: 'jest',
      command: 'npx',
      // No watchman: a broken local install crashes Jest, and the suite is small enough to crawl.
      args: ['--no-install', 'jest', '--ci', '--no-watchman'],
      requires: 'node_modules/.bin/jest',
      timeout: TESTS_TIMEOUT_MS,
    },
  ],
});
