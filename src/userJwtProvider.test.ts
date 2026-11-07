import { createUserJwtProviderSetter, withUserJwtProvider } from './userJwtProvider';

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

function fakePlugin() {
  const listeners: { [event: string]: (data: any) => void } = {};
  const plugin = {
    addListener: jest.fn(async (event: string, listener: (data: any) => void) => {
      listeners[event] = listener;
      return { remove: async () => undefined };
    }),
    setUserJwtProviderEnabled: jest.fn(async () => undefined),
    userJwtProviderResult: jest.fn(async () => undefined),
  };
  return { plugin, emit: (event: string, data: any) => listeners[event]?.(data) };
}

describe('setUserJwtProvider', () => {
  it('answers userJwtExpired with the provider token', async () => {
    const { plugin, emit } = fakePlugin();
    const setUserJwtProvider = createUserJwtProviderSetter(plugin as any);

    await setUserJwtProvider(async () => 'fresh.jwt.token');
    expect(plugin.setUserJwtProviderEnabled).toHaveBeenCalledWith({ enabled: true });

    emit('userJwtExpired', { requestId: 'r1' });
    await flush();

    expect(plugin.userJwtProviderResult).toHaveBeenCalledWith({ requestId: 'r1', token: 'fresh.jwt.token' });
  });

  it('answers null when the provider fails, and after it was removed', async () => {
    const { plugin, emit } = fakePlugin();
    const setUserJwtProvider = createUserJwtProviderSetter(plugin as any);

    await setUserJwtProvider(() => Promise.reject(new Error('offline')));
    emit('userJwtExpired', { requestId: 'r1' });
    await flush();
    expect(plugin.userJwtProviderResult).toHaveBeenCalledWith({ requestId: 'r1', token: null });

    await setUserJwtProvider(null);
    expect(plugin.setUserJwtProviderEnabled).toHaveBeenLastCalledWith({ enabled: false });
    emit('userJwtExpired', { requestId: 'r2' });
    await flush();
    expect(plugin.userJwtProviderResult).toHaveBeenCalledWith({ requestId: 'r2', token: null });
  });

  it('listens once however often the provider is set', async () => {
    const { plugin } = fakePlugin();
    const setUserJwtProvider = createUserJwtProviderSetter(plugin as any);

    await setUserJwtProvider(() => 'a.b.c');
    await setUserJwtProvider(() => 'd.e.f');

    expect(plugin.addListener).toHaveBeenCalledTimes(1);
  });
});

describe('identity methods on an older native build', () => {
  const unimplemented = () =>
    Promise.reject(
      Object.assign(new Error('"Gleap.setUserJwt()" is not implemented on ios'), { code: 'UNIMPLEMENTED' }),
    );

  it('warns instead of rejecting', async () => {
    const { plugin } = fakePlugin();
    const native = Object.assign(plugin, {
      setUserJwt: jest.fn(unimplemented),
      setSessionDuration: jest.fn(unimplemented),
      setAuthTokens: jest.fn(unimplemented),
    });
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const gleap = withUserJwtProvider(native as any);

    await expect(gleap.setUserJwt({ token: 'a.b.c' })).resolves.toBeUndefined();
    await expect(gleap.setSessionDuration({ milliseconds: 1000 })).resolves.toBeUndefined();
    await expect(gleap.setAuthTokens({ tokens: { api: 'x' } })).resolves.toBeUndefined();
    expect(native.setUserJwt).toHaveBeenCalledWith({ token: 'a.b.c' });
    expect(warn).toHaveBeenCalledTimes(3);
    warn.mockRestore();
  });

  it('passes calls and other errors through', async () => {
    const { plugin } = fakePlugin();
    const native = Object.assign(plugin, {
      setUserJwt: jest.fn(async () => undefined),
      setAuthTokens: jest.fn(() => Promise.reject(new Error('bad tokens'))),
    });
    const gleap = withUserJwtProvider(native as any);

    await gleap.setUserJwt({ token: 'a.b.c' });
    expect(native.setUserJwt).toHaveBeenCalledWith({ token: 'a.b.c' });
    await expect(gleap.setAuthTokens({ tokens: {} })).rejects.toThrow('bad tokens');
  });
});
