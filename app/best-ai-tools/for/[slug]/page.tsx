import type { Metadata } from 'next';
import { connectDB } from '@/lib/mongodb';
import Tool from '@/lib/models/Tool';
import RankingPageClient from '@/components/RankingPageClient';
import { jsonLdScript } from '@/lib/jsonld';

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 86400;
export const dynamicParams = true;

export async function generateStaticParams() {
    await connectDB();
    const tools = await Tool.find({ status: 'Active', workflow_tags: { $exists: true, $ne: [] } }, 'workflow_tags').lean() as any[];
    const seen = new Set<string>();
    const params: { slug: string }[] = [];
    for (const t of tools) {
        for (const tag of (t.workflow_tags || [])) {
            const slug = (tag as string).toLowerCase().replace(/\s+/g, '-');
            if (!seen.has(slug)) {
                seen.add(slug);
                params.push({ slug });
            }
        }
    }
    return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const label = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    return {
        title: `Best AI Tools for ${label} (2026) | ToolCurrent`,
        description: `Top-ranked AI tools for ${label}. Scored and ranked by workflow performance.`,
        alternates: { canonical: `https://toolcurrent.com/best-ai-tools/for/${slug}` },
    };
}

export default async function WorkflowRankingPage({ params }: Props) {
    const { slug } = await params;
    await connectDB();
    const workflowLabel = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    let tools = await Tool.find({ workflow_tags: { $in: [workflowLabel, slug] }, status: 'Active' }).lean();
    if (tools.length === 0) {
        tools = await Tool.find({ status: 'Active' }).sort({ rating_score: -1 }).limit(20).lean();
    }

    // ── JSON-LD Schemas ──────────────────────────────────────────────────────
    const rankingTitle = `Best AI Tools for ${workflowLabel} (2026)`;
    const rankingUrl = `/best-ai-tools/for/${slug}`;
    const rankingDescription = `Top-ranked AI tools for ${workflowLabel}. Scored and ranked by workflow performance.`;

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
            url: `https://toolcurrent.com/tools/${tool.slug}?for=${slug}`,
            description: tool.short_description || tool.name,
        })),
    };

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Best AI Tools', item: 'https://toolcurrent.com/best-ai-tools' },
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
                type="workflow"
                slug={slug}
                tools={JSON.parse(JSON.stringify(tools))}
            />
        </>
    );
}
