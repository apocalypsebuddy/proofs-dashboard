import { NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '@/lib/awsClients';
import { PrismaClient } from '@prisma/client';
import { headers } from 'next/headers';
import { getUserIdentityFromToken } from '@/app/utils/auth';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    try {
      // Build the where clause based on user's role
      const token = authHeader.split(' ')[1];
      const { userId, group } = await getUserIdentityFromToken(token);

      let where = {};
      switch (group) {
        case 'superadmin':
          where = {};
          break;
        case 'customer':
          where = { customerId: userId };
          break;
        case 'printer':
          where = { printerId: userId };
          break;
        default:
          return NextResponse.json({ error: 'Unauthorized - No valid role' }, { status: 403 });
      }

      const proofs = await prisma.proof.findMany({
        where,
        orderBy: {
          date: 'desc'
        }
      });

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

    // Generate unique S3 keys using provided resourceId
    const uploadDate = Date.now().toString();
    const frontKey = `${resourceId}_front_${uploadDate}`;
    const backKey = `${resourceId}_back_${uploadDate}`;

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
    // setting the URLs like that for now but it's weird
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
