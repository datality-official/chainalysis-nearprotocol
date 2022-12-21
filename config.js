const dotenv = require("dotenv");
const CONFIG_PATH = "./near-api-server.config.json";

dotenv.config();
dotenv.config({ path: `./environments/.env.${process.env.NODE_ACTIVE_ENV}` });

const AppSettings = {
  pg_port: process.env.pg_port,

  cp_region: process.env.cp_region,
  cp_cognitoUserPoolId: process.env.cp_cognitoUserPoolId,
  cp_tokenUse: process.env.cp_tokenUse,
  cp_tokenExpiration: process.env.cp_tokenExpiration,

  cognito_secret_id: process.env.cognito_secret_id,
  near_secret_id: process.env.near_secret_id,
  prod_api_key: process.env.prod_api_key,

  server_host: process.env.server_host,
  server_port: process.env.server_port,
  rpc_node: process.env.rpc_node,
  networkId: process.env.networkId,
  init_disabled: process.env.init_disabled,
  initial_balance: process.env.initial_balance,
  master_account_id: process.env.master_account_id,
  master_key: process.env.master_key,

  aws_accessKeyId: process.env.aws_accessKeyId,
  aws_secretAccessKey: process.env.aws_secretAccessKey,
  aws_region: process.env.aws_region,

  x_api_key: process.env.x_api_key,

  chainalysis_api_endpoint: process.env.chainalysis_api_endpoint,
  chainalysis_token: process.env.chainalysis_token,
};

const paramKey = (property) => {
  if (property === "user") return "pg_user";
  if (property === "password") return "pg_password";
  if (property === "dbname") return "pg_database";
  if (property === "host") return "pg_host";
  if (property === "region") return "cp_region";
  if (property === "cognitoUserPoolId") return "cp_cognitoUserPoolId";
  if (property === "near_account_id") return "master_account_id";
  if (property === "near_key") return "master_key";
  return property;
};

const setParams = (params) => {
  for (const property in params) {
    AppSettings[paramKey(property)] = params[property];
  }
};

module.exports = {
  CONFIG_PATH,

  reject: (err) => {
    console.log(err);
    return { error: typeof err === "string" ? err : JSON.stringify(err) };
  },
  notify: (message) => {
    return { text: message };
  },

  setParams: (params) => {
    return setParams(params);
  },

  setEnvForProd: () => {
    if (process.env.NODE_ACTIVE_ENV === "prod" && process.env.networkId === 'testnet') {
       AppSettings['rpc_node'] = process.env.rpc_node_testnet;
       AppSettings['helper_url'] = process.env.helper_url_testnet;
       AppSettings['post_account_name'] = process.env.post_account_name_testnet;
       AppSettings['transfer_account_name'] = process.env.transfer_account_name_testnet;
       AppSettings['transaction_account_name'] = process.env.transaction_account_name_testnet;
       AppSettings['review_account_name'] = process.env.review_account_name_testnet;
       AppSettings['escrow_account_id'] = process.env.escrow_account_id_testnet;
       AppSettings['escrow_secret_id'] = process.env.escrow_secret_id_testnet;
       AppSettings['revenue_account_id'] = process.env.revenue_account_id_testnet;
       AppSettings['JsonRpcProvider'] = process.env.JsonRpcProvider_testnet;
       AppSettings['offers_account_id'] = process.env.offers_account_id_testnet;
    }
  },

  settings: AppSettings,
};
