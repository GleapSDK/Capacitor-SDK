import { createUserJwtProviderSetter } from './userJwtProvider';

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
