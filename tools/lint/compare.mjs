// What a change adds, by comparing the findings before it with those after it. There is no line mapping, so a hit counts
// as old wherever it went: moved within a file, split off into a new one, or reformatted.

const withoutLineNumbers = (message) => message.replace(/\(at line \d+\)/g, '');
// Silenced apart from active in both: a silenced old hit must not excuse a new active one with the same text.
const exactOf = ({ rule, message, source, isSilenced }) => [rule, withoutLineNumbers(message), source.trim(), Boolean(isSilenced)].join('\0');
// A line reformatted, or a name changed around an old hit. Only within the file, so that fixing one hit does not excuse
// a new one elsewhere.
const looseOf = ({ path, rule, message, isSilenced }) => [path, rule, withoutLineNumbers(message).replace(/(["'`]).*?\1/g, '""'), Boolean(isSilenced)].join('\0');

const take = ({ pool, key }) => {
  const count = pool.get(key) ?? 0;
  if (count) pool.set(key, count - 1);
  return count > 0;
};

const countsOf = ({ hits, keyOf }) => {
  const pool = new Map();
  for (const hit of hits) pool.set(keyOf(hit), (pool.get(keyOf(hit)) ?? 0) + 1);
  return pool;
};

export const newHits = ({ before, after }) => {
  const exact = countsOf({ hits: before, keyOf: exactOf });
  const loose = countsOf({ hits: before, keyOf: looseOf });
  // The same line first, so that of two alike hits the one on a new line is the one reported.
  const unmatched = after.filter((hit) => {
    const isOld = take({ pool: exact, key: exactOf(hit) });
    if (isOld) take({ pool: loose, key: looseOf(hit) });
    return !isOld;
  });
  return unmatched.filter((hit) => !take({ pool: loose, key: looseOf(hit) }));
};
