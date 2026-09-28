/**
 * Runs fn in zone.js' root zone when zone.js is loaded (Angular / Ionic apps), so the plugin's
 * timers and body reads do not trigger Angular change detection. Without zone.js it just runs fn.
 */
export declare function runOutsideZone<T>(fn: () => T): T;
