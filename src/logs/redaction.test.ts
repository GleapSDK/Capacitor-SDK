import { describe, expect, it } from '@jest/globals';

import type { GleapNetworkLogEntry } from '../definitions';

import {
  BODY_NOT_CAPTURED,
  REDACTED_VALUE,
  createRedactionRules,
  isBlacklistedUrl,
  redactFormBody,
  redactHeaders,
  redactJsonBody,
  redactNetworkLogs,
  redactUrl,
  stripNetworkLogEntry,
} from './redaction';

const entry = (overrides: Partial<GleapNetworkLogEntry> = {}): GleapNetworkLogEntry => ({
  date: '2026-09-27T10:00:00.123Z',
  type: 'POST',
  url: 'https://api.example.com/login',
  duration: 12,
  success: true,
  request: {
    headers: { 'content-type': 'application/json' },
    payload: '{"email":"a@b.c","password":"hunter2"}',
  },
  response: {
    status: 200,
    statusText: 'OK',
    headers: { 'content-type': 'application/json' },
    responseText: '{"token":"abc","user":{"id":1}}',
  },
  ...overrides,
});

describe('createRedactionRules', () => {
  it('trims, lowercases and dedupes props and blacklist entries', () => {
    const rules = createRedactionRules(
      [' Password ', 'password', 'User.Token', '', 42 as any],
      ['API.Example.com', 'api.example.com', null as any],
    );
    expect(Array.from(rules.props)).toEqual(['password', 'user.token']);
    expect(rules.paths).toEqual([['user', 'token']]);
    expect(rules.blacklist).toEqual(['gleap.io', 'gleap.ai', 'api.example.com']);
  });
});

describe('blacklist', () => {
  it('always drops the Gleap hosts', () => {
    const rules = createRedactionRules([], []);
    expect(isBlacklistedUrl('https://api.gleap.io/sessions', rules)).toBe(true);
    expect(isBlacklistedUrl('https://ws.gleap.ai/x', rules)).toBe(true);
    expect(isBlacklistedUrl('https://api.example.com/x', rules)).toBe(false);
  });

  it('matches configured entries as case-insensitive substrings', () => {
    const rules = createRedactionRules([], ['Example.com/private']);
    expect(isBlacklistedUrl('https://example.com/private/1', rules)).toBe(true);
    expect(isBlacklistedUrl('https://example.com/public', rules)).toBe(false);
  });

  it('removes blacklisted entries from the list', () => {
    const rules = createRedactionRules([], ['tracking']);
    const logs = redactNetworkLogs(
      [
        entry({ url: 'https://api.gleap.io/widget' }),
        entry({ url: 'https://tracking.example.com/p' }),
        entry({ url: 'https://api.example.com/ok' }),
      ],
      rules,
    );
    expect(logs.map((log) => log.url)).toEqual(['https://api.example.com/ok']);
  });
});

describe('headers', () => {
  it('removes headers named like a prop, case-insensitive', () => {
    const rules = createRedactionRules(['X-Api-Key'], []);
    expect(redactHeaders({ 'x-api-key': 'secret', 'X-API-KEY': 's2', accept: '*/*' }, rules)).toEqual({
      accept: '*/*',
    });
  });

  it('always masks the credential headers but keeps their names', () => {
    const rules = createRedactionRules([], []);
    expect(
      redactHeaders(
        {
          Authorization: 'Bearer abc',
          'proxy-authorization': 'Basic x',
          Cookie: 'sid=1',
          'set-cookie': 'sid=2',
          'content-type': 'application/json',
        },
        rules,
      ),
    ).toEqual({
      Authorization: REDACTED_VALUE,
      'proxy-authorization': REDACTED_VALUE,
      Cookie: REDACTED_VALUE,
      'set-cookie': REDACTED_VALUE,
      'content-type': 'application/json',
    });
  });

  it('removes a credential header entirely when it is a prop', () => {
    const rules = createRedactionRules(['authorization'], []);
    expect(redactHeaders({ Authorization: 'Bearer abc' }, rules)).toEqual({});
  });
});

