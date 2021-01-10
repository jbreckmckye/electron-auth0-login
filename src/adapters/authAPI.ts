import got from 'got';
import { Adapter } from '../types';
import { context } from '../framework';

export const authAPI: Adapter = (config) => context('authAPI', {
    /**
     * After receiving auth code, use second half of PKCE pair to get a token (PKCE second leg)
     */
    exchangeAuthCode: async (authCode, pair) => got.post(`https://${config.auth0.domain}/oauth/token`, {
        json: {
            grant_type: 'authorization_code',
            client_id: config.auth0.clientId,
            code_verifier: pair.verifier,
            code: authCode,
            redirect_uri: `https://${config.auth0.domain}/mobile`
        }
    }).json(),

    /**
     * Used to restore login state for persistent login
     */
    exchangeRefreshToken: async (refreshToken) => got.post(`https://${config.auth0.domain}/oauth/token`, {
        json: {
            grant_type: 'refresh_token',
            client_id: config.auth0.clientId,
            refresh_token: refreshToken
        }
    }).json()
});
