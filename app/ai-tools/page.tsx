import type { Metadata } from 'next';
import { connectDB } from '@/lib/mongodb';
import Tool from '@/lib/models/Tool';
import AIToolsHubPageClient from '@/components/AIToolsHubPageClient';

export const metadata: Metadata = {
    title: 'AI Tools Directory (2026) | ToolCurrent',
    description: 'Browse and compare hundreds of AI tools by category, pricing, and use case.',
    alternates: { canonical: 'https://toolcurrent.com/ai-tools' },
    openGraph: {
        title: 'AI Tools Directory (2026) | ToolCurrent',
        description: 'Browse and compare hundreds of AI tools by category, pricing, and use case.',
        url: 'https://toolcurrent.com/ai-tools',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'AI Tools Directory (2026) | ToolCurrent',
        description: 'Browse and compare hundreds of AI tools by category, pricing, and use case.',
    },
};

export const revalidate = 3600;

export default async function AIToolsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const params = await searchParams;
    await connectDB();
    const tools = await Tool.find({ status: 'Active' }).sort({ rating_score: -1 }).lean();

    const qs = new URLSearchParams(
        Object.entries(params)
            .filter(([, v]) => v !== undefined)
            .map(([k, v]) => [k, Array.isArray(v) ? v[0] : (v as string)])
    ).toString();

    return (
        <AIToolsHubPageClient
            tools={JSON.parse(JSON.stringify(tools))}
            initialQueryString={qs ? `?${qs}` : ''}
        />
    );
}
