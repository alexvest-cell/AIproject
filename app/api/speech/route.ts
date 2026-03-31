import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Article from '@/lib/models/Article';

export async function POST(request: Request) {
    const { articleId } = await request.json();
    if (!articleId) return NextResponse.json({ error: 'Article ID required' }, { status: 400 });

    try {
        await connectDB();
        const article = await Article.findOne({ id: articleId });
        if (!article) return NextResponse.json({ error: 'Article not found' }, { status: 404 });
        if (!article.audioUrl) return NextResponse.json({ error: 'Audio not yet generated for this article' }, { status: 404 });

        const cloudParams = await fetch(article.audioUrl);
        if (cloudParams.ok) {
            const buffer = await cloudParams.arrayBuffer();
            const audioData = Buffer.from(buffer).toString('base64');
            return NextResponse.json({ audioData });
        }
        return NextResponse.json({ error: 'Failed to fetch audio from storage' }, { status: 500 });
    } catch (error) {
        return NextResponse.json({ error: 'Audio fetch error' }, { status: 500 });
    }
}
