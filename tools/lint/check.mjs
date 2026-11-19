#!/usr/bin/env node
// ESLint and Prettier on the changed files, reporting only what the change adds. The rules are the plugin template's,
// from package.json: `eslintConfig` (@ionic/eslint-config/recommended) and `prettier` (@ionic/prettier-config), the
// same `npm run lint` runs on the whole repo, which has old findings and so cannot block anything.
//
//   check.mjs [--base <ref>] [--head <ref>]    without --base the closest remote branch, without --head the working tree
//
// ESLint: a hit is new when the file did not have it before (compare.mjs). Prettier judges whole files: a new file, or
// one that was formatted where the branch left its base, must be formatted. Never format an old file to pass.
//
// Exit codes: 0 nothing blocking, 1 a new problem. When it cannot run, without node_modules for example, it says so and
// exits 0, so that a push hook lets the push go on.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

import { newHits } from './compare.mjs';

// The config and the packages come from here: in CI the base branch's copy, so a PR cannot loosen its own rules.
const TOOL_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
// A control character in a name would break the line-based git cat-file --batch behind readBlobs, for every other file
// too, and could rewrite the terminal when printed.
const isSafeName = (path) => !/[\x00-\x1f\x7f]/.test(path);
const isEslintFile = (path) => /^src\/.*\.ts$/.test(path) && isSafeName(path);
const isPrettierFile = (path) => /^(src\/.*\.ts|android\/src\/.*\.java)$/.test(path) && isSafeName(path);
// An eslint-disable comment left over for a rule this config does not have. ESLint reports it as an error of that rule.
const UNKNOWN_RULE = /^Definition for rule .* (was )?not found/;
// A comment like /* eslint rule: "off" */ switches a rule off without a trace in ESLint's results. eslint-disable
// comments do leave one. Read from the parsed comments, so that the same text in a string does not count.
const isRuleComment = ({ type, value }) => type === 'Block' && /^\s*eslint\s/.test(value);
const ALLOW_HELP = 'Only if it is a false alarm: `// eslint-disable-next-line <rule> -- <reason>` on the line above. Reviewers see it.';
const FORMAT_HELP = 'Format only that file: `npx prettier --plugin=prettier-plugin-java --write <file>`. Never `npm run fmt`: it rewrites every old file.';

const ruleCommentLines = ({ parser, path, text }) => {
  if (!text.includes('eslint')) return [];
  try {
    const { ast } = parser.parseForESLint(text, { filePath: path, comment: true, loc: true });
    return ast.comments.filter(isRuleComment).map(({ loc }) => loc.start.line);
  } catch {
    return [];
  }
};

const lint = async ({ eslint, parser, path, text }) => {
  const [result] = await eslint.lintText(text, { filePath: join(TOOL_ROOT, path), warnIgnored: false });
  if (!result) return [];
  const lines = text.split('\n');
  const hit = (message, isSilenced) => ({
    path,
    line: message.line,
    rule: message.ruleId,
    message: message.message,
    isError: message.severity === 2,
    isSilenced,
    source: lines[message.line - 1] ?? '',
  });
  const isRuleHit = ({ ruleId, message }) => ruleId && !UNKNOWN_RULE.test(message);
  const inlineRules = ruleCommentLines({ parser, path, text }).map((line) =>
    hit({ line, ruleId: 'inline-eslint-config', message: 'Set rules in package.json (eslintConfig), not in a comment.', severity: 2 }, false),
  );
  return [
    ...inlineRules,
    ...result.messages.filter(isRuleHit).map((message) => hit(message, false)),
    ...result.suppressedMessages.filter(isRuleHit).map((message) => hit(message, true)),
  ];
};

const lintAll = async ({ eslint, parser, files }) => {
  const hits = [];
  for (const { path, text } of files) hits.push(...(await lint({ eslint, parser, path, text })));
  return hits;
};

// The options as the CLI finds them for that path: package.json's `prettier`, with its overrides for Java.
const isFormatted = async ({ prettier, plugins, path, text }) => {
  const filepath = join(TOOL_ROOT, path);
  try {
    const options = await prettier.resolveConfig(filepath);
    return await prettier.check(text, { ...options, filepath, plugins });
  } catch {
    // Code Prettier cannot parse is the compiler's and ESLint's to report.
    return true;
  }
};

