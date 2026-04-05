import type { Metadata } from 'next';
import { connectDB } from '@/lib/mongodb';
import Tool from '@/lib/models/Tool';
import { notFound } from 'next/navigation';
import ToolPageClient from '@/components/ToolPageClient';
import { jsonLdScript } from '@/lib/jsonld';

type Props = {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ for?: string }>;
};

export const revalidate = 86400;

export async function generateStaticParams() {
    await connectDB();
    const tools = await Tool.find({ status: 'Active' }, 'slug').lean();
    return (tools as any[]).map((tool) => ({ slug: tool.slug }));
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const ALL_WORKFLOW_SLUGS = [
    'students', 'developers', 'marketers', 'content-creators', 'startups',
    'small-business', 'enterprise', 'researchers', 'designers', 'sales-teams',
];

function forSlugToLabel(slug: string): string {
    const overrides: Record<string, string> = {
        'content-creators': 'Content Creators',
        'small-business': 'Small Business',
        'sales-teams': 'Sales Teams',
        'ai-chatbots': 'AI Chatbots',
        'ai-writing': 'AI Writing',
        'data-analysis': 'Data Analysis',
    };
    return overrides[slug] || slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function parseWfBreakdown(wb: string | null, label: string): { score: number | null; evidence: string | null } {
    if (!wb) return { score: null, evidence: null };
    const line = wb.split('\n').find((l: string) => l.toLowerCase().startsWith(label.toLowerCase() + ':'));
    if (!line) return { score: null, evidence: null };
    const scoreMatch = line.match(/(\d+(?:\.\d+)?)\s*\/\s*10/);
    const score = scoreMatch ? parseFloat(scoreMatch[1]) : null;
    const dashIdx = line.indexOf('—');
    const enDashIdx = line.indexOf('–');
    const idx = dashIdx !== -1 ? dashIdx : enDashIdx !== -1 ? enDashIdx : -1;
    const evidence = idx !== -1 ? line.slice(idx + 1).trim() : null;
    return { score, evidence };
}

function mapCategoryToSchema(cat?: string): string {
    const map: Record<string, string> = {
        'AI Chatbots':         'ChatBot',
        'AI Writing':          'WritingApplication',
        'AI Image Generation': 'MultimediaApplication',
        'AI Video':            'MultimediaApplication',
        'AI Audio':            'MultimediaApplication',
        'Productivity':        'BusinessApplication',
        'Automation':          'BusinessApplication',
        'Design':              'DesignApplication',
        'Development':         'DeveloperApplication',
        'Marketing':           'BusinessApplication',
        'Sales & CRM':         'BusinessApplication',
        'Customer Support':    'BusinessApplication',
        'Data Analysis':       'BusinessApplication',
        'SEO Tools':           'BusinessApplication',
        'Other':               'WebApplication',
    };
    return map[cat || ''] || 'WebApplication';
}

function mapPlatformsToOS(platforms?: string[]): string | undefined {
    if (!platforms?.length) return undefined;
    const osMap: Record<string, string> = {
        'Web':               'Web Browser',
        'iOS':               'iOS',
        'Android':           'Android',
        'Desktop':           'Windows, macOS',
        'Browser Extension': 'Chrome, Firefox',
    };
    const os = platforms.filter(p => p !== 'API').map(p => osMap[p]).filter(Boolean);
    return os.length > 0 ? os.join(', ') : undefined;
}

function catToSlug(cat: string): string {
    return cat.toLowerCase().replace(/\s*&\s*/g, '-').replace(/\s+/g, '-').replace(/-+/g, '-');
}

// ── Metadata ───────────────────────────────────────────────────────────────────

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    try {
        await connectDB();
        const { slug } = await params;
        const { for: forContext } = await searchParams;
        const tool = await Tool.findOne({ slug }).lean() as any;
        if (!tool) return {};

        if (forContext) {
            const forLabel = forSlugToLabel(forContext);
            const isWorkflow = ALL_WORKFLOW_SLUGS.includes(forContext);
            if (isWorkflow) {
                const { score, evidence } = parseWfBreakdown(tool.workflow_breakdown || null, forLabel);
                const desc = `Is ${tool.name} good for ${forLabel}?${score != null ? ` Score: ${score}/10.` : ''}${evidence ? ` ${evidence}` : ''}`.trim();
                return {
                    title: `${tool.name} for ${forLabel} — Review & Pricing (2026) | ToolCurrent`,
                    description: desc,
                    alternates: { canonical: `https://toolcurrent.com/tools/${slug}` },
                };
            } else {
                return {
                    title: `${tool.name} — Best ${forLabel} Tool Review (2026) | ToolCurrent`,
                    description: tool.meta_description || tool.short_description || `Deep dive review of ${tool.name}.`,
                    alternates: { canonical: `https://toolcurrent.com/tools/${slug}` },
                };
            }
        }

        return {
            title: tool.meta_title || `${tool.name} Review, Pricing & Alternatives (2026)`,
            description: tool.meta_description || tool.short_description || `Deep dive review of ${tool.name}.`,
            alternates: { canonical: `https://toolcurrent.com/tools/${slug}` },
        };
    } catch { return {}; }
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function ToolPage({ params, searchParams }: Props) {
    const { slug } = await params;
    const { for: forContext } = await searchParams;
    await connectDB();
    const tool = await Tool.findOne({ slug }).lean() as any;
    if (!tool) notFound();

    const competitorIds: string[] = tool.competitors || [];
    const relatedIds: string[] = tool.related_tools || [];
    const unresolvedCompetitorNames: string[] = tool._unresolved_competitors || [];
    const unresolvedRelatedNames: string[] = tool._unresolved_related || [];

    const [competitors, relatedTools] = await Promise.all([
        competitorIds.length
            ? Tool.find({ id: { $in: competitorIds }, status: 'Active' }).lean()
            : unresolvedCompetitorNames.length
                ? Tool.find({ name: { $in: unresolvedCompetitorNames }, status: 'Active' }).lean()
                : [],
        relatedIds.length
            ? Tool.find({ id: { $in: relatedIds }, status: 'Active' }).lean()
            : unresolvedRelatedNames.length
                ? Tool.find({ name: { $in: unresolvedRelatedNames }, status: 'Active' }).lean()
                : [],
    ]);

    // ── JSON-LD Schemas ──────────────────────────────────────────────────────

    const softwareSchema = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: tool.name,
        description: tool.short_description,
        url: tool.website_url,
        applicationCategory: mapCategoryToSchema(tool.category_primary),
        operatingSystem: mapPlatformsToOS(tool.supported_platforms),
        offers: {
            '@type': 'Offer',
            price: (tool.pricing_model === 'Free' || tool.pricing_model === 'Open Source') ? '0' : undefined,
            priceCurrency: 'USD',
            priceSpecification: {
                '@type': 'PriceSpecification',
                description: tool.starting_price,
            },
        },
        aggregateRating: tool.rating_score ? {
            '@type': 'AggregateRating',
            ratingValue: tool.rating_score.toString(),
            bestRating: '10',
            worstRating: '0',
            ratingCount: '1',
            reviewCount: '1',
        } : undefined,
        featureList: tool.key_features?.join(', ') || undefined,
        softwareVersion: tool.model_version || undefined,
        dateModified: tool.last_updated ? new Date(tool.last_updated).toISOString() : undefined,
    };

    const breadcrumbItems: Record<string, any>[] = [
        { '@type': 'ListItem', position: 1, name: 'AI Tools', item: 'https://toolcurrent.com/ai-tools' },
    ];
    if (tool.category_primary) {
        breadcrumbItems.push({
            '@type': 'ListItem',
            position: 2,
            name: tool.category_primary,
            item: `https://toolcurrent.com/best-software/${catToSlug(tool.category_primary)}`,
        });
    }
    breadcrumbItems.push({
        '@type': 'ListItem',
        position: breadcrumbItems.length + 1,
        name: tool.name,
        item: `https://toolcurrent.com/tools/${tool.slug}`,
    });

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbItems,
    };

    let faqSchema: Record<string, any> | null = null;
    if (forContext) {
        const forLabel = forSlugToLabel(forContext);
        const { evidence } = parseWfBreakdown(tool.workflow_breakdown || null, forLabel);
        faqSchema = {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
                {
                    '@type': 'Question',
                    name: `Is ${tool.name} good for ${forLabel}?`,
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: evidence || tool.short_description || tool.name,
                    },
                },
                {
                    '@type': 'Question',
                    name: `How much does ${tool.name} cost?`,
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: tool.starting_price || (tool.pricing_model === 'Free' ? 'Free' : 'See website for current pricing.'),
                    },
                },
                {
                    '@type': 'Question',
                    name: `What is ${tool.name} best for?`,
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: tool.best_for?.join('. ') || tool.short_description || tool.name,
                    },
                },
            ],
        };
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: jsonLdScript(softwareSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbSchema) }}
            />
            {faqSchema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: jsonLdScript(faqSchema) }}
                />
            )}
            <ToolPageClient
                tool={JSON.parse(JSON.stringify(tool))}
                competitors={JSON.parse(JSON.stringify(competitors))}
                relatedTools={JSON.parse(JSON.stringify(relatedTools))}
                forContext={forContext}
            />
        </>
    );
}
