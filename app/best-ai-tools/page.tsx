import type { Metadata } from 'next';
import { connectDB } from '@/lib/mongodb';
import Tool from '@/lib/models/Tool';
import BestSoftwareHubPageClient from '@/components/BestSoftwareHubPageClient';

export const metadata: Metadata = {
    title: 'Best AI Tools (2026) | ToolCurrent',
    description: 'Explore the best AI tools ranked by category and workflow. Find the right tool for your needs.',
    alternates: { canonical: 'https://toolcurrent.com/best-ai-tools' },
    openGraph: {
        title: 'Best AI Tools (2026) | ToolCurrent',
        description: 'Explore the best AI tools ranked by category and workflow. Find the right tool for your needs.',
        url: 'https://toolcurrent.com/best-ai-tools',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Best AI Tools (2026) | ToolCurrent',
        description: 'Explore the best AI tools ranked by category and workflow. Find the right tool for your needs.',
    },
};

export const revalidate = 3600;

export default async function BestAIToolsPage() {
    await connectDB();
    const tools = await Tool.find({ status: 'Active' }).sort({ rating_score: -1 }).lean();
    return <BestSoftwareHubPageClient tools={JSON.parse(JSON.stringify(tools))} />;
}
