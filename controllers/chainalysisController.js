const axios = require("axios");
const api = require("../config");
const pgController = require("./pgController");

module.exports = {
  retrieveAddressDetails: async (req, res) => {
    const risks = ["Severe", "High", "Medium"];
    const authorization = req.get("Authorization");
    try {
      const { user_id, wallet_id } = req.body;
      const chainalysis_details = await pgController.fetchChainalysisDetails(
        user_id,
        wallet_id
      );
      if (chainalysis_details) {
        const { reason } = chainalysis_details;
        return res.status(200).send(reason);
      } else {
        await module.exports.registerNewAddress(wallet_id);
        const risk_assessment_result =
          await module.exports.retrieveRiskAssessment(wallet_id);
        // log into db
        const _category = risks.includes(risk_assessment_result["risk"])
          ? JSON.stringify(
              risk_assessment_result["addressIdentifications"][0]["category"]
            )
          : "";
        await pgController.SaveChainalysisLog(
          user_id,
          wallet_id,
          _category,
          JSON.stringify(risk_assessment_result),
          risks.includes(risk_assessment_result["risk"])
        );
        if (risks.includes(risk_assessment_result["risk"])) {
          // create zendesk ticket
          await module.exports.createZendeskTicket(
            authorization,
            user_id,
            JSON.stringify(risk_assessment_result)
          );
        }
        return res.status(200).send(risk_assessment_result);
      }
    } catch (error) {
      return res.status(400).send(error);
    }
  },

  registerNewAddress: (address) => {
    return new Promise(async (resolve, reject) => {
      try {
        const config = {
          method: "post",
          url: api.settings.chainalysis_api_endpoint,
          headers: {
            Token: api.settings.chainalysis_token,
            "Content-Type": "application/json",
          },
          data: {
            address,
          },
        };
        const response = await axios(config);
        resolve(response.data);
      } catch (error) {
        console.log({ error });
        reject(error);
      }
    });
  },

  retrieveRiskAssessment: (address) => {
    return new Promise(async (resolve, reject) => {
      try {
        const config = {
          method: "get",
          url: api.settings.chainalysis_api_endpoint + "/" + address,
          headers: {
            Token: api.settings.chainalysis_token,
            "Content-Type": "application/json",
          },
        };
        const response = await axios(config);
        resolve(response.data);
      } catch (error) {
        console.log({ error });
        reject(error);
      }
    });
  },

  createZendeskTicket: (authorization, user_id, details) => {
    return new Promise(async (resolve, reject) => {
      try {
        const config = {
          method: "post",
          url: api.settings.zendesk_api_endpoint,
          headers: {
            "x-api-key": api.settings.x_api_key,
            authorization,
          },
          data: {
            user_id,
            details,
          },
        };
        const response = await axios(config);
        resolve(response.data);
      } catch (error) {
        reject(error);
      }
    });
  },

  retrieveAddressDetailsFromDB: async (req, res) => {
    try {
      const { user_id, wallet_id } = req.body;
      const chainalysis_details = await pgController.fetchWalletDetails(
        user_id,
        wallet_id
      );
      return res.status(200).send(chainalysis_details);
    } catch (error) {
      return res.status(400).send(error);
    }
  },

  retrieveAddressDetailsForZendesk: (user_id, wallet_id) => {
    return new Promise(async (resolve, reject) => {
      const risks = ["Severe", "High", "Medium"];
      try {
        const chainalysis_details = await pgController.fetchChainalysisDetails(
          user_id,
          wallet_id
        );
        if (chainalysis_details) {
          const { reason } = chainalysis_details;
          resolve(reason);
        } else {
          await module.exports.registerNewAddress(wallet_id);
          const risk_assessment_result = await module.exports.retrieveRiskAssessment(wallet_id);
          // log into db
          const _category = risks.includes(risk_assessment_result["risk"])
            ? JSON.stringify(
                risk_assessment_result["addressIdentifications"][0]["category"]
              )
            : "";
          await pgController.SaveChainalysisLog(
            user_id,
            wallet_id,
            _category,
            JSON.stringify(risk_assessment_result),
            risks.includes(risk_assessment_result["risk"])
          );
          if (risks.includes(risk_assessment_result["risk"])) {
            // create zendesk ticket
            await module.exports.createZendeskTicket(
              "",
              user_id,
              JSON.stringify(risk_assessment_result)
            );
          }
          resolve(risk_assessment_result);
        }
      } catch (error) {
        reject(error);
      }
    })
  },
};
