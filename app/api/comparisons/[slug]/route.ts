import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Comparison from '@/lib/models/Comparison';
import Tool from '@/lib/models/Tool';
import Article from '@/lib/models/Article';
import { requireAuth } from '@/lib/auth';
import { generateComparison } from '@/lib/compareEngine.js';

type Params = { params: Promise<{ slug: string }> };

export async function GET(request: Request, { params }: Params) {
    try {
        await connectDB();
        const { slug } = await params;
        const { searchParams } = new URL(request.url);
        const ucParam = searchParams.get('use_case');

        let comparison = await Comparison.findOne({ slug });

        let toolA, toolB, toolC;
        if (comparison) {
            [toolA, toolB] = await Promise.all([
                Tool.findOne({ slug: comparison.tool_a_slug }),
                Tool.findOne({ slug: comparison.tool_b_slug }),
            ]);
            toolC = comparison.tool_c_slug ? await Tool.findOne({ slug: comparison.tool_c_slug }) : null;
        } else {
            const parts = slug.split('-vs-');
            if (parts.length < 2) return NextResponse.json({ error: 'Invalid comparison slug' }, { status: 404 });
            if (parts.length === 3) {
                [toolA, toolB, toolC] = await Promise.all([
                    Tool.findOne({ slug: parts[0] }),
                    Tool.findOne({ slug: parts[1] }),
                    Tool.findOne({ slug: parts[2] }),
                ]);
            } else {
                [toolA, toolB] = await Promise.all([
                    Tool.findOne({ slug: parts[0] }),
                    Tool.findOne({ slug: parts.slice(1).join('-vs-') }),
                ]);
            }
            if (!toolA || !toolB) return NextResponse.json({ error: 'One or more tools not found' }, { status: 404 });
        }

        const toolList = [toolA, toolB, toolC].filter(Boolean);

        let ucDisplay: string | null = null;
        let invalidUseCase = false;
        let available_use_cases: string[] = [];

        if (ucParam) {
            ucDisplay = ucParam.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
            const allTagSets = toolList.map(t => ((t as Record<string, unknown>).use_case_tags as string[] || []).map((u: string) => u.toLowerCase()));
            available_use_cases = ((toolList[0] as Record<string, unknown>).use_case_tags as string[] || []).filter((uc: string) =>
                allTagSets.every(s => s.includes(uc.toLowerCase()))
            );
            if (!available_use_cases.some(uc => uc.toLowerCase() === ucDisplay!.toLowerCase())) {
                invalidUseCase = true;
                ucDisplay = null;
            }
        }

        const ctx = {
            primary_use_case: ucDisplay || undefined,
            comparison_type: comparison?.comparison_type || (toolC ? 'multi' : '1v1'),
        };
        let generatedOutput = generateComparison(toolList, ctx);

        if (comparison?.is_override) {
            const ov = comparison;
            if (ov.verdict_override) {
                generatedOutput = {
                    ...generatedOutput,
                    header: { ...generatedOutput.header, quick_summary: ov.verdict_override },
                    quick_verdict: { ...generatedOutput.quick_verdict, summary: ov.verdict_override },
                };
            }
            if (ov.strengths_override) {
                const merged = { ...generatedOutput.strengths_weaknesses };
                Object.keys(ov.strengths_override).forEach(s => {
                    if (merged[s]) merged[s] = { ...merged[s], strengths: ov.strengths_override[s] };
                });
                generatedOutput = { ...generatedOutput, strengths_weaknesses: merged };
            }
            if (ov.weaknesses_override) {
                const merged = { ...generatedOutput.strengths_weaknesses };
                Object.keys(ov.weaknesses_override).forEach(s => {
                    if (merged[s]) merged[s] = { ...merged[s], weaknesses: ov.weaknesses_override[s] };
                });
                generatedOutput = { ...generatedOutput, strengths_weaknesses: merged };
            }
            if (ov.feature_comparison_override) generatedOutput = { ...generatedOutput, table: ov.feature_comparison_override };
            if (ov.recommendation_override) generatedOutput = { ...generatedOutput, decision: ov.recommendation_override };
        }

        const toolSlugs = toolList.map((t: Record<string, unknown>) => t.slug);
        const [alternativeComparisons, relatedRankings] = await Promise.all([
            Comparison.find({
                $or: [{ tool_a_slug: { $in: toolSlugs } }, { tool_b_slug: { $in: toolSlugs } }, { tool_c_slug: { $in: toolSlugs } }],
                slug: { $ne: slug },
                status: 'published',
            }).limit(5),
            Article.find({ primary_tools: { $in: toolSlugs }, status: 'published' }).sort({ createdAt: -1 }).limit(4),
        ]);

        const compObj = comparison ? comparison.toObject() : {
            id: null,
            title: toolList.map((t: Record<string, unknown>) => t.name).join(' vs '),
            slug,
            tool_a_slug: toolA.slug,
            tool_b_slug: toolB.slug,
            tool_c_slug: toolC?.slug || null,
            is_override: false,
            use_case: ucDisplay,
            comparison_type: ctx.comparison_type,
            status: 'published',
            primary_use_cases: [],
        };

        return NextResponse.json({
            ...compObj,
            tool_a: toolA,
            tool_b: toolB,
            tool_c: toolC || null,
            generated_output: generatedOutput,
            alternativeComparisons,
            relatedRankings,
            ...(invalidUseCase ? { invalid_use_case: true, available_use_cases } : {}),
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch comparison' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: Params) {
    const authError = requireAuth(request);
    if (authError) return authError;

    try {
        await connectDB();
        const { slug: comparisonId } = await params;
        const updates = { ...await request.json(), updatedAt: new Date() };
        const comparison = await Comparison.findOneAndUpdate({ id: comparisonId }, updates, { new: true });
        if (!comparison) return NextResponse.json({ error: 'Comparison not found' }, { status: 404 });
        return NextResponse.json(comparison);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update comparison: ' + (error as Error).message }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: Params) {
    const authError = requireAuth(request);
    if (authError) return authError;

    try {
        await connectDB();
        const { slug: comparisonId } = await params;
        const comparison = await Comparison.findOneAndDelete({ id: comparisonId });
        if (!comparison) return NextResponse.json({ error: 'Comparison not found' }, { status: 404 });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete comparison: ' + (error as Error).message }, { status: 500 });
    }
}
