const CLIENT_ID = process.env.CLIENT_ID || ''; //My SPA
const ISSUER = process.env.ISSUER || '';
const OKTA_TESTING_DISABLEHTTPSCHECK = process.env.OKTA_TESTING_DISABLEHTTPSCHECK || false;

export default {
  oidc: {
    clientId: CLIENT_ID,
    issuer: ISSUER,
    redirectUri: 'http://localhost:3000/callback',
    scopes: ['openid', 'email', 'profile', 'order.status'],
    // scopes: ['openid', 'profile', 'email', 'address','order.create', 'order.status'],
    pkce: true,
    disableHttpsCheck: OKTA_TESTING_DISABLEHTTPSCHECK,
  },
  resourceServer: {
    messagesUrl: 'http://localhost:8000/api/messages',
    infoUrl: 'http://localhost:8000/api/userProfile',
  },
};
