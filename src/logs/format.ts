export const MAX_LOG_LENGTH = 1000;
export const MAX_ERROR_LOG_LENGTH = 5000;
export const TRUNCATED_SUFFIX = '… [truncated]';

const MAX_DEPTH = 5;
const MAX_KEYS = 50;
const MAX_ITEMS = 50;

/** Keeps the head of a log line so the result (incl. the suffix) fits max chars. */
export function truncateLog(text: string, max: number): string {
  if (text.length <= max) {
    return text;
  }
  let end = Math.max(0, max - TRUNCATED_SUFFIX.length);
  const last = text.charCodeAt(end - 1);
  if (last >= 0xd800 && last <= 0xdbff) {
    end--;
  }
  return text.slice(0, end) + TRUNCATED_SUFFIX;
}

/**
 * Formats console arguments like the browser console does (printf-style %s %d %i %f %o %O %c in
 * the first string), with objects as depth-limited JSON. Stops early once the text exceeds the
 * budget, so logging a huge object stays cheap.
 */
export function formatConsoleArgs(args: ArrayLike<unknown>, budget: number): string {
  if (!args || args.length === 0) {
    return '';
  }
  let out = '';
  let index = 0;
  const first = args[0];
  if (typeof first === 'string' && first.indexOf('%') > -1 && args.length > 1) {
    index = 1;
    for (let i = 0; i < first.length && out.length <= budget; i++) {
      const char = first[i];
      if (char !== '%' || i + 1 >= first.length) {
        out += char;
        continue;
      }
      const specifier = first[i + 1];
      if (specifier === '%') {
        out += '%';
        i++;
        continue;
      }
      if ('sdifoOc'.indexOf(specifier) < 0 || index >= args.length) {
        out += char;
        continue;
      }
      const arg = args[index++];
      i++;
      switch (specifier) {
        case 's':
          out += typeof arg === 'string' ? arg : formatValue(arg, budget);
          break;
        case 'd':
        case 'i':
          out += formatInteger(arg);
          break;
        case 'f':
          out += formatFloat(arg);
          break;
        case 'o':
        case 'O':
          out += formatValue(arg, budget);
          break;
        default:
          // %c (CSS) consumes its argument and prints nothing.
          break;
      }
    }
  }
  for (; index < args.length && out.length <= budget; index++) {
    const arg = args[index];
    const text = typeof arg === 'string' ? arg : formatValue(arg, budget);
    out = out.length > 0 ? `${out} ${text}` : text;
  }
  return out;
}

function formatInteger(value: unknown): string {
  if (typeof value === 'number') {
    return String(value < 0 ? Math.ceil(value) : Math.floor(value));
  }
  if (typeof value === 'bigint') {
    return String(value);
  }
  if (typeof value === 'string') {
    return String(parseInt(value, 10));
  }
  return 'NaN';
}

function formatFloat(value: unknown): string {
  if (typeof value === 'number') {
    return String(value);
  }
  if (typeof value === 'string') {
    return String(parseFloat(value));
  }
  return 'NaN';
}

/** A single value as text: strings as they are, errors with their stack, objects as JSON. */
export function formatValue(value: unknown, budget: number): string {
  try {
    if (typeof value === 'string') {
      return value;
    }
    if (isError(value)) {
      return formatError(value);
    }
    if (value === null || (typeof value !== 'object' && typeof value !== 'function')) {
      return formatPrimitive(value);
    }
    const serializer = new Serializer(budget);
    serializer.write(value, 0);
    return serializer.result();
  } catch (e) {
    return '[unserializable value]';
  }
}

/** "Name: message" followed by the stack (V8 stacks already start with that line). */
export function formatError(error: unknown): string {
  try {
    const err = error as { name?: unknown; message?: unknown; stack?: unknown };
    const name = typeof err.name === 'string' && err.name ? err.name : 'Error';
    const message = typeof err.message === 'string' ? err.message : '';
    const head = message ? `${name}: ${message}` : name;
    const stack = typeof err.stack === 'string' ? err.stack.trim() : '';
    if (!stack) {
      return head;
    }
    if (stack.indexOf(head) === 0) {
      return stack;
    }
    return `${head}\n${stack}`;
  } catch (e) {
    return 'Error';
  }
}

export function isError(value: unknown): boolean {
  if (!value || typeof value !== 'object') {
    return false;
  }
  if (typeof Error !== 'undefined' && value instanceof Error) {
    return true;
  }
  const candidate = value as { name?: unknown; message?: unknown; stack?: unknown };
  return (
    typeof candidate.message === 'string' && typeof candidate.stack === 'string' && typeof candidate.name === 'string'
  );
}

function formatPrimitive(value: unknown): string {
  if (typeof value === 'bigint') {
    return `${value}n`;
  }
  if (typeof value === 'symbol') {
    return value.toString();
  }
  return String(value);
}

function describeFunction(value: unknown): string {
  const name = (value as { name?: unknown }).name;
  return `[Function: ${typeof name === 'string' && name ? name : 'anonymous'}]`;
}

function describeNode(value: unknown): string | null {
  if (typeof Node === 'undefined' || !(value instanceof Node)) {
    return null;
  }
  if (typeof Element !== 'undefined' && value instanceof Element) {
    let text = `<${value.tagName.toLowerCase()}`;
    if (value.id) {
      text += `#${value.id}`;
    }
    const className = value.getAttribute('class');
    if (className) {
      text += `.${className.trim().split(/\s+/).join('.')}`;
    }
    return `${text}>`;
  }
  return value.nodeName;
}

