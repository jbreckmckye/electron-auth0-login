import { Adapter, Config } from '../types';
import { BrowserWindow } from 'electron';
import qs from 'qs';
import url from 'url';

export const authWindow: Adapter<'authWindow'> = (config: Config) => {
    const baseWinConfig = {
        width: 800,
        height: 600,
        alwaysOnTop: true,
        backgroundColor: '#202020'
    };

    const baseLogoutWin = {
        ...baseWinConfig,
        title: 'Log out',
        skipTaskbar: true,
        show: false,
        frame: false
    };

    return {
        /**
         * Open a browser window to get an auth code, passing through the first part of the PKCE pair (PKCE first leg)
         */
        login: (pair) => new Promise((resolve, reject) => {
            const authCodeUrl = `https://${config.auth0.domain}/authorize?` + qs.stringify({
                audience: config.auth0.audience,
                scope: config.auth0.scopes,
                response_type: 'code',
                client_id: config.auth0.clientId,
                code_challenge: pair.challenge,
                code_challenge_method: 'S256',
                redirect_uri: `https://${config.auth0.domain}/mobile`,
                // Custom parameters
                ...config.login?.authorizeParams
            });

            const loginWindow = new BrowserWindow({
                ...baseWinConfig,
                title: 'Log in',
                // Custom parameters
                ...config.logout?.windowConfig
            });

            loginWindow.webContents.on('did-navigate', (event, href) => {
                const location = url.parse(href);
                if (location.pathname == '/mobile') {
                    const query = qs.parse(location.search || '', {ignoreQueryPrefix: true});
                    resolve(query.code);
                    loginWindow.destroy();
                }
            });

            loginWindow.on('close', reject);

            loginWindow.loadURL(authCodeUrl);
        }),

        /**
         * Remote logout from Auth0, deleting cookies etc.
         */
        logout: () => new Promise((resolve, reject) => {
            const logoutWindow = new BrowserWindow({
                ...baseLogoutWin,
                // Custom parameters
                ...config.logout?.windowConfig
            });

            logoutWindow.webContents.on('did-navigate', () => {
                logoutWindow.destroy();
                resolve();
            });

            logoutWindow.loadURL(`https://${config.auth0.domain}/v2/logout`);

            setTimeout(() => reject(new Error('Logout timed out')), 60 * 1000);
        })
    }
}
