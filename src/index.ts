import { registerPlugin } from '@capacitor/core';

import type { GleapPlugin } from './definitions';

const Gleap = registerPlugin<GleapPlugin>('Gleap', {
  web: () => import('./web').then(m => new m.GleapWeb()),
});

export * from './definitions';
export { Gleap };
