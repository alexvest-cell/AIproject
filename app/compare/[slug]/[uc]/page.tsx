import type { Metadata } from 'next';
import { connectDB } from '@/lib/mongodb';
import ComparisonModel from '@/lib/models/Comparison';
import Tool from '@/lib/models/Tool';
import { notFound } from 'next/navigation';
import ComparisonPageClient from '@/components/ComparisonPageClient';
import { jsonLdScript } from '@/lib/jsonld';

type Props = { params: Promise<{ slug: string; uc: string }> };

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
    // [uc] comparison pages are not pre-built at deploy time.
    // dynamicParams = true (above) ensures they render on-demand and are
    // then cached per revalidate = 3600. Pre-building them during SSG
    // causes parallel DB connection timeouts with Atlas.
    return [];
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
                alternates: { canonical: `https://toolcurrent.com/compare/${slug}` },
            };
        }
        // Synthetic: derive from tool slugs
        const parts = slug.split('-vs-');
        if (parts.length >= 2) {
            const [tA, tB] = await Promise.all([
                Tool.findOne({ slug: parts[0] }).lean() as Promise<any>,
                Tool.findOne({ slug: parts[1] }).lean() as Promise<any>,
            ]);
            if (tA && tB) return {
                title: `${tA.name} vs ${tB.name} for ${ucLabel} (2026)`,
                description: `Compare ${tA.name} and ${tB.name} for ${ucLabel} — features, pricing, and who wins.`,
                alternates: { canonical: `https://toolcurrent.com/compare/${slug}` },
            };
        }
        return {};
    } catch { return {}; }
}

export default async function CompareUcPage({ params }: Props) {
    const { slug, uc } = await params;
    await connectDB();
    const comparison = await ComparisonModel.findOne({ slug }).lean() as any;

    const useCase = uc.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

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
        initialData = { ...comparison, tool_a: toolA, tool_b: toolB, tool_c: toolC ?? undefined };
    } else {
        // No comparison doc — synthetic builder (mirrors [slug]/page.tsx)
        const parts = slug.split('-vs-');
        if (parts.length < 2) notFound();

        const slugA = parts[0];
        const slugB = parts[1];
        const slugC = parts.length >= 3 ? parts[2] : null;

        const [toolA, toolB, toolC] = await Promise.all([
            Tool.findOne({ slug: slugA, status: 'Active' }).lean(),
            Tool.findOne({ slug: slugB, status: 'Active' }).lean(),
            slugC ? Tool.findOne({ slug: slugC, status: 'Active' }).lean() : Promise.resolve(null),
        ]);

        if (!toolA || !toolB) notFound();
        tA = toolA as any;
        tB = toolB as any;
        tC = toolC as any | null;

        // Validate use case — check if either tool has it in use_case_scores
        const ucNormalized = uc.replace(/-/g, ' ').toLowerCase();
        const hasUc = (t: any) => t?.use_case_scores?.some((u: any) => u.use_case?.toLowerCase() === ucNormalized);
        const useCaseValid = hasUc(tA) || hasUc(tB) || hasUc(tC);

        initialData = {
            id: slug,
            slug,
            title: tC ? `${tA.name} vs ${tB.name} vs ${tC.name}` : `${tA.name} vs ${tB.name}`,
            tool_a_slug: slugA,
            tool_b_slug: slugB,
            tool_c_slug: slugC ?? undefined,
            tool_a: tA,
            tool_b: tB,
            tool_c: tC ?? undefined,
            status: 'published' as const,
            comparison_type: tC ? ('3way' as const) : ('1v1' as const),
            generated_output: null,
            _use_case_notice: useCaseValid
                ? null
                : 'This use case comparison is not available — showing overall comparison.',
        };

        if (!useCaseValid) {
            // Re-render with no use case context if it's not valid for this pair
            return (
                <ComparisonPageClient
                    slug={slug}
                    useCase={undefined}
                    initialData={JSON.parse(JSON.stringify(initialData))}
                />
            );
        }
    }

    if (!tA || !tB) notFound();

    // ── JSON-LD Schemas ──────────────────────────────────────────────────────
    const comparedTools = [tA, tB, tC].filter(Boolean);
    const compUrl = `https://toolcurrent.com/compare/${slug}/${uc}`;

    const itemListSchema = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: `${tA.name} vs ${tB.name} for ${useCase} — Comparison`,
        description: `Side-by-side comparison of ${tA.name} and ${tB.name} for ${useCase}. Scores, features, pricing, and verdict.`,
        url: compUrl,
        numberOfItems: comparedTools.length,
        itemListElement: comparedTools.map((tool: any, index: number) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: tool.name,
            url: `https://toolcurrent.com/tools/${tool.slug}?for=${uc}`,
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
                name: `${tA.name} vs ${tB.name}`,
                item: `https://toolcurrent.com/compare/${slug}`,
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: `${tA.name} vs ${tB.name} for ${useCase}`,
                item: compUrl,
            },
        ],
    };

    const verdictText = comparison?.verdict
        || (typeof comparison?.body === 'string' ? comparison.body.slice(0, 300) : undefined)
        || `Compare ${tA.name} and ${tB.name} for ${useCase} — see the full comparison for ratings, features, and pricing.`;

    const pricingText = `${tA.name}: ${tA.starting_price || tA.pricing_model || 'See website'}. ${tB.name}: ${tB.starting_price || tB.pricing_model || 'See website'}.`;

    const winnerAdvantage = comparison?.choose_tool_a?.[0]
        || comparison?.why_it_wins_override
        || `See full comparison for detailed strengths of ${tA.name} vs ${tB.name} for ${useCase}.`;

    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
            {
                '@type': 'Question',
                name: `Which is better for ${useCase}: ${tA.name} or ${tB.name}?`,
                acceptedAnswer: { '@type': 'Answer', text: verdictText },
            },
            {
                '@type': 'Question',
                name: `How much does ${tA.name} cost compared to ${tB.name}?`,
                acceptedAnswer: { '@type': 'Answer', text: pricingText },
            },
            {
                '@type': 'Question',
                name: `What is ${tA.name} better at than ${tB.name} for ${useCase}?`,
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
                useCase={useCase}
                initialData={JSON.parse(JSON.stringify(initialData))}
            />
        </>
    );
}
