import { getCurrentUser, fetchUserAttributes, fetchAuthSession } from 'aws-amplify/auth';
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from '../types';

// This is used by the client side app to get the current user's info
export async function getCurrentUserInfo() {
  try {
    const { userId } = await getCurrentUser();
    const attributes = await fetchUserAttributes();
    const { tokens } = await fetchAuthSession();
    
    // Get groups from the ID token payload
    const rawGroups = tokens?.idToken?.payload['cognito:groups'] || [];
    const groups = (Array.isArray(rawGroups) ? rawGroups : [rawGroups])
      .filter((group): group is string => typeof group === 'string');
    
    return {
      userId,
      groups,
      attributes
    };
  } catch (error) {
    console.error('Error fetching user info:', error);
    return null;
  }
}

// This is used by the API to get the user's identity from the bearertoken
// The token only contains the userId, userName, and groups. not any other user attributes
export async function getUserIdentityFromToken(token: string) {
  const payload = jwtDecode<TokenPayload>(token);
  console.log('payload', payload);
  return {
    userId: payload.sub,
    username: payload.username,
    group: payload['cognito:groups']?.[0]
  }
}