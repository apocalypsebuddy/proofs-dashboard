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
      // TODO: use accountId instead of userId
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
  console.log("Starting POST request");

  try {
    const formData = await request.formData();
    console.log('formData', formData);
    const description = formData.get('description') as string;
    const batchId = formData.get('batchId') as string;
    const customerId = formData.get('customerId') as string;
    const customerName = formData.get('customerName') as string;
    const printerId = formData.get('printerId') as string;
    const printerName = formData.get('printerName') as string;
    const resourceId = formData.get('resourceId') as string;
    const frontImage = formData.get('frontImage') as File;
    const backImage = formData.get('backImage') as File;
    const dataImage = formData.get('dataImage') as File;

    if (!resourceId) {
      return NextResponse.json({ error: 'Resource ID is required' }, { status: 400 });
    }

    // Generate unique S3 keys using provided resourceId
    const uploadDate = Date.now().toString();
    let frontImageS3Key = null;
    let backImageS3Key = null;
    let dataImageS3Key = null;

    // Upload front image to S3 if provided
    if (frontImage && frontImage.size > 0) {
      frontImageS3Key = `${resourceId}_front_${uploadDate}`;
      const frontBuffer = Buffer.from(await frontImage.arrayBuffer());
      await s3Client.send(new PutObjectCommand({
        Bucket: 'proofs-dashboard-dev',
        Key: frontImageS3Key,
        Body: frontBuffer,
        ContentType: frontImage.type,
      }));
    }

    // Upload back image to S3 if provided
    if (backImage && backImage.size > 0) {
      backImageS3Key = `${resourceId}_back_${uploadDate}`;
      const backBuffer = Buffer.from(await backImage.arrayBuffer());
      await s3Client.send(new PutObjectCommand({
        Bucket: 'proofs-dashboard-dev',
        Key: backImageS3Key,
        Body: backBuffer,
        ContentType: backImage.type,
      }));
    }

    // Upload data image to S3 if provided
    // This is an optional field that is the frontImage and backImage combined 
    // It's not used yet, but it's here for future use
    // This was built when we thought we'd be merging the front and back images into a single image for upload
    if (dataImage && dataImage.size > 0) {
      dataImageS3Key = `${resourceId}_data_${uploadDate}`;
    const dataImageBuffer = Buffer.from(await dataImage.arrayBuffer());
    await s3Client.send(new PutObjectCommand({
      Bucket: 'proofs-dashboard-dev',
        Key: dataImageS3Key,
      Body: dataImageBuffer,
      ContentType: dataImage.type,
    }));
    }

    // console.log('frontImageS3Key at creation', frontImageS3Key);
    // console.log('backImageS3Key at creation', backImageS3Key);
    // console.log('dataImageS3Key at creation', dataImageS3Key);

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
        printFrontUrl: frontImageS3Key ? `https://proofs-dashboard-dev.s3.us-west-2.amazonaws.com/${frontImageS3Key}` : null,
        printBackUrl: backImageS3Key ? `https://proofs-dashboard-dev.s3.us-west-2.amazonaws.com/${backImageS3Key}` : null,
        dataImageS3Key: dataImageS3Key,
      },
    });

    // console.log('proof at creation', proof);

    return NextResponse.json(proof);
  } catch (error) {
    console.error('Error creating proof:', error);
    return NextResponse.json({ error: 'Failed to create proof' }, { status: 500 });
  }
}
