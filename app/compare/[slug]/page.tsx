import type { Metadata } from 'next';
import { connectDB } from '@/lib/mongodb';
import ComparisonModel from '@/lib/models/Comparison';
import Tool from '@/lib/models/Tool';
import { notFound } from 'next/navigation';
import ComparisonPageClient from '@/components/ComparisonPageClient';
import { jsonLdScript } from '@/lib/jsonld';

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ use_case?: string }> };

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
    await connectDB();
    const tools = await Tool.find({ status: 'Active' }, 'slug competitors').lean();
    const activeSlugs = new Set((tools as any[]).map(t => t.slug));
    const params: { slug: string }[] = [];
    const seen = new Set<string>();
    for (const tool of tools as any[]) {
        for (const competitor of tool.competitors || []) {
            // Skip competitor slugs that don't resolve to an active tool — avoids dead compare URLs
            if (!activeSlugs.has(competitor)) continue;
            const slug = `${tool.slug}-vs-${competitor}`;
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
            const title = comparison.meta_title || comparison.title;
            const description = comparison.meta_description || `Head-to-head comparison: ${comparison.title}.`;
            return {
                title,
                description,
                alternates: { canonical: `https://toolcurrent.com/compare/${slug}` },
                openGraph: {
                    title,
                    description,
                    url: `https://toolcurrent.com/compare/${slug}`,
                    type: 'website',
                },
                twitter: { card: 'summary_large_image', title, description },
            };
        }
        const parts = slug.split('-vs-');
        if (parts.length >= 2) {
            const [tA, tB] = await Promise.all([
                Tool.findOne({ slug: parts[0] }).lean() as Promise<any>,
                Tool.findOne({ slug: parts[parts.length - 1] }).lean() as Promise<any>,
            ]);
            if (tA && tB) {
                const title = `${tA.name} vs ${tB.name} (2026)`;
                const description = `Compare ${tA.name} and ${tB.name} — pricing, features, and who wins.`;
                return {
                    title,
                    description,
                    alternates: { canonical: `https://toolcurrent.com/compare/${slug}` },
                    openGraph: { title, description, url: `https://toolcurrent.com/compare/${slug}`, type: 'website' },
                    twitter: { card: 'summary_large_image', title, description },
                };
            }
        }
        return {};
    } catch { return {}; }
}

