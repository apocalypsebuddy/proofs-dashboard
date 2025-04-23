import { getCurrentUser, fetchUserAttributes, fetchAuthSession } from 'aws-amplify/auth';

export async function getCurrentUserInfo() {
  try {
    // Get the current authenticated user
    const { userId } = await getCurrentUser();
    
    // Fetch user attributes
    const attributes = await fetchUserAttributes();
    
    // Get the current session to access tokens
    const { tokens } = await fetchAuthSession();
    
    // Get groups from the ID token payload and ensure they're strings
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