describe('JSON bodies', () => {
  it('removes matching keys at any depth, also inside arrays, case-insensitive', () => {
    const rules = createRedactionRules(['password', 'TOKEN'], []);
    const body = JSON.stringify({
      Password: 'a',
      user: { name: 'n', password: 'b', sessions: [{ token: 't1', id: 1 }] },
      list: [[{ Token: 't2' }]],
    });
    expect(JSON.parse(redactJsonBody(body, rules))).toEqual({
      user: { name: 'n', sessions: [{ id: 1 }] },
      list: [[{}]],
    });
  });

  it('applies dotted props as a path from the root and as a whole key', () => {
    const rules = createRedactionRules(['user.password'], []);
    const body = JSON.stringify({
      user: { password: 'root', name: 'n' },
      nested: { user: { password: 'kept' } },
      'user.password': 'whole-key',
      deep: { 'User.Password': 'whole-key-deep' },
      users: [{ password: 'kept-in-array' }],
    });
    expect(JSON.parse(redactJsonBody(body, rules))).toEqual({
      user: { name: 'n' },
      nested: { user: { password: 'kept' } },
      deep: {},
      users: [{ password: 'kept-in-array' }],
    });
  });

  it('walks arrays along a dotted path', () => {
    const rules = createRedactionRules(['items.secret'], []);
    expect(redactJsonBody('[{"items":[{"secret":1,"a":2}]},{"items":{"SECRET":3}}]', rules)).toBe(
      '[{"items":[{"a":2}]},{"items":{}}]',
    );
  });

  it('returns an unchanged body untouched (no re-serialisation)', () => {
    const rules = createRedactionRules(['password'], []);
    const body = '{ "email" : "a@b.c",\n  "n": 1.50 }';
    expect(redactJsonBody(body, rules)).toBe(body);
  });

  it('leaves bodies that do not parse as they are (no double encoding)', () => {
    const rules = createRedactionRules(['password'], []);
    const truncated = '{"password":"x","other":"y"\n… [truncated, 200000 bytes]';
    expect(redactJsonBody(truncated, rules)).toBe(truncated);
    expect(redactJsonBody('"password"', rules)).toBe('"password"');
    expect(redactJsonBody('password=1', rules)).toBe('password=1');
  });

  it('does nothing without props', () => {
    const rules = createRedactionRules([], []);
    const body = '{"password":"x"}';
    expect(redactJsonBody(body, rules)).toBe(body);
  });
});

describe('form bodies and query parameters', () => {
  it('removes form fields named like a prop, case-insensitive, keeping the encoding of the rest', () => {
    const rules = createRedactionRules(['password'], []);
    expect(redactFormBody('user=a%20b&PassWord=secret&x=1+2&password', rules)).toBe('user=a%20b&x=1+2');
  });

  it('decodes encoded field names before matching', () => {
    const rules = createRedactionRules(['api key'], []);
    expect(redactFormBody('api%20key=1&api+key=2&other=3', rules)).toBe('other=3');
  });

  it('treats bracket names like nested keys', () => {
    const rules = createRedactionRules(['password', 'card.number'], []);
    expect(redactFormBody('user%5Bpassword%5D=a&user[name]=n&card[number]=4242&card[cvc]=1', rules)).toBe(
      'user[name]=n&card[cvc]=1',
    );
  });

  it('returns the body untouched when nothing matched', () => {
    const rules = createRedactionRules(['password'], []);
    const body = 'a=1&b=%20';
    expect(redactFormBody(body, rules)).toBe(body);
  });

  it('removes query parameters and keeps the rest of the URL as it was', () => {
    const rules = createRedactionRules(['token', 'Session'], []);
    expect(redactUrl('https://x.com/a/b?q=hello%20world&TOKEN=abc&session=1#frag', rules)).toBe(
      'https://x.com/a/b?q=hello%20world#frag',
    );
    expect(redactUrl('https://x.com/a?token=abc', rules)).toBe('https://x.com/a');
    const untouched = 'https://x.com/a?q=a+b&z=%7E';
    expect(redactUrl(untouched, rules)).toBe(untouched);
  });
});