function constructorName(value: object): string {
  try {
    const proto = Object.getPrototypeOf(value);
    if (!proto) {
      return '';
    }
    const ctor = proto.constructor;
    const name = ctor && typeof ctor.name === 'string' ? ctor.name : '';
    return name === 'Object' ? '' : name;
  } catch (e) {
    return '';
  }
}

/** JSON-like serialiser with depth, key and length limits and circular protection. */
class Serializer {
  private parts: string[] = [];
  private length = 0;
  private ancestors: unknown[] = [];

  constructor(private readonly budget: number) {}

  result(): string {
    return this.parts.join('');
  }

  private isFull(): boolean {
    return this.length > this.budget;
  }

  private push(text: string): void {
    if (this.isFull()) {
      return;
    }
    this.parts.push(text);
    this.length += text.length;
  }

  write(value: unknown, depth: number): void {
    if (this.isFull()) {
      return;
    }
    if (value === null || value === undefined) {
      this.push(String(value));
      return;
    }
    switch (typeof value) {
      case 'string':
        this.push(JSON.stringify(value));
        return;
      case 'number':
      case 'boolean':
      case 'bigint':
      case 'symbol':
        this.push(formatPrimitive(value));
        return;
      case 'function':
        this.push(describeFunction(value));
        return;
      default:
        break;
    }
    this.writeObject(value as object, depth);
  }

  private writeObject(value: object, depth: number): void {
    if (this.ancestors.indexOf(value) > -1) {
      this.push('[Circular]');
      return;
    }
    if (isError(value)) {
      this.push(JSON.stringify(formatError(value).split('\n')[0]));
      return;
    }
    if (value instanceof Date) {
      this.push(isNaN(value.getTime()) ? '"Invalid Date"' : JSON.stringify(value.toISOString()));
      return;
    }
    if (value instanceof RegExp) {
      this.push(String(value));
      return;
    }
    const node = describeNode(value);
    if (node !== null) {
      this.push(node);
      return;
    }
    if (typeof window !== 'undefined' && value === window) {
      this.push('[Window]');
      return;
    }
    if (typeof ArrayBuffer !== 'undefined') {
      if (value instanceof ArrayBuffer) {
        this.push(`[ArrayBuffer(${value.byteLength})]`);
        return;
      }
      if (ArrayBuffer.isView(value)) {
        const length = (value as unknown as { length?: number }).length;
        this.push(
          `[${constructorName(value) || 'ArrayBufferView'}(${typeof length === 'number' ? length : value.byteLength})]`,
        );
        return;
      }
    }
    if (typeof Promise !== 'undefined' && value instanceof Promise) {
      this.push('[Promise]');
      return;
    }

    const isArray = Array.isArray(value);
    if (depth >= MAX_DEPTH) {
      this.push(isArray ? `[Array(${(value as unknown[]).length})]` : '[Object]');
      return;
    }

    this.ancestors.push(value);
    try {
      if (isArray) {
        this.writeArray(value as unknown[], depth);
      } else if (typeof Map !== 'undefined' && value instanceof Map) {
        this.writeMap(value, depth);
      } else if (typeof Set !== 'undefined' && value instanceof Set) {
        this.writeSet(value, depth);
      } else {
        this.writePlainObject(value, depth);
      }
    } finally {
      this.ancestors.pop();
    }
  }

  private writeArray(value: unknown[], depth: number): void {
    this.push('[');
    const count = Math.min(value.length, MAX_ITEMS);
    for (let i = 0; i < count && !this.isFull(); i++) {
      if (i > 0) {
        this.push(',');
      }
      this.write(value[i], depth + 1);
    }
    if (value.length > MAX_ITEMS) {
      this.push(`,"… ${value.length - MAX_ITEMS} more"`);
    }
    this.push(']');
  }

  private writeMap(value: Map<unknown, unknown>, depth: number): void {
    this.push(`Map(${value.size}) {`);
    let count = 0;
    value.forEach((item, key) => {
      if (count >= MAX_ITEMS || this.isFull()) {
        return;
      }
      if (count > 0) {
        this.push(', ');
      }
      this.write(key, depth + 1);
      this.push(' => ');
      this.write(item, depth + 1);
      count++;
    });
    this.push('}');
  }

  private writeSet(value: Set<unknown>, depth: number): void {
    this.push(`Set(${value.size}) {`);
    let count = 0;
    value.forEach((item) => {
      if (count >= MAX_ITEMS || this.isFull()) {
        return;
      }
      if (count > 0) {
        this.push(', ');
      }
      this.write(item, depth + 1);
      count++;
    });
    this.push('}');
  }

  private writePlainObject(value: object, depth: number): void {
    const record = value as { [key: string]: unknown; toJSON?: unknown };
    if (typeof record.toJSON === 'function') {
      let converted: unknown;
      try {
        converted = (record.toJSON as () => unknown)();
      } catch (e) {
        converted = undefined;
      }
      if (converted !== undefined && converted !== value) {
        this.write(converted, depth + 1);
        return;
      }
    }
    const name = constructorName(value);
    if (name) {
      this.push(`${name} `);
    }
    this.push('{');
    const keys = Object.keys(record);
    const count = Math.min(keys.length, MAX_KEYS);
    for (let i = 0; i < count && !this.isFull(); i++) {
      if (i > 0) {
        this.push(',');
      }
      this.push(`${JSON.stringify(keys[i])}:`);
      let child: unknown;
      try {
        child = record[keys[i]];
      } catch (e) {
        child = '[getter threw]';
      }
      this.write(child, depth + 1);
    }
    if (keys.length > MAX_KEYS) {
      this.push(`,"…":"${keys.length - MAX_KEYS} more keys"`);
    }
    this.push('}');
  }
}
