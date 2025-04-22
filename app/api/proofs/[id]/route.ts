import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

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

    if (!proof) {
      return NextResponse.json({ error: 'Proof not found' }, { status: 404 });
    }

    return NextResponse.json(proof);
  } catch (error) {
    console.error('Error fetching proof:', error);
    return NextResponse.json({ error: 'Failed to fetch proof' }, { status: 500 });
  }
} 