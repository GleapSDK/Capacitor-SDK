// After every edit: the quality check on that one file, so the agent sees problems at once. dist/ is what
// `npm run build` makes from src/, so a hand edit there is refused.
import { existsSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';

import { repoRootOf } from '../../tools/quality/changes.mjs';
import { projectDirOf, runEditHook } from '../../tools/quality/hooks.mjs';

const projectDir = projectDirOf(import.meta.url);

const handEditOfBuildOutput = (absolute) => {
  const root = (existsSync(dirname(absolute)) && repoRootOf(dirname(absolute))) || projectDir;
  if (!relative(root, absolute).startsWith('dist/')) return null;
  return 'dist/ is build output. Change src/ instead and run `npm run build`; commit what it writes to dist/ and README.md.';
};

await runEditHook({ projectDir, toolPath: join(projectDir, 'tools/quality/check.mjs'), extraCheck: handEditOfBuildOutput });
