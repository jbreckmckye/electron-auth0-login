# Electron Auth0 Login

Enables Auth0 login for your Electron.js app.

Usage is simple: you call a `getToken` method, and one of three things happens (in order of preference):

1. If we have a token in memory, we return it
2. If you have a refresh token, we exchange it for a new token
3. If you have no refresh token (or have refresh tokens disabled), we start a new login flow

Refresh tokens are stored securely on the user's machine using [node-keytar](https://github.com/atom/node-keytar). If the machine is shared the refresh token will only be available to the correct user account.

Supports TypeScript out of the box.

## Setup

Adding dependencies to your project:

```
# Installing electron-auth0-login
npm install electron-auth0-login --save

# Installing peer dependencies
npm install request request-promise-native --save

# (Optional) installing Node Keytar (allows secure storage of user refresh tokens)
npm install node-keytar --save
npm install electron-rebuild --save-dev
npx electron-rebuild
```

(Don't forget to call electron-rebuild again when upgrading Electron)

Then, in a module available to your main process code (e.g. `auth.ts`):

```typescript
import ElectronAuth0Login from 'electron-auth0-login';

export new ElectronAuth0Login({

    // Get these from your Auth0 application console
    auth0Audience: 'https://api.mydomain.com',
    auth0ClientId: 'abc123ghiMyApp',
    auth0Domain: 'my-domain.eu.auth0.com',
    auth0Scopes: 'given_name profile offline_access' // add 'offline_access' for refresh tokens

    // Optional - only required when using refresh tokens
    applicationName: 'my-cool-app',
    useRefreshTokens: true
});

```

## Usage

You can call `getToken` any time you need an auth0 token:

In main process code:

```typescript
import auth from './auth'; // module defined above

async function doSomethingWithAPI() {
    const token = await auth.getToken();
    api.get('/things', {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    });
}
```

In renderer process code:

```typescript
import {remote} from 'electron';

const auth = remote.require('./auth');

async function doSomethingWithAPI() {
    const token = await auth.getToken();
    api.get('/things', {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    });
}
```