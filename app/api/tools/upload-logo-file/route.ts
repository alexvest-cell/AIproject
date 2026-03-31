import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import cloudinary from '@/lib/cloudinary';
import streamifier from 'streamifier';

export async function POST(request: Request) {
    const authError = requireAuth(request);
    if (authError) return authError;

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

        const buffer = Buffer.from(await file.arrayBuffer());
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
