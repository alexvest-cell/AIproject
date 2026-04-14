'use client';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SiteNav from './SiteNav';
import SiteFooter from './SiteFooter';
import { ComparisonsHub } from './HubPage';
import type { Article } from '../types';

function ComparisonsHubInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialToolSlug = searchParams.get('tool') || '';

    const handleToolAChange = (slug: string | null) => {
        if (slug) {
            router.replace(`/comparisons?tool=${slug}`, { scroll: false });
        } else {
            router.replace('/comparisons', { scroll: false });
        }
    };

    return (
        <ComparisonsHub
            onComparisonClick={(slug, uc) => {
                const path = uc ? `/compare/${slug}/${uc}` : `/compare/${slug}`;
                router.push(path);
            }}
            onArticleClick={(a: Article) => router.push(`/article/${(a as any).slug || a.id}`)}
            articles={[]}
            initialToolSlug={initialToolSlug}
            onToolAChange={handleToolAChange}
        />
    );
}

export default function ComparisonsHubPageClient() {
    return (
        <div className="min-h-screen bg-surface-base text-news-text font-sans">
            <SiteNav />
            <Suspense fallback={null}>
                <ComparisonsHubInner />
            </Suspense>
            <SiteFooter />
        </div>
    );
}
