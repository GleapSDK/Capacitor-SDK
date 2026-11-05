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
/** The plugin with `setUserJwtProvider` handled in JavaScript. */
export function withUserJwtProvider(plugin) {
    const setUserJwtProvider = createUserJwtProviderSetter(plugin);
    return new Proxy(plugin, {
        get(target, property, receiver) {
            if (property === 'setUserJwtProvider') {
                return setUserJwtProvider;
            }
            return Reflect.get(target, property, receiver);
        },
    });
}
//# sourceMappingURL=userJwtProvider.js.map