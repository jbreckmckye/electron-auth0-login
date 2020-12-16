import { Adapter, TokenResponse } from '../types';
import https, { RequestOptions } from 'https';

export const adapter: Adapter<'authAPI'> = (config) => {
    return {
        exchangeAuthCode: (authCode, pair) => post<TokenResponse>({
            grant_type: 'authorization_code',
            client_id: config.auth0.clientId,
            code_verifier: pair.verifier,
            code: authCode,
            redirect_uri: `https://${config.auth0.domain}/mobile`
        }),

        exchangeRefreshToken: (refreshToken) => post<TokenResponse>({
            grant_type: 'refresh_token',
            client_id: config.auth0.clientId,
            refresh_token: refreshToken
        })
    }
}

function post <O>(input: object, opts?: RequestOptions) {
    const content = JSON.stringify(input);

    const options: RequestOptions = {
        port: 443,
        method: 'POST',
        headers: {
           'Content-Type': 'application/json',
           'Content-Length': content.length
        },
        ...opts
    };

    return new Promise((resolve, reject) => {
        const request = https.request(options, resp => {
            resp.on('data', resolve);
        });

        request.on('error', reject);

        request.write(content);
        request.end();
    }) as Promise<O>;
}
