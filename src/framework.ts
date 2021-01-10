import { Adapter, Context, Operation } from './types';

export function adapter <K extends keyof Context, Op extends Operation<any, any>>(op: Op, key: K, val: Context[K]): ReturnType<Adapter> {
    return {
        op,
        ctx: {
            [key]: val
        }
    };
}
