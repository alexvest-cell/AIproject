'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Tool, Article, Stack } from '../types';
import { ExternalLink, Check, X, ChevronLeft, Star, Zap, Globe, Smartphone, Layers, Calendar, ArrowRight, Maximize2, Image as ImageIcon, ChevronDown, Users, Tag } from 'lucide-react';
import { RelatedContent } from './RelatedContent';

interface ToolPageProps {
    slug: string;
    onBack: () => void;
    onArticleClick: (article: Article) => void;
    onComparisonClick: (slug: string) => void;
    onAlternativesClick: (slug: string) => void;
    onStackClick?: (slug: string) => void;
    onDismissContext?: () => void;
    // Server-prefetched data — skips client-side fetch when provided
    initialTool?: Tool;
    initialAlternatives?: Tool[];
    initialCompetitors?: Tool[];
    initialRelatedTools?: Tool[];
    forContext?: string;
}

const PRICING_COLORS: Record<string, string> = {
    Free: 'bg-green-900/50 text-green-400 border-green-700',
    Freemium: 'bg-blue-900/50 text-blue-400 border-blue-700',
    Paid: 'bg-purple-900/50 text-purple-400 border-purple-700',
    Enterprise: 'bg-orange-900/50 text-orange-400 border-orange-700',
    Trial: 'bg-yellow-900/50 text-yellow-400 border-yellow-700',
    'Open Source': 'bg-violet-900/50 text-violet-400 border-violet-700',
};

// Parse "$0 (Go: $8/mo; Plus: $20/mo; ...)" into [{label, price}]
function parsePricingTiers(raw: string): { label: string; price: string }[] | null {
    const match = raw.match(/^([^(]+)\(([^)]+)\)$/);
    if (!match) return null;
    const base = match[1].trim();
    const tiers = match[2].split(';').map(s => {
        const ci = s.indexOf(':');
        if (ci < 0) return null;
        return { label: s.slice(0, ci).trim(), price: s.slice(ci + 1).trim() };
    }).filter(Boolean) as { label: string; price: string }[];
    return [{ label: 'Free', price: base }, ...tiers];
}

const CATEGORY_PRIMARY_VALUES = [
    'AI Writing', 'AI Chatbots', 'Productivity', 'Automation', 'Design',
    'Development', 'Marketing', 'Data Analysis', 'Customer Support', 'Other',
] as const;

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

function wfBreakdownScore(wb: string | null | undefined, label: string): number | null {
    if (!wb) return null;
    const line = wb.split('\n').find((l: string) => l.toLowerCase().startsWith(label.toLowerCase() + ':'));
    if (!line) return null;
    const m = line.match(/(\d+(?:\.\d+)?)\s*\/\s*10/);
    return m ? parseFloat(m[1]) : null;
}

function wfBreakdownEvidence(wb: string | null | undefined, label: string): string | null {
    if (!wb) return null;
    const line = wb.split('\n').find((l: string) => l.toLowerCase().startsWith(label.toLowerCase() + ':'));
    if (!line) return null;
    const dashIdx = line.indexOf('—');
    const enDashIdx = line.indexOf('–');
    const idx = dashIdx !== -1 ? dashIdx : enDashIdx !== -1 ? enDashIdx : -1;
    return idx !== -1 ? line.slice(idx + 1).trim() : null;
}

const USE_CASE_VALUES = [
    'Content Creation', 'Research', 'Coding', 'Automation', 'Lead Generation',
    'Customer Support', 'Data Analysis', 'Design', 'Education', 'Personal Productivity', 'Marketing',
] as const;

