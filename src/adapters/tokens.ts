import { Adapter, TokenResponse } from '../types';

const epochSeconds = () => Date.now() / 1000;

export const tokens: Adapter<'tokens'> = () => {
    let tokenResponse: TokenResponse | null = null;
    let expiresAt: number | null = null;

    return {
        /**
         * Forget the token
         */
        async delete() {
            tokenResponse = null;
        },

        /**
         * When does the token expire?
         */
        expiresIn: () => expiresAt
            ? expiresAt - epochSeconds()
            : Infinity,

        async get() {
            return tokenResponse;
        },

        async set(resp: TokenResponse) {
            tokenResponse = resp;
            expiresAt = epochSeconds() + resp.expires_in;
        }
    }
}
