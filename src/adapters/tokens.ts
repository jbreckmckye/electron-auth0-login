import { Adapter, TokenResponse } from '../types';
import { context } from '../framework';

const epochSeconds = () => Date.now() / 1000;

export const tokens: Adapter = () => {
    let tokenResponse: TokenResponse | null = null;
    let expiresAt: number | null = null;

    return context('tokens', {
        async delete() {
            tokenResponse = null;
        },

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
    })
};
