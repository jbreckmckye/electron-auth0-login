interface Config {
    applicationName?: string,

    // API we're going to access
    auth0Audience: string,

    auth0ClientId: string,
    auth0Domain: string,

    // What permissions do we want?
    auth0Scopes: string,

    useRefreshTokens?: boolean,

    windowConfig?: object
}

interface PKCEPair {
    verifier: string,
    challenge: string
}

interface Auth0TokenResponse {
    access_token: string,
    expires_in: number
    scope: string,
    refresh_token?: string
    token_type: string
}

interface TokenProperties extends Auth0TokenResponse {
    created_time: number
}
