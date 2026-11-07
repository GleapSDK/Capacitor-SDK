import type { GleapInitializeOptions, GleapPlugin } from './definitions';
/** The Project ID from `initialize` options: `projectId`, or the former `API_KEY`. */
export declare function resolveProjectId(options: GleapInitializeOptions | null | undefined): string | undefined;
/**
 * `initialize({ projectId })` sends the Project ID under both names, so a native build that only reads
 * `API_KEY` (an app updated over the air) keeps working.
 */
export declare function withProjectIdInitialize<T extends Pick<GleapPlugin, 'initialize'>>(plugin: T): T;
