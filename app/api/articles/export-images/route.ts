import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Article from '@/lib/models/Article';
import { requireAuth } from '@/lib/auth';

export async function GET(request: Request) {
    const authError = requireAuth(request);
    if (authError) return authError;

    try {
        await connectDB();
        const articles = await Article.find().sort({ createdAt: -1 });

        const imageData: unknown[] = [];
        const uniqueUrls = new Set<string>();

        articles.forEach((article: Record<string, unknown>) => {
            const images: { type: string; url: string }[] = [];
            const addImg = (type: string, url: unknown) => {
                if (url && typeof url === 'string' && !uniqueUrls.has(url)) {
                    images.push({ type, url });
                    uniqueUrls.add(url);
                }
            };
            addImg('main', article.imageUrl);
            addImg('original', article.originalImageUrl);
            addImg('secondary', article.secondaryImageUrl);
            addImg('diagram', article.diagramUrl);
            if (images.length > 0) imageData.push({ articleId: article.id, articleTitle: article.title, images });
        });

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        return new NextResponse(
            JSON.stringify({ exportDate: new Date().toISOString(), totalArticles: articles.length, totalUniqueImages: uniqueUrls.size, imageData }),
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Disposition': `attachment; filename="toolcurrent-images-backup-${timestamp}.json"`,
                },
            }
        );
    } catch (error) {
        return NextResponse.json({ error: 'Failed to export image URLs' }, { status: 500 });
    }
}
