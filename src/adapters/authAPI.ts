import { Adapter, TokenResponse } from '../types';
import { adapter } from '../framework';

export const authAPI: Adapter = (op, ctx, config) => {
    const { post } = ctx.net!;

    return adapter(op, 'authAPI', {
        /**
         * After receiving auth code, use second half of PKCE pair to get a token (PKCE second leg)
         */
        exchangeAuthCode: (authCode, pair) => post<TokenResponse>({
            grant_type: 'authorization_code',
            client_id: config.auth0.clientId,
            code_verifier: pair.verifier,
            code: authCode,
            redirect_uri: `https://${config.auth0.domain}/mobile`
        }),

        /**
         * Used to restore login state for 'persistent login'
         */
        exchangeRefreshToken: (refreshToken) => post<TokenResponse>({
            grant_type: 'refresh_token',
            client_id: config.auth0.clientId,
            refresh_token: refreshToken
        })
    });
}
