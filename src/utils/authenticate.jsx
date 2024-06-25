import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";

import { AuthenticationDetails, CognitoUser } from "amazon-cognito-identity-js";
import userpool from "./userPool";

export const cognitoClient = new CognitoIdentityProviderClient({
  region: import.meta.env.VITE_REACT_APP_REGION,
});

export const authenticate = (Email, Password) => {
  return new Promise((resolve, reject) => {
    const user = new CognitoUser({
      Username: Email,
      Pool: userpool,
    });

    const authDetails = new AuthenticationDetails({
      Username: Email,
      Password,
    });

    user.authenticateUser(authDetails, {
      onSuccess: (result) => {
        console.log("login successful");
        resolve(result);
      },
      onFailure: (err) => {
        console.log("login failed", err);
        reject(err);
      },
    });
  });
};

export const logout = () => {
  const user = userpool.getCurrentUser();
  user.signOut();
  window.location.href = "/";
};

export const confirmSignUp = async (email, code) => {
  const params = {
    ClientId: import.meta.env.VITE_REACT_APP_CLIENT_ID,
    Username: email,
    ConfirmationCode: code,
  };
  try {
    const command = new ConfirmSignUpCommand(params);
    await cognitoClient.send(command);
    console.log("User confirmed successfully");
    return true;
  } catch (error) {
    console.error("Error confirming sign up: ", error);
    throw error;
  }
};
