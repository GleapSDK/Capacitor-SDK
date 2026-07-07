import type { GleapPlugin } from './definitions';
declare const Gleap: GleapPlugin;
/**
 * Registers the handler for a Frontend tool defined on your AI agent in the
 * Gleap dashboard. The agent calls the handler with the configured parameters
 * and waits for the returned result (string or object, which gets
 * stringified).
 */
declare const registerAgentTool: (name: string, handler: (params: any) => any | Promise<any>) => Promise<void>;
export * from './definitions';
export { Gleap, registerAgentTool };
