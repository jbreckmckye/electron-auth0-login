import {BrowserWindow, Event as ElectronEvent} from 'electron';
import qs from 'qs';
import request from 'request';
import url from 'url';

import {getPKCEChallengePair} from './cryptoUtils';

let authWindow: BrowserWindow;

export async function getToken(config: Config) {
    const pkcePair = getPKCEChallengePair();
    const authCodeURL = getAuthCodeEndpoint(config, pkcePair);
    const authCode = await getAuthCode(config, authCodeURL);
    const accessToken = await getAccessToken(config, authCode, pkcePair);
}

/**
 * Creates user login window.
 * The user passes their username and password, along with the PKCE challenge value.
 * In return, Auth0 redirects us to a page containing an authorization code in the URL.
 * The code is not yet a token. To obtain that, we must do a further request with the PKCE verifier in tow.
 * Doing this means that a malicious actor who intercepts the Auth0 redirect cannot hijack the user's credentials.
 */
async function getAuthCode(config: Config, authCodeURL: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        if (authWindow) authWindow.destroy();

        authWindow = new BrowserWindow({
            width: 800,
            height: 600,
            parent: config.parentWindow,
            title: 'Log in',
            backgroundColor: '#202020'
        });

        authWindow.webContents.on('did-navigate' as any, (event: ElectronEvent, href: string) => {
            const location = url.parse(href);
            const query = qs.parse(location.search || '', {ignoreQueryPrefix: true});
            if (query.code) {
                resolve(query.code);
                authWindow.destroy();
            }
        });

        authWindow.on('close', reject);

        authWindow.loadURL(authCodeURL);
    });
}

function getAuthCodeEndpoint(config: Config, pkcePair: PKCEPair) {
    return `https://${config.auth0Domain}/authorize?`+ qs.stringify({
        audience: config.auth0Audience,
        scope: config.auth0Scopes,
        response_type: 'code',
        client_id: config.auth0ClientId,
        code_challenge: pkcePair.challenge,
        code_challenge_method: 'S256',
        redirect_uri: `https://${config.auth0Domain}/mobile`
    });
}

async function getAccessToken(config: Config, authCode: string, pkcePair: PKCEPair): Promise<AccessTokenMeta> {
    return new Promise<AccessTokenMeta>((resolve, reject) => {
        request.post(`https://${config.auth0Domain}/oauth/token`, {
            json: true,
            body: {
                grant_type: 'authorization code',
                client_id: config.auth0ClientId,
                code_verifier: pkcePair.verifier,
                code: authCode,
                redirect_uri: `https://${config.auth0Domain}/mobile`
            },
            callback: (err, httpResponse, body) => {
                if (err || httpResponse.statusCode >= 400) {
                    reject(err || httpResponse.statusCode);
                } else {
                    const result: AccessTokenMeta = {
                        auth0Response: body,
                        time: Date.now()
                    };
                    resolve(result);
                }
            }
        });
    });
}