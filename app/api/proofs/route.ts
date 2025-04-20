import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const s3Client = new S3Client({
  region: 'us-west-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

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

export async function GET() {
  try {
    const proofs = await prisma.proof.findMany({
      orderBy: {
        date: 'desc'
      }
    });
    return NextResponse.json({ items: proofs });
  } catch (error) {
    console.error('Error fetching proofs:', error);
    return NextResponse.json({ error: 'Failed to fetch proofs' }, { status: 500 });
  }
}
