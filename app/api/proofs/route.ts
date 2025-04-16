import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
