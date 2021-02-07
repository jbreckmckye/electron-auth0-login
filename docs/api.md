# API

## getToken

`getToken(): Promise<string>`

Returns an authorization token you can use against an Auth0-secured API.

If one not available, tries using refresh tokens, then launches the login screen.

## isLoggedIn

`isLoggedIn(): boolean`

Checks whether we have tokens already. May be useful for the UI.

## login

`login(): Promise<string>`

Manually begins a login flow.

Note that if you just want a token, you can use `getToken` instead.

## logout

`logout(): Promise<void>`

Logs the user out, which deletes local and refresh tokens. Also clears any Auth0 cookies.
