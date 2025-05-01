import { NextResponse } from 'next/server';
import { ListUsersInGroupCommand } from '@aws-sdk/client-cognito-identity-provider';
import { cognitoClient } from '@/lib/awsClients';

// This endpoint is only used to populate the customer dropdown on the upload form
export async function GET() {
  try {
    const command = new ListUsersInGroupCommand({
      UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
      // Filter: 'cognito:user_status = "CONFIRMED"',
      GroupName: 'customer',
    });

    const response = await cognitoClient.send(command);

    
    // Filter users in the customer group and map to required format
    const customers = response.Users?.map(user => ({
      id: user.Attributes?.find(attr => attr.Name === 'sub')?.Value || '',
      email: user.Attributes?.find(attr => attr.Name === 'email')?.Value || '',
      name: user.Attributes?.find(attr => attr.Name === 'name')?.Value || user.Username || '',
    })) || [];
    // ?.filter(user => user)
    // .map(user => ({
      //   id: user.Username || '',
      //   name: user.Attributes?.find(attr => attr.Name === 'name')?.Value || user.Username || '',
      // })) || [];
      
    // console.log('response', JSON.stringify(customers, null, 2));
    return NextResponse.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
} 