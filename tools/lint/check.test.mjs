// node --test tools/lint/check.test.mjs (CI runs it). The lint compare on real changes in throwaway repositories, with
// this repo's ESLint and Prettier config and packages.
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { after, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import { newHits } from './compare.mjs';

const TOOL_DIR = dirname(fileURLToPath(import.meta.url));

const hit = (rule, message, source = 'line', path = 'src/a.ts') => ({ rule, message, source, path, isSilenced: false });

describe('newHits', () => {
  it('reports a hit the change adds', () => {
    const added = hit('r', 'new');
    assert.deepEqual(newHits({ before: [hit('r', 'old')], after: [hit('r', 'old'), added] }), [added]);
  });

  it('counts a hit as old when it moved, even with its line reformatted', () => {
    assert.deepEqual(newHits({ before: [hit('r', 'm', 'a(b)')], after: [hit('r', 'm', '  a(b)')] }), []);
  });

  it('counts every hit, so a second copy of an old line is new', () => {
    const line = hit('r', 'm', 'a();');
    assert.deepEqual(newHits({ before: [line], after: [line, line] }), [line]);
  });

  it('does not let a fixed hit excuse a new one in another file', () => {
    const added = hit('r', 'm', 'new();', 'src/b.ts');
    assert.deepEqual(newHits({ before: [hit('r', 'm', 'old();', 'src/a.ts')], after: [added] }), [added]);
  });
});

describe('on a real change', () => {
  const repos = [];
  after(() => repos.forEach((repo) => rmSync(repo, { recursive: true, force: true })));

  const write = (repo, files) => {
    for (const [path, text] of Object.entries(files)) {
      mkdirSync(dirname(join(repo, path)), { recursive: true });
      writeFileSync(join(repo, path), text);
    }
  };
  const git = (repo, ...args) => execFileSync('git', args, { cwd: repo, stdio: 'pipe' }).toString().trim();
  const commitAll = (repo, message) => {
    git(repo, 'add', '-A');
    git(repo, '-c', 'user.name=t', '-c', 'user.email=t@t', '-c', 'commit.gpgsign=false', 'commit', '-qm', message);
  };
  const repoWith = (files) => {
    const repo = realpathSync(mkdtempSync(join(tmpdir(), 'lint-')));
    repos.push(repo);
    git(repo, 'init', '-q', '-b', 'main');
    write(repo, { 'package.json': '{"name":"t","private":true}', ...files });
    commitAll(repo, 'base');
    git(repo, 'checkout', '-qb', 'work');
    return repo;
  };
  const run = (repo, args = ['--base', 'main', '--head', 'HEAD']) => {
    const { status, stdout, stderr } = spawnSync(process.execPath, [join(TOOL_DIR, 'check.mjs'), ...args], { cwd: repo, encoding: 'utf8' });
    return { status, output: stdout + stderr };
  };
  const change = (repo, files) => {
    write(repo, files);
    commitAll(repo, 'change');
    return run(repo);
  };

  const CLEAN = 'export const a = 1;\n';
  const OLD_VAR = 'export function old(): number {\n  var x = 1;\n  return x;\n}\n';
  const UNFORMATTED = 'export const a = {b:1}\n';

  it('stays quiet about what was already there', () => {
    const repo = repoWith({ 'src/a.ts': OLD_VAR });
    const { status, output } = change(repo, { 'src/a.ts': `${OLD_VAR}export const added = 1;\n` });
    assert.equal(status, 0, output);
    assert.ok(output.includes('0 problem(s), 0 hint(s) in 1 changed file(s)'), output);
  });

  it('fails on a new ESLint error in src/', () => {
    const repo = repoWith({ 'src/a.ts': CLEAN });
    const { status, output } = change(repo, { 'src/a.ts': `${CLEAN}${OLD_VAR}` });
    assert.equal(status, 1, output);
    assert.ok(output.includes('error  src/a.ts:3  no-var'), output);
  });

  it('shows a rule silenced with a comment, without failing', () => {
    const repo = repoWith({ 'src/a.ts': CLEAN });
    const silenced = 'export function f(): number {\n  // eslint-disable-next-line no-var -- reason\n  var x = 1;\n  return x;\n}\n';
    const { status, output } = change(repo, { 'src/a.ts': silenced });
    assert.equal(status, 0, output);
    assert.ok(output.includes('silenced  src/a.ts:3  no-var'), output);
  });

  it('fails on a comment that switches a rule off', () => {
    const repo = repoWith({ 'src/a.ts': CLEAN });
    const { status, output } = change(repo, { 'src/a.ts': `/* eslint no-var: "off" */\n${CLEAN}` });
    assert.equal(status, 1, output);
    assert.ok(output.includes('inline-eslint-config'), output);
  });

  it('fails on a new file Prettier would change', () => {
    const repo = repoWith({ 'src/a.ts': CLEAN });
    const { status, output } = change(repo, { 'src/b.ts': UNFORMATTED });
    assert.equal(status, 1, output);
    assert.ok(output.includes('error  src/b.ts:1  prettier'), output);
  });

  it('fails when a formatted file stops being formatted', () => {
    const repo = repoWith({ 'src/a.ts': CLEAN });
    const { status, output } = change(repo, { 'src/a.ts': UNFORMATTED });
    assert.equal(status, 1, output);
    assert.ok(output.includes('prettier'), output);
  });

  it('leaves the formatting of an old unformatted file alone', () => {
    const repo = repoWith({ 'src/a.ts': UNFORMATTED });
    const { status, output } = change(repo, { 'src/a.ts': `${UNFORMATTED}export const c = {d:2}\n` });
    assert.equal(status, 0, output);
  });

  it('checks Java formatting with the Java overrides', () => {
    const path = 'android/src/main/java/a/A.java';
    const formatted = 'package a;\n\npublic class A {\n\n    public int one() {\n        return 1;\n    }\n}\n';
    const repo = repoWith({ [path]: formatted });
    assert.equal(change(repo, { [path]: formatted.replace('return 1;', 'return 2;') }).status, 0);
    const { status, output } = change(repo, { [path]: formatted.replace('    public int one() {', 'public int one(){') });
    assert.equal(status, 1, output);
    assert.ok(output.includes(`error  ${path}:1  prettier`), output);
  });

  it('leaves files outside src/ and android/src/ alone', () => {
    const repo = repoWith({ 'example/a.ts': CLEAN });
    const { status, output } = change(repo, { 'example/a.ts': `${OLD_VAR}${UNFORMATTED}` });
    assert.equal(status, 0, output);
    assert.ok(output.includes('in 0 changed file(s)'), output);
  });

  it('says so when it cannot run, and lets the push go on', () => {
    const repo = repoWith({ 'src/a.ts': CLEAN });
    const { status, output } = run(repo, ['--base', 'no-such-ref', '--head', 'HEAD']);
    assert.equal(status, 0);
    assert.ok(output.includes('lint skipped'), output);
  });
});
