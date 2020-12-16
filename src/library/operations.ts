import { Context } from '../types';

/**
 * Return a usable auth token or, failing that, try to get a new one
 * You should use this whenever you want to auth e.g. an API request
 */
export async function getToken (ctx: Context): Promise<string> {
    const {
        authAPI,
        logger,
        tokens,
        refreshTokens
    } = ctx;

    const token = await tokens.get();

    if (token && tokens.expiresIn() > 60) {
        // We have a valid token - use it
        return token.access_token;
    }

    if (refreshTokens) {
        const refreshToken = await refreshTokens.get();

        // Attempt to use refresh token
        if (refreshToken) {
            try {
                const token = await authAPI.exchangeRefreshToken(refreshToken);
                await tokens.set(token);
                return token.access_token;

            } catch (err) {
                logger.warn(`Could not use refresh token, may have been revoked`);
                await refreshTokens.delete();
            }
        }
    }

    // If all else failed, we need to start a new login flow
    return login(ctx);
}

/**
 * Check whether we are logged in
 */
export function isLoggedIn (ctx: Context) {
    return !!ctx.tokens.get();
}

/**
 * Manually start a login flow. Note that this will not return a token.
 * If you just want a token, use getToken(), which will log in only if we don't have a token available.
 */
export async function login (ctx: Context): Promise<string> {
    const {
        authAPI,
        authWindow,
        cryptography,
        refreshTokens,
        tokens
    } = ctx;

    const pkcePair = cryptography.getPKCEChallengePair();

    const authCode = await authWindow.login();
    const token = await authAPI.exchangeAuthCode(authCode, pkcePair);

    const { access_token, refresh_token } = token;

    if (refreshTokens && refresh_token) {
        await refreshTokens.set(refresh_token);
    }

    await tokens.set(token);

    return access_token;
}

/**
 * Log the user out
 */
export async function logout (ctx: Context) {
    const {
        authWindow,
        refreshTokens,
        tokens
    } = ctx;

    await Promise.all([
        tokens.delete(),
        authWindow.logout(),
        refreshTokens && refreshTokens.delete()
    ]);
}
