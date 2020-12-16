import * as Operations from './operations';
import { Adapter, Config, Context, MergedAdapter, Operation } from '../types';

export function $library (adapter: MergedAdapter) {
    return function library (config: Config) {
        const applyCtx = $applyCtx(adapter(config));

        return {
            getToken:   applyCtx(Operations.getToken),
            isLoggedIn: applyCtx(Operations.isLoggedIn),
            login:      applyCtx(Operations.login),
            logout:     applyCtx(Operations.logout)
        };
    }
}

export function $applyCtx (ctx: Context) {
    return function <I, O>(op: Operation<I, O>) {
        return (input: I) => op(ctx, input);
    }
}

export function mergeAdapters (adapters: { [K in keyof Context]: Adapter<K> } ): MergedAdapter {
    return (config) => Object.keys(adapters).reduce(
        (acc: Context, key: keyof Context) => ({
            ...acc,
            [key]: adapters[key]!(config)
        }),
        {} as Context
    );
}
