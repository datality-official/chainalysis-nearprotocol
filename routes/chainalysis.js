const express = require('express');
const router = express.Router();
const chainalysisController = require("../controllers/chainalysisController");
const auth = require("../authentication/id-token-validator");
const x_api_key = require("../authentication/x-api-key-validator");


router.post('/retrieve-address-details', auth, x_api_key, chainalysisController.retrieveAddressDetails);
router.post('/wallet-details', auth, x_api_key, chainalysisController.retrieveAddressDetailsFromDB);

module.exports = router;