import { Adapter, Keytar } from '../types';
import { context } from '../framework';


export const keytarRefreshTokens: Adapter = (config) => {
    if (!config.refreshTokens)                  throw new Error(`No config.refreshTokens`);
    if (!('keytar' in config.refreshTokens))    throw new Error(`No refreshTokens.keytar`);
    if (!('appName' in config.refreshTokens))   throw new Error(`No refreshTokens.appName`);

    const { keytar, appName } = config.refreshTokens;

    return context('refreshTokens', {
        get: () => keytar.getPassword(appName, 'refresh-token'),

        async set(password: string) {
            await keytar.setPassword(appName, 'refresh-token', password);
        },

        async delete() {
            await keytar.deletePassword(appName, 'refresh-token');
        }
    });
};

export const customRefreshTokens: Adapter = (config) => {
    if (!config.refreshTokens || !('store' in config.refreshTokens)) {
        throw new Error('No refresh token store on config');
    }

    return context('refreshTokens', config.refreshTokens.store);
};
