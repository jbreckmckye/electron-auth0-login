import { Adapter } from '../types';
import { context } from '../framework';

export const logger: Adapter = () => context('logger', {
    warn: (...s: string[]) => console.warn(...s)
});
