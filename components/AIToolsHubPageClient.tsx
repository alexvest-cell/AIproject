'use client';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SiteNav from './SiteNav';
import { AIToolsHub } from './HubPage';
import type { Tool } from '../types';

interface Props { tools: Tool[] }

function AIToolsHubInner({ tools }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialSearch = searchParams.get('search') || '';

    const handleSearchChange = (term: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (term) {
            params.set('search', term);
        } else {
            params.delete('search');
        }
        const qs = params.toString();
        router.replace(qs ? `/ai-tools?${qs}` : '/ai-tools', { scroll: false });
    };

    return (
        <AIToolsHub
            articles={[]}
            onArticleClick={(a) => router.push(`/article/${(a as any).slug || a.id}`)}
            onToolClick={(s) => router.push(`/tools/${s}`)}
            onComparisonClick={(s) => router.push(`/compare/${s}`)}
            initialTools={tools}
            initialSearch={initialSearch}
            onSearchChange={handleSearchChange}
        />
    );
}

export default function AIToolsHubPageClient({ tools }: Props) {
    return (
        <div className="min-h-screen bg-surface-base text-news-text font-sans">
            <SiteNav />
            <div className="pt-[112px]">
                <div className="container mx-auto px-4 md:px-8 py-10">
                    <Suspense fallback={null}>
                        <AIToolsHubInner tools={tools} />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
