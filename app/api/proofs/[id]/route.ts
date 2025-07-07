import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '@/lib/awsClients';
import { dummyData } from '@/scripts/dummyData.mjs';

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

    // frontKey and backKey are the old fields that we're not using anymore
    // dataImageS3Key is the new field that we're using
    const frontKey = proof.printFrontUrl?.split('/')?.pop();
    const backKey = proof.printBackUrl?.split('/')?.pop();
    const dataImageS3Key = proof.dataImageS3Key?.split('/')?.pop();

    if (dataImageS3Key) {
      await s3Client.send(new DeleteObjectCommand({
        Bucket: 'proofs-dashboard-dev',
        Key: dataImageS3Key,
      }));
    }

    // This shouldn't hit anymore since we're not using the old fields
    // Still preserving for now so the the old mock proofs stick around
    if (frontKey && backKey) {
      // Don't delete the S3 objects if the URLs are from the dummy data
      // Maybe this shouldn't be hardcoded like this, what's the worst that could happen?
      if (dummyData.some(p => p.printFrontUrl === proof.printFrontUrl && p.printBackUrl === proof.printBackUrl)) {
        console.log('Skipping deletion of dummy data');
      } else {
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