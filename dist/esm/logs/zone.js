/**
 * Runs fn in zone.js' root zone when zone.js is loaded (Angular / Ionic apps), so the plugin's
 * timers and body reads do not trigger Angular change detection. Without zone.js it just runs fn.
 */
export function runOutsideZone(fn) {
    const zone = typeof globalThis !== 'undefined'
        ? globalThis.Zone
        : undefined;
    const root = zone === null || zone === void 0 ? void 0 : zone.root;
    if (root && typeof root.run === 'function') {
        return root.run(fn);
    }
    return fn();
}
//# sourceMappingURL=zone.js.map