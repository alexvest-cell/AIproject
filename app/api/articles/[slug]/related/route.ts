import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Article from '@/lib/models/Article';
import Tool from '@/lib/models/Tool';
import Comparison from '@/lib/models/Comparison';

type Params = { params: Promise<{ slug: string }> };

export async function GET(request: Request, { params }: Params) {
    try {
        await connectDB();
        const { slug } = await params;
        const MAX_RELATED_TOOLS = 12;
        const MAX_RELATED_ARTICLES = 6;

        const article = await Article.findOne({ slug }).lean();
        if (!article) return NextResponse.json({ error: 'Article not found' }, { status: 404 });

        const primaryToolSlugs: string[] = (article as any).primary_tools || [];

        let tools = await Tool.find({ slug: { $in: primaryToolSlugs }, status: 'Active' }).limit(MAX_RELATED_TOOLS).lean();
        if (tools.length === 0) {
            tools = await Tool.find({ status: 'Active' }).sort({ rating_score: -1, review_count: -1 }).limit(8).lean();
        }

        const comparisonQuery = primaryToolSlugs.length > 0
            ? { $or: [{ tool_a_slug: { $in: primaryToolSlugs } }, { tool_b_slug: { $in: primaryToolSlugs } }, { tool_c_slug: { $in: primaryToolSlugs } }], status: 'published' }
            : null;
        const comparisons = comparisonQuery ? await Comparison.find(comparisonQuery).limit(4).lean() : [];

        const a = article as any;
        const articleCategories: string[] = Array.isArray(a.category) ? a.category : (a.category ? [a.category] : []);
        const relatedOrClauses: object[] = [];
        if (articleCategories.length > 0) relatedOrClauses.push({ category: { $in: articleCategories } });
        if (a.topic) relatedOrClauses.push({ topic: a.topic });
        const relatedArticles = relatedOrClauses.length > 0
            ? await Article.find({ _id: { $ne: a._id }, $or: relatedOrClauses })
                .sort({ createdAt: -1 })
                .limit(MAX_RELATED_ARTICLES)
                .select('id title slug excerpt imageUrl category topic article_type date')
                .lean()
            : [];

        return NextResponse.json({ tools, comparisons, relatedArticles });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch related content' }, { status: 500 });
    }
}
