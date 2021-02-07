import { library } from './library';
import { Config } from './types';
import { mergeAdapters } from './framework';

import {
    authAPI,
    authWindow,
    cryptography,
    logger,
    keytarRefreshTokens,
    customRefreshTokens,
    tokens
} from './adapters';

export = function (config: Config) {
    let adapter = mergeAdapters(
        authAPI,
        authWindow,
        cryptography,
        logger,
        tokens
    );

    if (config.refreshTokens && 'keytar' in config.refreshTokens) {
        adapter = mergeAdapters(
            adapter,
            keytarRefreshTokens
        );
    }

    if (config.refreshTokens && 'store' in config.refreshTokens) {
        adapter = mergeAdapters(
            adapter,
            customRefreshTokens
        );
    }

    return library(adapter, config);
}
