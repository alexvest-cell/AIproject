import type { Metadata } from 'next';
import { connectDB } from '@/lib/mongodb';
import Tool from '@/lib/models/Tool';
import AIToolsHubPageClient from '@/components/AIToolsHubPageClient';

export const metadata: Metadata = {
    title: 'AI Tools Directory (2026) | ToolCurrent',
    description: 'Browse and compare hundreds of AI tools by category, pricing, and use case.',
    alternates: { canonical: 'https://toolcurrent.com/ai-tools' },
};

export const revalidate = 3600;

export default async function AIToolsPage() {
    await connectDB();
    const tools = await Tool.find({ status: 'Active' }).sort({ rating_score: -1 }).lean();
    return <AIToolsHubPageClient tools={JSON.parse(JSON.stringify(tools))} />;
}
