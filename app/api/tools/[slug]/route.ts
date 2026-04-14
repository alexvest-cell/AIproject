import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { connectDB } from '@/lib/mongodb';
import Tool from '@/lib/models/Tool';
import Comparison from '@/lib/models/Comparison';
import Article from '@/lib/models/Article';
import Stack from '@/lib/models/Stack';
import UseCase from '@/lib/models/UseCase';
import { requireAuth } from '@/lib/auth';

type Params = { params: Promise<{ slug: string }> };

const INVALIDATING_FIELDS = ['key_features', 'pricing_model', 'starting_price', 'rating_score', 'limitations', 'use_case_tags', 'best_for'];

export async function GET(request: Request, { params }: Params) {
    try {
        await connectDB();
        const { slug } = await params;
        const tool = await Tool.findOne({ slug });
        if (!tool) return NextResponse.json({ error: 'Tool not found' }, { status: 404 });

        const [comparisons, allRelatedArticles, stacks, useCases] = await Promise.all([
            Comparison.find({ $or: [{ tool_a_slug: slug }, { tool_b_slug: slug }, { tool_c_slug: slug }], status: 'published' }),
            Article.find({ primary_tools: slug, status: 'published' }).sort({ createdAt: -1 }).lean(),
            Stack.find({ tools: slug, status: 'Published' }).lean(),
            UseCase.find({ related_tools: slug, status: 'active' }).lean(),
        ]);

        const relatedArticles = allRelatedArticles;
        const reviews = allRelatedArticles.filter((a: { article_type?: string }) => a.article_type === 'review');
        const guides = allRelatedArticles.filter((a: { article_type?: string }) => a.article_type === 'guide');
        const news = allRelatedArticles.filter((a: { article_type?: string }) => a.article_type === 'news');
        const bestOf = allRelatedArticles.filter((a: { article_type?: string }) => ['best-of', 'ranking'].includes(a.article_type || ''));
        const useCaseArticles = allRelatedArticles.filter((a: { article_type?: string }) => a.article_type === 'use_case');

        return NextResponse.json({ tool, comparisons, relatedArticles, reviews, guides, news, bestOf, useCaseArticles, stacks, useCases });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch tool' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: Params) {
    const authError = requireAuth(request);
    if (authError) return authError;

    try {
        await connectDB();
        const { slug: toolId } = await params;
        const existing = await Tool.findOne({ id: toolId }).lean() as Record<string, unknown> | null;
        if (!existing) return NextResponse.json({ error: 'Tool not found' }, { status: 404 });

        const { _id, __v, createdAt, ...rawBody } = await request.json();
        const CLEARABLE_ARRAYS = ['screenshots', 'workflow_tags'];
        const CLEARABLE_STRINGS = ['workflow_breakdown', 'price_by_plan'];

        const safeBody = Object.fromEntries(
            Object.entries(rawBody).filter(([k, v]) => {
                if ((v === null || v === undefined) && !CLEARABLE_STRINGS.includes(k)) return false;
                if (v === '') return false;
                if (Array.isArray(v) && v.length === 0 && !CLEARABLE_ARRAYS.includes(k)) return false;
                if (typeof v === 'object' && v !== null && !Array.isArray(v) && Object.keys(v).length === 0) return false;
                return true;
            })
        );

        const updated = await Tool.findOneAndUpdate(
            { id: toolId },
            { $set: { ...safeBody, updatedAt: new Date() } },
            { new: true, runValidators: true }
        ).lean() as Record<string, unknown> | null;

        if (!updated) return NextResponse.json({ error: 'Tool not found after update' }, { status: 404 });

        // Revalidate cached pages for this tool
        revalidatePath(`/tools/${updated.slug}`);
        revalidatePath('/ai-tools');
        revalidatePath('/best-ai-tools');
        revalidatePath('/comparisons');
        revalidatePath('/');
        for (const competitor of (updated.competitors as string[]) || []) {
            const competitorSlug = competitor.toLowerCase().replace(/\s+/g, '-');
            revalidatePath(`/compare/${updated.slug}-vs-${competitorSlug}`);
            for (const ucEntry of (updated.use_case_scores as any[]) || []) {
                const uc = (ucEntry.use_case as string)?.toLowerCase().replace(/\s+/g, '-');
                if (uc) revalidatePath(`/compare/${updated.slug}-vs-${competitorSlug}/${uc}`);
            }
        }
        for (const workflow of (updated.workflow_tags as string[]) || []) {
            revalidatePath(`/best-ai-tools/for/${workflow.toLowerCase().replace(/\s+/g, '-')}`);
        }
        if (updated.category_primary) {
            revalidatePath(`/best-ai-tools/${(updated.category_primary as string).toLowerCase().replace(/\s+/g, '-')}`);
        }

        const hasRelevantChanges = INVALIDATING_FIELDS.some(field => {
            const oldVal = JSON.stringify(existing[field] ?? null);
            const newVal = JSON.stringify(safeBody[field] ?? existing[field] ?? null);
            return oldVal !== newVal;
        });

        if (hasRelevantChanges) {
            await Comparison.updateMany(
                { $or: [{ tool_a_slug: updated.slug }, { tool_b_slug: updated.slug }, { tool_c_slug: updated.slug }] },
                { $set: { needs_update: true } }
            );
        }

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update tool: ' + (error as Error).message }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: Params) {
    const authError = requireAuth(request);
    if (authError) return authError;

    try {
        await connectDB();
        const { slug: toolId } = await params;
        const tool = await Tool.findOneAndDelete({ id: toolId });
        if (!tool) return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete tool: ' + (error as Error).message }, { status: 500 });
    }
}
