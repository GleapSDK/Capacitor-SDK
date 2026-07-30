import { registerPlugin } from '@capacitor/core';
const Gleap = registerPlugin('Gleap', {
    web: () => import('./web').then(m => new m.GleapWeb()),
});
const registeredAgentTools = {};
let agentToolListenerAttached = false;
/**
 * Registers the handler for a Frontend tool defined on your AI agent in the
 * Gleap dashboard. The agent calls the handler with the configured parameters
 * and waits for the returned result (string or object, which gets
 * stringified).
 */
const registerAgentTool = async (name, handler) => {
    if (!name || typeof handler !== 'function') {
        return;
    }
    registeredAgentTools[name] = handler;
    if (!agentToolListenerAttached) {
        agentToolListenerAttached = true;
        await Gleap.addListener('agentToolExecution', async (data) => {
            var _a;
            try {
                const { executionId, name: toolName, params } = data !== null && data !== void 0 ? data : {};
                if (!executionId || !toolName) {
                    return;
                }
                let result;
                const toolHandler = registeredAgentTools[toolName];
                if (!toolHandler) {
                    result = `No handler registered for tool '${toolName}' in the app. Register one via Gleap.registerAgentTool('${toolName}', handler).`;
                }
                else {
                    try {
                        const handlerResult = await toolHandler(params !== null && params !== void 0 ? params : {});
                        result =
                            typeof handlerResult === 'string'
                                ? handlerResult
                                : JSON.stringify(handlerResult !== null && handlerResult !== void 0 ? handlerResult : '');
                        if (!result) {
                            result = 'The action completed without returning a result.';
                        }
                    }
                    catch (error) {
                        result = `Tool execution failed: ${(_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : 'unknown error'}`;
                    }
                }
                await Gleap.sendAgentToolResult({ executionId, result });
            }
            catch (exp) {
                // Ignore.
            }
        });
    }
    await Gleap.registerAgentTool({ name });
};
export * from './definitions';
export { Gleap, registerAgentTool };
//# sourceMappingURL=index.js.map