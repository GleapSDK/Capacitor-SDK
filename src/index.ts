import { registerPlugin } from '@capacitor/core';

import type { GleapPlugin } from './definitions';
import {
  installWebViewLogCapture,
  wrapPluginWithLogCapture,
} from './logs/webViewLogs';

const GleapNative = registerPlugin<GleapPlugin>('Gleap', {
  web: () => import('./web').then(m => new m.GleapWeb()),
});

// On iOS and Android, record the WebView's console and fetch/XHR traffic from the moment the
// plugin is imported, and hand it to the native SDK (which cannot see either on its own).
const webViewLogCapture = installWebViewLogCapture(GleapNative);

const Gleap: GleapPlugin = webViewLogCapture
  ? wrapPluginWithLogCapture(GleapNative, webViewLogCapture)
  : GleapNative;

const registeredAgentTools: {
  [name: string]: (params: any) => any | Promise<any>;
} = {};
let agentToolListenerAttached = false;

/**
 * Registers the handler for a Frontend tool defined on your AI agent in the
 * Gleap dashboard. The agent calls the handler with the configured parameters
 * and waits for the returned result (string or object, which gets
 * stringified).
 */
const registerAgentTool = async (
  name: string,
  handler: (params: any) => any | Promise<any>,
): Promise<void> => {
  if (!name || typeof handler !== 'function') {
    return;
  }

  registeredAgentTools[name] = handler;

  if (!agentToolListenerAttached) {
    agentToolListenerAttached = true;

    await Gleap.addListener('agentToolExecution', async data => {
      try {
        const { executionId, name: toolName, params } = data ?? ({} as any);
        if (!executionId || !toolName) {
          return;
        }

        let result;
        const toolHandler = registeredAgentTools[toolName];
        if (!toolHandler) {
          result = `No handler registered for tool '${toolName}' in the app. Register one via Gleap.registerAgentTool('${toolName}', handler).`;
        } else {
          try {
            const handlerResult = await toolHandler(params ?? {});
            result =
              typeof handlerResult === 'string'
                ? handlerResult
                : JSON.stringify(handlerResult ?? '');
            if (!result) {
              result = 'The action completed without returning a result.';
            }
          } catch (error: any) {
            result = `Tool execution failed: ${
              error?.message ?? 'unknown error'
            }`;
          }
        }

        await Gleap.sendAgentToolResult({ executionId, result });
      } catch (exp) {
        // Ignore.
      }
    });
  }

  await Gleap.registerAgentTool({ name });
};

export * from './definitions';
export { Gleap, registerAgentTool };
