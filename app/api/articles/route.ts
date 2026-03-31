import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Article from '@/lib/models/Article';
import { requireAuth, getAdminToken } from '@/lib/auth';
import { generateSlug } from '@/lib/slug';

export async function GET(request: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const includeUnpublished = searchParams.get('includeUnpublished');
        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        const isAdmin = token && token === getAdminToken();

        let query: Record<string, unknown> = {};
        if (!(isAdmin && includeUnpublished === 'true')) {
            const now = new Date();
            query = {
                $or: [
                    { status: 'published' },
                    { status: 'scheduled', scheduledPublishDate: { $lte: now } },
                    { status: { $exists: false } },
                ],
            };
        }

        const articles = await Article.find(query).sort({ createdAt: -1 });
        return NextResponse.json(articles);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const authError = requireAuth(request);
    if (authError) return authError;

    try {
        await connectDB();
        const newArticle = await request.json();

        if (!newArticle.id) newArticle.id = 'gen-' + Date.now();
        if (!newArticle.createdAt) newArticle.createdAt = new Date().toISOString();
        newArticle.updatedAt = new Date().toISOString();
        if (!newArticle.slug && newArticle.title) newArticle.slug = generateSlug(newArticle.title);
        if (typeof newArticle.content === 'string') newArticle.content = [newArticle.content];

        const created = await Article.create(newArticle);
        return NextResponse.json(created, { status: 201 });
    } catch (error: unknown) {
        console.error(error);
        if ((error as { code?: number }).code === 11000) {
            return NextResponse.json({ error: 'Duplicate article ID or Slug.' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to create article: ' + (error as Error).message }, { status: 500 });
    }
}
