import type { GleapPlugin, GleapUserJwtProvider, GleapUserJwtProviderBridge } from './definitions';
declare type IdentityPlugin = Pick<GleapPlugin, 'addListener'> & GleapUserJwtProviderBridge;
/**
 * `Gleap.setUserJwtProvider(fn)`: the provider stays in JavaScript. The native (or JavaScript) SDK keeps the rules
 * (one call at a time, 10 s timeout, 30 s pause after a failure) and asks for a token with the `userJwtExpired`
 * event; the answer goes back with `userJwtProviderResult`.
 */
export declare function createUserJwtProviderSetter(plugin: IdentityPlugin): (provider: GleapUserJwtProvider | null) => Promise<void>;
/** True for Capacitor's rejection of a method the native plugin does not implement. */
export declare function isUnimplemented(error: unknown): boolean;
/** `method` of `plugin`, resolving with a warning when the native build does not have it yet. */
export declare function warnWhenUnimplemented<A extends unknown[]>(plugin: object, method: string): (...args: A) => Promise<void>;
/**
 * The plugin with `setUserJwtProvider` handled in JavaScript, and `setUserJwt`, `setSessionDuration` and
 * `setAuthTokens` warning (not rejecting) on an older native build.
 */
export declare function withUserJwtProvider<T extends IdentityPlugin>(plugin: T): T;
export {};
