import { Adapter, Keytar } from '../types';

export const refreshTokens: Adapter<'refreshTokens'> = (config) => {
    const cfg = config.refreshTokens;

    if (!cfg) {
        return undefined;

    } else if ('keytar' in cfg) {
        return keytarAdapter(cfg.keytar, cfg.appName);

    } else {
        return cfg.store;
    }
}

export function keytarAdapter (keytar: Keytar, appName: string) {
    return {
        get: () => keytar.getPassword(appName, 'refresh-token'),

        async set(password: string) {
            await keytar.setPassword(appName, 'refresh-token', password);
        },

        async delete() {
            await keytar.deletePassword(appName, 'refresh-token');
        }
    }
}
