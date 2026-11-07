import { resolveProjectId, withProjectIdInitialize } from './projectId';

describe('initialize({ projectId })', () => {
  it('resolves projectId first, then the former API_KEY', () => {
    expect(resolveProjectId({ projectId: 'P1' })).toBe('P1');
    expect(resolveProjectId({ API_KEY: 'K1' })).toBe('K1');
    expect(resolveProjectId({ projectId: 'P1', API_KEY: 'K1' })).toBe('P1');
    expect(resolveProjectId({ projectId: '', API_KEY: 'K1' })).toBe('K1');
    expect(resolveProjectId({})).toBeUndefined();
    expect(resolveProjectId(undefined)).toBeUndefined();
  });

  it('sends the Project ID under both names so an older native build keeps working', async () => {
    const plugin = { initialize: jest.fn(async () => ({ initialized: true })), other: 1 };
    const wrapped = withProjectIdInitialize(plugin);

    await expect(wrapped.initialize({ projectId: 'P1' })).resolves.toEqual({ initialized: true });
    expect(plugin.initialize).toHaveBeenLastCalledWith({ projectId: 'P1', API_KEY: 'P1' });

    await wrapped.initialize({ API_KEY: 'K1' });
    expect(plugin.initialize).toHaveBeenLastCalledWith({ projectId: 'K1', API_KEY: 'K1' });

    expect(wrapped.other).toBe(1);
  });

  it('passes options without a key through, so the native side rejects them', async () => {
    const plugin = { initialize: jest.fn(async () => ({ initialized: true })) };
    await withProjectIdInitialize(plugin).initialize({});
    expect(plugin.initialize).toHaveBeenLastCalledWith({});
  });
});
