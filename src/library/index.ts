import * as Operations from './operations';
import { Adapter, Config, Context } from '../types';
import { $applyCtx } from '../framework';

export function library (adapter: Adapter, config: Config) {
    const applyCtx = $applyCtx(adapter(config) as Context);

    return {
        getToken:   applyCtx(Operations.getToken),
        isLoggedIn: applyCtx(Operations.isLoggedIn),
        login:      applyCtx(Operations.login),
        logout:     applyCtx(Operations.logout)
    };
}
