"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const codependency_1 = __importDefault(require("codependency"));
const electron_1 = require("electron");
const qs_1 = __importDefault(require("qs"));
const request_promise_native_1 = __importDefault(require("request-promise-native"));
const url_1 = __importDefault(require("url"));
const requirePeer = codependency_1.default.register(module);
const keytar = requirePeer('keytar', { optional: true });
const cryptoUtils_1 = require("./cryptoUtils");
class ElectronAuth0Login {
    constructor(config) {
        this.config = config;
        this.tokenProperties = null;
        this.useRefreshToken = !!(config.useRefreshTokens && config.applicationName && keytar);
        if (config.useRefreshTokens && !config.applicationName) {
            console.warn('electron-auth0-login: cannot use refresh tokens without an application name');
        }
        if (config.useRefreshTokens && !keytar) {
            console.warn('electron-auth0-login: cannot use refresh tokens without node-keytar installed');
        }
    }
    logout() {
        return __awaiter(this, void 0, void 0, function* () {
            this.tokenProperties = null;
            if (this.useRefreshToken) {
                yield keytar.deletePassword(this.config.applicationName, 'refresh-token');
            }
        });
    }
    getToken() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.tokenProperties && timeToTokenExpiry(this.tokenProperties) > 60) {
                // We have a valid token - use it
                return this.tokenProperties.access_token;
            }
            else if (this.useRefreshToken) {
                // See if we can use a refresh token
                const refreshToken = yield keytar.getPassword(this.config.applicationName, 'refresh-token');
                if (refreshToken) {
                    try {
                        this.tokenProperties = yield this.sendRefreshToken(refreshToken);
                        return this.tokenProperties.access_token;
                    }
                    catch (err) {
                        console.warn('electron-auth0-login: could not use refresh token, may have been revoked');
                        keytar.deletePassword(this.config.applicationName, 'refresh-token');
                        return this.login();
                    }
                }
                else {
                    return this.login();
                }
            }
            else {
                return this.login();
            }
        });
    }
    sendRefreshToken(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            return request_promise_native_1.default(`https://${this.config.auth0Domain}/oauth/token`, {
                method: 'POST',
                json: true,
                body: {
                    grant_type: 'refresh_token',
                    client_id: this.config.auth0ClientId,
                    refresh_token: refreshToken
                }
            }).promise().then(toTokenMeta);
        });
    }
    login() {
        return __awaiter(this, void 0, void 0, function* () {
            const pkcePair = cryptoUtils_1.getPKCEChallengePair();
            const authCode = yield this.getAuthCode(pkcePair);
            this.tokenProperties = yield this.exchangeAuthCodeForToken(authCode, pkcePair);
            if (this.useRefreshToken && this.tokenProperties.refresh_token) {
                keytar.setPassword(this.config.applicationName, 'refresh-token', this.tokenProperties.refresh_token);
            }
            return this.tokenProperties.access_token;
        });
    }
    getAuthCode(pkcePair) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const authCodeUrl = `https://${this.config.auth0Domain}/authorize?` + qs_1.default.stringify({
                    audience: this.config.auth0Audience,
                    scope: this.config.auth0Scopes,
                    response_type: 'code',
                    client_id: this.config.auth0ClientId,
                    code_challenge: pkcePair.challenge,
                    code_challenge_method: 'S256',
                    redirect_uri: `https://${this.config.auth0Domain}/mobile`
                });
                const authWindow = new electron_1.BrowserWindow({
                    width: 800,
                    height: 600,
                    alwaysOnTop: true,
                    title: 'Log in',
                    backgroundColor: '#202020'
                });
                authWindow.webContents.on('did-navigate', (event, href) => {
                    const location = url_1.default.parse(href);
                    if (location.pathname == '/mobile') {
                        const query = qs_1.default.parse(location.search || '', { ignoreQueryPrefix: true });
                        resolve(query.code);
                        authWindow.destroy();
                    }
                });
                authWindow.on('close', reject);
                authWindow.loadURL(authCodeUrl);
            });
        });
    }
    exchangeAuthCodeForToken(authCode, pkcePair) {
        return __awaiter(this, void 0, void 0, function* () {
            return request_promise_native_1.default(`https://${this.config.auth0Domain}/oauth/token`, {
                method: 'POST',
                json: true,
                body: {
                    grant_type: 'authorization_code',
                    client_id: this.config.auth0ClientId,
                    code_verifier: pkcePair.verifier,
                    code: authCode,
                    redirect_uri: `https://${this.config.auth0Domain}/mobile`
                }
            }).promise().then(toTokenMeta);
        });
    }
}
exports.default = ElectronAuth0Login;
function timeToTokenExpiry(tokenMeta) {
    return tokenMeta.created_time + tokenMeta.expires_in - getEpochSeconds();
}
function toTokenMeta(tokenResponse) {
    return Object.assign({}, tokenResponse, { created_time: getEpochSeconds() });
}
function getEpochSeconds() {
    return Date.now() / 1000;
}
