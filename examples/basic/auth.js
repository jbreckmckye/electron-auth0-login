const { AuthenticationClient } = require('auth0');
const ElectronAuth0Login = require('../../dist/index').default;

const { clientId, domain, audience } = process.env;
const scope = 'openid email';

const authenticationClient = new AuthenticationClient({
  domain,
  clientId
});

const electronAuth0Login = new ElectronAuth0Login({
  auth0Audience: audience,
  auth0ClientId: clientId,
  auth0Domain: domain,
  auth0Scopes: scope
});

function handleAuth() {
  return new Promise((resolve, reject) => {
    electronAuth0Login.getToken().then((accessToken) => {
      authenticationClient.getProfile(accessToken, function(err, userProfile) {
        if (err) reject(err);

        resolve(userProfile);
      });
    });
  });
}

module.exports = { handleAuth };
