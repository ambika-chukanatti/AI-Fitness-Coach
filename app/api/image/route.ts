// src/app/api/image/route.ts (Using Pollinations.ai - FREE, NO KEY)
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { description } = await req.json();

    if (!description) {
      return NextResponse.json({ error: 'Image description is required.' }, { status: 400 });
    }

    const encodedPrompt = encodeURIComponent(description);
    
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true`;

    const response = await fetch(pollinationsUrl);

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch image from Pollinations.' }, { status: response.status });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const base64Image = buffer.toString('base64');
    const imageUrl = `data:image/jpeg;base64,${base64Image}`;
    
    return NextResponse.json({ imageUrl }, { status: 200 });

  } catch (error) {
    console.error('Image Generation API Error:', error);
    return NextResponse.json({ error: 'Failed to generate image.' }, { status: 500 });
  }
}