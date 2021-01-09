import { $library, mergeAdapters } from './library';
import {
    authAPI,
    authWindow,
    cryptography,
    logger,
    refreshTokens,
    tokens
} from './adapters';

export default $library( mergeAdapters({
    authAPI,
    authWindow,
    cryptography,
    logger,
    refreshTokens,
    tokens
}));
