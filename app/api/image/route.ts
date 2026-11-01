import { NextResponse } from 'next/server';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const TIMEOUT_MS = 55_000;

type Attempt = { ok: true; buffer: ArrayBuffer; contentType: string } | { ok: false; reason: string };

async function tryFetchImage(url: string, headers: Record<string, string> = {}): Promise<Attempt> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, { headers, signal: controller.signal, redirect: 'follow' });
    const contentType = response.headers.get('content-type') || '';

    if (!response.ok) {
      const body = (await response.text().catch(() => '')).slice(0, 300);
      return { ok: false, reason: `HTTP ${response.status} ${body}`.trim() };
    }
    // A 200 that isn't an image (HTML/JSON error page) must not be treated as success.
    if (!contentType.startsWith('image/')) {
      return { ok: false, reason: `Unexpected content-type "${contentType}"` };
    }
    return { ok: true, buffer: await response.arrayBuffer(), contentType };
  } catch (err: unknown) {
    const e = err as { name?: string; message?: string };
    return { ok: false, reason: e?.name === 'AbortError' ? 'Timed out' : e?.message || 'Network error' };
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function POST(req: Request) {
  try {
    const { description } = await req.json();

    if (!description || typeof description !== 'string') {
      return NextResponse.json({ error: 'Image description is required.' }, { status: 400 });
    }

    const prompt = encodeURIComponent(description.slice(0, 400));
    const seed = Math.floor(Math.random() * 1_000_000);
    const params = `width=1024&height=576&nologo=true&seed=${seed}&model=flux`;
    const apiKey = process.env.POLLINATIONS_API_KEY;

    const failures: string[] = [];

    const unified = await tryFetchImage(
      `https://gen.pollinations.ai/image/${prompt}?${params}`,
      apiKey ? { Authorization: `Bearer ${apiKey}` } : {}
    );
    if (unified.ok) return imageResponse(unified);
    failures.push(`gen.pollinations.ai -> ${unified.reason}`);

    console.error('Image generation failed:', failures);

    return NextResponse.json(
      {
        error: apiKey
          ? 'Image service is unavailable right now. Please try again.'
          : 'Image service rejected the request. Add POLLINATIONS_API_KEY to your environment variables.',
      },
      { status: 503 }
    );
  } catch (error) {
    console.error('Image Generation API Error:', error);
    return NextResponse.json({ error: 'Failed to generate image.' }, { status: 500 });
  }
}

function imageResponse(img: { buffer: ArrayBuffer; contentType: string }) {
  return new NextResponse(img.buffer, {
    status: 200,
    headers: { 'Content-Type': img.contentType, 'Cache-Control': 'no-store' },
  });
}
