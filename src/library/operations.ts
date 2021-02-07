import { Context } from '../types';

/**
 * Return a usable auth token or, failing that, try to get a new one
 * You should use this whenever you want to auth e.g. an API request
 */
export async function getToken (ctx: Context): Promise<string> {
    const {
        authAPI,
        logger: {
            warn,
            debug
        },
        tokens,
        refreshTokens
    } = ctx;

    debug('Retrieving token from store');
    const token = await tokens.get();

    if (token && tokens.expiresIn() > 60) {
        debug('Using fresh token from store');
        return token.access_token;
    }

    if (refreshTokens) {
        debug('Falling back to refresh token');
        const refreshToken = await refreshTokens.get();

        if (refreshToken) {
            try {
                debug('Attempting to use refresh token');
                const token = await authAPI.exchangeRefreshToken(refreshToken);
                await tokens.set(token);
                return token.access_token;

            } catch (err) {
                warn(`Could not use refresh token, may have been revoked`);
                await refreshTokens.delete();
            }
        }
    }

    debug('No valid token or refresh token available; starting new login flow');
    return login(ctx);
}

/**
 * Check whether we are logged in
 */
export function isLoggedIn (ctx: Context) {
    return !!ctx.tokens.get();
}

/**
 * Manually start a login flow.
 * If you just want a token, use getToken(), which will log in only if we don't have a token available.
 */
export async function login (ctx: Context): Promise<string> {
    const {
        authAPI,
        authWindow,
        cryptography,
        logger: { debug },
        refreshTokens,
        tokens
    } = ctx;

    debug('Beginning login');

    const pkcePair = cryptography.getPKCEChallengePair();
    const authCode = await authWindow.login(pkcePair);
    const token = await authAPI.exchangeAuthCode(authCode, pkcePair);

    debug('Received token from Auth0');

    const { access_token, refresh_token } = token;

    if (refreshTokens) {
        if (refresh_token) {
            debug('Setting refresh token');
            await refreshTokens.set(refresh_token);
        } else {
            debug('Refresh tokens are enabled but none was returned by API');
        }
    }

    await tokens.set(token);
    debug('Login successful');

    return access_token;
}

/**
 * Log the user out
 */
export async function logout (ctx: Context) {
    const {
        authWindow,
        refreshTokens,
        logger: { debug },
        tokens
    } = ctx;

    await Promise.all([
        tokens.delete(),
        authWindow.logout(),
        refreshTokens && refreshTokens.delete()
    ]);

    debug('Logged out successfully');
}
