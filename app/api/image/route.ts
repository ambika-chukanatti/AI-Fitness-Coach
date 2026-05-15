import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { description } = await req.json();

    if (!description) {
      return NextResponse.json({ error: 'Image description is required.' }, { status: 400 });
    }

    const encodedPrompt = encodeURIComponent(description);
    const seed = Date.now();
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${seed}&model=flux`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(imageUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        const imageBuffer = await response.arrayBuffer();
        return new NextResponse(imageBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'public, max-age=86400',
          },
        });
      }
    } catch {
      clearTimeout(timeoutId);
    }

    return NextResponse.json({ error: 'Could not generate image. Please try again.' }, { status: 503 });

  } catch (error) {
    console.error('Image Generation API Error:', error);
    return NextResponse.json({ error: 'Failed to generate image.' }, { status: 500 });
  }
}