describe('redactNetworkLogs', () => {
  it('redacts URL, headers and both bodies of an entry', () => {
    const rules = createRedactionRules(['password', 'token', 'x-trace'], []);
    const [log] = redactNetworkLogs(
      [
        entry({
          url: 'https://api.example.com/login?token=1&keep=2',
          request: {
            headers: {
              'content-type': 'application/json',
              authorization: 'Bearer x',
              'X-Trace': 't',
            },
            payload: '{"email":"a@b.c","password":"hunter2"}',
          },
          response: {
            status: 200,
            statusText: 'OK',
            headers: { 'content-type': 'application/json', 'x-trace': 't' },
            responseText: '{"token":"abc","user":{"id":1}}',
          },
        }),
      ],
      rules,
    );
    expect(log).toEqual({
      date: '2026-09-27T10:00:00.123Z',
      type: 'POST',
      url: 'https://api.example.com/login?keep=2',
      duration: 12,
      success: true,
      request: {
        headers: { 'content-type': 'application/json', authorization: REDACTED_VALUE },
        payload: '{"email":"a@b.c"}',
      },
      response: {
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
        responseText: '{"user":{"id":1}}',
      },
    });
  });

  it('redacts urlencoded request bodies, also without a content type', () => {
    const rules = createRedactionRules(['password'], []);
    const [withType, withoutType, plainText] = redactNetworkLogs(
      [
        entry({
          request: {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
            payload: 'user=a&password=b',
          },
        }),
        entry({ request: { headers: {}, payload: 'user=a&password=b' } }),
        entry({
          request: { headers: { 'content-type': 'text/plain' }, payload: 'password=b' },
        }),
      ],
      rules,
    );
    expect(withType.request?.payload).toBe('user=a');
    expect(withoutType.request?.payload).toBe('user=a');
    expect(plainText.request?.payload).toBe('password=b');
  });

  it('keeps failed requests (errorText, no status) and masks their headers', () => {
    const rules = createRedactionRules([], []);
    const [log] = redactNetworkLogs(
      [
        entry({
          success: false,
          request: { headers: { Cookie: 'a=b' }, payload: '' },
          response: { errorText: 'TypeError: Failed to fetch' },
        }),
      ],
      rules,
    );
    expect(log.request?.headers).toEqual({ Cookie: REDACTED_VALUE });
    expect(log.response).toEqual({ errorText: 'TypeError: Failed to fetch' });
  });

  it('does not modify the input entries', () => {
    const rules = createRedactionRules(['password'], []);
    const input = entry({
      request: {
        headers: { authorization: 'Bearer x' },
        payload: '{"password":"p"}',
      },
    });
    const snapshot = JSON.parse(JSON.stringify(input));
    redactNetworkLogs([input], rules);
    expect(input).toEqual(snapshot);
  });

  it('strips an entry whose body cannot be redacted instead of sending it unredacted', () => {
    const rules = createRedactionRules(['a.b'], []);
    let deep = '{"a":';
    for (let i = 0; i < 70000; i++) {
      deep += '[';
    }
    deep += '1';
    for (let i = 0; i < 70000; i++) {
      deep += ']';
    }
    deep += ',"password":"p"}';
    const [log] = redactNetworkLogs(
      [
        entry({
          url: 'https://api.example.com/x?token=1',
          request: { headers: { authorization: 'Bearer x' }, payload: deep },
        }),
      ],
      rules,
    );
    expect(log.url).toBe('https://api.example.com/x');
    expect(log.request).toEqual({ headers: {}, payload: BODY_NOT_CAPTURED });
    expect(log.response?.responseText).toBe(BODY_NOT_CAPTURED);
  });
});

describe('stripNetworkLogEntry', () => {
  it('keeps the error of a failed request', () => {
    expect(
      stripNetworkLogEntry(entry({ success: false, response: { errorText: 'Request timed out' } })).response,
    ).toEqual({ errorText: 'Request timed out' });
  });
});