const unformattedFiles = async ({ prettier, plugins, files }) => {
  const found = [];
  for (const { path, before, after } of files) {
    const wasFormatted = before === undefined || (await isFormatted({ prettier, plugins, path, text: before }));
    if (wasFormatted && !(await isFormatted({ prettier, plugins, path, text: after }))) found.push(path);
  }
  return found;
};

const levelOf = ({ isError, isSilenced }) => (isSilenced ? 'silenced' : isError ? 'error' : 'warning');

const printReport = ({ hits, unformatted }) => {
  for (const hit of hits) console.log(`${levelOf(hit)}  ${hit.path}:${hit.line}  ${hit.rule}\n  ${hit.message}\n`);
  for (const path of unformatted) console.log(`error  ${path}:1  prettier\n  Prettier would change it: a new file, or one that was formatted before this change.\n`);
};

const loadTools = () => {
  // Loaded here, so that a missing package ends in the catch below and not in a stack trace.
  const fromRoot = createRequire(join(TOOL_ROOT, 'package.json'));
  const { ESLint } = fromRoot('eslint');
  const parser = fromRoot('@typescript-eslint/parser');
  const prettier = fromRoot('prettier');
  const { eslintConfig } = JSON.parse(readFileSync(join(TOOL_ROOT, 'package.json'), 'utf8'));
  const eslint = new ESLint({ cwd: TOOL_ROOT, useEslintrc: false, baseConfig: eslintConfig, resolvePluginsRelativeTo: TOOL_ROOT });
  return { eslint, parser, prettier, plugins: [fromRoot.resolve('prettier-plugin-java')] };
};

const main = async () => {
  const tools = loadTools();
  const { changedFiles, forkPointOf, readBlobs, repoRootOf, resolveBase } = await import('../quality/changes.mjs');

  const { values } = parseArgs({ options: { base: { type: 'string' }, head: { type: 'string' } } });
  const root = repoRootOf(process.cwd());
  if (!root) throw new Error('not inside a git repository');
  const base = values.base ?? resolveBase({ root });
  const fork = forkPointOf({ root, base, head: values.head });

  const changes = changedFiles({ root, fork, head: values.head }).filter(({ path, isDeleted }) => !isDeleted && isPrettierFile(path));
  const oldBlobs = readBlobs({ root, rev: fork, paths: changes.map(({ path, previousPath }) => previousPath ?? path) });
  const paths = changes.map(({ path }) => path);
  const newBlobs = values.head ? readBlobs({ root, rev: values.head, paths }) : null;
  const readNew = (path) => (newBlobs ? newBlobs.get(path) : readFileSync(join(root, path), 'utf8'));
  // Under the new name, so that a file moved into the rules' reach does not count its old hits as new.
  const files = changes.map(({ path, previousPath }) => ({ path, before: oldBlobs.get(previousPath ?? path), after: readNew(path) }));

  const linted = files.filter(({ path }) => isEslintFile(path));
  const before = await lintAll({ ...tools, files: linted.filter(({ before }) => before !== undefined).map(({ path, before }) => ({ path, text: before })) });
  const after = await lintAll({ ...tools, files: linted.map(({ path, after }) => ({ path, text: after })) });
  // A silenced hint is a decision someone made. A silenced error is shown, so reviewers see the check was switched off.
  const hits = newHits({ before, after }).filter(({ isError, isSilenced }) => isError || !isSilenced);
  const unformatted = await unformattedFiles({ ...tools, files });

  printReport({ hits, unformatted });
  const errors = hits.filter(({ isError, isSilenced }) => isError && !isSilenced).length + unformatted.length;
  if (hits.some(({ isError, isSilenced }) => isError && !isSilenced)) console.log(`${ALLOW_HELP}\n`);
  if (unformatted.length) console.log(`${FORMAT_HELP}\n`);
  console.log(`lint: ${errors} problem(s), ${hits.length + unformatted.length - errors} hint(s) in ${files.length} changed file(s), compared with ${fork.slice(0, 10)}.`);
  return errors ? 1 : 0;
};

try {
  process.exitCode = await main();
} catch (error) {
  console.error(`lint skipped, it could not run: ${error.message}. If packages are missing or old, run npm ci.`);
}
