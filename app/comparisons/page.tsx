import type { Metadata } from 'next';
import ComparisonsHubPageClient from '@/components/ComparisonsHubPageClient';

export const metadata: Metadata = {
    title: 'AI Tool Comparisons (2026) | ToolCurrent',
    description: 'Compare any two AI tools side by side. See scores, features, and a clear verdict.',
    alternates: { canonical: 'https://toolcurrent.com/comparisons' },
    openGraph: {
        title: 'AI Tool Comparisons (2026) | ToolCurrent',
        description: 'Compare any two AI tools side by side. See scores, features, and a clear verdict.',
        url: 'https://toolcurrent.com/comparisons',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'AI Tool Comparisons (2026) | ToolCurrent',
        description: 'Compare any two AI tools side by side. See scores, features, and a clear verdict.',
    },
};

export const revalidate = 3600;

export default function Page() {
    return <ComparisonsHubPageClient />;
}
