import type { Metadata } from 'next';
import { connectDB } from '@/lib/mongodb';
import Tool from '@/lib/models/Tool';
import RankingPageClient from '@/components/RankingPageClient';

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 86400;

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
        alternates: { canonical: `https://toolcurrent.com/best-software/for/${slug}` },
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

    return (
        <RankingPageClient
            type="workflow"
            slug={slug}
            tools={JSON.parse(JSON.stringify(tools))}
        />
    );
}
