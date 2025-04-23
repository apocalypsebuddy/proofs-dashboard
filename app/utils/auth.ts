import { getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';

export async function getCurrentUserInfo() {
  try {
    // Get the current authenticated user
    const user = await getCurrentUser();
    
    // Fetch user attributes which includes groups
    const attributes = await fetchUserAttributes();
    
    // The groups are typically in the 'cognito:groups' attribute
    const groups = attributes['cognito:groups'] || [];
    
    return {
      user,
      userId: user.userId,
      groups: Array.isArray(groups) ? groups : [groups],
      attributes
    };
  } catch (error) {
    console.error('Error fetching user info:', error);
    return null;
  }
} 