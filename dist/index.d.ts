export default class ElectronAuth0Login {
    private config;
    private tokenProperties;
    private useRefreshToken;
    constructor(config: Config);
    logout(): Promise<void>;
    getToken(): Promise<string>;
    private sendRefreshToken;
    private login;
    private getAuthCode;
    private exchangeAuthCodeForToken;
}
