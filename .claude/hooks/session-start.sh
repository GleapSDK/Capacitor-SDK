#!/bin/sh
# At the start of a session: the push hook, and the TypeScript the quality check parses with, each only when missing.
# package.json ships in the npm package, so this repo has no npm `prepare` script to do it.
cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0
sh .githooks/install.sh
if [ ! -d tools/quality/node_modules/typescript ]; then
  npm ci --prefix tools/quality --no-audit --no-fund --silent >/dev/null 2>&1 ||
    echo "Could not install tools/quality's TypeScript; the quality check cannot run until npm ci --prefix tools/quality works."
fi
exit 0
