import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import cloudinary, { streamUpload } from '@/lib/cloudinary';
import streamifier from 'streamifier';

export async function POST(request: Request) {
    const authError = requireAuth(request);
    if (authError) return authError;

    try {
        const { url } = await request.json();
        if (!url || typeof url !== 'string') return NextResponse.json({ error: 'url is required' }, { status: 400 });

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);
        if (!response.ok) return NextResponse.json({ error: `Failed to fetch image: ${response.status} ${response.statusText}` }, { status: 400 });

        const buffer = Buffer.from(await response.arrayBuffer());
        const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: 'toolcurrent/assets', resource_type: 'image' },
                (error, r) => { if (r) resolve(r as { secure_url: string }); else reject(error); }
            );
            streamifier.createReadStream(buffer).pipe(stream);
        });
        return NextResponse.json({ url: result.secure_url });
    } catch (err) {
        return NextResponse.json({ error: (err as Error).message || 'Upload failed' }, { status: 500 });
    }
}
