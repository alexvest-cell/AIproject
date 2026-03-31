import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Article from '@/lib/models/Article';
import Tool from '@/lib/models/Tool';
import { requireAuth } from '@/lib/auth';

export async function GET(request: Request) {
    const authError = requireAuth(request);
    if (authError) return authError;

    try {
        await connectDB();
        const articles = await Article.find().sort({ createdAt: -1 });
        const tools = await Tool.find().lean();

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        return new NextResponse(
            JSON.stringify({ exportDate: new Date().toISOString(), totalArticles: articles.length, totalTools: tools.length, articles, tools }),
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Disposition': `attachment; filename="toolcurrent-backup-${timestamp}.json"`,
                },
            }
        );
    } catch (error) {
        return NextResponse.json({ error: 'Failed to export articles' }, { status: 500 });
    }
}
