import { NextResponse } from 'next/server';
import { streamUpload } from '@/lib/cloudinary';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const imageFile = formData.get('image') as File | null;
        const audioFile = formData.get('audio') as File | null;

        if (!imageFile && !audioFile) return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });

        let result;
        if (imageFile) {
            const buffer = Buffer.from(await imageFile.arrayBuffer());
            result = await streamUpload(buffer, 'image');
        } else if (audioFile) {
            const buffer = Buffer.from(await audioFile.arrayBuffer());
            result = await streamUpload(buffer, 'video');
        }

        return NextResponse.json({ url: result!.secure_url });
    } catch (error) {
        return NextResponse.json({ error: `Upload failed: ${(error as Error).message}` }, { status: 500 });
    }
}
