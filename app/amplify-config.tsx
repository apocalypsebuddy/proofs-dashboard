'use client';

import { Amplify } from "aws-amplify";

// Check if required environment variables are defined
// const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
// const userPoolClientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
// Envvars are not available during build time in AWS App Runner (stupid)
// The Cognito keys are public so it's safe to expose them here. This should be a temporary workaround
const userPoolId = 'us-west-2_wblQBOMpC';
const userPoolClientId = '3ijjn66958hi0trhrpqch9oscp';

if (!userPoolId || !userPoolClientId) {
  throw new Error('Missing required environment variables for Cognito configuration');
}

// Initialize Amplify
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId,
      userPoolClientId,
    },
  },
});

export default function ConfigureAmplify() {
  return null;
} 