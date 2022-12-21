const api = require("./config");
const ssm = require("./aws/ssm");
const secret_manager = require("./aws/secretManager");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();
dotenv.config({ path: `./environments/.env.${process.env.NODE_ACTIVE_ENV}` });

const initializeEnv = () => {
  return new Promise(async (resolve, reject) => {
    try {
      if (process.env.cognito_secret_id) {
        const cognito = await getParameterFromSecretManager(
          process.env.cognito_secret_id
        );
        api.setParams(JSON.parse(cognito));
      }
      if (process.env.api_key_secret_id) {
        const api_key = await getParameterFromSecretManager(
          process.env.api_key_secret_id
        );
        api.setParams(JSON.parse(api_key));
      }
      if (process.env.near_secret_id && process.env.networkId === "mainnet") {
        const near = await getParameterFromSecretManager(
          process.env.near_secret_id
        );
        api.setParams(JSON.parse(near));
      }
      const data = await getParameterFromSSM(process.env.db_param);
      // await fetchDatalityCommision();
      const { Value } = data.Parameter;
      const params = Value.split(" ");
      api.setParams(getParamaObj(params));
      if (process.env.escrow_secret_id) {
        const escrow_account_key = await getParameterFromSecretManager(
          process.env.escrow_secret_id
        );
        api.setParams(JSON.parse(escrow_account_key));
      }
      if (
        process.env.NODE_ACTIVE_ENV === "prod" &&
        process.env.networkId === "testnet" &&
        process.env.escrow_secret_id_testnet
      ) {
        const escrow_account_key = await getParameterFromSecretManager(
          process.env.escrow_secret_id_testnet
        );
        api.setParams(JSON.parse(escrow_account_key));
      }
      resolve(params);
    } catch (error) {
      reject(error);
    }
  });
};

const fetchDatalityCommision = (
  attempt,
  max_attempt = +api.settings.max_attempt
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = {
        method: "get",
        url: api.settings.datality_commission_endpoint,
        headers: {
          "x-api-key": api.settings.x_api_key,
        },
      };
      const response = await axios(config);
      resolve(JSON.parse(response.data.data));
    } catch (error) {
      console.log({ error });
      if (attempt <= max_attempt) {
        resolve(module.exports.fetchDatalityCommision(attempt + 1));
      }
      reject(error);
    }
  });
};

const fetchNearConversionRate = (
  attempt,
  max_attempt = +api.settings.max_attempt
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { data } = await axios.get(api.settings.helper_url + "/fiat");
      resolve(data["near"]["usd"]);
    } catch (error) {
      console.log({ error });
      if (attempt <= max_attempt) {
        resolve(module.exports.fetchNearConversionRate(attempt + 1));
      }
      reject(error);
    }
  });
};

const getParameterFromSSM = (param) => {
  return new Promise(function (resolve, reject) {
    ssm.getParameter(
      { Name: param, WithDecryption: true },
      function (err, data) {
        if (err) {
          reject(console.log("Error getting parameter: " + err, err.stack));
        } else {
          resolve(data);
        }
      }
    );
  });
};

const getParameterFromSecretManager = (SecretId) => {
  return new Promise(async (resolve, reject) => {
    secret_manager.getSecretValue(
      {
        SecretId,
      },
      (error, data) => {
        if (error) {
          reject(error);
        } else {
          if ("SecretString" in data) {
            resolve(data.SecretString);
          } else {
            let buffer = Buffer.from(data.SecretBinary, "base64");
            const decodedBinarySecret = buffer.toString("ascii");
            resolve(decodedBinarySecret);
          }
        }
      }
    );
  });
};

const getParamaObj = (params) => {
  const obj = {};
  for (const param of params) {
    const split = param.split("=");
    obj[split[0]] = split[1];
  }
  return obj;
};

module.exports = {
  initializeEnv: () => {
    return initializeEnv();
  },
  fetchDatalityCommision: (attempt = 1) => {
    return fetchDatalityCommision(attempt);
  },
  fetchNearConversionRate: (attempt = 1) => {
    return fetchNearConversionRate(attempt);
  },
};
