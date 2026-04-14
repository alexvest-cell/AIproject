import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import Tool from '@/lib/models/Tool';
import RankingPageClient from '@/components/RankingPageClient';
import { jsonLdScript } from '@/lib/jsonld';
import { categorySlugToName, categoryNameToSlug, CATEGORY_SLUG_TO_NAME } from '@/lib/utils/slugs';

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 86400;

export async function generateStaticParams() {
    await connectDB();
    const tools = await Tool.find({ status: 'Active' }, 'category_primary').lean() as any[];
    const seen = new Set<string>();
    const params: { slug: string }[] = [];
    for (const t of tools) {
        if (!t.category_primary) continue;
        const slug = categoryNameToSlug(t.category_primary);
        if (!seen.has(slug)) {
            seen.add(slug);
            params.push({ slug });
        }
    }
    return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const label = categorySlugToName(slug);
    if (!label) return { title: 'Not Found' };
    return {
        title: `Best ${label} Software (2026) | ToolCurrent`,
        description: `Top-ranked ${label} AI tools, scored by rating and features.`,
        alternates: { canonical: `https://toolcurrent.com/best-software/${slug}` },
    };
}

export default async function CategoryRankingPage({ params }: Props) {
    const { slug } = await params;
    const categoryLabel = categorySlugToName(slug);
    if (!categoryLabel) return notFound();

    await connectDB();
    const tools = await Tool.find({
        category_primary: categoryLabel,
        status: 'Active',
    }).sort({ rating_score: -1 }).lean();

    // ── JSON-LD Schemas ──────────────────────────────────────────────────────
    const rankingTitle = `Best ${categoryLabel} Software (2026)`;
    const rankingUrl = `/best-software/${slug}`;
    const rankingDescription = `Top-ranked ${categoryLabel} AI tools, scored by rating and features.`;

    const itemListSchema = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: rankingTitle,
        description: rankingDescription,
        url: `https://toolcurrent.com${rankingUrl}`,
        numberOfItems: tools.length,
        itemListElement: (tools as any[]).map((tool, index) => ({
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
            { '@type': 'ListItem', position: 1, name: 'Best Software', item: 'https://toolcurrent.com/best-software' },
            { '@type': 'ListItem', position: 2, name: rankingTitle, item: `https://toolcurrent.com${rankingUrl}` },
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
            <RankingPageClient
                type="category"
                slug={slug}
                tools={JSON.parse(JSON.stringify(tools))}
            />
        </>
    );
}
