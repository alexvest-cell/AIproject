'use client';
import { useRouter } from 'next/navigation';
import SiteNav from './SiteNav';
import SiteFooter from './SiteFooter';
import { BestSoftwareHub } from './HubPage';
import type { Tool } from '../types';

interface Props { tools: Tool[] }

export default function BestSoftwareHubPageClient({ tools }: Props) {
    const router = useRouter();
    return (
        <div className="min-h-screen bg-surface-base text-news-text font-sans">
            <SiteNav />
            <div className="pt-[112px]">
                <div className="container mx-auto px-4 md:px-8 py-10">
                    <BestSoftwareHub
                        articles={[]}
                        onArticleClick={(a) => router.push(`/article/${(a as any).slug || a.id}`)}
                        onToolClick={(s) => router.push(`/tools/${s}`)}
                        onComparisonClick={(s) => router.push(`/compare/${s}`)}
                        onHubNavigate={(h) => router.push(`/${h}`)}
                        initialTools={tools}
                    />
                </div>
            </div>
            <SiteFooter />
        </div>
    );
}
