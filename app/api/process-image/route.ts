import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const imageProcessorUrl = process.env.IMAGE_PROCESSOR_URL || '';
  const imageProcessorApiKey = process.env.IMAGE_PROCESSOR_API_KEY || '';
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;
    
    if (!image) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    
    // Create new FormData with the correct 'file' key for the external service
    // Doing this to match what the external service expects without having to change my chain of parameters too much
    const externalFormData = new FormData();
    externalFormData.append('file', image);

    // These envs aren't set yet
    console.log('imageProcessorUrl', imageProcessorUrl);

    const externalResponse = await fetch(imageProcessorUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${imageProcessorApiKey}:`).toString('base64')}`,
      },
      body: externalFormData,
    });

    if (!externalResponse.ok) {
      console.error('External service error:', {
        status: externalResponse.status,
        statusText: externalResponse.statusText,
      });
      console.log('externalResponse', externalResponse);
      return NextResponse.json({ error: `Failed to process image with external service: ${externalResponse.statusText}` }, { status: 500 });
    }

    const result = await externalResponse.json();
    console.log('result', result);
    console.log('result data', result.data);
    // Return the response from the external service
    return NextResponse.json({
      resourceId: result.data.resource_id,
      batchId: result.data.batch_id,
      wo: result.data.wo,
      batchDate: result.data.batch_date,
    });

  } catch (error) {
    console.error('Error processing image:', error);
    return NextResponse.json({ error: 'Failed to process image' }, { status: 500 });
  }
} 