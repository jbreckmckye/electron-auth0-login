interface Config {
    auth0Audience: string,
    auth0ClientId: string,
    auth0Domain: string,
    auth0Scopes: string,
    parentWindow: any,
    useRefreshTokens?: boolean
}

interface PKCEPair {
    verifier: string,
    challenge: string
}

interface AccessTokenMeta {
    auth0Response: {
        access_token: string,
        refresh_token?: string,
        id_token: string,
        token_type: string
    },
    time: number
}