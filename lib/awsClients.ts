import { S3Client } from "@aws-sdk/client-s3";
import {
  CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";

const REGION = process.env.AWS_REGION || "us-west-2";

// Instantiating clients here so they can be used in any file with just one instance for the whole app
// TODO: Dynamically set credentials based on environment

export const s3Client = new S3Client({
  region: REGION,
  // no credentials: let App Runner’s role supply them
  // credentials: {
  //   accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  //   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  // },
});

export const cognitoClient = new CognitoIdentityProviderClient({
  region: REGION,
  // again, no credentials block
  // credentials: {
  //   accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  //   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  // },
});

