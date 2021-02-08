# Setup guide

You're advised to begin with the [Quick Start](README.md#-quick-start-guide-getting-auth-tokens).

## Setting up Auth0

You must configure an application in Auth0 before users can log into it. There are a couple of requirements here:

1. It must be set up as a 'native' application, not 'machine to machine'
2. It must have an 'allowed callback URL' of your auth0 domain + `/mobile`

## Initialising the library

The library exports a factory function that has to be called inside your **main process code**:

```typescript
// Inside main.ts or one of its dependencies
import { auth0Login } from 'electron-auth0-login';
```

If you need to use the library from within the **renderer** process, see the example in the Quick Start guide.

## Configuration options

The library takes a config object with the following properties:

```typescript
export type Config = {
    // Prints verbose logs; can be useful for troubleshooting
    debug?: boolean,

    // Details of the Auth0 application
    auth0: {
        // Get these from your Auth0 app dashboard
        audience: string,
        clientId: string,
        domain: string,
        // This will be custom to your application, e.g. 'given_name profile'
        scopes: string
    },

    // Customise the login
    login?: {
        // Properties for the Electron BrowserWindow used during login
        windowConfig?: object,
        // Additional query params sent on the /authorize request - consult Auth0 documentation
        authorizeParams?: object
    },

    // Customise the logout
    logout?: {
        windowConfig?: object
    },
    
    // Set up refresh tokens
    refreshTokens?:
        | { keytar: typeof keytar, appName: string }
        | { store: Store<string> }
}
```

## Refresh tokens

Refresh tokens allow the user to effectively log in once, and stay signed in even after their token expires, at least until they explicitly log out.

### Option 1: Keytar

[Keytar](https://github.com/atom/node-keytar) is a library for cross-OS secure key storage in Electron apps. It works well on Mac/Linux but apparently has some security issues on Windows.

You use Keytar as follows:

```typescript
import keytar from 'keytar';

const auth = auth0Login({
  ...basicConfig,
  refreshTokens: {
    keytar,
    appName: 'myApp'
  }
});
```

### Option 2: custom store

If you don't want to use Keytar (e.g. due to issues on Windows), you can provide your own store.

A custom store must implement methods for `set`, `get` and `delete`, which may be asynchronous.

## Custom login and logout pages

You can override any of the [Electron BrowserWindow options](https://www.electronjs.org/docs/api/browser-window#new-browserwindowoptions) used for the login and logout pages.

