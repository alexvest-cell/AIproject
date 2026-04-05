'use client';
import { useRouter } from 'next/navigation';
import SiteNav from './SiteNav';
import ToolPage from './ToolPage';
import type { Tool } from '../types';

interface Props {
    tool: Tool;
    competitors: Tool[];
    relatedTools: Tool[];
    forContext?: string;
}

export default function ToolPageClient({ tool, competitors, relatedTools, forContext }: Props) {
    const router = useRouter();
    return (
        <>
            <SiteNav />
            <ToolPage
                slug={tool.slug}
                initialTool={tool}
                initialAlternatives={competitors}
                initialCompetitors={competitors}
                initialRelatedTools={relatedTools}
                forContext={forContext}
                onBack={() => router.back()}
                onArticleClick={(a) => router.push(`/article/${(a as any).slug || a.id}`)}
                onComparisonClick={(s) => router.push(`/compare/${s}`)}
                onAlternativesClick={(s) => router.push(`/tools/${s}/alternatives`)}
                onStackClick={(s) => router.push(`/stacks/${s}`)}
            />
        </>
    );
}
