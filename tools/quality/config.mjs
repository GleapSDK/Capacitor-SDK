// The Capacitor plugin half of the quality check: limits, scope and names from .claude/rules/code-conventions.md.
import { basename } from 'node:path';

export const LIMITS = {
  // A new file over fileLines is a warning, over newFileLines an error. An existing file over fileLines may not grow.
  fileLines: 400,
  newFileLines: 700,
  functionLines: 80,
  positionalParams: 2,
  // Growth up to this in a file or function already over its limit is a note, not a failure.
  smallGrowthLines: 10,
  lineChars: 160,
  // This share of a new file found in what the change removed elsewhere makes it moved code.
  movedShare: 0.9,
  // This share of a file in literal tables makes it data, with no line limit.
  dataShare: 0.9,
  dataMinLines: 50,
};

const OUT_OF_SCOPE = [/\.test\.[cm]?[jt]sx?$/, /\.d\.[cm]?ts$/, /\.generated\.[cm]?[jt]sx?$/];
const FIXTURE = [/(^|\/)fixtures\//, /\.fixtures?\.[cm]?[jt]sx?$/];

const NAME_PART = /^[a-z][A-Za-z0-9]*$/;

// Modules are camelCase like the rest of src (projectId.ts, logs/networkCapture.ts).
const fileNameProblem = ({ path }) => {
  const wanted = 'a file is <name>.ts, the name camelCase, like src/logs/networkCapture.ts';
  if (!path.endsWith('.ts')) return wanted;
  return NAME_PART.test(basename(path, '.ts')) ? null : wanted;
};

const folderNameProblem = (folder) =>
  NAME_PART.test(basename(folder)) ? null : 'a new folder is lowercase, or camelCase when one word is not enough';

const testCandidates = ({ path, facts }) => {
  if (!path.endsWith('.ts') || !facts.functions.size) return null;
  return [path.replace(/\.ts$/, '.test.ts')];
};

const URL_LIKE = /(^|\.)(location|url|uri|base|parsed|link|\w*(Url|URL|Uri|Location))$|^new URL\(/;
const URL_PROPERTIES = new Set(['origin', 'protocol', 'hostname', 'host', 'pathname']);

// One job, one system: the losing side of the table in .claude/rules/code-conventions.md. Type-only imports are free.
// A new package needs package.json, which AGENTS.md makes a stop-and-ask, so only the web SDK is guarded here.
const ONE_SYSTEM_BANS = [
  {
    rule: 'web-sdk-import',
    module: /^gleap$/,
    isExemptFile: (path) => path === 'src/web.ts',
    fix: 'Only src/web.ts imports the Gleap JavaScript SDK: index.ts loads it lazily, so iOS and Android apps never run it.',
  },
];

export const config = {
  limits: LIMITS,
  isInScope: (path) => /^src\/.*\.[cm]?[jt]sx?$/.test(path) && !OUT_OF_SCOPE.some((pattern) => pattern.test(path)),
  // Fixtures have no line limit and no name or test rule. Every other rule still applies to them.
  isFixture: (path) => FIXTURE.some((pattern) => pattern.test(path)),
  // docgen documents the one GleapPlugin interface, so every new call adds its signature and JSDoc here.
  registryFiles: new Set(['src/definitions.ts']),
  isModelFile: () => false,
  isParamsExemptFile: () => false,
  genericFileNames: new Set(['index', 'types', 'utils', 'helpers', 'controller', 'model']),
  defaultExports: { isExemptFile: () => false },
  fixes: {
    'default-export': 'Use a named export: a default export has no canonical name, so agents cannot find or rename it reliably.',
    'console-log':
      'Remove it: the plugin runs inside the customer\'s app. console.warn or console.error only for what the app\'s developer must act on, starting with [Gleap].',
    ...Object.fromEntries(ONE_SYSTEM_BANS.map(({ rule, fix }) => [rule, fix])),
  },
  extraCounters: ONE_SYSTEM_BANS.map(({ rule }) => rule),
  bannedImports: ONE_SYSTEM_BANS,
  // The bridge passes native data the typings leave open, so `any` and `as` often cannot be avoided, and most string
  // comparisons compare a value a native SDK or the Gleap API owns. long-line and needs-test warn only until the check
  // is required. Comment stamps only warn while old comments still carry them for new ones to copy.
  warningRules: new Set(['string-compare', 'type-assertion', 'any', 'long-line', 'needs-test', 'comment-attribution', 'comment-date']),
  // Until the check is required, growth of old code warns too. A new file over newFileLines still fails.
  legacySizeGrowthWarns: true,
  stringExemptions: {
    // `typeof` and the empty string are exempt in the core. Everything here needs a URL receiver.
    isExempt: ({ name, receiver }) => URL_PROPERTIES.has(name) && URL_LIKE.test(receiver),
  },
  // No components and no domains: the plugin is one flat src/ with logs/.
  isNewComponentBlock: () => false,
  isDomainImport: () => false,
  fileNameProblem,
  folderNameProblem,
  testCandidates,
};
