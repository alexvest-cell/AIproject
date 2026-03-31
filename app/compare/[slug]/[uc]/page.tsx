import type { Metadata } from 'next';
import { connectDB } from '@/lib/mongodb';
import ComparisonModel from '@/lib/models/Comparison';
import Tool from '@/lib/models/Tool';
import { notFound } from 'next/navigation';
import ComparisonPageClient from '@/components/ComparisonPageClient';

type Props = { params: Promise<{ slug: string; uc: string }> };

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
    await connectDB();
    const tools = await Tool.find({ status: 'Active' }, 'slug competitors use_case_scores').lean();
    const params: { slug: string; uc: string }[] = [];
    const seen = new Set<string>();
    for (const tool of tools as any[]) {
        for (const competitor of tool.competitors || []) {
            const competitorSlug = (competitor as string).toLowerCase().replace(/\s+/g, '-');
            const compSlug = `${tool.slug}-vs-${competitorSlug}`;
            for (const ucEntry of tool.use_case_scores || []) {
                const uc = (ucEntry.use_case as string)?.toLowerCase().replace(/\s+/g, '-');
                if (!uc) continue;
                const key = `${compSlug}/${uc}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    params.push({ slug: compSlug, uc });
                }
            }
        }
    }
    return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    try {
        await connectDB();
        const { slug, uc } = await params;
        const comparison = await ComparisonModel.findOne({ slug }).lean() as any;
        const ucLabel = uc.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        if (comparison) {
            return {
                title: comparison.meta_title || `${comparison.title} for ${ucLabel}`,
                description: comparison.meta_description || `Compare ${comparison.title} for ${ucLabel}.`,
                alternates: { canonical: `https://toolcurrent.com/compare/${slug}/${uc}` },
            };
        }
        return {};
    } catch { return {}; }
}

export default async function CompareUcPage({ params }: Props) {
    const { slug, uc } = await params;
    await connectDB();
    const comparison = await ComparisonModel.findOne({ slug }).lean() as any;
    if (!comparison) notFound();

    const [toolA, toolB, toolC] = await Promise.all([
        comparison.tool_a_slug ? Tool.findOne({ slug: comparison.tool_a_slug }).lean() : null,
        comparison.tool_b_slug ? Tool.findOne({ slug: comparison.tool_b_slug }).lean() : null,
        comparison.tool_c_slug ? Tool.findOne({ slug: comparison.tool_c_slug }).lean() : null,
    ]);

    const enriched = { ...comparison, tool_a: toolA, tool_b: toolB, tool_c: toolC ?? undefined };
    const useCase = uc.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    return (
        <ComparisonPageClient
            slug={slug}
            useCase={useCase}
            initialData={JSON.parse(JSON.stringify(enriched))}
        />
    );
}
