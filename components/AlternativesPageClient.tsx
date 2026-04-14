'use client';
import { useRouter } from 'next/navigation';
import SiteNav from './SiteNav';
import SiteFooter from './SiteFooter';
import AlternativesPage from './AlternativesPage';

interface Props {
    slug: string;
    tool: any;
    alternatives: any[];
    comparisons: any[];
    relatedArticles: any[];
}

export default function AlternativesPageClient({ slug, tool, alternatives, comparisons, relatedArticles }: Props) {
    const router = useRouter();
    return (
        <>
            <SiteNav />
            <AlternativesPage
                toolSlug={slug}
                initialTool={tool}
                initialAlternatives={alternatives}
                initialComparisons={comparisons}
                initialRelatedArticles={relatedArticles}
                onBack={() => router.back()}
                onToolClick={(s) => router.push(`/tools/${s}`)}
                onArticleClick={(a) => router.push(`/article/${(a as any).slug || a.id}`)}
                onComparisonClick={(s) => router.push(`/compare/${s}`)}
            />
            <SiteFooter />
        </>
    );
}
