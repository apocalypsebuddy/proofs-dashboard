import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '@/lib/awsClients';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const proof = await prisma.proof.findUnique({
      where: { id },
    });

    console.log('proof', proof);
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

    const frontKey = proof.printFrontUrl?.split('/')?.pop();
    const backKey = proof.printBackUrl?.split('/')?.pop();
    const dataImageS3Key = proof.dataImageS3Key?.split('/')?.pop();

    if (dataImageS3Key) {
      await s3Client.send(new DeleteObjectCommand({
        Bucket: 'proofs-dashboard-dev',
        Key: dataImageS3Key,
      }));
    }

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