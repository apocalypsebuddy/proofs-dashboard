import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get the form data from the request
    const formData = await request.formData();
    
    // Forward the request to the actual API endpoint
    const response = await fetch('https://94f0nmul0k.execute-api.us-west-2.amazonaws.com/proofs-production/scan-events', {
      method: 'POST',
      body: formData,
    });

    // Get the response data
    const responseData = await response.text();
    
    // Return the response with proper CORS headers
    return new NextResponse(responseData, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Error proxying scan-events request:', error);
    return NextResponse.json(
      { error: 'Failed to upload scan event' },
      { status: 500 }
    );
  }
}

// Handle preflight OPTIONS requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
