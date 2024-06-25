import { CognitoUserPool } from "amazon-cognito-identity-js";

const poolData = {
  UserPoolId: import.meta.env.VITE_REACT_APP_USER_POOL_ID,
  ClientId: import.meta.env.VITE_REACT_APP_CLIENT_ID,
};

export default new CognitoUserPool(poolData);
