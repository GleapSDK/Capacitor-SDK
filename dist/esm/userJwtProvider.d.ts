import type { GleapPlugin, GleapUserJwtProvider } from './definitions';
declare type IdentityPlugin = Pick<GleapPlugin, 'addListener' | 'setUserJwtProviderEnabled' | 'userJwtProviderResult'>;
/**
 * `Gleap.setUserJwtProvider(fn)`: the provider stays in JavaScript. The native (or JavaScript) SDK keeps the rules
 * (one call at a time, 10 s timeout, 30 s pause after a failure) and asks for a token with the `userJwtExpired`
 * event; the answer goes back with `userJwtProviderResult`.
 */
export declare function createUserJwtProviderSetter(plugin: IdentityPlugin): (provider: GleapUserJwtProvider | null) => Promise<void>;
/** The plugin with `setUserJwtProvider` handled in JavaScript. */
export declare function withUserJwtProvider<T extends IdentityPlugin>(plugin: T): T;
export {};
