const AWS = require('aws-sdk');
const api = require('../config');

AWS.config.update({
    accessKeyId: api.settings.aws_accessKeyId,
    secretAccessKey: api.settings.aws_secretAccessKey,
    region: api.settings.aws_region,
});

const secret_manager = new AWS.SecretsManager();



module.exports = secret_manager;