export default async function ComparePage({ params, searchParams }: Props) {
    const { slug } = await params;
    const { use_case } = await searchParams;
    await connectDB();
    const comparison = await ComparisonModel.findOne({ slug }).lean() as any;

    // ── Resolve tools and initialData (real comparison or synthetic) ──────────
    let tA: any, tB: any, tC: any = null;
    let initialData: any;

    if (comparison) {
        const [toolA, toolB, toolC] = await Promise.all([
            comparison.tool_a_slug ? Tool.findOne({ slug: comparison.tool_a_slug }).lean() : null,
            comparison.tool_b_slug ? Tool.findOne({ slug: comparison.tool_b_slug }).lean() : null,
            comparison.tool_c_slug ? Tool.findOne({ slug: comparison.tool_c_slug }).lean() : null,
        ]);
        tA = toolA; tB = toolB; tC = toolC ?? null;
        initialData = { ...comparison, tool_a: toolA, tool_b: toolB, tool_c: toolC ?? undefined } as any;
    } else {
        // No comparison doc — synthetic builder from tool slugs
        const parts = slug.split('-vs-');
        if (parts.length < 2) notFound();
        const slugA = parts[0];
        const slugB = parts[1];
        // Guard: ID-based slugs will never resolve to a tool — return clean 404
        if (slugA.startsWith('tool-') || slugB.startsWith('tool-')) notFound();
        const slugC = parts.length >= 3 ? parts[2] : null;
        const [toolA, toolB, toolC] = await Promise.all([
            Tool.findOne({ slug: slugA, status: 'Active' }).lean(),
            Tool.findOne({ slug: slugB, status: 'Active' }).lean(),
            slugC ? Tool.findOne({ slug: slugC, status: 'Active' }).lean() : Promise.resolve(null),
        ]);
        if (!toolA || !toolB) notFound();
        tA = toolA as any;
        tB = toolB as any;
        tC = (toolC as any) ?? null;
        const titleParts = [tA.name, tB.name, ...(tC ? [tC.name] : [])];
        initialData = {
            id: slug,
            slug,
            title: titleParts.join(' vs '),
            tool_a_slug: slugA,
            tool_b_slug: slugB,
            tool_c_slug: slugC ?? undefined,
            tool_a: tA,
            tool_b: tB,
            tool_c: tC ?? undefined,
            status: 'published' as const,
            comparison_type: slugC ? '1v1v1' : '1v1' as const,
            generated_output: null,
        };
    }

    if (!tA || !tB) notFound();

    // ── Prefetch Also Compare — alternative comparisons involving these tools ─
    const toolSlugs = [tA, tB, tC].filter(Boolean).map((t: any) => t.slug);
    const rawAltComps = await ComparisonModel.find({
        $or: [
            { tool_a_slug: { $in: toolSlugs } },
            { tool_b_slug: { $in: toolSlugs } },
            { tool_c_slug: { $in: toolSlugs } },
        ],
        slug: { $ne: slug },
        status: 'published',
    }).limit(10).lean() as any[];

    // Enrich each with tool_a / tool_b so the Also Compare cards can render logos
    const altPairSlugs = Array.from(new Set(rawAltComps.flatMap(c => [c.tool_a_slug, c.tool_b_slug].filter(Boolean))));
    const altPairTools = altPairSlugs.length > 0
        ? await Tool.find({ slug: { $in: altPairSlugs }, status: 'Active' }, 'slug name logo').lean() as any[]
        : [];
    const altToolBySlug = new Map<string, any>(altPairTools.map(t => [t.slug, t]));
    const alternativeComparisons = rawAltComps
        .map(c => ({ ...c, tool_a: altToolBySlug.get(c.tool_a_slug) || null, tool_b: altToolBySlug.get(c.tool_b_slug) || null }))
        .filter(c => c.tool_a && c.tool_b)
        .slice(0, 4);

    initialData = { ...initialData, alternativeComparisons };

    // ── JSON-LD Schemas ──────────────────────────────────────────────────────
    const useCaseDisplay = use_case
        ? use_case.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
        : undefined;
    const comparedTools = [tA, tB, tC].filter(Boolean);
    const compUrl = `https://toolcurrent.com/compare/${slug}`;

    const itemListSchema = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: `${tA.name} vs ${tB.name}${useCaseDisplay ? ` for ${useCaseDisplay}` : ''} — Comparison`,
        description: `Side-by-side comparison of ${tA.name} and ${tB.name}${useCaseDisplay ? ` for ${useCaseDisplay}` : ''}. Scores, features, pricing, and verdict.`,
        url: compUrl,
        numberOfItems: comparedTools.length,
        itemListElement: comparedTools.map((tool: any, index: number) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: tool.name,
            url: `https://toolcurrent.com/tools/${tool.slug}`,
            description: tool.short_description || tool.name,
        })),
    };

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Comparisons', item: 'https://toolcurrent.com/comparisons' },
            {
                '@type': 'ListItem',
                position: 2,
                name: useCaseDisplay
                    ? `${tA.name} vs ${tB.name} for ${useCaseDisplay}`
                    : `${tA.name} vs ${tB.name}`,
                item: compUrl,
            },
        ],
    };

    const verdictText = comparison?.verdict
        || (typeof comparison?.body === 'string' ? comparison.body.slice(0, 300) : undefined)
        || `Compare ${tA.name} and ${tB.name} — see the full comparison for ratings, features, and pricing.`;

    const pricingText = `${tA.name}: ${tA.starting_price || tA.pricing_model || 'See website'}. ${tB.name}: ${tB.starting_price || tB.pricing_model || 'See website'}.`;

    const winnerAdvantage = comparison?.choose_tool_a?.[0]
        || comparison?.why_it_wins_override
        || `See full comparison for detailed strengths of ${tA.name} vs ${tB.name}.`;

    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
            {
                '@type': 'Question',
                name: `Which is better: ${tA.name} or ${tB.name}${useCaseDisplay ? ` for ${useCaseDisplay}` : ''}?`,
                acceptedAnswer: { '@type': 'Answer', text: verdictText },
            },
            {
                '@type': 'Question',
                name: `How much does ${tA.name} cost compared to ${tB.name}?`,
                acceptedAnswer: { '@type': 'Answer', text: pricingText },
            },
            {
                '@type': 'Question',
                name: `What is ${tA.name} better at than ${tB.name}?`,
                acceptedAnswer: { '@type': 'Answer', text: winnerAdvantage },
            },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: jsonLdScript(itemListSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: jsonLdScript(faqSchema) }}
            />
            <ComparisonPageClient
                slug={slug}
                useCase={use_case}
                initialData={JSON.parse(JSON.stringify(initialData))}
            />
        </>
    );
}
