export  type TokenPayload = {
  "cognito:groups"?: string[];
  [claim: string]: unknown;
};