const ToolPage: React.FC<ToolPageProps> = ({ slug, onBack, onArticleClick, onComparisonClick, onAlternativesClick, onStackClick, onDismissContext, initialTool, initialAlternatives, initialCompetitors, initialRelatedTools, forContext }) => {
    const [tool, setTool] = useState<Tool | null>(initialTool ?? null);
    const [alternatives, setAlternatives] = useState<Tool[]>(initialAlternatives ?? []);
    const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
    const [reviews, setReviews] = useState<Article[]>([]);
    const [guides, setGuides] = useState<Article[]>([]);
    const [news, setNews] = useState<Article[]>([]);
    const [bestOf, setBestOf] = useState<Article[]>([]);
    const [useCaseArticles, setUseCaseArticles] = useState<Article[]>([]);
    const [stacks, setStacks] = useState<Stack[]>([]);
    const [useCases, setUseCases] = useState<any[]>([]);
    const [allTools, setAllTools] = useState<any[]>([]);
    const [loading, setLoading] = useState(!initialTool);
    const [error, setError] = useState<string | null>(null);
    const [expandedPlans, setExpandedPlans] = useState<Set<string>>(new Set(['free']));
    const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

    // Always fetch alternatives from the API — no client-side cap so count matches the alternatives page
    useEffect(() => {
        fetch(`/api/tools/${slug}/alternatives`)
            .then(r => r.ok ? r.json() : { alternatives: [] })
            .then(async (altData) => {
                let alts: Tool[] = altData.alternatives || [];
                if (alts.length === 0) {
                    const popular = await fetch(`/api/tools?sort=popular&limit=9`)
                        .then(r => r.ok ? r.json() : [])
                        .catch(() => []);
                    alts = (popular as Tool[]).filter((t: Tool) => t.slug !== slug).slice(0, 8);
                }
                setAlternatives(alts);
            })
            .catch(() => {});
    }, [slug]);

    useEffect(() => {
        if (initialTool) {
            // Data was pre-loaded server-side; skip the primary fetch
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        // Scroll restoration managed by browser

        Promise.all([
            fetch(`/api/tools/${slug}`).then(r => r.ok ? r.json() : Promise.reject('Tool not found')),
            fetch('/api/tools').then(r => r.ok ? r.json() : []).catch(() => [])
        ])
            .then(([data, toolsData]) => {
                setTool(data.tool);
                setRelatedArticles(data.relatedArticles || []);
                setReviews(data.reviews || []);
                setGuides(data.guides || []);
                setNews(data.news || []);
                setBestOf(data.bestOf || []);
                setUseCaseArticles(data.useCaseArticles || []);
                setStacks(data.stacks || []);
                setUseCases(data.useCases || []);
                setAllTools(Array.isArray(toolsData) ? toolsData : []);

                if (data.tool) {
                    // Update Page Meta
                    document.title = `${data.tool.name} Review, Pricing & Alternatives | ToolCurrent`;
                    const description = data.tool.meta_description || data.tool.short_description || `Deep dive review of ${data.tool.name}. Pricing, features, and key comparison vs other AI tools.`;

                    let metaDesc = document.querySelector('meta[name="description"]');
                    if (!metaDesc) {
                        metaDesc = document.createElement('meta');
                        metaDesc.setAttribute('name', 'description');
                        document.head.appendChild(metaDesc);
                    }
                    metaDesc.setAttribute('content', description);

                    // Inject SoftwareApplication schema
                    const schema = {
                        '@context': 'https://schema.org',
                        '@type': 'SoftwareApplication',
                        name: data.tool.name,
                        description: data.tool.short_description,
                        applicationCategory: data.tool.category_tags?.[0] || 'WebApplication',
                        offers: {
                            '@type': 'Offer',
                            price: data.tool.starting_price || '0',
                            priceCurrency: 'USD',
                            ...(data.tool.free_tier && data.tool.free_tier.toLowerCase() !== 'none'
                                ? { description: `Free tier: ${data.tool.free_tier}` }
                                : {})
                        },
                        url: data.tool.website_url
                    };
                    let el = document.getElementById('tool-schema');
                    if (!el) {
                        el = document.createElement('script');
                        el.id = 'tool-schema';
                        (el as HTMLScriptElement).type = 'application/ld+json';
                        document.head.appendChild(el);
                    }
                    el.textContent = JSON.stringify(schema);
                }
            })
            .catch(err => setError(typeof err === 'string' ? err : 'Failed to load tool'))
            .finally(() => setLoading(false));

        return () => {
            const el = document.getElementById('tool-schema');
            if (el) el.remove();
            // Reset title on unmount (App.tsx will set its own title usually, but good to be safe)
            document.title = 'ToolCurrent | Tech & AI Intelligence';
        };
    }, [slug]);

    if (loading) return (
        <div className="min-h-screen bg-surface-base flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-news-muted">
                <div className="w-8 h-8 border-2 border-news-accent border-t-transparent rounded-full animate-spin" />
                <span className="text-sm uppercase tracking-widest">Loading tool</span>
            </div>
        </div>
    );

    if (error || !tool) return (
        <div className="min-h-screen bg-surface-base flex items-center justify-center">
            <div className="text-center">
                <p className="text-news-muted mb-4">{error || 'Tool not found'}</p>
                <button onClick={onBack} className="text-news-accent hover:underline text-sm">← Back</button>
            </div>
        </div>
    );

    const t = tool as any;

    // ── forContext banner data ─────────────────────────────────────────────────
    const forContextLabel = forContext ? forSlugToLabel(forContext) : null;
    const isWorkflowContext = forContext ? ALL_WORKFLOW_SLUGS.includes(forContext) : false;
    const bannerScore = (forContextLabel && isWorkflowContext)
        ? wfBreakdownScore(t.workflow_breakdown, forContextLabel)
        : (tool.rating_score > 0 ? tool.rating_score : null);
    const bannerEvidence = (forContextLabel && isWorkflowContext)
        ? wfBreakdownEvidence(t.workflow_breakdown, forContextLabel)
        : (tool.short_description || null);

    const ratingBreakdown: Record<string, number> = (t.rating_breakdown && typeof t.rating_breakdown === 'object' && !Array.isArray(t.rating_breakdown)) ? t.rating_breakdown : {};
    const useCaseBreakdown: Record<string, string> = (t.use_case_breakdown && typeof t.use_case_breakdown === 'object' && !Array.isArray(t.use_case_breakdown)) ? t.use_case_breakdown : {};
    const ucScoresArr: Array<{ use_case: string; score: number | null; description: string }> = Array.isArray(t.use_case_scores) ? t.use_case_scores : [];

    const competitorIds: string[] = Array.isArray(t.competitors) ? t.competitors : [];
    const relatedToolIds: string[] = Array.isArray(t.related_tools) ? t.related_tools : [];
    const competitorObjs = (initialCompetitors?.length) ? initialCompetitors : allTools.filter(at => competitorIds.includes(at.id));
    const relatedToolObjs = (initialRelatedTools?.length) ? initialRelatedTools : allTools.filter(at => relatedToolIds.includes(at.id));

    // Inline link injection: wraps competitor names in <a> tags within prose text
    const linkifyCompetitors = (text: string): React.ReactNode => {
        if (!text || !competitorObjs.length) return text;
        const entries = competitorObjs.filter((c: any) => c.name && c.slug);
        if (!entries.length) return text;
        const sorted = [...entries].sort((a: any, b: any) => b.name.length - a.name.length);
        const pattern = sorted.map((c: any) => c.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
        const regex = new RegExp(`(${pattern})`, 'gi');
        const parts = text.split(regex);
        return (
            <>{parts.map((part, i) => {
                const match = entries.find((c: any) => c.name.toLowerCase() === part.toLowerCase());
                if (match) return <a key={i} href={`/tools/${match.slug}`} className="text-news-accent hover:underline decoration-news-accent/50">{part}</a>;
                return <React.Fragment key={i}>{part}</React.Fragment>;
            })}</>
        );
    };

    const sections = [];
    if (tool.full_description) sections.push({ id: 'overview', label: 'Overview' });
    if (t.screenshots?.length > 0) sections.push({ id: 'screenshots', label: 'Screenshots' });
    if (t.model_version_by_plan) sections.push({ id: 'plans', label: 'Plans' });
    if (tool.key_features?.length > 0) sections.push({ id: 'features', label: 'Features' });
    if (tool.pros?.length > 0 || tool.cons?.length > 0) sections.push({ id: 'proscons', label: 'Pros & Cons' });
    if (t.best_for?.length > 0 || t.not_ideal_for?.length > 0) sections.push({ id: 'best-for', label: 'Who It\'s For' });
    if (tool.use_case_tags?.length > 0) sections.push({ id: 'use-cases', label: 'Use Cases' });
    if (t.alternative_selection) sections.push({ id: 'alternatives-guide', label: 'When Not To Choose' });

    const pricingClass = PRICING_COLORS[tool.pricing_model] || 'bg-surface-alt text-news-muted border-border-subtle';

    // ── Plans & Pricing — computed once, shared between mobile block and main content ──
    const mobilePlanData = (() => {
        if (!t.model_version_by_plan) return null;
        const mvbpPriceMap: Record<string, string> = {};
        const planTiersList = (t.model_version_by_plan as string)
            .split('\n').filter((l: string) => l.trim())
            .map((line: string) => {
                const ci = line.indexOf(':');
                const rawKey = ci > 0 ? line.slice(0, ci).trim() : line.trim();
                const priceMatch = rawKey.match(/\(([^)]+)\)\s*$/);
                const isPriceString = (s: string) => /[\$\d\/]/.test(s);
                // Always strip parenthetical suffix for clean plan name and consistent lookup keys
                const planName = priceMatch ? rawKey.replace(/\s*\([^)]+\)\s*$/, '').trim() : rawKey;
                if (priceMatch && isPriceString(priceMatch[1])) mvbpPriceMap[planName.toLowerCase()] = priceMatch[1];
                return { plan: planName, models: ci > 0 ? line.slice(ci + 1).trim() : '' };
            });
        const limitsMap: Record<string, string> = {};
        const rateLimitsPriceMap: Record<string, string> = {};
        if (t.rate_limits) {
            (t.rate_limits as string).split('\n').filter((l: string) => l.trim()).forEach((line: string) => {
                const ci = line.indexOf(':');
                if (ci < 0) return;
                const rawKey = line.slice(0, ci).trim();
                const priceMatch = rawKey.match(/\(([^)]+)\)\s*$/);
                // Always strip parenthetical suffix for consistent lookup keys
                const planKey = priceMatch ? rawKey.replace(/\s*\([^)]+\)\s*$/, '').trim().toLowerCase() : rawKey.trim().toLowerCase();
                if (priceMatch && /[\$\d\/]/.test(priceMatch[1])) rateLimitsPriceMap[planKey] = priceMatch[1];
                limitsMap[planKey] = line.slice(ci + 1).trim();
            });
        }
        const priceMap: Record<string, string> = {};
        if (t.price_by_plan) {
            (t.price_by_plan as string).split('\n').filter((l: string) => l.trim()).forEach((line: string) => {
                const ci = line.indexOf(':');
                if (ci > 0) priceMap[line.slice(0, ci).trim().toLowerCase()] = line.slice(ci + 1).trim();
            });
        } else {
            Object.assign(priceMap, mvbpPriceMap);
            Object.assign(priceMap, rateLimitsPriceMap);
            if (!Object.keys(priceMap).length && t.starting_price) {
                const tiers = parsePricingTiers(t.starting_price as string);
                if (tiers) tiers.forEach(({ label, price }) => { priceMap[label.toLowerCase()] = price; });
            }
        }
        return { planTiersList, limitsMap, priceMap };
    })();

    const JumpNav = ({ sections }: { sections: { id: string, label: string }[] }) => {
        if (sections.length === 0) return null;
        return (
            <div className="hidden lg:block fixed left-12 top-1/2 -translate-y-1/2 w-64 space-y-4 border-l border-border-divider pl-6 py-4">
                <div className="text-[10px] font-bold text-news-muted uppercase tracking-[0.2em] mb-4">Jump To</div>
                <nav className="flex flex-col gap-3">
                    {sections.map((s, i) => (
                        <a key={i} href={`#${s.id}`} className="text-xs text-news-muted hover:text-news-accent transition-colors truncate block">
                            {s.label}
                        </a>
                    ))}
                </nav>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-surface-base text-news-text font-sans relative pt-16 md:pt-[112px]">
            <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
            <JumpNav sections={sections} />

            <div className="container mx-auto px-4 md:px-8 py-10 max-w-7xl">

                {/* Hero Header */}
                <div className="flex flex-col md:flex-row gap-6 items-start mb-10 pb-10 border-b border-border-divider">
                    {tool.logo && (
                        <div className="w-20 h-20 rounded-2xl bg-white border border-border-subtle flex-shrink-0 overflow-hidden shadow-inner">
                            <img src={tool.logo} alt={`${tool.name} logo`} className="w-full h-full object-contain p-2" loading="lazy" />
                        </div>
                    )}
                    <div className="flex-grow">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">{tool.name}</h1>
                            <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${pricingClass}`}>
                                {tool.pricing_model}
                            </span>
                            {tool.category_primary && (
                                <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-surface-alt text-news-text border border-border-subtle">
                                    {tool.category_primary}
                                </span>
                            )}
                            {tool.ai_enabled && (
                                <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-blue-500/15 text-blue-400 border border-transparent">
                                    <Zap size={10} /> AI-Powered
                                </span>
                            )}
                            {t.last_updated && (
                                <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-news-muted">
                                    <Calendar size={12} /> Last updated: {new Date(t.last_updated).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                </span>
                            )}
                        </div>
                        <p className="text-news-text text-lg leading-relaxed mb-4 max-w-2xl">{tool.short_description}</p>
                        <div className="flex flex-wrap gap-2 mb-5">
                            {/* category_primary is canonical; fall back to category_tags for legacy tools */}
                            {(tool.category_primary ? [tool.category_primary] : tool.category_tags).map(tag => (
                                <a key={tag}
                                   href={`/ai-tools?category=${encodeURIComponent(tag)}`}
                                   className="text-xs px-2 py-1 rounded-full bg-surface-alt shadow-sm text-news-muted border border-border-subtle hover:border-news-accent/40 hover:text-news-accent transition-colors">
                                    {tag}
                                </a>
                            ))}
                            {/* secondary_tags are SEO-only — not rendered */}
                            {(tool.category_primary || tool.category_tags.length > 0) && (() => {
                                const cat = tool.category_primary || tool.category_tags[0];
                                const catSlug = cat.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                                return (
                                    <a href={`/best-ai-tools/${catSlug}`}
                                       className="text-xs px-2 py-1 rounded-full bg-news-accent/10 text-news-accent border border-news-accent/30 hover:bg-news-accent/20 transition-colors font-medium">
                                        Best {cat} Software →
                                    </a>
                                );
                            })()}
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {tool.affiliate_url && (
                                <a href={tool.affiliate_url} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-2 bg-news-accent hover:opacity-90 text-white font-bold text-sm px-5 py-2.5 rounded-lg transition-opacity shadow-md">
                                    Try {tool.name} <ExternalLink size={14} />
                                </a>
                            )}
                            {tool.website_url && (
                                <a href={tool.website_url} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-2 bg-surface-card hover:bg-surface-hover text-white font-bold text-sm px-5 py-2.5 rounded-lg transition-colors border border-border-subtle shadow-sm">
                                    <Globe size={14} /> Website
                                </a>
                            )}
                        </div>
                        {t.review_slug && (
                            <div className="mt-3">
                                <a href={`/articles/${t.review_slug}`}
                                    className="inline-flex items-center gap-1.5 text-xs text-news-accent hover:underline font-medium">
                                    Want our full verdict? Read the {tool.name} Review 2026 <ArrowRight size={12} />
                                </a>
                            </div>
                        )}
                        {alternatives.length > 0 && (
                            <div className="mt-3">
                                <Link href={`/tools/${slug}/alternatives`}
                                    className="inline-flex items-center gap-1 text-xs text-teal-400 hover:underline font-medium">
                                    See {alternatives.length} Alternatives →
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── For-context banner ───────────────────────────────────── */}
                {forContext && forContextLabel && (
                    <div className="relative border-l-4 border-teal-500 bg-teal-500/[.03] rounded-r-xl px-4 py-3 mb-8 flex flex-col gap-2 pr-12">
                        <div className="flex items-center gap-4 flex-wrap">
                            <div className="flex items-center gap-2">
                                {isWorkflowContext
                                    ? <Users size={13} className="text-teal-400 flex-shrink-0" />
                                    : <Tag size={13} className="text-teal-400 flex-shrink-0" />
                                }
                                <span className="text-[10px] font-bold uppercase tracking-widest text-teal-400">
                                    {isWorkflowContext ? `Viewing for ${forContextLabel}` : `Viewing in ${forContextLabel}`}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Star size={13} fill="currentColor" className="text-teal-400" />
                                <span className="text-sm font-semibold text-white">
                                    {bannerScore != null
                                        ? (isWorkflowContext ? `${bannerScore}/10 for ${forContextLabel}` : `${(bannerScore as number).toFixed(1)}/10 Overall`)
                                        : forContextLabel
                                    }
                                </span>
                            </div>
                        </div>
                        <a
                            href={isWorkflowContext ? `/best-ai-tools/for/${forContext}` : `/best-ai-tools/${forContext}`}
                            className="inline-flex items-center gap-1 text-xs text-teal-400 hover:underline font-medium"
                        >
                            <ChevronLeft size={12} />
                            Back to Best {forContextLabel} Tools
                        </a>
                        {onDismissContext && (
                            <button
                                onClick={onDismissContext}
                                aria-label="Remove context"
                                title="View standard page"
                                className="absolute bottom-3 right-3 md:bottom-auto md:top-1/2 md:-translate-y-1/2 w-6 h-6 md:w-8 md:h-8 rounded-full border border-teal-500/50 bg-teal-500/10 flex items-center justify-center text-teal-400 hover:bg-teal-500/25 hover:border-teal-400 transition-colors flex-shrink-0"
                            >
                                <X size={12} className="md:hidden" />
                                <X size={16} className="hidden md:block" />
                            </button>
                        )}
                    </div>
                )}

                {/* ─── Mobile only: decision-critical blocks ─── */}
                <div className="md:hidden space-y-4 mb-8">

                    {/* Pricing — hidden on mobile when Plans table exists (replaced by accordion below) */}
                    {!t.model_version_by_plan && (
                    <div className="bg-surface-card border border-border-subtle shadow-elevation rounded-2xl p-6">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-news-muted mb-4">Pricing</h3>
                        <div className={`inline-block text-sm font-bold px-3 py-1 rounded-full border mb-3 ${pricingClass}`}>{tool.pricing_model}</div>
                        {tool.starting_price && (() => {
                            const tiers = parsePricingTiers(tool.starting_price!);
                            if (tiers) return (
                                <div className="mb-3 space-y-1">
                                    {tiers.map(({ label, price }) => (
                                        <div key={label} className="flex justify-between items-baseline gap-2 text-xs">
                                            <span className="text-news-muted">{label}</span>
                                            <span className="text-white font-semibold tabular-nums">{price}</span>
                                        </div>
                                    ))}
                                </div>
                            );
                            return <p className="text-white font-semibold mb-3 text-sm">{tool.starting_price}</p>;
                        })()}
                        {!t.model_version_by_plan && t.free_tier != null && (
                            <div className="mt-2 mb-3 pt-3 border-t border-border-divider">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-news-accent mb-1">Free tier includes:</p>
                                {t.free_tier.toLowerCase() === 'none'
                                    ? <p className="text-xs text-news-muted">Not available</p>
                                    : <p className="text-xs text-white leading-relaxed">{t.free_tier}</p>
                                }
                            </div>
                        )}
                        {tool.affiliate_url && (
                            <a href={tool.affiliate_url} target="_blank" rel="noopener noreferrer"
                                className="block w-full text-center bg-news-accent hover:opacity-90 text-white font-bold text-sm px-4 py-2.5 rounded-lg transition-opacity shadow-md">
                                Get Started →
                            </a>
                        )}
                    </div>
                    )}

                    {/* Plans & Pricing accordion — mobile only, shown when Plans table exists */}
                    {mobilePlanData && (
                        <div className="bg-surface-card border border-border-subtle shadow-elevation rounded-2xl p-5">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-news-muted mb-3">Plans & Pricing</h3>
                            <div className="space-y-1">
                                {mobilePlanData.planTiersList.map((tier: { plan: string; models: string }, i: number) => {
                                    const key = tier.plan.toLowerCase();
                                    const isFree = key === 'free';
                                    const isExpanded = expandedPlans.has(key);
                                    const rawLimits = mobilePlanData.limitsMap[key] || '';
                                    const limitDisplay = rawLimits.toLowerCase().includes('not publicly disclosed') ? '—' : (rawLimits || '—');
                                    return (
                                        <div key={i} className={`border rounded-xl overflow-hidden ${isFree ? 'border-news-accent/40' : 'border-border-subtle'}`}>
                                            <button
                                                onClick={() => setExpandedPlans(prev => {
                                                    const next = new Set(prev);
                                                    if (next.has(key)) next.delete(key); else next.add(key);
                                                    return next;
                                                })}
                                                className="w-full flex items-center justify-between px-4 py-3 bg-surface-card hover:bg-surface-hover transition-colors text-left"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-white">{tier.plan}</span>
                                                    {isFree && <span className="text-[8px] font-bold uppercase tracking-widest text-news-accent border border-news-accent/30 px-1.5 py-0.5 rounded">FREE</span>}
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0 max-w-[55%] text-right">
                                                    <span className="text-[10px] font-bold text-news-accent leading-tight">{mobilePlanData.priceMap[key] || (isFree ? '$0' : '—')}</span>
                                                    <ChevronDown size={14} className={`text-news-muted transition-transform duration-200 flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                                                </div>
                                            </button>
                                            {isExpanded && (
                                                <div className="px-4 py-3 bg-surface-base border-t border-border-subtle space-y-2.5">
                                                    <div>
                                                        <span className="text-[10px] font-bold uppercase tracking-widest text-news-accent">Model</span>
                                                        <p className="text-xs text-white mt-0.5 leading-snug">{tier.models || '—'}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] font-bold uppercase tracking-widest text-news-accent">Usage Limits</span>
                                                        <p className="text-xs text-news-muted mt-0.5 leading-snug">{limitDisplay}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Our Score */}
                    {tool.rating_score > 0 && (
                        <div className="bg-surface-card border border-border-subtle shadow-elevation rounded-2xl p-6">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-news-muted mb-3 text-center">Our Score</h3>
                            <div className="flex items-center justify-center gap-1 text-news-accent mb-4">
                                <Star size={18} fill="currentColor" />
                                <span className="text-2xl font-black text-white">{tool.rating_score.toFixed(1)}</span>
                                <span className="text-news-muted text-sm">/10</span>
                            </div>
                            {Object.keys(ratingBreakdown).length > 0 && (
                                <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border-divider pt-4">
                                    {Object.entries(ratingBreakdown).map(([dim, score]) => (
                                        <div key={dim}>
                                            <div className="flex justify-between text-[10px] text-news-muted mb-1">
                                                <span className="font-bold uppercase tracking-widest">{dim}</span>
                                                <span className="text-white font-bold">{score.toFixed(1)}</span>
                                            </div>
                                            <div className="w-full bg-surface-alt rounded-full h-1.5">
                                                <div className="bg-news-accent h-1.5 rounded-full transition-all" style={{ width: `${(score / 10) * 100}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Use Cases — inline after Our Score on mobile */}
                    {tool.use_case_tags?.length > 0 && (
                        <div className="bg-surface-card border border-border-subtle shadow-elevation rounded-2xl p-4">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-news-muted mb-4 text-center">Use Cases</h3>
                            <div className="space-y-4">
                                {tool.use_case_tags.map((uc: string) => {
                                    const se = ucScoresArr.find(s => s.use_case.toLowerCase() === uc.toLowerCase());
                                    const sc = se?.score != null ? se.score : (() => { const m = (useCaseBreakdown[uc] || '').match(/(\d+(?:\.\d+)?)\s*\/\s*10/); return m ? parseFloat(m[1]) : null; })();
                                    const desc = se?.description || (useCaseBreakdown[uc] ? useCaseBreakdown[uc].replace(/^\d+(?:\.\d+)?\/10\s*[—–-]\s*/, '') : null);
                                    if (!desc && sc == null) return null;
                                    return (
                                        <div key={uc}>
                                            {sc != null ? (
                                                <>
                                                    <div className="flex justify-between items-center mb-1.5">
                                                        <p className="text-xs font-bold uppercase tracking-widest text-news-accent">{uc}</p>
                                                        <span className="text-xs font-bold text-white tabular-nums">{sc.toFixed(1)}</span>
                                                    </div>
                                                    <div className="w-full bg-surface-alt rounded-full h-1.5 mb-2">
                                                        <div className="bg-news-accent h-1.5 rounded-full" style={{ width: `${(sc / 10) * 100}%` }} />
                                                    </div>
                                                </>
                                            ) : (
                                                <p className="text-xs font-bold uppercase tracking-widest text-news-accent mb-1">{uc}</p>
                                            )}
                                            {desc && <p className="text-xs text-news-text leading-relaxed">{desc}</p>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Platforms */}
                    {tool.supported_platforms?.length > 0 && (
                        <div className="bg-surface-card border border-border-subtle shadow-elevation rounded-2xl p-5">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-news-muted mb-3 flex items-center gap-2">
                                <Smartphone size={12} /> Platforms
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {tool.supported_platforms.map(p => (
                                    <span key={p} className="text-xs px-2 py-1 rounded bg-surface-alt shadow-sm text-news-text border border-border-subtle">{p}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Capabilities — 2-column grid if ≥4 items */}
                    {(() => {
                        const capRows = [
                            { label: 'Context Window', value: t.context_window },
                            { label: 'API Pricing', value: t.api_pricing },
                            { label: 'Image Generation', value: t.image_generation },
                            { label: 'Memory Persistence', value: t.memory_persistence },
                            { label: 'Computer Use', value: t.computer_use },
                            { label: 'API Available', value: t.api_available },
                            { label: 'Multimodal', value: (t as any).multimodal, tooltip: 'Handles multiple input/output types — text, image, audio, or video' },
                            { label: 'Open Source', value: (t as any).open_source, tooltip: 'Partial = some components open source or weights available with restrictions' },
                            { label: 'Browser Extension', value: (t as any).browser_extension, tooltip: 'Available as a browser extension' },
                        ].filter(r => r.value);
                        if (!capRows.length) return null;
                        const renderCap = (value: string | null | undefined) => {
                            if (value === 'yes') return <span className="flex items-center gap-1 text-news-accent text-xs font-bold">✓ Yes</span>;
                            if (value === 'no') return <span className="text-news-muted text-xs">✗ No</span>;
                            if (value === 'partial') return <span className="text-yellow-500 text-xs">◑ Partial</span>;
                            return <span className="text-white text-xs font-medium">{value}</span>;
                        };
                        return (
                            <div className="bg-surface-card border border-border-subtle shadow-elevation rounded-2xl p-5">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-news-muted mb-4 flex items-center gap-2">
                                    <Zap size={12} /> Capabilities
                                </h3>
                                <div className={capRows.length >= 4 ? 'grid grid-cols-2 gap-x-3 gap-y-3' : 'space-y-2.5'}>
                                    {capRows.map(r => (
                                        <div key={r.label} className="space-y-0.5" title={(r as any).tooltip || undefined}>
                                            <span className="text-[11px] text-news-muted block">{r.label}</span>
                                            {renderCap(r.value)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })()}

                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {/* Main Content Column */}
                    <div className="md:col-span-2 space-y-10">

                        {/* Full Description */}
                        {tool.full_description && (
                            <section id="overview" className="scroll-mt-24">
                                <h2 className="text-base font-bold uppercase tracking-widest text-news-muted mb-4 border-b border-border-divider pb-2">Overview</h2>
                                <p className="text-news-text leading-relaxed text-lg">{linkifyCompetitors(tool.full_description)}</p>
                            </section>
                        )}

                        {/* Top Alternatives moved to bottom RelatedContent section */}

                        {/* Product Screenshots */}
                        {(tool as any).screenshots?.length > 0 && (
                            <section id="screenshots" className="scroll-mt-24">
                                <h2 className="text-base font-bold uppercase tracking-widest text-news-muted mb-6 border-b border-border-divider pb-2 flex items-center gap-2">
                                    <ImageIcon size={16} /> Product Screenshots
                                </h2>
                                <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
                                    {(tool as any).screenshots.map((s: any, i: number) => (
                                        <div key={i} className="flex-shrink-0 w-4/5 sm:w-[400px] snap-start relative group cursor-pointer" onClick={() => window.open(s.url, '_blank')}>
                                            <div className="aspect-video rounded-xl overflow-hidden bg-surface-card border border-border-subtle shadow-lg">
                                                <img src={s.url} alt={s.caption || ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Maximize2 className="text-white" size={24} />
                                                </div>
                                            </div>
                                            {s.caption && <p className="text-[10px] text-news-muted mt-2 font-medium italic">{s.caption}</p>}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Plans & Pricing */}
                        {t.model_version_by_plan && (() => {
                            const mvbpPriceMap: Record<string, string> = {};
                            const planTiersList = (t.model_version_by_plan as string)
                                .split('\n').filter((l: string) => l.trim())
                                .map((line: string) => {
                                    const ci = line.indexOf(':');
                                    const rawKey = ci > 0 ? line.slice(0, ci).trim() : line.trim();
                                    const priceMatch = rawKey.match(/\(([^)]+)\)\s*$/);
                                    const planName = rawKey.replace(/\s*\([^)]+\)\s*$/, '').trim();
                                    if (priceMatch) mvbpPriceMap[planName.toLowerCase()] = priceMatch[1];
                                    return { plan: planName, models: ci > 0 ? line.slice(ci + 1).trim() : '' };
                                });
                            // Build limitsMap from rate_limits.
                            // Plan names may include a price suffix: "Go ($8/mo): limits..."
                            // Strip that suffix so keys match the plain plan names from model_version_by_plan.
                            const limitsMap: Record<string, string> = {};
                            const rateLimitsPriceMap: Record<string, string> = {};
                            if (t.rate_limits) {
                                (t.rate_limits as string).split('\n').filter((l: string) => l.trim()).forEach((line: string) => {
                                    const ci = line.indexOf(':');
                                    if (ci < 0) return;
                                    const rawKey = line.slice(0, ci).trim();
                                    // Extract "(price)" from plan name if present e.g. "Go ($8/mo)"
                                    const priceMatch = rawKey.match(/\(([^)]+)\)\s*$/);
                                    const planKey = rawKey.replace(/\s*\([^)]+\)\s*$/, '').trim().toLowerCase();
                                    if (priceMatch) rateLimitsPriceMap[planKey] = priceMatch[1];
                                    limitsMap[planKey] = line.slice(ci + 1).trim();
                                });
                            }
                            const priceMap: Record<string, string> = {};
                            if (t.price_by_plan) {
                                // Explicit price_by_plan field takes priority
                                (t.price_by_plan as string).split('\n').filter((l: string) => l.trim()).forEach((line: string) => {
                                    const ci = line.indexOf(':');
                                    if (ci > 0) priceMap[line.slice(0, ci).trim().toLowerCase()] = line.slice(ci + 1).trim();
                                });
                            } else {
                                // Prices embedded in model_version_by_plan plan names e.g. "Plus ($20/mo):"
                                Object.assign(priceMap, mvbpPriceMap);
                                // Prices embedded in rate_limits plan names e.g. "Plus ($20/mo):"
                                Object.assign(priceMap, rateLimitsPriceMap);
                                // Final fallback: legacy "$0 (Go: $8/mo; Plus: $20/mo)" compact format
                                if (!Object.keys(priceMap).length && t.starting_price) {
                                    const tiers = parsePricingTiers(t.starting_price as string);
                                    if (tiers) tiers.forEach(({ label, price }) => { priceMap[label.toLowerCase()] = price; });
                                }
                            }
                            return (
                                <section id="plans" className="scroll-mt-24">
                                    <p className="hidden md:block text-[10px] font-bold uppercase tracking-[0.2em] text-news-accent mb-1">Pricing</p>
                                    <h2 className="hidden md:block text-xl font-bold text-white mb-4 border-b border-border-divider pb-2">Plans & Pricing</h2>

                                    {/* Desktop table */}
                                    <div className="hidden md:block overflow-hidden rounded-xl border border-border-subtle">
                                        <table className="w-full text-xs">
                                            <thead>
                                                <tr className="bg-surface-card border-b border-border-subtle">
                                                    {['Plan', 'Model', 'Usage Limits', 'Price'].map(h => (
                                                        <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-news-accent">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {planTiersList.map((tier: { plan: string; models: string }, i: number) => {
                                                    const isFree = tier.plan.toLowerCase() === 'free';
                                                    const rawLimits = limitsMap[tier.plan.toLowerCase()] || '';
                                                    const limitDisplay = rawLimits.toLowerCase().includes('not publicly disclosed') ? '—' : (rawLimits || '—');
                                                    return (
                                                        <tr key={i} className={`border-b border-border-subtle last:border-0 hover:bg-surface-hover/30 transition-colors ${i % 2 === 0 ? 'bg-surface-base' : 'bg-surface-card/40'} ${isFree ? 'border-l-2 border-news-accent' : ''}`}>
                                                            <td className="px-4 py-3 font-medium text-white whitespace-nowrap">
                                                                {tier.plan}
                                                                {isFree && <span className="ml-1.5 text-[8px] font-bold uppercase tracking-widest text-news-accent border border-news-accent/30 px-1.5 py-0.5 rounded">FREE</span>}
                                                            </td>
                                                            <td className="px-4 py-3 text-news-text leading-snug">{tier.models || '—'}</td>
                                                            <td className="px-4 py-3 text-news-muted leading-snug">{limitDisplay}</td>
                                                            <td className="px-4 py-3 w-40">
                                                                {(() => {
                                                                    const p = priceMap[tier.plan.toLowerCase()];
                                                                    if (p) return <span className={`font-bold leading-snug ${isFree ? 'text-news-accent' : 'text-white'}`}>{p}</span>;
                                                                    if (isFree) return <span className="font-bold text-news-accent">Free</span>;
                                                                    return <span className="text-news-muted">—</span>;
                                                                })()}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Mobile accordion — hidden here; shown in top mobile block */}
                                    <div className="hidden space-y-1">
                                        {planTiersList.map((tier: { plan: string; models: string }, i: number) => {
                                            const key = tier.plan.toLowerCase();
                                            const isFree = key === 'free';
                                            const isExpanded = expandedPlans.has(key);
                                            const rawLimits = limitsMap[key] || '';
                                            const limitDisplay = rawLimits.toLowerCase().includes('not publicly disclosed') ? '—' : (rawLimits || '—');
                                            return (
                                                <div key={i} className={`border rounded-xl overflow-hidden ${isFree ? 'border-news-accent/40' : 'border-border-subtle'}`}>
                                                    <button
                                                        onClick={() => setExpandedPlans(prev => {
                                                            const next = new Set(prev);
                                                            if (next.has(key)) next.delete(key); else next.add(key);
                                                            return next;
                                                        })}
                                                        className="w-full flex items-center justify-between px-4 py-3 bg-surface-card hover:bg-surface-hover transition-colors text-left"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-medium text-white">{tier.plan}</span>
                                                            {isFree && <span className="text-[8px] font-bold uppercase tracking-widest text-news-accent border border-news-accent/30 px-1.5 py-0.5 rounded">FREE</span>}
                                                        </div>
                                                        <div className="flex items-center gap-3 flex-shrink-0">
                                                            <span className="text-xs font-bold text-news-accent">{priceMap[tier.plan.toLowerCase()] || (isFree ? '$0' : '—')}</span>
                                                            <ChevronDown size={14} className={`text-news-muted transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                                        </div>
                                                    </button>
                                                    {isExpanded && (
                                                        <div className="px-4 py-3 bg-surface-base border-t border-border-subtle space-y-2.5">
                                                            <div>
                                                                <span className="text-[10px] font-bold uppercase tracking-widest text-news-accent">Model</span>
                                                                <p className="text-xs text-white mt-0.5 leading-snug">{tier.models || '—'}</p>
                                                            </div>
                                                            <div>
                                                                <span className="text-[10px] font-bold uppercase tracking-widest text-news-accent">Usage Limits</span>
                                                                <p className="text-xs text-news-muted mt-0.5 leading-snug">{limitDisplay}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            );
                        })()}

                        {/* Key Features */}
                        {tool.key_features?.length > 0 && (
                            <section id="features" className="scroll-mt-24">
                                <h2 className="text-base font-bold uppercase tracking-widest text-news-muted mb-4 border-b border-border-divider pb-2">Key Features</h2>
                                <ul className="space-y-3">
                                    {tool.key_features.map((f, i) => (
                                        <li key={i} className="flex items-start gap-3 text-white">
                                            <Check size={18} className="text-news-accent mt-0.5 flex-shrink-0" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        {/* Pros & Cons */}
                        {(tool.pros?.length > 0 || tool.cons?.length > 0) && (
                            <section id="proscons" className="scroll-mt-24">
                                <h2 className="text-base font-bold uppercase tracking-widest text-news-muted mb-4 border-b border-border-divider pb-2">Pros & Cons</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="bg-surface-card border border-border-subtle shadow-sm rounded-xl p-5 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-news-accent"></div>
                                        <h3 className="text-news-accent font-bold text-sm uppercase tracking-widest mb-3">Pros</h3>
                                        <ul className="space-y-2">
                                            {tool.pros.map((p, i) => (
                                                <li key={i} className="flex items-start gap-2 text-news-text text-sm">
                                                    <Check size={14} className="text-news-accent mt-0.5 flex-shrink-0" /><span>{linkifyCompetitors(p)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="bg-surface-card border border-border-subtle shadow-sm rounded-xl p-5 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                                        <h3 className="text-red-400 font-bold text-sm uppercase tracking-widest mb-3">Cons</h3>
                                        <ul className="space-y-2">
                                            {tool.cons.map((c, i) => (
                                                <li key={i} className="flex items-start gap-2 text-news-text text-sm">
                                                    <X size={14} className="text-red-400 mt-0.5 flex-shrink-0" /><span>{linkifyCompetitors(c)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Best For / Not Ideal For */}
                        {(t.best_for?.length > 0 || t.not_ideal_for?.length > 0) && (
                            <section id="best-for" className="scroll-mt-24">
                                <h2 className="text-base font-bold uppercase tracking-widest text-news-muted mb-4 border-b border-border-divider pb-2">Who It's For</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {t.best_for?.length > 0 && (
                                        <div className="bg-surface-card border border-border-subtle rounded-xl p-5 relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-news-accent"></div>
                                            <h3 className="text-news-accent font-bold text-sm uppercase tracking-widest mb-3">Best For</h3>
                                            <ul className="space-y-2">
                                                {t.best_for.map((item: string, i: number) => (
                                                    <li key={i} className="flex items-start gap-2 text-news-text text-sm">
                                                        <Check size={14} className="text-news-accent mt-0.5 flex-shrink-0" /> {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {t.not_ideal_for?.length > 0 && (
                                        <div className="bg-surface-card border border-border-subtle rounded-xl p-5 relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
                                            <h3 className="text-orange-400 font-bold text-sm uppercase tracking-widest mb-3">Not Ideal For</h3>
                                            <ul className="space-y-2">
                                                {t.not_ideal_for.map((item: string, i: number) => (
                                                    <li key={i} className="flex items-start gap-2 text-news-text text-sm">
                                                        <X size={14} className="text-orange-400 mt-0.5 flex-shrink-0" /> {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                                {/* Audience Scores */}
                                {t.workflow_tags?.length > 0 && (
                                    <div className="mt-6">
                                        <h2 className="text-base font-bold uppercase tracking-widest text-news-muted mb-4 border-b border-border-divider pb-2">Audience Scores</h2>
                                        <div className="space-y-4">
                                        {(t.workflow_tags as string[]).map((wf: string) => {
                                            const wfScore = wfBreakdownScore(t.workflow_breakdown, wf);
                                            const wfEvidence = wfBreakdownEvidence(t.workflow_breakdown, wf);
                                            const wfSlug = wf.toLowerCase().replace(/\s+/g, '-');
                                            if (!wfEvidence && wfScore == null) return null;
                                            return (
                                                <div key={wf} className="bg-surface-card border border-border-subtle rounded-xl p-4">
                                                    {wfScore != null ? (
                                                        <>
                                                            <div className="flex justify-between items-center mb-1.5">
                                                                <a href={`/best-ai-tools/for/${wfSlug}`} className="text-xs font-bold uppercase tracking-widest text-news-accent hover:underline">{wf}</a>
                                                                <span className="text-xs font-bold text-white tabular-nums">{wfScore.toFixed(1)}</span>
                                                            </div>
                                                            <div className="w-full bg-surface-alt rounded-full h-1.5 mb-3">
                                                                <div className="bg-news-accent h-1.5 rounded-full" style={{ width: `${(wfScore / 10) * 100}%` }} />
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <a href={`/best-ai-tools/for/${wfSlug}`} className="text-xs font-bold uppercase tracking-widest text-news-accent hover:underline block mb-2">{wf}</a>
                                                    )}
                                                    {wfEvidence && <p className="text-sm text-news-text leading-relaxed">{wfEvidence}</p>}
                                                </div>
                                            );
                                        })}
                                        </div>
                                    </div>
                                )}
                            </section>
                        )}

                        {/* ─── Mobile only: compares with + often used with (positions 11–12) ─── */}
                        {(competitorObjs.length > 0 || relatedToolObjs.length > 0) && (
                            <div className="md:hidden space-y-4">
                                {competitorObjs.length > 0 && (
                                    <div className="bg-surface-card border border-border-subtle shadow-elevation rounded-2xl p-5">
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-news-muted mb-3">Compares With</h3>
                                        <div className="divide-y divide-border-divider">
                                            {competitorObjs.map((comp: any) => {
                                                const diff = (t.competitor_differentiator as any)?.[comp.id] || null;
                                                const compSlug = comp.slug || '';
                                                return (
                                                    <a key={comp.id} href={`/compare/${tool.slug}-vs-${compSlug}`}
                                                        className="flex items-start gap-2.5 group py-3 first:pt-0 last:pb-0 hover:bg-surface-alt/40 -mx-1 px-1 rounded transition-colors cursor-pointer">
                                                        {comp.logo && <div className="w-6 h-6 rounded bg-white flex-shrink-0 overflow-hidden flex items-center justify-center p-0.5 mt-0.5"><img src={comp.logo} alt="" className="w-full h-full object-contain" onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.parentElement!.style.display = 'none'; }} /></div>}
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-xs font-semibold text-white group-hover:text-news-accent transition-colors">{comp.name}</p>
                                                            {diff && <p className="text-sm text-news-muted leading-relaxed mt-0.5">{diff}</p>}
                                                            <p className="text-[11px] text-news-accent/70 group-hover:text-news-accent transition-colors text-right mt-1">Compare →</p>
                                                        </div>
                                                    </a>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                                {relatedToolObjs.length > 0 && (
                                    <div className="bg-surface-card border border-border-subtle shadow-elevation rounded-2xl p-5">
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-news-muted mb-3">Often Used With</h3>
                                        <div className="flex flex-col gap-3">
                                            {relatedToolObjs.map((rel: any) => {
                                                const note = (t.related_tool_note as any)?.[rel.id] || rel.short_description || null;
                                                const inner = (
                                                    <div className="flex items-start gap-3 group">
                                                        {rel.logo && <div className="w-8 h-8 rounded-lg bg-white flex-shrink-0 overflow-hidden flex items-center justify-center"><img src={rel.logo} alt="" className="w-full h-full object-contain p-1" onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.parentElement!.style.display = 'none'; }} /></div>}
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-semibold text-white group-hover:text-news-accent transition-colors">{rel.name}</p>
                                                            {note && <p className="text-[11px] text-news-muted leading-relaxed line-clamp-2 mt-0.5">{note}</p>}
                                                        </div>
                                                    </div>
                                                );
                                                return rel.slug ? <a key={rel.id} href={`/tools/${rel.slug}`}>{inner}</a> : <div key={rel.id}>{inner}</div>;
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Use Cases — desktop only; mobile renders inline above after Our Score */}
                        {tool.use_case_tags?.length > 0 && (
                            <section id="use-cases" className="scroll-mt-24 hidden md:block">
                                <h2 className="text-base font-bold uppercase tracking-widest text-news-muted mb-4 border-b border-border-divider pb-2">Use Cases</h2>
                                <div className="space-y-4">
                                    {tool.use_case_tags.map((uc: string) => {
                                        const se = ucScoresArr.find(s => s.use_case.toLowerCase() === uc.toLowerCase());
                                        const sc = se?.score != null ? se.score : (() => { const m = (useCaseBreakdown[uc] || '').match(/(\d+(?:\.\d+)?)\s*\/\s*10/); return m ? parseFloat(m[1]) : null; })();
                                        const desc = se?.description || (useCaseBreakdown[uc] ? useCaseBreakdown[uc].replace(/^\d+(?:\.\d+)?\/10\s*[—–-]\s*/, '') : null);
                                        if (!desc && sc == null) return null;
                                        const ucAnchor = `use-case-${uc.toLowerCase().replace(/\s+/g, '-')}`;
                                        return (
                                            <div key={uc} id={ucAnchor} className="bg-surface-card border border-border-subtle rounded-xl p-4 scroll-mt-24">
                                                {sc != null ? (
                                                    <>
                                                        <div className="flex justify-between items-center mb-1.5">
                                                            <p className="text-xs font-bold uppercase tracking-widest text-news-accent">{uc}</p>
                                                            <span className="text-xs font-bold text-white tabular-nums">{sc.toFixed(1)}</span>
                                                        </div>
                                                        <div className="w-full bg-surface-alt rounded-full h-1.5 mb-3">
                                                            <div className="bg-news-accent h-1.5 rounded-full" style={{ width: `${(sc / 10) * 100}%` }} />
                                                        </div>
                                                    </>
                                                ) : (
                                                    <p className="text-xs font-bold uppercase tracking-widest text-news-accent mb-2">{uc}</p>
                                                )}
                                                {desc && <p className="text-sm text-news-text leading-relaxed">{desc}</p>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                        {/* Alternative Selection */}
                        {t.alternative_selection && (
                            <section id="alternatives-guide" className="scroll-mt-24">
                                <div className="mb-4 border-b border-border-divider pb-2">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-news-accent mb-1">Consider These Instead</p>
                                    <h2 className="text-xl font-bold text-white">When Not To Choose {tool.name}</h2>
                                </div>
                                <div className="bg-surface-card border border-border-subtle rounded-xl p-5">
                                    <p className="text-sm text-news-text leading-relaxed">{linkifyCompetitors(t.alternative_selection)}</p>
                                </div>
                            </section>
                        )}

                        {/* ─── Mobile only: integrations + model + limitations (positions 15–17) ─── */}
                        {(tool.integrations?.length > 0 || t.model_version || t.limitations?.length > 0) && (
                            <div className="md:hidden space-y-4">
                                {tool.integrations?.length > 0 && (
                                    <div className="bg-surface-card border border-border-subtle shadow-elevation rounded-2xl p-5">
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-news-muted mb-3">Integrations</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {tool.integrations.map(int => (
                                                <span key={int} className="text-xs px-3 py-1.5 rounded-full bg-surface-alt text-white border border-border-subtle shadow-sm">{int}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {/* Current Model — only shown when no Plans table (legacy fallback) */}
                                {!t.model_version_by_plan && t.model_version && (
                                    <div className="bg-surface-card border border-border-subtle shadow-elevation rounded-2xl p-5">
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-news-muted mb-2">Current Model</h3>
                                        <p className="text-sm text-white font-medium">{t.model_version}</p>
                                    </div>
                                )}
                                {t.limitations?.length > 0 && (
                                    <div className="bg-surface-card border border-border-subtle shadow-elevation rounded-2xl p-5">
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-news-muted mb-3">Known Limitations</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {t.limitations.map((lim: string) => (
                                                <span key={lim} className="text-[10px] px-2 py-1 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 font-mono">
                                                    {lim.replace(/_/g, ' ')}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Build a Stack banner — hidden until stacks feature is live */}

                        {/* Reviews */}
                        {reviews.length > 0 && (
                            <section id="linked-reviews" className="scroll-mt-24">
                                <h2 className="text-base font-bold uppercase tracking-widest text-news-muted mb-3 border-b border-border-divider pb-2">Reviews</h2>
                                <div className="space-y-2">
                                    {reviews.map((a: Article) => (
                                        <a key={a.id || (a as any)._id} href={`/articles/${a.slug}`}
                                            className="flex items-center justify-between gap-3 bg-surface-alt border border-border-subtle rounded-lg px-4 py-3 hover:border-news-accent/40 transition-colors group">
                                            <span className="text-sm text-news-text group-hover:text-white truncate">{a.title}</span>
                                            <ArrowRight size={12} className="flex-shrink-0 text-news-muted group-hover:text-news-accent" />
                                        </a>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Guides */}
                        {guides.length > 0 && (
                            <section id="linked-guides" className="scroll-mt-24">
                                <h2 className="text-base font-bold uppercase tracking-widest text-news-muted mb-3 border-b border-border-divider pb-2">Guides</h2>
                                <div className="space-y-2">
                                    {guides.map((a: Article) => (
                                        <a key={a.id || (a as any)._id} href={`/articles/${a.slug}`}
                                            className="flex items-center justify-between gap-3 bg-surface-alt border border-border-subtle rounded-lg px-4 py-3 hover:border-news-accent/40 transition-colors group">
                                            <span className="text-sm text-news-text group-hover:text-white truncate">{a.title}</span>
                                            <ArrowRight size={12} className="flex-shrink-0 text-news-muted group-hover:text-news-accent" />
                                        </a>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* News */}
                        {news.length > 0 && (
                            <section id="linked-news" className="scroll-mt-24">
                                <h2 className="text-base font-bold uppercase tracking-widest text-news-muted mb-3 border-b border-border-divider pb-2">News</h2>
                                <div className="space-y-2">
                                    {news.map((a: Article) => (
                                        <a key={a.id || (a as any)._id} href={`/articles/${a.slug}`}
                                            className="flex items-center justify-between gap-3 bg-surface-alt border border-border-subtle rounded-lg px-4 py-3 hover:border-news-accent/40 transition-colors group">
                                            <span className="text-sm text-news-text group-hover:text-white truncate">{a.title}</span>
                                            <ArrowRight size={12} className="flex-shrink-0 text-news-muted group-hover:text-news-accent" />
                                        </a>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Best-of / Rankings */}
                        {bestOf.length > 0 && (
                            <section id="linked-bestof" className="scroll-mt-24">
                                <h2 className="text-base font-bold uppercase tracking-widest text-news-muted mb-3 border-b border-border-divider pb-2">Best-of Rankings</h2>
                                <div className="space-y-2">
                                    {bestOf.map((a: Article) => (
                                        <a key={a.id || (a as any)._id} href={`/articles/${a.slug}`}
                                            className="flex items-center justify-between gap-3 bg-surface-alt border border-border-subtle rounded-lg px-4 py-3 hover:border-news-accent/40 transition-colors group">
                                            <span className="text-sm text-news-text group-hover:text-white truncate">{a.title}</span>
                                            <ArrowRight size={12} className="flex-shrink-0 text-news-muted group-hover:text-news-accent" />
                                        </a>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Use Cases */}
                        {useCases.length > 0 && (
                            <section id="linked-usecases" className="scroll-mt-24">
                                <h2 className="text-base font-bold uppercase tracking-widest text-news-muted mb-3 border-b border-border-divider pb-2">Use Cases</h2>
                                <div className="flex flex-wrap gap-2">
                                    {useCases.map((uc: any) => (
                                        <a key={uc.slug} href={`/use-cases/${uc.slug}`}
                                            className="text-xs px-3 py-1.5 rounded-full bg-surface-alt border border-border-subtle hover:border-news-accent/40 text-news-text hover:text-white transition-colors">
                                            {uc.name}
                                        </a>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Sidebar — desktop only; all content duplicated inline above for mobile */}
                    <div className="hidden md:block space-y-6" aria-hidden="true">
                        {/* Pricing Card */}
                        <div className="bg-surface-card border border-border-subtle shadow-elevation rounded-2xl p-6 relative overflow-hidden">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-news-muted mb-4">Pricing</h3>
                            <div className={`inline-block text-sm font-bold px-3 py-1 rounded-full border mb-3 ${pricingClass}`}>
                                {tool.pricing_model}
                            </div>
                            {tool.starting_price && (() => {
                                const tiers = parsePricingTiers(tool.starting_price!);
                                if (tiers) return (
                                    <div className="mb-1 space-y-1">
                                        {tiers.map(({ label, price }) => (
                                            <div key={label} className="flex justify-between items-baseline gap-2 text-xs">
                                                <span className="text-news-muted">{label}</span>
                                                <span className="text-white font-semibold tabular-nums">{price}</span>
                                            </div>
                                        ))}
                                    </div>
                                );
                                return <p className="text-white font-semibold text-sm">{tool.starting_price}</p>;
                            })()}
                            {/* FREE_TIER shown here only when no Plans table (legacy records) */}
                            {!t.model_version_by_plan && t.free_tier != null && (
                                <div className="mt-3 pt-3 border-t border-border-divider">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-news-accent mb-1">Free tier includes:</p>
                                    {t.free_tier.toLowerCase() === 'none'
                                        ? <p className="text-xs text-news-muted">Not available</p>
                                        : <p className="text-xs text-white leading-relaxed">{t.free_tier}</p>
                                    }
                                </div>
                            )}
                            {tool.affiliate_url && (
                                <a href={tool.affiliate_url} target="_blank" rel="noopener noreferrer"
                                    className="mt-4 block text-center bg-news-accent hover:opacity-90 text-white font-bold text-sm px-4 py-2.5 rounded-lg transition-opacity shadow-md">
                                    Get Started →
                                </a>
                            )}
                        </div>

                        {/* Platforms */}
                        {tool.supported_platforms?.length > 0 && (
                            <div className="bg-surface-card border border-border-subtle shadow-elevation rounded-2xl p-6">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-news-muted mb-4 flex items-center gap-2">
                                    <Smartphone size={12} /> Platforms
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {tool.supported_platforms.map(p => (
                                        <span key={p} className="text-xs px-2 py-1 rounded bg-surface-alt shadow-sm text-news-text border border-border-subtle">{p}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Capabilities */}
                        {(() => {
                            const t = tool as any;
                            const capRows: Array<{ label: string; value: string | null | undefined }> = [
                                { label: 'Context Window', value: t.context_window },
                                { label: 'API Pricing', value: t.api_pricing },
                                { label: 'Image Generation', value: t.image_generation },
                                { label: 'Memory Persistence', value: t.memory_persistence },
                                { label: 'Computer Use', value: t.computer_use },
                                { label: 'API Available', value: t.api_available },
                            ];
                            const hasAny = capRows.some(r => r.value);
                            if (!hasAny) return null;
                            const renderCapability = (value: string | null | undefined) => {
                                if (value === 'yes') return <span className="flex items-center gap-1 text-news-accent text-xs font-bold">✓ Yes</span>;
                                if (value === 'no') return <span className="text-news-muted text-xs">✗ No</span>;
                                if (value === 'partial') return <span className="text-yellow-500 text-xs">◑ Partial</span>;
                                return <span className="text-white text-xs font-medium">{value}</span>;
                            };
                            return (
                                <div className="bg-surface-card border border-border-subtle shadow-elevation rounded-2xl p-6">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-news-muted mb-4 flex items-center gap-2">
                                        <Zap size={12} /> Capabilities
                                    </h3>
                                    <div className="space-y-2.5">
                                        {capRows.filter(r => r.value).map(r => {
                                            const isEnum = ['yes','no','partial'].includes(r.value as string);
                                            const isShort = isEnum || (r.value && r.value.length <= 10);
                                            return isShort ? (
                                                <div key={r.label} className="flex items-center justify-between gap-2">
                                                    <span className="text-[11px] text-news-muted">{r.label}</span>
                                                    {renderCapability(r.value)}
                                                </div>
                                            ) : (
                                                <div key={r.label} className="space-y-0.5">
                                                    <span className="text-[11px] text-news-muted block">{r.label}</span>
                                                    <span className="text-white text-xs font-medium leading-snug block">{r.value}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Rating */}
                        {tool.rating_score > 0 && (
                            <div className="bg-surface-card border border-border-subtle shadow-elevation rounded-2xl p-6">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-news-muted mb-3 text-center">Our Score</h3>
                                <div className="flex items-center justify-center gap-1 text-news-accent mb-4">
                                    <Star size={18} fill="currentColor" />
                                    <span className="text-2xl font-black text-white">{tool.rating_score.toFixed(1)}</span>
                                    <span className="text-news-muted text-sm">/10</span>
                                </div>
                                {Object.keys(ratingBreakdown).length > 0 && (
                                    <div className="space-y-2 border-t border-border-divider pt-4">
                                        {Object.entries(ratingBreakdown).map(([dim, score]) => (
                                            <div key={dim}>
                                                <div className="flex justify-between text-[10px] text-news-muted mb-1">
                                                    <span className="font-bold uppercase tracking-widest">{dim}</span>
                                                    <span className="text-white font-bold">{score.toFixed(1)}</span>
                                                </div>
                                                <div className="w-full bg-surface-alt rounded-full h-1.5">
                                                    <div className="bg-news-accent h-1.5 rounded-full transition-all" style={{ width: `${(score / 10) * 100}%` }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Use Case Score Bars */}
                        {tool.use_case_tags?.length > 0 && (() => {
                            const ucWithScores = tool.use_case_tags.map((uc: string) => {
                                const se = ucScoresArr.find(s => s.use_case.toLowerCase() === uc.toLowerCase());
                                const sc = se?.score != null ? se.score : (() => { const m = (useCaseBreakdown[uc] || '').match(/(\d+(?:\.\d+)?)\s*\/\s*10/); return m ? parseFloat(m[1]) : null; })();
                                return { uc, sc };
                            });
                            return (
                                <div className="bg-surface-card border border-border-subtle shadow-elevation rounded-2xl p-5">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-news-muted mb-4 text-center">Use Cases</h3>
                                    <div className="space-y-2">
                                        {ucWithScores.map(({ uc, sc }: { uc: string; sc: number | null }) => {
                                            const ucAnchor = `use-case-${uc.toLowerCase().replace(/\s+/g, '-')}`;
                                            return (
                                                <a key={uc} href={`#${ucAnchor}`}
                                                    onClick={(e: React.MouseEvent) => { e.preventDefault(); document.getElementById(ucAnchor)?.scrollIntoView({ behavior: 'smooth' }); }}
                                                    className="block group">
                                                    <div className="flex justify-between text-[10px] text-news-muted mb-1 group-hover:text-news-accent transition-colors">
                                                        <span className="font-bold uppercase tracking-widest">{uc}</span>
                                                        <span className="text-white font-bold">{sc != null ? sc.toFixed(1) : '—'}</span>
                                                    </div>
                                                    <div className="w-full bg-surface-alt rounded-full h-1.5">
                                                        <div className="bg-news-accent h-1.5 rounded-full transition-all" style={{ width: sc != null ? `${(sc / 10) * 100}%` : '0%' }} />
                                                    </div>
                                                </a>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Compares With */}
                        {competitorObjs.length > 0 && (
                            <div className="bg-surface-card border border-border-subtle shadow-elevation rounded-2xl p-5">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-news-muted mb-3">Compares With</h3>
                                <div className="divide-y divide-border-divider">
                                    {competitorObjs.map((comp: any) => {
                                        const diff = (t.competitor_differentiator as any)?.[comp.id] || null;
                                        const compSlug = comp.slug || '';
                                        return (
                                            <a key={comp.id} href={`/compare/${tool.slug}-vs-${compSlug}`}
                                                className="flex items-start gap-2.5 group py-3 first:pt-0 last:pb-0 hover:bg-surface-alt/40 -mx-1 px-1 rounded transition-colors cursor-pointer">
                                                {comp.logo && <div className="w-6 h-6 rounded bg-white flex-shrink-0 overflow-hidden flex items-center justify-center p-0.5 mt-0.5"><img src={comp.logo} alt="" className="w-full h-full object-contain" onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.parentElement!.style.display = 'none'; }} /></div>}
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-semibold text-white group-hover:text-news-accent transition-colors">{comp.name}</p>
                                                    {diff && <p className="text-sm text-news-muted leading-relaxed mt-0.5">{diff}</p>}
                                                    <p className="text-[11px] text-news-accent/70 group-hover:text-news-accent transition-colors text-right mt-1">Compare →</p>
                                                </div>
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Alternatives */}
                        {alternatives.length > 0 && (
                            <div className="bg-surface-card border border-border-subtle shadow-elevation rounded-2xl p-5">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-news-muted mb-3">Alternatives</h3>
                                <div className="divide-y divide-border-divider">
                                    {alternatives.slice(0, 3).map((alt: any) => (
                                        <Link key={alt.slug} href={`/tools/${alt.slug}`}
                                            className="flex items-center gap-2 group py-2.5 first:pt-0 last:pb-0 hover:bg-surface-alt/40 -mx-1 px-1 rounded transition-colors">
                                            {alt.logo && (
                                                <div className="w-5 h-5 rounded bg-white flex-shrink-0 overflow-hidden flex items-center justify-center p-0.5">
                                                    <img src={alt.logo} alt="" className="w-full h-full object-contain" onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.parentElement!.style.display = 'none'; }} />
                                                </div>
                                            )}
                                            <span className="text-xs text-news-muted group-hover:text-white transition-colors truncate">{alt.name}</span>
                                        </Link>
                                    ))}
                                </div>
                                <Link href={`/tools/${slug}/alternatives`}
                                    className="mt-3 block text-xs text-teal-400 hover:underline font-medium">
                                    See all {alternatives.length} alternatives →
                                </Link>
                            </div>
                        )}

                        {/* Best For */}
                        {t.workflow_tags?.length > 0 && (
                            <div className="bg-surface-card border border-border-subtle shadow-elevation rounded-2xl p-5">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-teal-400 mb-3">Best For</h3>
                                <div className="flex flex-wrap gap-2">
                                    {(t.workflow_tags as string[]).map((wf: string) => (
                                        <a
                                            key={wf}
                                            href={`/best-ai-tools/for/${wf.toLowerCase().replace(/\s+/g, '-')}`}
                                            className="text-[11px] px-2.5 py-1 rounded-full bg-surface-alt border border-border-subtle text-teal-400 hover:border-teal-500/40 hover:bg-teal-500/5 transition-colors font-medium"
                                        >
                                            {wf}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Often Used With */}
                        {relatedToolObjs.length > 0 && (
                            <div className="bg-surface-card border border-border-subtle shadow-elevation rounded-2xl p-5">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-news-muted mb-3">Often Used With</h3>
                                <div className="flex flex-col gap-3">
                                    {relatedToolObjs.map((rel: any) => {
                                        const note = (t.related_tool_note as any)?.[rel.id] || rel.short_description || null;
                                        const inner = (
                                            <div className="flex items-start gap-3 group">
                                                {rel.logo && (
                                                    <div className="w-8 h-8 rounded-lg bg-white flex-shrink-0 overflow-hidden flex items-center justify-center">
                                                        <img src={rel.logo} alt="" className="w-full h-full object-contain p-1" onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.parentElement!.style.display = 'none'; }} />
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-white group-hover:text-news-accent transition-colors">{rel.name}</p>
                                                    {note && <p className="text-[11px] text-news-muted leading-relaxed line-clamp-2 mt-0.5">{note}</p>}
                                                </div>
                                            </div>
                                        );
                                        return rel.slug ? (
                                            <a key={rel.id} href={`/tools/${rel.slug}`}>{inner}</a>
                                        ) : (
                                            <div key={rel.id}>{inner}</div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Integrations */}
                        {tool.integrations?.length > 0 && (
                            <div className="bg-surface-card border border-border-subtle shadow-elevation rounded-2xl p-5">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-news-muted mb-3">Integrations</h3>
                                <div className="flex flex-wrap gap-2">
                                    {tool.integrations.map(int => (
                                        <span key={int} className="text-xs px-3 py-1.5 rounded-full bg-surface-alt text-white border border-border-subtle shadow-sm">{int}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Current Model — only shown when no Plans table (legacy fallback) */}
                        {!t.model_version_by_plan && t.model_version && (
                            <div className="bg-surface-card border border-border-subtle shadow-elevation rounded-2xl p-5">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-news-muted mb-2">Current Model</h3>
                                <p className="text-sm text-white font-medium">{t.model_version}</p>
                            </div>
                        )}

                        {/* Limitations */}
                        {t.limitations?.length > 0 && (
                            <div className="bg-surface-card border border-border-subtle shadow-elevation rounded-2xl p-5">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-news-muted mb-3">Known Limitations</h3>
                                <div className="flex flex-wrap gap-2">
                                    {t.limitations.map((lim: string) => (
                                        <span key={lim} className="text-[10px] px-2 py-1 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 font-mono">
                                            {lim.replace(/_/g, ' ')}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ToolPage;
