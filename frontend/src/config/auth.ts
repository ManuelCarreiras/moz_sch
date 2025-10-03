import { Amplify } from 'aws-amplify';

// Cognito configuration
const cognitoConfig = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || 'eu-west-1_xxxxxxxxx',
      userPoolClientId: import.meta.env.VITE_COGNITO_APP_CLIENT_ID || 'xxxxxxxxxxxxxxxxxxxxxxxxxx',
      loginWith: {
        email: true,
        username: true,
      },
      signUpVerificationMethod: 'code' as const,
    },
  },
};

// Initialize Amplify
Amplify.configure(cognitoConfig);

export default cognitoConfig;
