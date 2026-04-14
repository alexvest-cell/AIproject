'use client';
import { useRouter } from 'next/navigation';
import SiteNav from './SiteNav';
import RankingPage from './RankingPage';
import type { Tool } from '../types';

interface Props {
    type: 'workflow' | 'category';
    slug: string;
    tools: Tool[];
}

export default function RankingPageClient({ type, slug, tools }: Props) {
    const router = useRouter();
    return (
        <>
            <SiteNav />
            <RankingPage
                type={type}
                slug={slug}
                initialTools={tools}
                onBack={() => router.back()}
                onToolClick={(s, forParam) => router.push(forParam ? `/tools/${s}?for=${encodeURIComponent(forParam)}` : `/tools/${s}`)}
                onComparisonClick={(s) => router.push(`/compare/${s}`)}
                onRankingClick={(t, s) => router.push(t === 'workflow' ? `/best-ai-tools/for/${s}` : `/best-ai-tools/${s}`)}
                onHubNavigate={(hub) => router.push(`/${hub}`)}
            />
        </>
    );
}
