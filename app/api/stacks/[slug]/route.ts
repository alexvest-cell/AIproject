import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Stack from '@/lib/models/Stack';
import Tool from '@/lib/models/Tool';
import Article from '@/lib/models/Article';
import Comparison from '@/lib/models/Comparison';
import { requireAuth } from '@/lib/auth';

type Params = { params: Promise<{ slug: string }> };

export async function GET(request: Request, { params }: Params) {
    try {
        await connectDB();
        const { slug } = await params;
        const stack = await Stack.findOne({ slug }).lean() as Record<string, unknown> | null;
        if (!stack) return NextResponse.json({ error: 'Stack not found' }, { status: 404 });

        const tools = await Tool.find({ slug: { $in: stack.tools as string[] }, status: 'Active' }).lean() as Record<string, unknown>[];
        const toolMap = Object.fromEntries(tools.map(t => [t.slug, t]));
        const populatedTools = (stack.tools as string[]).map(s => toolMap[s]).filter(Boolean);

        const [relatedArticles, comparisons, relatedStacks] = await Promise.all([
            Article.find({
                $or: [{ primary_tools: { $in: stack.tools as string[] } }, { category: stack.workflow_category }],
                status: 'published',
            }).sort({ createdAt: -1 }).limit(10).lean(),
            Comparison.find({
                $or: [{ tool_a_slug: { $in: stack.tools as string[] } }, { tool_b_slug: { $in: stack.tools as string[] } }, { tool_c_slug: { $in: stack.tools as string[] } }],
                status: 'published',
            }).limit(6).lean(),
            Stack.find({ workflow_category: stack.workflow_category, slug: { $ne: slug }, status: 'Published' }).limit(4).lean(),
        ]);

        const allCategoryTags = [...new Set(tools.flatMap(t => (t.category_tags as string[]) || []))];
        const altCandidates = allCategoryTags.length
            ? await Tool.find({ category_tags: { $in: allCategoryTags }, slug: { $nin: stack.tools as string[] }, status: 'Active' }, 'slug name logo short_description category_tags pricing_model rating_score').limit(40).lean() as Record<string, unknown>[]
            : [];

        const alternativeTools: Record<string, unknown[]> = {};
        for (const t of tools) {
            const tags = (t.category_tags as string[]) || [];
            alternativeTools[t.slug as string] = altCandidates
                .filter(a => (a.category_tags as string[])?.some(tag => tags.includes(tag)))
                .slice(0, 2);
        }

        return NextResponse.json({ stack, tools: populatedTools, relatedArticles, comparisons, relatedStacks, alternativeTools });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch stack' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: Params) {
    const authError = requireAuth(request);
    if (authError) return authError;

    try {
        await connectDB();
        const { slug: id } = await params;
        const stack = await Stack.findOne({ $or: [{ id }, { slug: id }] });
        if (!stack) return NextResponse.json({ error: 'Stack not found' }, { status: 404 });
        Object.assign(stack, await request.json());
        await stack.save();
        return NextResponse.json(stack);
    } catch (err) {
        return NextResponse.json({ error: (err as Error).message }, { status: 400 });
    }
}

export async function DELETE(request: Request, { params }: Params) {
    const authError = requireAuth(request);
    if (authError) return authError;

    try {
        await connectDB();
        const { slug: id } = await params;
        const stack = await Stack.findOneAndDelete({ $or: [{ id }, { slug: id }] });
        if (!stack) return NextResponse.json({ error: 'Stack not found' }, { status: 404 });
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
