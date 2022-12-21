const api = require('../config');
const verifyApiKey = (req, res, next) => {

    const x_api_key = req.get('x-api-key');

    if (!x_api_key) {
        const response = {};
        response.success = false;
        response.message = 'x-api-key missing in header';
        return res.status(401).send(response);
    }

    if (x_api_key === api.settings.x_api_key) {
        return next();
    } else {
        const response = {};
        response.success = false;
        response.message = 'Invalid x-api-key';
        return res.status(401).send(response);
    }

};

module.exports = verifyApiKey;