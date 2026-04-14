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

        const MAX = 12;
        const competitorSlugs = ((tool.competitors as string[]) || []).filter((s: string) => s !== slug);

        // ── Step 1: Explicit competitors ─────────────────────────────────────────
        let explicitCompetitors: Record<string, unknown>[] = [];
        if (competitorSlugs.length > 0) {
            explicitCompetitors = await Tool.find({
                slug: { $in: competitorSlugs },
                status: 'Active',
            }).sort({ rating_score: -1 }).lean() as Record<string, unknown>[];
        }

        const explicitSlugs = explicitCompetitors.map((t: any) => t.slug as string);

        // ── Step 2: Category matches to fill remaining slots ─────────────────────
        const remainingAfterExplicit = MAX - explicitCompetitors.length;
        let categoryMatches: Record<string, unknown>[] = [];
        if (remainingAfterExplicit > 0 && tool.category_primary) {
            categoryMatches = await Tool.find({
                category_primary: tool.category_primary,
                status: 'Active',
                slug: { $ne: slug, $nin: explicitSlugs },
            }).sort({ rating_score: -1 }).limit(remainingAfterExplicit).lean() as Record<string, unknown>[];
        }

        // ── Step 3: Tertiary use-case fallback (only when total < 3) ────────────
        const combined = [...explicitCompetitors, ...categoryMatches];
        let useCaseMatches: Record<string, unknown>[] = [];
        if (combined.length < 3) {
            const usedSlugs = [slug, ...explicitSlugs, ...categoryMatches.map((t: any) => t.slug as string)];
            const remainingAfterCategory = MAX - combined.length;
            useCaseMatches = await Tool.find({
                use_case_tags: { $in: (tool.use_case_tags as string[]) || [] },
                status: 'Active',
                slug: { $ne: slug, $nin: usedSlugs },
            }).sort({ rating_score: -1 }).limit(remainingAfterCategory).lean() as Record<string, unknown>[];
        }

        // ── Step 4: Combine with source indicator ────────────────────────────────
        const alternatives = [
            ...explicitCompetitors.map((t: any) => ({ ...t, _alternativeSource: 'competitor' })),
            ...categoryMatches.map((t: any) => ({ ...t, _alternativeSource: 'category' })),
            ...useCaseMatches.map((t: any) => ({ ...t, _alternativeSource: 'use-case' })),
        ].slice(0, MAX);

        const [comparisons, relatedArticles] = await Promise.all([
            Comparison.find({ $or: [{ tool_a_slug: slug }, { tool_b_slug: slug }, { tool_c_slug: slug }], status: 'published' }).lean(),
            Article.find({ primary_tools: slug, status: 'published' }).sort({ createdAt: -1 }).limit(6).lean(),
        ]);

        return NextResponse.json({ tool, alternatives, comparisons, relatedArticles });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch alternatives' }, { status: 500 });
    }
}
