import { Adapter, Context, Operation } from './types';

export const context = <K extends keyof Context> (key: K, val: Context[K]) => ({
    [key]: val
});

export function mergeAdapters (...adapters: Adapter[]): Adapter {
    return (config) => adapters.reduce(
        (ctx, item) => ({
            ...ctx,
            ...item(config)
        }),
        {}
    )
}

export function $applyCtx (ctx: Context) {
    return function <I, O>(op: Operation<I, O>) {
        return (input: I) => op(ctx, input);
    }
}
