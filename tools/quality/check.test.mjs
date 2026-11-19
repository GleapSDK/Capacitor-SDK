// node --test tools/quality/check.test.mjs (CI runs it). The shared core's cases, then what only this repo's config
// decides.
import assert from 'node:assert/strict';
import { dirname, resolve } from 'node:path';
import { after, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import { config, LIMITS } from './config.mjs';
import { defineCoreCases } from './core.cases.mjs';
import { checkChange, checkChanges } from './rules.mjs';

const TOOL_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(TOOL_DIR, '../..');

defineCoreCases({
  describe,
  it,
  afterAll: after,
  config,
  LIMITS,
  checkChange,
  checkChanges,
  toolDir: TOOL_DIR,
  repoRoot: REPO_ROOT,
  toolRelative: 'tools/quality',
  pathFor: (name) => `src/${name}.ts`,
});

// Detection is tested with every rule at full strength. The core cases pin which rules only warn.
const strict = { ...config, warningRules: new Set(), legacySizeGrowthWarns: false };
const report = (change, pathExists = () => true) =>
  checkChange({ change: { isNewPath: change.before == null, newFolders: [], ...change }, config: strict, pathExists });
const rulesOf = (change, pathExists) => report(change, pathExists).violations.map(({ rule }) => rule);

const logic = 'export const run = (a: number) => a + 1;';

describe('scope', () => {
  for (const path of ['src/index.ts', 'src/web.ts', 'src/definitions.ts', 'src/logs/networkCapture.ts']) {
    it(`checks ${path}`, () => assert.ok(config.isInScope(path), path));
  }
  for (const path of [
    'src/projectId.test.ts',
    'src/nativeParity.test.ts',
    'dist/esm/index.js',
    'dist/esm/index.d.ts',
    'example/src/js/capacitor-welcome.js',
    'tools/quality/rules.mjs',
    'rollup.config.mjs',
  ]) {
    it(`leaves out ${path}`, () => assert.ok(!config.isInScope(path), path));
  }
});

describe('file names', () => {
  for (const path of ['src/projectId.ts', 'src/logs/networkCapture.ts', 'src/bannerHeight.ts']) {
    it(`green: ${path}`, () => assert.deepEqual(rulesOf({ path, before: null, after: logic }), []));
  }
  for (const path of ['src/banner-height.ts', 'src/Banner_Height.ts', 'src/BannerHeight.ts', 'src/bannerHeight.js']) {
    it(`red: ${path}`, () => assert.ok(rulesOf({ path, before: null, after: logic }).includes('file-name'), path));
  }
  it('red: a new generic name', () => assert.ok(rulesOf({ path: 'src/logs/helpers.ts', before: null, after: logic }).includes('generic-file-name')));
  it('red: a new folder that is not camelCase', () =>
    assert.ok(rulesOf({ path: 'src/agent-tools/registry.ts', before: null, after: logic, newFolders: ['src/agent-tools'] }).includes('folder-name')));
});

describe('needs-test', () => {
  const missing = () => false;
  it('red: a new module with functions and no test next to it', () =>
    assert.ok(rulesOf({ path: 'src/bannerHeight.ts', before: null, after: logic }, missing).includes('needs-test')));
  it('green: the test is next to it', () =>
    assert.ok(!rulesOf({ path: 'src/bannerHeight.ts', before: null, after: logic }, (path) => path === 'src/bannerHeight.test.ts').includes('needs-test')));
});

describe('definitions.ts is the API registry', () => {
  const methods = (count) => Array.from({ length: count }, (_, i) => `  call${i}(options: { value: string }): Promise<void>;`).join('\n');
  const api = (count) => `export interface GleapPlugin {\n${methods(count)}\n}\n`;
  it('green: a new call grows it past the file limit', () =>
    assert.deepEqual(rulesOf({ path: 'src/definitions.ts', before: api(LIMITS.fileLines + 20), after: api(LIMITS.fileLines + 21) }), []));
  it('red: the same growth anywhere else', () =>
    assert.ok(rulesOf({ path: 'src/bannerHeight.ts', before: api(LIMITS.fileLines + 20), after: api(LIMITS.fileLines + 40) }).includes('file-lines')));
});

describe('one job, one system', () => {
  it('red: the Gleap JavaScript SDK outside src/web.ts', () => {
    for (const line of ["import Gleap from 'gleap';", "export const load = () => import('gleap');"]) {
      assert.ok(rulesOf({ path: 'src/index.ts', before: logic, after: `${line}\n${logic}` }).includes('web-sdk-import'), line);
    }
  });
  it('green: the Gleap JavaScript SDK in src/web.ts, and a type-only import anywhere', () => {
    assert.deepEqual(rulesOf({ path: 'src/web.ts', before: logic, after: `import Gleap from 'gleap';\n${logic}` }), []);
    assert.deepEqual(rulesOf({ path: 'src/index.ts', before: logic, after: `import type Gleap from 'gleap';\n${logic}` }), []);
  });
});
