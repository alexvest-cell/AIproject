import type { Metadata } from 'next';
import { connectDB } from '@/lib/mongodb';
import Tool from '@/lib/models/Tool';
import RankingPageClient from '@/components/RankingPageClient';

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 86400;

// Maps slugs that can't be reconstructed via simple capitalization
const SLUG_TO_LABEL: Record<string, string> = {
    'sales-crm':           'Sales & CRM',
    'seo-tools':           'SEO Tools',
    'ai-chatbots':         'AI Chatbots',
    'ai-writing':          'AI Writing',
    'ai-image-generation': 'AI Image Generation',
    'ai-video':            'AI Video',
    'ai-audio':            'AI Audio',
    'customer-support':    'Customer Support',
    'data-analysis':       'Data Analysis',
};

function slugToLabel(slug: string): string {
    return SLUG_TO_LABEL[slug] ||
        slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function labelToSlug(label: string): string {
    return label.toLowerCase()
        .replace(/\s*&\s*/g, '-')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

export async function generateStaticParams() {
    await connectDB();
    const tools = await Tool.find({ status: 'Active' }, 'category_primary').lean() as any[];
    const seen = new Set<string>();
    const params: { slug: string }[] = [];
    for (const t of tools) {
        if (!t.category_primary) continue;
        const slug = labelToSlug(t.category_primary);
        if (!seen.has(slug)) {
            seen.add(slug);
            params.push({ slug });
        }
    }
    return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const label = slugToLabel(slug);
    return {
        title: `Best ${label} Software (2026) | ToolCurrent`,
        description: `Top-ranked ${label} AI tools, scored by rating and features.`,
        alternates: { canonical: `https://toolcurrent.com/best-software/${slug}` },
    };
}

export default async function CategoryRankingPage({ params }: Props) {
    const { slug } = await params;
    await connectDB();
    const categoryLabel = slugToLabel(slug);
    let tools = await Tool.find({
        $or: [{ category_primary: categoryLabel }, { category_tags: { $in: [categoryLabel, slug] } }],
        status: 'Active',
    }).sort({ rating_score: -1 }).lean();
    if (tools.length === 0) {
        tools = await Tool.find({ status: 'Active' }).sort({ rating_score: -1 }).limit(20).lean();
    }

    return (
        <RankingPageClient
            type="category"
            slug={slug}
            tools={JSON.parse(JSON.stringify(tools))}
        />
    );
}
