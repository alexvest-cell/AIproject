import type { Metadata } from 'next';
import { connectDB } from '@/lib/mongodb';
import Tool from '@/lib/models/Tool';
import { notFound } from 'next/navigation';
import ToolPageClient from '@/components/ToolPageClient';

type Props = {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ for?: string }>;
};

export const revalidate = 86400;

export async function generateStaticParams() {
    await connectDB();
    const tools = await Tool.find({ status: 'Active' }, 'slug').lean();
    return (tools as any[]).map((tool) => ({ slug: tool.slug }));
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const ALL_WORKFLOW_SLUGS = [
    'students', 'developers', 'marketers', 'content-creators', 'startups',
    'small-business', 'enterprise', 'researchers', 'designers', 'sales-teams',
];

function forSlugToLabel(slug: string): string {
    const overrides: Record<string, string> = {
        'content-creators': 'Content Creators',
        'small-business': 'Small Business',
        'sales-teams': 'Sales Teams',
        'ai-chatbots': 'AI Chatbots',
        'ai-writing': 'AI Writing',
        'data-analysis': 'Data Analysis',
    };
    return overrides[slug] || slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function parseWfBreakdown(wb: string | null, label: string): { score: number | null; evidence: string | null } {
    if (!wb) return { score: null, evidence: null };
    const line = wb.split('\n').find((l: string) => l.toLowerCase().startsWith(label.toLowerCase() + ':'));
    if (!line) return { score: null, evidence: null };
    const scoreMatch = line.match(/(\d+(?:\.\d+)?)\s*\/\s*10/);
    const score = scoreMatch ? parseFloat(scoreMatch[1]) : null;
    const dashIdx = line.indexOf('—');
    const enDashIdx = line.indexOf('–');
    const idx = dashIdx !== -1 ? dashIdx : enDashIdx !== -1 ? enDashIdx : -1;
    const evidence = idx !== -1 ? line.slice(idx + 1).trim() : null;
    return { score, evidence };
}

// ── Metadata ───────────────────────────────────────────────────────────────────

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    try {
        await connectDB();
        const { slug } = await params;
        const { for: forContext } = await searchParams;
        const tool = await Tool.findOne({ slug }).lean() as any;
        if (!tool) return {};

        if (forContext) {
            const forLabel = forSlugToLabel(forContext);
            const isWorkflow = ALL_WORKFLOW_SLUGS.includes(forContext);
            if (isWorkflow) {
                const { score, evidence } = parseWfBreakdown(tool.workflow_breakdown || null, forLabel);
                const desc = `Is ${tool.name} good for ${forLabel}?${score != null ? ` Score: ${score}/10.` : ''}${evidence ? ` ${evidence}` : ''}`.trim();
                return {
                    title: `${tool.name} for ${forLabel} — Review & Pricing (2026) | ToolCurrent`,
                    description: desc,
                    alternates: { canonical: `https://toolcurrent.com/tools/${slug}` },
                };
            } else {
                return {
                    title: `${tool.name} — Best ${forLabel} Tool Review (2026) | ToolCurrent`,
                    description: tool.meta_description || tool.short_description || `Deep dive review of ${tool.name}.`,
                    alternates: { canonical: `https://toolcurrent.com/tools/${slug}` },
                };
            }
        }

        return {
            title: tool.meta_title || `${tool.name} Review, Pricing & Alternatives (2026)`,
            description: tool.meta_description || tool.short_description || `Deep dive review of ${tool.name}.`,
            alternates: { canonical: `https://toolcurrent.com/tools/${slug}` },
        };
    } catch { return {}; }
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function ToolPage({ params, searchParams }: Props) {
    const { slug } = await params;
    const { for: forContext } = await searchParams;
    await connectDB();
    const tool = await Tool.findOne({ slug }).lean() as any;
    if (!tool) notFound();

    const competitorIds: string[] = tool.competitors || [];
    const relatedIds: string[] = tool.related_tools || [];
    // Also resolve any unresolved competitors stored by name
    const unresolvedCompetitorNames: string[] = tool._unresolved_competitors || [];
    const unresolvedRelatedNames: string[] = tool._unresolved_related || [];

    const [competitors, relatedTools] = await Promise.all([
        competitorIds.length
            ? Tool.find({ id: { $in: competitorIds }, status: 'Active' }).lean()
            : unresolvedCompetitorNames.length
                ? Tool.find({ name: { $in: unresolvedCompetitorNames }, status: 'Active' }).lean()
                : [],
        relatedIds.length
            ? Tool.find({ id: { $in: relatedIds }, status: 'Active' }).lean()
            : unresolvedRelatedNames.length
                ? Tool.find({ name: { $in: unresolvedRelatedNames }, status: 'Active' }).lean()
                : [],
    ]);

    return (
        <ToolPageClient
            tool={JSON.parse(JSON.stringify(tool))}
            competitors={JSON.parse(JSON.stringify(competitors))}
            relatedTools={JSON.parse(JSON.stringify(relatedTools))}
            forContext={forContext}
        />
    );
}
