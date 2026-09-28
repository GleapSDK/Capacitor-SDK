/**
 * Runs fn in zone.js' root zone when zone.js is loaded (Angular / Ionic apps), so the plugin's
 * timers and body reads do not trigger Angular change detection. Without zone.js it just runs fn.
 */
export function runOutsideZone<T>(fn: () => T): T {
  const zone =
    typeof globalThis !== 'undefined'
      ? (globalThis as unknown as { Zone?: { root?: { run?: unknown } } }).Zone
      : undefined;
  const root = zone?.root;
  if (root && typeof root.run === 'function') {
    return (root as { run: (callback: () => T) => T }).run(fn);
  }
  return fn();
}
