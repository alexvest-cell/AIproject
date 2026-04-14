import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import Tool from '@/lib/models/Tool';
import Comparison from '@/lib/models/Comparison';
import Article from '@/lib/models/Article';
import AlternativesPageClient from '@/components/AlternativesPageClient';
import { jsonLdScript } from '@/lib/jsonld';

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 86400;

export async function generateStaticParams() {
    await connectDB();
    const tools = await Tool.find({ status: 'Active' }, 'slug').lean();
    return (tools as any[]).map(t => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    try {
        await connectDB();
        const { slug } = await params;
        const tool = await Tool.findOne({ slug }).lean() as any;
        if (!tool) return {};
        return {
            title: `Best ${tool.name} Alternatives (2026) — Ranked & Compared | ToolCurrent`,
            description: `The best alternatives to ${tool.name} in 2026. Compare features, pricing, and scores to find the right tool for your workflow.`,
            alternates: { canonical: `https://toolcurrent.com/tools/${slug}/alternatives` },
        };
    } catch { return {}; }
}

// ── Shared helpers ─────────────────────────────────────────────────────────────

function isDiscontinued(t: any): boolean {
    const d = ((t.short_description || '') + ' ' + (t.full_description || '')).toLowerCase();
    return d.includes('discontinued') || d.includes('shut down') || d.includes('no longer available');
}

async function fetchAlternatives(tool: any, slug: string): Promise<any[]> {
    const MAX = 12;
    const competitorSlugs = ((tool.competitors as string[]) || []).filter((s: string) => s !== slug);

    // Step 1 — explicit competitors
    let explicitCompetitors: any[] = [];
    if (competitorSlugs.length > 0) {
        explicitCompetitors = await Tool.find({
            slug: { $in: competitorSlugs },
            status: 'Active',
        }).sort({ rating_score: -1 }).lean();
    }
    const explicitSlugs = explicitCompetitors.map((t: any) => t.slug as string);

    // Step 2 — category fills
    const remainingAfterExplicit = MAX - explicitCompetitors.length;
    let categoryMatches: any[] = [];
    if (remainingAfterExplicit > 0 && tool.category_primary) {
        categoryMatches = await Tool.find({
            category_primary: tool.category_primary,
            status: 'Active',
            slug: { $ne: slug, $nin: explicitSlugs },
        }).sort({ rating_score: -1 }).limit(remainingAfterExplicit).lean();
    }

    // Step 3 — use-case tertiary fallback (only when total < 3)
    const combined = [...explicitCompetitors, ...categoryMatches];
    let useCaseMatches: any[] = [];
    if (combined.length < 3) {
        const usedSlugs = [slug, ...explicitSlugs, ...categoryMatches.map((t: any) => t.slug)];
        useCaseMatches = await Tool.find({
            use_case_tags: { $in: (tool.use_case_tags as string[]) || [] },
            status: 'Active',
            slug: { $ne: slug, $nin: usedSlugs },
        }).sort({ rating_score: -1 }).limit(MAX - combined.length).lean();
    }

    const raw = [
        ...explicitCompetitors.map(t => ({ ...t, _alternativeSource: 'competitor' })),
        ...categoryMatches.map(t => ({ ...t, _alternativeSource: 'category' })),
        ...useCaseMatches.map(t => ({ ...t, _alternativeSource: 'use-case' })),
    ].slice(0, MAX);

    // Discontinued tools always last
    return [
        ...raw.filter(t => !isDiscontinued(t)),
        ...raw.filter(t => isDiscontinued(t)),
    ];
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function AlternativesPage({ params }: Props) {
    const { slug } = await params;
    await connectDB();

    const tool = await Tool.findOne({ slug }).lean() as any;
    if (!tool) notFound();

    const [alternatives, comparisons, relatedArticles] = await Promise.all([
        fetchAlternatives(tool, slug),
        Comparison.find({
            $or: [{ tool_a_slug: slug }, { tool_b_slug: slug }, { tool_c_slug: slug }],
            status: 'published',
        }).lean(),
        Article.find({ primary_tools: slug, status: 'published' })
            .sort({ createdAt: -1 })
            .limit(6)
            .lean(),
    ]);

    // ── JSON-LD ────────────────────────────────────────────────────────────────

    const topUseCases = (tool.use_case_tags || []).slice(0, 2) as string[];
    const useCaseText = topUseCases.length > 0
        ? topUseCases.join(' and ').toLowerCase()
        : 'similar capabilities';
    const introText = `Looking for alternatives to ${tool.name}? These are the top ${alternatives.length} tools that offer similar ${useCaseText} — ranked by overall score and compared across features, pricing, and use cases.`;

    const itemListSchema = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: `Best ${tool.name} Alternatives (2026)`,
        description: introText,
        url: `https://toolcurrent.com/tools/${slug}/alternatives`,
        numberOfItems: alternatives.length,
        itemListElement: alternatives.map((alt: any, index: number) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: alt.name,
            url: `https://toolcurrent.com/tools/${alt.slug}`,
            description: alt.short_description,
        })),
    };

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'AI Tools', item: 'https://toolcurrent.com/ai-tools' },
            { '@type': 'ListItem', position: 2, name: tool.name, item: `https://toolcurrent.com/tools/${slug}` },
            { '@type': 'ListItem', position: 3, name: `${tool.name} Alternatives`, item: `https://toolcurrent.com/tools/${slug}/alternatives` },
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
            <AlternativesPageClient
                slug={slug}
                tool={JSON.parse(JSON.stringify(tool))}
                alternatives={JSON.parse(JSON.stringify(alternatives))}
                comparisons={JSON.parse(JSON.stringify(comparisons))}
                relatedArticles={JSON.parse(JSON.stringify(relatedArticles))}
            />
        </>
    );
}
