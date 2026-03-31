import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Article from '@/lib/models/Article';
import { requireAuth } from '@/lib/auth';

type Params = { params: Promise<{ slug: string }> };

export async function PUT(request: Request, { params }: Params) {
    const authError = requireAuth(request);
    if (authError) return authError;

    try {
        await connectDB();
        const { slug: articleId } = await params;
        const updates = await request.json();
        updates.updatedAt = new Date().toISOString();

        const updated = await Article.findOneAndUpdate({ id: articleId }, updates, { new: true });
        if (!updated) return NextResponse.json({ error: 'Article not found' }, { status: 404 });
        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update article: ' + (error as Error).message }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: Params) {
    const authError = requireAuth(request);
    if (authError) return authError;

    try {
        await connectDB();
        const { slug: articleId } = await params;
        const deleted = await Article.findOneAndDelete({ id: articleId });
        if (!deleted) return NextResponse.json({ error: 'Article not found' }, { status: 404 });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete article: ' + (error as Error).message }, { status: 500 });
    }
}
