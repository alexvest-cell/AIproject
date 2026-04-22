import type { Metadata } from 'next';
import { connectDB } from '@/lib/mongodb';
import Tool from '@/lib/models/Tool';
import BestSoftwareHubPageClient from '@/components/BestSoftwareHubPageClient';
import { jsonLdScript } from '@/lib/jsonld';

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
    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://toolcurrent.com' },
            { '@type': 'ListItem', position: 2, name: 'Best AI Tools', item: 'https://toolcurrent.com/best-ai-tools' },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbSchema) }}
            />
            <BestSoftwareHubPageClient tools={JSON.parse(JSON.stringify(tools))} />
        </>
    );
}
