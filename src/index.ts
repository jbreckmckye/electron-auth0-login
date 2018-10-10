import {BrowserWindow, Event as ElectronEvent} from 'electron';
import qs from 'qs';
import request from 'request';
import url from 'url';

import {base64hash, base64random, urlEncodeBase64String} from './util';

interface Config {
    auth0Audience: string,
    auth0ClientId: string,
    auth0Domain: string,
    auth0Scopes: string,
    parentWindow: BrowserWindow,
    useRefreshTokens?: boolean
}

export async function getToken(config: Config) {
    const pkcePair = getPKCEChallengePair();

    const authCodeURL = `https://${config.auth0Domain}/authorize?`
        + qs.stringify({
            audience: config.auth0Audience,
            scope: config.auth0Scopes,
            response_type: 'code',
            client_id: config.auth0ClientId,
            code_challenge: pkcePair.challenge,
            code_challenge_method: 'S256',
            redirect_uri: `https://${config.auth0Domain}/mobile`
        });

    const authCode = await getAuthCode(config, authCodeURL);
    const accessToken = await getAccessToken(config, authCode, pkcePair);
}

function getPKCEChallengePair(): PKCEPair {
    const seed = base64random(32);
    const verifier = urlEncodeBase64String(seed);
    const challenge = urlEncodeBase64String(base64hash(verifier));
    return {verifier, challenge};
}

async function getAuthCode(config: Config, authCodeURL: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const authWindow = new BrowserWindow({
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