import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import cloudinary from '@/lib/cloudinary';

export async function GET(request: Request) {
    const authError = requireAuth(request);
    if (authError) return authError;

    try {
        const result = await cloudinary.api.resources({
            type: 'upload',
            prefix: 'toolcurrent/assets',
            max_results: 100,
            resource_type: 'image',
        });
        return NextResponse.json(result.resources.map((r: { secure_url: string; public_id: string }) => ({ url: r.secure_url, public_id: r.public_id })));
    } catch (err) {
        return NextResponse.json({ error: (err as Error).message || 'Failed to fetch assets' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const authError = requireAuth(request);
    if (authError) return authError;

    try {
        const { public_id } = await request.json();
        if (!public_id || typeof public_id !== 'string') return NextResponse.json({ error: 'public_id is required' }, { status: 400 });
        const result = await cloudinary.uploader.destroy(public_id, { resource_type: 'image' });
        return NextResponse.json({ result });
    } catch (err) {
        return NextResponse.json({ error: (err as Error).message || 'Delete failed' }, { status: 500 });
    }
}
