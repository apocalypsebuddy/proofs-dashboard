import { Amplify } from 'aws-amplify';

// Check if required environment variables are defined
const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
const userPoolClientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;

if (!userPoolId || !userPoolClientId) {
  throw new Error('Missing required environment variables for Cognito configuration');
}

// Initialize Amplify for server-side usage
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId,
      userPoolClientId,
    },
  },
});

export default Amplify; 