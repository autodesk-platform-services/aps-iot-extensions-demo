const { AuthClientTwoLegged } = require('forge-apis');
const { APS_CLIENT_ID, APS_CLIENT_SECRET } = require('../config.js');

let publicAuthClient = new AuthClientTwoLegged(APS_CLIENT_ID, APS_CLIENT_SECRET, ['viewables:read'], true);

async function getPublicToken() {
    if (!publicAuthClient.isAuthorized()) {
        await publicAuthClient.authenticate();
    }
    return publicAuthClient.getCredentials();
}

module.exports = {
    getPublicToken
};
