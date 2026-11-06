/**
 * `Gleap.setUserJwtProvider(fn)`: the provider stays in JavaScript. The native (or JavaScript) SDK keeps the rules
 * (one call at a time, 10 s timeout, 30 s pause after a failure) and asks for a token with the `userJwtExpired`
 * event; the answer goes back with `userJwtProviderResult`.
 */
export function createUserJwtProviderSetter(plugin) {
    let currentProvider = null;
    let listening = null;
    const answer = async (requestId) => {
        let token = null;
        try {
            const provider = currentProvider;
            if (provider) {
                const result = await provider();
                token = typeof result === 'string' && result.length > 0 ? result : null;
            }
        }
        catch (e) {
            token = null;
        }
        try {
            await plugin.userJwtProviderResult({ requestId, token });
        }
        catch (e) {
            // An older native build without the method: nothing waits for the answer.
        }
    };
    return async (provider) => {
        if (provider !== null && typeof provider !== 'function') {
            console.warn('Gleap: setUserJwtProvider expects a function returning a token (or a Promise of one).');
            return;
        }
        currentProvider = provider;
        if (provider && !listening) {
            listening = plugin.addListener('userJwtExpired', (data) => {
                if (data && typeof data.requestId === 'string' && data.requestId) {
                    void answer(data.requestId);
                }
            });
            await listening;
        }
        try {
            await plugin.setUserJwtProviderEnabled({ enabled: provider !== null });
        }
        catch (e) {
            console.warn('Gleap: setUserJwtProvider needs a native build of capacitor-gleap-plugin that includes it.');
        }
    };
}
// Identity methods a native build from before them does not have. Like the provider, they warn instead of
// rejecting: an app updated over the air keeps working on the older native build.
const IDENTITY_METHODS = ['setUserJwt', 'setSessionDuration', 'setAuthTokens'];
/** True for Capacitor's rejection of a method the native plugin does not implement. */
export function isUnimplemented(error) {
    const e = error;
    return !!e && (e.code === 'UNIMPLEMENTED' || (typeof e.message === 'string' && /not implemented/i.test(e.message)));
}
/** `method` of `plugin`, resolving with a warning when the native build does not have it yet. */
export function warnWhenUnimplemented(plugin, method) {
    return async (...args) => {
        const native = Reflect.get(plugin, method);
        try {
            if (typeof native !== 'function') {
                throw { code: 'UNIMPLEMENTED' };
            }
            await native.apply(plugin, args);
        }
        catch (e) {
            if (!isUnimplemented(e)) {
                throw e;
            }
            console.warn(`Gleap: ${method} needs a native build of capacitor-gleap-plugin that includes it.`);
        }
    };
}
/**
 * The plugin with `setUserJwtProvider` handled in JavaScript, and `setUserJwt`, `setSessionDuration` and
 * `setAuthTokens` warning (not rejecting) on an older native build.
 */
export function withUserJwtProvider(plugin) {
    const setUserJwtProvider = createUserJwtProviderSetter(plugin);
    const guarded = {};
    for (const method of IDENTITY_METHODS) {
        guarded[method] = warnWhenUnimplemented(plugin, method);
    }
    return new Proxy(plugin, {
        get(target, property, receiver) {
            if (property === 'setUserJwtProvider') {
                return setUserJwtProvider;
            }
            if (typeof property === 'string' && Object.prototype.hasOwnProperty.call(guarded, property)) {
                return guarded[property];
            }
            return Reflect.get(target, property, receiver);
        },
    });
}
//# sourceMappingURL=userJwtProvider.js.map