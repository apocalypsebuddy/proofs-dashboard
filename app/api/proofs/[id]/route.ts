import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

const prisma = new PrismaClient();
const s3Client = new S3Client({
  region: 'us-west-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const proof = await prisma.proof.findUnique({
      where: { id },
    });

    if (!proof) {
      return NextResponse.json({ error: 'Proof not found' }, { status: 404 });
    }

    return NextResponse.json(proof);
  } catch (error) {
    console.error('Error fetching proof:', error);
    return NextResponse.json({ error: 'Failed to fetch proof' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const proof = await prisma.proof.findUnique({
      where: { id },
    });

    if (!proof) {
      return NextResponse.json({ error: 'Proof not found' }, { status: 404 });
    }

    // Delete images from S3
    const frontKey = proof.printFrontUrl.split('/').pop();
    const backKey = proof.printBackUrl.split('/').pop();

    if (frontKey && backKey) {
      await Promise.all([
        s3Client.send(new DeleteObjectCommand({
          Bucket: 'proofs-dashboard-dev',
          Key: frontKey,
        })),
        s3Client.send(new DeleteObjectCommand({
          Bucket: 'proofs-dashboard-dev',
          Key: backKey,
        }))
      ]);
    }

    // Delete proof from database
    await prisma.proof.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Proof deleted successfully' });
  } catch (error) {
    console.error('Error deleting proof:', error);
    return NextResponse.json({ error: 'Failed to delete proof' }, { status: 500 });
  }
} 