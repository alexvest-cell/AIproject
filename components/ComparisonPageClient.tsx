'use client';
import { useRouter } from 'next/navigation';
import SiteNav from './SiteNav';
import SiteFooter from './SiteFooter';
import ComparisonPage from './ComparisonPage';
import type { Comparison } from '../types';

interface Props {
    initialData: Comparison;
    slug: string;
    useCase?: string;
}

export default function ComparisonPageClient({ initialData, slug, useCase }: Props) {
    const router = useRouter();
    return (
        <>
            <SiteNav />
            <ComparisonPage
                slug={slug}
                useCase={useCase}
                initialData={initialData}
                onBack={() => router.back()}
                onToolClick={(s) => router.push(`/tools/${s}`)}
                onUseCaseChange={(uc) => router.push(`/compare/${slug}/${uc.toLowerCase().replace(/\s+/g, '-')}`)}
            />
            <SiteFooter />
        </>
    );
}
