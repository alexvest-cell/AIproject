import type { Metadata } from 'next';
import FindMyToolClient from './FindMyToolClient';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';

export const metadata: Metadata = {
    title: 'Find Your AI Tool — ToolCurrent',
    description: 'Answer 6 quick questions and get personalised AI tool recommendations matched to your role, budget, and workflow.',
};

export default function FindMyToolPage() {
    return (
        <div className="min-h-screen bg-surface-base text-news-text font-sans">
            <SiteNav />
            <FindMyToolClient />
            <SiteFooter />
        </div>
    );
}
