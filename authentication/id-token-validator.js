const CognitoExpress = require('cognito-express');
const api = require('../config');

const cognitoExpress = new CognitoExpress({
    region: api.settings.cp_region,
    cognitoUserPoolId: api.settings.cp_cognitoUserPoolId,
    tokenUse: api.settings.cp_tokenUse,
    tokenExpiration: api.settings.cp_tokenExpiration,
});

const verifyToken = (req, res, next) => {

    const accessToken = req.get('Authorization');

    if (!accessToken) {
        const response = {};
        response.success = false;
        response.message = 'Access token missing in header';
        return res.status(401).send(response);
    }

    cognitoExpress.validate(accessToken, (err, response) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                const authResponse = {};
                authResponse.success = false;
                authResponse.message = 'Token expired';
                return res.status(401).send(authResponse);
            }
            return res.status(401).send(err);
        }
        return next();
    });
    
};

module.exports = verifyToken;