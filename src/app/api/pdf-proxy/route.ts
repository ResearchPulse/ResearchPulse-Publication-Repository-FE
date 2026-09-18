import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url || !url.startsWith('https://')) {
    return new NextResponse('Invalid or missing URL parameter', { status: 400 });
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/pdf',
      },
    });

    if (!response.ok) {
      return new NextResponse(`Failed to fetch PDF from upstream: ${response.statusText}`, {
        status: response.status,
      });
    }

    const arrayBuffer = await response.arrayBuffer();
    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', 'application/pdf');
    responseHeaders.set('Cache-Control', 'public, max-age=3600');
    // Important: Prevent browser from executing the PDF as HTML
    responseHeaders.set('Content-Disposition', 'inline');

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('PDF Proxy error:', error);
    return new NextResponse('Internal server error while fetching PDF', { status: 500 });
  }
}
