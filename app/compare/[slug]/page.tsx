import type { Metadata } from 'next';
import { connectDB } from '@/lib/mongodb';
import ComparisonModel from '@/lib/models/Comparison';
import Tool from '@/lib/models/Tool';
import { notFound } from 'next/navigation';
import ComparisonPageClient from '@/components/ComparisonPageClient';

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ use_case?: string }> };

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
    await connectDB();
    const tools = await Tool.find({ status: 'Active' }, 'slug competitors').lean();
    const params: { slug: string }[] = [];
    const seen = new Set<string>();
    for (const tool of tools as any[]) {
        for (const competitor of tool.competitors || []) {
            const competitorSlug = (competitor as string).toLowerCase().replace(/\s+/g, '-');
            const slug = `${tool.slug}-vs-${competitorSlug}`;
            if (!seen.has(slug)) {
                seen.add(slug);
                params.push({ slug });
            }
        }
    }
    return params;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    try {
        await connectDB();
        const { slug } = await params;
        const comparison = await ComparisonModel.findOne({ slug }).lean() as any;
        if (comparison) {
            return {
                title: comparison.meta_title || comparison.title,
                description: comparison.meta_description || `Head-to-head comparison: ${comparison.title}.`,
                alternates: { canonical: `https://toolcurrent.com/compare/${slug}` },
            };
        }
        const parts = slug.split('-vs-');
        if (parts.length >= 2) {
            const [tA, tB] = await Promise.all([
                Tool.findOne({ slug: parts[0] }).lean() as Promise<any>,
                Tool.findOne({ slug: parts[parts.length - 1] }).lean() as Promise<any>,
            ]);
            if (tA && tB) return { title: `${tA.name} vs ${tB.name} (2026)`, description: `Compare ${tA.name} and ${tB.name} — pricing, features, and who wins.` };
        }
        return {};
    } catch { return {}; }
}

export default async function ComparePage({ params, searchParams }: Props) {
    const { slug } = await params;
    const { use_case } = await searchParams;
    await connectDB();
    const comparison = await ComparisonModel.findOne({ slug }).lean() as any;

    if (comparison) {
        const [toolA, toolB, toolC] = await Promise.all([
            comparison.tool_a_slug ? Tool.findOne({ slug: comparison.tool_a_slug }).lean() : null,
            comparison.tool_b_slug ? Tool.findOne({ slug: comparison.tool_b_slug }).lean() : null,
            comparison.tool_c_slug ? Tool.findOne({ slug: comparison.tool_c_slug }).lean() : null,
        ]);
        const enriched = { ...comparison, tool_a: toolA, tool_b: toolB, tool_c: toolC ?? undefined };
        return (
            <ComparisonPageClient
                slug={slug}
                useCase={use_case}
                initialData={JSON.parse(JSON.stringify(enriched))}
            />
        );
    }

    // No comparison doc yet — build a synthetic one from the two tool slugs
    const parts = slug.split('-vs-');
    if (parts.length < 2) notFound();
    const slugA = parts[0];
    const slugB = parts.slice(1).join('-vs-');
    const [toolA, toolB] = await Promise.all([
        Tool.findOne({ slug: slugA, status: 'Active' }).lean(),
        Tool.findOne({ slug: slugB, status: 'Active' }).lean(),
    ]);
    if (!toolA || !toolB) notFound();

    const tA = toolA as any;
    const tB = toolB as any;
    const synthetic = {
        id: slug,
        slug,
        title: `${tA.name} vs ${tB.name}`,
        tool_a_slug: slugA,
        tool_b_slug: slugB,
        tool_a: tA,
        tool_b: tB,
        status: 'published' as const,
        comparison_type: '1v1' as const,
        generated_output: null,
    };
    return (
        <ComparisonPageClient
            slug={slug}
            useCase={use_case}
            initialData={JSON.parse(JSON.stringify(synthetic))}
        />
    );
}
