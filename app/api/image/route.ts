import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { description } = await req.json();

    if (!description) {
      return NextResponse.json({ error: 'Image description is required.' }, { status: 400 });
    }

    const encodedPrompt = encodeURIComponent(description);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${Date.now()}`;

    return NextResponse.json({ imageUrl }, { status: 200 });

  } catch (error) {
    console.error('Image Generation API Error:', error);
    return NextResponse.json({ error: 'Failed to generate image.' }, { status: 500 });
  }
}