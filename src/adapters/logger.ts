import { Adapter } from '../types';
import { context } from '../framework';

export const logger: Adapter = (config) => context('logger', {
    debug: (...s: string[]) => {
      if (config.debug) {
          console.log(...s);
      }
    },
    warn: (...s: string[]) => console.warn(...s)
});
