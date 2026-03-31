import type { Metadata } from 'next';
import { connectDB } from '@/lib/mongodb';
import Tool from '@/lib/models/Tool';
import RankingPageClient from '@/components/RankingPageClient';

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 86400;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const label = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    return {
        title: `Best ${label} Software (2026) | ToolCurrent`,
        description: `Top-ranked ${label} AI tools, scored by rating and features.`,
        alternates: { canonical: `https://toolcurrent.com/best-software/${slug}` },
    };
}

export default async function CategoryRankingPage({ params }: Props) {
    const { slug } = await params;
    await connectDB();
    const categoryLabel = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
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
