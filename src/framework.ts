import { Adapter, Context, Operation } from './types';

export const context = <K extends keyof Context> (key: K, val: Context[K]) => ({
    [key]: val
});
