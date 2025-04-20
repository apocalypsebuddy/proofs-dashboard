import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
// import { createPresignedPost } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

const BUCKET_NAME = process.env.AWS_S3_BUCKET;

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

// Ehhh I dunno about this function
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;
    
    const fileName = image.name;
    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Upload to S3
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: image.type,
    });

    // TODO: Move this to a separate file
    const s3Client = new S3Client({
      region: process.env.AWS_REGION
    });
    await s3Client.send(command);

    // Generate the S3 URL
    const imageUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

    // Create the proof object
    const proof = {
      id: uuidv4(),
      date: new Date().toISOString(),
      batchId: formData.get('batchId'),
      description: formData.get('description'),
      customerId: formData.get('customerId'),
      customerName: formData.get('customerName'),
      printerId: formData.get('printerId'),
      printerName: formData.get('printerName'),
      imageUrl,
    };

    // TODO: Save proof to database

    return NextResponse.json(proof);
  } catch (error) {
    console.error('Error handling proof upload:', error);
    return NextResponse.json(
      { error: 'Failed to upload proof' },
      { status: 500 }
    );
  }
}
