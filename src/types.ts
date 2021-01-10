// Used for types only; this library does not bundle keytar
import keytar from 'keytar';
export type Keytar = typeof keytar;

export type Operation <I, O> = (ctx: Context, input: I) => O;

export type Adapter = (cfg: Config) => Partial<Context>;

export type Context = {
    authAPI: {
        // Makes request exchanging refresh token
        exchangeRefreshToken(refreshToken: string): Promise<TokenResponse>,

        // Makes refresh exchanging auth code, using code verifier
        exchangeAuthCode(authCode: string, pair: PKCEPair): Promise<TokenResponse>,
    },
    authWindow: {
        login(pair: PKCEPair): Promise<string>,
        logout(): Promise<void>,
    },
    cryptography: {
        getPKCEChallengePair(): PKCEPair
    },
    logger: {
        debug(...s: string[]): void,
        warn(...s: string[]): void
    },
    tokens: Store<TokenResponse> & {
        expiresIn(): number
    },
    refreshTokens?: Store<string>
}

export type PKCEPair = {
    verifier: string,
    challenge: string
}

export type TokenResponse = {
    access_token: string,
    expires_in: number
    scope: string,
    refresh_token?: string
    token_type: string
}

export type Config = {
    debug?: boolean,
    auth0: {
        audience: string,
        clientId: string,
        domain: string,
        scopes: string
    },
    login?: {
        windowConfig?: object,
        authorizeParams?: object
    },
    logout?: {
        windowConfig?: object
    },
    refreshTokens?:
        | { keytar: typeof keytar, appName: string }
        | { store: Store<string> }
}

export type Store <T> = {
    delete(): Promise<void>,
    get(): Promise<T | null>,
    set(t: T): Promise<void>
}
