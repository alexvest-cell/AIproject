import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Category from '@/lib/models/Category';
import Tool from '@/lib/models/Tool';
import Article from '@/lib/models/Article';
import UseCase from '@/lib/models/UseCase';
import Comparison from '@/lib/models/Comparison';
import { requireAuth } from '@/lib/auth';

type Params = { params: Promise<{ slug: string }> };

export async function GET(request: Request, { params }: Params) {
    try {
        await connectDB();
        const { slug } = await params;
        const category = await Category.findOne({ slug }).lean() as Record<string, unknown> | null;
        if (!category) return NextResponse.json({ error: 'Category not found' }, { status: 404 });

        const tools = await Tool.find({ category_tags: { $regex: new RegExp(category.name as string, 'i') }, status: 'Active' })
            .sort({ rating_score: -1 }).limit(100).lean() as Record<string, unknown>[];

        const featuredToolSlugs = (category.featured_tools as string[]) || [];
        const featuredTools = featuredToolSlugs.length > 0
            ? tools.filter(t => featuredToolSlugs.includes(t.slug as string))
            : tools.slice(0, 4);

        const toolSlugs = tools.map(t => t.slug as string);
        const [bestSoftwareArticles, guides, useCases, comparisons] = await Promise.all([
            Article.find({ $or: [{ category: { $in: [category.name] } }, { primary_tools: { $in: toolSlugs } }], article_type: { $in: ['best-of', 'ranking'] }, status: 'published' }).sort({ createdAt: -1 }).limit(8).lean(),
            Article.find({ $or: [{ category: { $in: [category.name] } }, { primary_tools: { $in: toolSlugs } }], article_type: 'guide', status: 'published' }).sort({ createdAt: -1 }).limit(8).lean(),
            UseCase.find({ $or: [{ primary_category: slug }, { primary_category: category.name as string }], status: 'active' }).lean(),
            Comparison.find({ $or: [{ tool_a_slug: { $in: toolSlugs } }, { tool_b_slug: { $in: toolSlugs } }], status: 'published' }).limit(6).lean(),
        ]);

        const relatedSlugs = (category.related_categories as string[]) || [];
        const relatedCategories = relatedSlugs.length > 0
            ? await Category.find({ slug: { $in: relatedSlugs }, status: 'active' }).lean()
            : await Category.find({ _id: { $ne: (category as Record<string, unknown>)._id }, status: 'active' }).limit(6).lean();

        return NextResponse.json({ category, tools, featuredTools, bestSoftwareArticles, guides, relatedCategories, useCases, comparisons });
    } catch (err) {
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: Params) {
    const authError = requireAuth(request);
    if (authError) return authError;

    try {
        await connectDB();
        const { slug } = await params;
        const updated = await Category.findOneAndUpdate({ slug }, { ...await request.json(), updatedAt: new Date() }, { new: true });
        if (!updated) return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        return NextResponse.json(updated);
    } catch (err) {
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: Params) {
    const authError = requireAuth(request);
    if (authError) return authError;

    try {
        await connectDB();
        const { slug } = await params;
        const deleted = await Category.findOneAndDelete({ slug });
        if (!deleted) return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
