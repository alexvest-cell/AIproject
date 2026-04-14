'use client';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SiteNav from './SiteNav';
import SiteFooter from './SiteFooter';
import { AIToolsHub } from './HubPage';
import type { Tool } from '../types';

interface Props { tools: Tool[]; initialQueryString?: string }

function AIToolsHubInner({ tools, initialQueryString }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialSearch = searchParams.get('search') || '';

    const handleSearchChange = (term: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (term) params.set('search', term);
        else params.delete('search');
        const qs = params.toString();
        router.replace(qs ? `/ai-tools?${qs}` : '/ai-tools', { scroll: false });
    };

    const handleWorkflowChange = (slug: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (slug) params.set('workflow', slug);
        else params.delete('workflow');
        const qs = params.toString();
        router.replace(qs ? `/ai-tools?${qs}` : '/ai-tools', { scroll: false });
    };

    // Client-side searchParams take precedence; fall back to server-provided value
    const qs = searchParams.toString();
    const queryString = qs ? `?${qs}` : (initialQueryString || '');

    return (
        <AIToolsHub
            articles={[]}
            onArticleClick={(a) => router.push(`/article/${(a as any).slug || a.id}`)}
            onToolClick={(s) => router.push(`/tools/${s}`)}
            onComparisonClick={(s) => router.push(`/compare/${s}`)}
            initialTools={tools}
            initialSearch={initialSearch}
            onSearchChange={handleSearchChange}
            onWorkflowChange={handleWorkflowChange}
            queryString={queryString}
        />
    );
}

export default function AIToolsHubPageClient({ tools, initialQueryString }: Props) {
    return (
        <div className="min-h-screen bg-surface-base text-news-text font-sans">
            <SiteNav />
            <div className="pt-[112px]">
                <div className="container mx-auto px-4 md:px-8 py-10">
                    <Suspense fallback={null}>
                        <AIToolsHubInner tools={tools} initialQueryString={initialQueryString} />
                    </Suspense>
                </div>
            </div>
            <SiteFooter />
        </div>
    );
}
