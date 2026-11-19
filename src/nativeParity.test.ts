import { describe, expect, it } from '@jest/globals';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as ts from 'typescript';

// The native plugins must answer every call definitions.ts declares, under the same name, and send the events it
// declares. Nothing compiles Swift or Java on most machines, so this reads the sources. web.ts is held to the same
// interfaces by `implements`, which tsc checks.

const ROOT = join(__dirname, '..');
const read = (path: string): string => readFileSync(join(ROOT, path), 'utf8');

const SWIFT = 'ios/Sources/GleapPlugin/GleapPlugin.swift';
const JAVA = 'android/src/main/java/io/gleapplugins/capacitor/GleapPlugin.java';
const API_INTERFACES = ['GleapPlugin', 'GleapUserJwtProviderBridge'];

// Calls that never reach native code: Capacitor itself answers addListener, and src/userJwtProvider.ts keeps the
// provider in JavaScript and talks to native through setUserJwtProviderEnabled and userJwtProviderResult.
const JAVASCRIPT_ONLY = ['addListener', 'setUserJwtProvider'];

const sorted = (names: Iterable<string>): string[] => [...new Set(names)].sort();
const matches = (text: string, pattern: RegExp): string[] => [...text.matchAll(pattern)].map((match) => match[1]);

const definitions = ts.createSourceFile('definitions.ts', read('src/definitions.ts'), ts.ScriptTarget.Latest, true);
const apiMembers = definitions.statements
  .filter(ts.isInterfaceDeclaration)
  .filter((node) => API_INTERFACES.includes(node.name.text))
  .flatMap((node) => [...node.members]);

const declaredCalls = sorted(
  apiMembers.filter(ts.isMethodSignature).map((member) => member.name.getText(definitions)),
).filter((name) => !JAVASCRIPT_ONLY.includes(name));

const declaredEvents = sorted(
  apiMembers
    .filter(ts.isMethodSignature)
    .filter((member) => member.name.getText(definitions) === 'addListener')
    .map((member) => member.parameters[0]?.type)
    .filter((type): type is ts.LiteralTypeNode => Boolean(type) && ts.isLiteralTypeNode(type as ts.Node))
    .map((type) => (type.literal as ts.StringLiteral).text),
);

const swift = read(SWIFT);
const java = read(JAVA);

describe('native parity with definitions.ts', () => {
  it('finds the calls and events it compares', () => {
    expect(declaredCalls.length).toBeGreaterThan(50);
    expect(declaredEvents.length).toBeGreaterThan(0);
  });

  it('iOS registers every declared call, and nothing else', () => {
    expect(sorted(matches(swift, /CAPPluginMethod\(name:\s*"(\w+)"/g))).toEqual(declaredCalls);
  });

  it('iOS implements every call it registers', () => {
    expect(sorted(matches(swift, /@objc\s+func\s+(\w+)\(\s*_\s+call:\s*CAPPluginCall\s*\)/g))).toEqual(declaredCalls);
  });

  it('Android implements every declared call as a @PluginMethod, and nothing else', () => {
    expect(sorted(matches(java, /@PluginMethod\b[^\n]*\s+public\s+void\s+(\w+)\s*\(\s*PluginCall\b/g))).toEqual(
      declaredCalls,
    );
  });

  it('both native plugins send only the events definitions.ts declares, and each of them', () => {
    expect(sorted(matches(swift, /notifyListeners\(\s*"([\w-]+)"/g))).toEqual(declaredEvents);
    expect(sorted(matches(java, /notifyListeners\(\s*"([\w-]+)"/g))).toEqual(declaredEvents);
  });
});
