import { registerPlugin } from '@capacitor/core';
const Gleap = registerPlugin('Gleap', {
    web: () => import('./web').then(m => new m.GleapWeb()),
});
export * from './definitions';
export { Gleap };
//# sourceMappingURL=index.js.map