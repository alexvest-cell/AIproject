import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Tool from '@/lib/models/Tool';
import Comparison from '@/lib/models/Comparison';
import Article from '@/lib/models/Article';

type Params = { params: Promise<{ slug: string }> };

export async function GET(request: Request, { params }: Params) {
    try {
        await connectDB();
        const { slug } = await params;

        const tool = await Tool.findOne({ slug }).lean() as Record<string, unknown> | null;
        if (!tool) return NextResponse.json({ error: 'Tool not found' }, { status: 404 });

        const candidates = await Tool.find({
            slug: { $ne: slug },
            status: 'Active',
            category_tags: { $in: (tool.category_tags as string[]) || [] },
        }).lean() as Record<string, unknown>[];

        const scored = candidates.map(t => {
            const overlap = ((t.category_tags as string[]) || []).filter(tag =>
                ((tool.category_tags as string[]) || []).includes(tag)
            ).length;
            return { ...t, _score: overlap * 10 + ((t.rating_score as number) || 0) };
        });
        scored.sort((a, b) => (b._score as number) - (a._score as number));
        const alternatives = scored.slice(0, 12);

        const [comparisons, relatedArticles] = await Promise.all([
            Comparison.find({ $or: [{ tool_a_slug: slug }, { tool_b_slug: slug }, { tool_c_slug: slug }], status: 'published' }).lean(),
            Article.find({ primary_tools: slug, status: 'published' }).sort({ createdAt: -1 }).limit(6).lean(),
        ]);

        return NextResponse.json({ tool, alternatives, comparisons, relatedArticles });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch alternatives' }, { status: 500 });
    }
}
