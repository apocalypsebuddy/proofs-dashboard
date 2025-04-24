import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { PrismaClient } from '@prisma/client';
import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { headers } from 'next/headers';
import { jwtDecode } from "jwt-decode";

const prisma = new PrismaClient();
const s3Client = new S3Client({
  region: 'us-west-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const cognitoClient = new CognitoIdentityProviderClient({
  region: 'us-west-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET() {
  try {
    const headersList = await headers();
    const authHeader = headersList.get('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    // Get user info from Cognito
    const command = new GetUserCommand({
      AccessToken: token,
    });

    

    type TokenPayload = {
      "cognito:groups"?: string[];
      [claim: string]: unknown;
    };

    const idToken = token;
    const payload = jwtDecode<TokenPayload>(idToken);
    console.log("Payload:", payload);
    console.log("payload.sub:", payload.sub);
    console.log("Groups from token:", payload["cognito:groups"]);

    try {
      const { Username, UserAttributes } = await cognitoClient.send(command);
      
      console.log('User info:', {
        username: Username,
        attributes: UserAttributes
      });
      
      // Get user's groups from attributes
      const isSuperadmin = payload["cognito:groups"]?.includes('superadmin');
      const isCustomer = payload["cognito:groups"]?.includes('customer');
      const isPrinter = payload["cognito:groups"]?.includes('printer');

      console.log('User roles:', {
        isSuperadmin,
        isCustomer,
        isPrinter
      });

      // Build the where clause based on user's role
      let where = {};
      if (!isSuperadmin) {
        if (isCustomer) {
          where = { customerId: Username };
        } else if (isPrinter) {
          where = { printerId: Username };
        } else {
          console.log('User has no valid role');
          return NextResponse.json({ error: 'Unauthorized - No valid role' }, { status: 403 });
        }
      }

      const proofs = await prisma.proof.findMany({
        where,
        orderBy: {
          date: 'desc'
        }
      });

      console.log('Found proofs:', proofs.length);

      return NextResponse.json(proofs);
    } catch (error) {
      console.error('Error getting user info:', error);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  } catch (error) {
    console.error('Error fetching proofs:', error);
    return NextResponse.json({ error: 'Failed to fetch proofs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const frontImage = formData.get('frontImage') as File;
    const backImage = formData.get('backImage') as File;
    const description = formData.get('description') as string;
    const batchId = formData.get('batchId') as string;
    const customerId = formData.get('customerId') as string;
    const customerName = formData.get('customerName') as string;
    const printerId = formData.get('printerId') as string;
    const printerName = formData.get('printerName') as string;
    const resourceId = formData.get('resourceId') as string;

    if (!frontImage || !backImage) {
      return NextResponse.json({ error: 'Both front and back images are required' }, { status: 400 });
    }

    if (!resourceId) {
      return NextResponse.json({ error: 'Resource ID is required' }, { status: 400 });
    }

    // Generate S3 keys using provided resourceId
    const frontKey = `${resourceId}_thumb_large_1.png`;
    const backKey = `${resourceId}_thumb_large_2.png`;

    // Upload front image to S3
    const frontBuffer = Buffer.from(await frontImage.arrayBuffer());
    await s3Client.send(new PutObjectCommand({
      Bucket: 'proofs-dashboard-dev',
      Key: frontKey,
      Body: frontBuffer,
      ContentType: frontImage.type,
    }));

    // Upload back image to S3
    const backBuffer = Buffer.from(await backImage.arrayBuffer());
    await s3Client.send(new PutObjectCommand({
      Bucket: 'proofs-dashboard-dev',
      Key: backKey,
      Body: backBuffer,
      ContentType: backImage.type,
    }));

    // Create proof record in database
    const proof = await prisma.proof.create({
      data: {
        description,
        batchId,
        customerId,
        customerName,
        printerId,
        printerName,
        resourceId,
        printFrontUrl: `https://proofs-dashboard-dev.s3.us-west-2.amazonaws.com/${frontKey}`,
        printBackUrl: `https://proofs-dashboard-dev.s3.us-west-2.amazonaws.com/${backKey}`,
      },
    });

    return NextResponse.json(proof);
  } catch (error) {
    console.error('Error creating proof:', error);
    return NextResponse.json({ error: 'Failed to create proof' }, { status: 500 });
  }
}
