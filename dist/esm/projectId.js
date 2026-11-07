/** The Project ID from `initialize` options: `projectId`, or the former `API_KEY`. */
export function resolveProjectId(options) {
    if (!options || typeof options !== 'object') {
        return undefined;
    }
    if (typeof options.projectId === 'string' && options.projectId.length > 0) {
        return options.projectId;
    }
    if (typeof options.API_KEY === 'string' && options.API_KEY.length > 0) {
        return options.API_KEY;
    }
    return undefined;
}
/**
 * `initialize({ projectId })` sends the Project ID under both names, so a native build that only reads
 * `API_KEY` (an app updated over the air) keeps working.
 */
export function withProjectIdInitialize(plugin) {
    const initialize = (options) => {
        const projectId = resolveProjectId(options);
        const native = Reflect.get(plugin, 'initialize');
        return native.call(plugin, projectId ? Object.assign(Object.assign({}, options), { projectId, API_KEY: projectId }) : options);
    };
    return new Proxy(plugin, {
        get(target, property, receiver) {
            if (property === 'initialize') {
                return initialize;
            }
            return Reflect.get(target, property, receiver);
        },
    });
}
//# sourceMappingURL=projectId.js.map