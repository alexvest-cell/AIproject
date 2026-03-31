import type { Metadata } from 'next';
import { connectDB } from '@/lib/mongodb';
import Tool from '@/lib/models/Tool';
import { notFound } from 'next/navigation';
import ToolPageClient from '@/components/ToolPageClient';

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 86400;

export async function generateStaticParams() {
    await connectDB();
    const tools = await Tool.find({ status: 'Active' }, 'slug').lean();
    return (tools as any[]).map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    try {
        await connectDB();
        const { slug } = await params;
        const tool = await Tool.findOne({ slug }).lean() as any;
        if (!tool) return {};
        return {
            title: tool.meta_title || `${tool.name} Review, Pricing & Alternatives (2026)`,
            description: tool.meta_description || tool.short_description || `Deep dive review of ${tool.name}.`,
            alternates: { canonical: `https://toolcurrent.com/tools/${slug}` },
        };
    } catch { return {}; }
}

export default async function ToolPage({ params }: Props) {
    const { slug } = await params;
    await connectDB();
    const tool = await Tool.findOne({ slug }).lean() as any;
    if (!tool) notFound();

    const competitorSlugs: string[] = (tool.competitors || [])
        .map((c: string) => c.toLowerCase().replace(/\s+/g, '-'));
    const relatedSlugs: string[] = (tool.related_tools || [])
        .map((r: string) => r.toLowerCase().replace(/\s+/g, '-'));

    const [competitors, relatedTools] = await Promise.all([
        competitorSlugs.length ? Tool.find({ slug: { $in: competitorSlugs }, status: 'Active' }).lean() : [],
        relatedSlugs.length ? Tool.find({ slug: { $in: relatedSlugs }, status: 'Active' }).lean() : [],
    ]);

    return (
        <ToolPageClient
            tool={JSON.parse(JSON.stringify(tool))}
            competitors={JSON.parse(JSON.stringify(competitors))}
            relatedTools={JSON.parse(JSON.stringify(relatedTools))}
        />
    );
}
