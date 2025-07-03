import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;
    
    if (!image) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    // TODO: Replace with actual Lambda function call
    // For now, return fake payload
    const fakePayload = {
      resourceId: "sfm_81ad1b7cd297ebe8",
      batchId: "76R160RJ",
      customerId: "18c1d3e0-f081-7002-9380-1cdf79dbaf55",
      customerName: "Verizon",
    };

    return NextResponse.json(fakePayload);
  } catch (error) {
    console.error('Error processing image:', error);
    return NextResponse.json({ error: 'Failed to process image' }, { status: 500 });
  }
} 