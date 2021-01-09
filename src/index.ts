import { $library, mergeAdapters } from './library';
import {
    authAPI,
    cryptography,
    logger,
    refreshTokens,
    tokens
} from './adapters';

export default $library( mergeAdapters({
    authAPI,
    cryptography,
    logger,
    refreshTokens,
    tokens
}));
