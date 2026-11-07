import type { GleapInitializeOptions, GleapPlugin } from './definitions';

/** The Project ID from `initialize` options: `projectId`, or the former `API_KEY`. */
export function resolveProjectId(options: GleapInitializeOptions | null | undefined): string | undefined {
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
export function withProjectIdInitialize<T extends Pick<GleapPlugin, 'initialize'>>(plugin: T): T {
  const initialize = (options: GleapInitializeOptions) => {
    const projectId = resolveProjectId(options);
    const native = Reflect.get(plugin, 'initialize') as GleapPlugin['initialize'];
    return native.call(plugin, projectId ? { ...options, projectId, API_KEY: projectId } : options);
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
