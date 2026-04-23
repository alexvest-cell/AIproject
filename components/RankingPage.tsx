'use client';
import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { categorySlugToName } from '../lib/utils/slugs';
import {
    ArrowLeft, Star, ArrowRight, BarChart2, Layers, Award,
    TrendingUp, ChevronRight, Info, ChevronDown, ChevronUp,
} from 'lucide-react';
import { Tool } from '../types';

// ── Constants ──────────────────────────────────────────────────────────────────

const CATEGORY_PRIMARY_VALUES = [
    'AI Chatbots', 'AI Writing', 'AI Image Generation', 'AI Video', 'AI Audio',
    'Productivity', 'Automation', 'Design', 'Development', 'Marketing',
    'Sales & CRM', 'Customer Support', 'Data Analysis', 'Research', 'SEO Tools', 'Other',
];

const ALL_WORKFLOW_TAGS = [
    'Students', 'Developers', 'Marketers', 'Content Creators', 'Startups',
    'Small Business', 'Enterprise', 'Researchers', 'Designers', 'Sales Teams',
    'Agencies', 'Educators', 'Freelancers', 'Product Managers', 'Data Scientists',
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function slugToLabel(slug: string): string {
    return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function labelToSlug(label: string): string {
    return label.toLowerCase().replace(/\s+/g, '-');
}

function extractWorkflowScore(tool: Tool, tag: string): number | null {
    const wb = (tool as any).workflow_breakdown as string | null;
    if (!wb) return null;
    const line = wb.split('\n').find((l: string) => l.toLowerCase().startsWith(tag.toLowerCase() + ':'));
    if (!line) return null;
    const m = line.match(/(\d+(?:\.\d+)?)\s*\/\s*10/);
    return m ? parseFloat(m[1]) : null;
}

function extractWorkflowEvidence(tool: Tool, tag: string): string | null {
    const wb = (tool as any).workflow_breakdown as string | null;
    if (!wb) return null;
    const line = wb.split('\n').find((l: string) => l.toLowerCase().startsWith(tag.toLowerCase() + ':'));
    if (!line) return null;
    const dashIdx = line.indexOf('—');
    if (dashIdx !== -1) return line.slice(dashIdx + 1).trim();
    const enDashIdx = line.indexOf('–');
    if (enDashIdx !== -1) return line.slice(enDashIdx + 1).trim();
    return null;
}

// ── Sub-components ─────────────────────────────────────────────────────────────

const RatingBarStrip: React.FC<{ breakdown: Record<string, number> }> = ({ breakdown }) => {
    const entries = Object.entries(breakdown).slice(0, 5);
    return (
        <div className="space-y-1.5">
            {entries.map(([key, val]) => (
                <div key={key} className="flex items-center gap-2">
                    <span className="text-[9px] text-news-muted capitalize w-20 flex-shrink-0 truncate">
                        {key.replace(/_/g, ' ')}
                    </span>
                    <div className="flex-1 h-1 rounded-full bg-white/5">
                        <div
                            className="h-1 rounded-full bg-teal-400"
                            style={{ width: `${Math.min((val / 10) * 100, 100)}%` }}
                        />
                    </div>
                    <span className="text-[9px] text-white font-bold w-5 text-right">{val}</span>
                </div>
            ))}
        </div>
    );
};

// ── Types ──────────────────────────────────────────────────────────────────────

interface RankedTool {
    tool: Tool;
    score: number | null;
    evidence: string | null;
}

export interface RankingPageProps {
    type: 'workflow' | 'category';
    slug: string;
    onBack: () => void;
    onToolClick: (slug: string, forParam?: string) => void;
    onComparisonClick: (slug: string) => void;
    onRankingClick: (type: 'workflow' | 'category', slug: string) => void;
    onHubNavigate?: (hub: string) => void;
    // Server-prefetched data — skips client-side fetch when provided
    initialTools?: Tool[];
}

// ── Main Component ─────────────────────────────────────────────────────────────

const RankingPage: React.FC<RankingPageProps> = ({
    type, slug, onBack, onToolClick, onComparisonClick, onRankingClick, onHubNavigate, initialTools,
}) => {
    const [allTools, setAllTools] = useState<Tool[]>(initialTools ?? []);
    const [loading, setLoading] = useState(!initialTools?.length);

    useEffect(() => {
        if (initialTools?.length) return;
        fetch('/api/tools')
            .then(r => r.json())
            .then(data => { setAllTools(Array.isArray(data) ? data : []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    // Derive human-readable label from slug
    const label = useMemo(() => {
        if (type === 'workflow') {
            return ALL_WORKFLOW_TAGS.find(t => labelToSlug(t) === slug) || slugToLabel(slug);
        }
        return categorySlugToName(slug) || CATEGORY_PRIMARY_VALUES.find(c => labelToSlug(c) === slug) || slugToLabel(slug);
    }, [type, slug]);

    // Set page title + meta description
    useEffect(() => {
        document.title = type === 'workflow'
            ? `Best Tools for ${label} in 2026 — ToolCurrent`
            : `Best ${label} Tools in 2026 — ToolCurrent`;

        let metaEl = document.querySelector<HTMLMetaElement>('meta[name="description"]');
        if (!metaEl) {
            metaEl = document.createElement('meta');
            metaEl.setAttribute('name', 'description');
            document.head.appendChild(metaEl);
        }
        metaEl.setAttribute('content', type === 'workflow'
            ? `Ranked list of the best AI tools for ${label}. Scored, tested, and compared so you can choose faster.`
            : `Top-rated ${label} tools ranked and scored. Expert recommendations based on features, pricing, and real-world performance.`
        );

        let canonEl = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
        if (!canonEl) {
            canonEl = document.createElement('link');
            canonEl.setAttribute('rel', 'canonical');
            document.head.appendChild(canonEl);
        }
        const canonPath = type === 'workflow'
            ? `/best-ai-tools/for/${slug}`
            : `/best-ai-tools/${slug}`;
        canonEl.setAttribute('href', `${window.location.origin}${canonPath}`);
    }, [type, label, slug]);

    // Filter + rank tools
    const rankedTools = useMemo((): RankedTool[] => {
        if (type === 'workflow') {
            const filtered = allTools.filter(t => ((t as any).workflow_tags || []).includes(label));
            return [...filtered]
                .map(t => ({
                    tool: t,
                    score: extractWorkflowScore(t, label),
                    evidence: extractWorkflowEvidence(t, label),
                }))
                .sort((a, b) => {
                    if (a.score !== null && b.score !== null) return b.score - a.score;
                    if (a.score !== null) return -1;
                    if (b.score !== null) return 1;
                    return (b.tool.rating_score || 0) - (a.tool.rating_score || 0);
                });
        } else {
            const filtered = allTools.filter(t => t.category_primary === label);
            return [...filtered]
                .sort((a, b) => (b.rating_score || 0) - (a.rating_score || 0))
                .map(t => ({
                    tool: t,
                    score: t.rating_score || null,
                    evidence: t.short_description || null,
                }));
        }
    }, [allTools, type, label]);

    const topPick = rankedTools[0] ?? null;
    const [visibleCount, setVisibleCount] = useState(9);
    const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
    const toggleCard = (slug: string) => setExpandedCards(prev => {
        const next = new Set(prev);
        next.has(slug) ? next.delete(slug) : next.add(slug);
        return next;
    });
    const visibleTools = rankedTools.slice(1, 1 + visibleCount);
    const hasMore = rankedTools.length > 1 + visibleCount;

    // Also Compare: pairs from top 4 tools
    const comparePairs = useMemo(() => {
        const top4 = rankedTools.slice(0, 4).map(r => r.tool);
        if (top4.length < 2) return [];
        const pairs: { a: Tool; b: Tool }[] = [];
        for (let i = 0; i < top4.length; i++) {
            for (let j = i + 1; j < top4.length; j++) {
                pairs.push({ a: top4[i], b: top4[j] });
            }
        }
        return pairs.slice(0, 4);
    }, [rankedTools]);

    // Related Rankings: 3 other workflow/category pages with tools
    const relatedRankings = useMemo(() => {
        if (type === 'workflow') {
            return ALL_WORKFLOW_TAGS
                .filter(t => t !== label)
                .filter(t => allTools.some(tool => ((tool as any).workflow_tags || []).includes(t)))
                .slice(0, 3);
        }
        return CATEGORY_PRIMARY_VALUES
            .filter(c => c !== label)
            .filter(c => allTools.some(tool => tool.category_primary === c))
            .slice(0, 3);
    }, [allTools, type, label]);

    // Most-recent last_updated among ranked tools
    const lastUpdated = useMemo(() => {
        const dates = rankedTools
            .map(r => r.tool.last_updated)
            .filter(Boolean)
            .map(d => new Date(d!).getTime());
        if (!dates.length) return null;
        return new Date(Math.max(...dates)).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }, [rankedTools]);

    // ── Render ─────────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="min-h-screen bg-news-bg flex items-center justify-center">
                <div className="flex items-center gap-3 text-news-muted text-sm">
                    <div className="w-5 h-5 rounded-full border-2 border-news-accent border-t-transparent animate-spin" />
                    Loading rankings…
                </div>
            </div>
        );
    }

    if (!loading && !rankedTools.length) {
        return (
            <div className="min-h-screen bg-news-bg flex flex-col items-center justify-center gap-4 px-4">
                <h1 className="text-xl font-black text-white">No tools found</h1>
                <p className="text-sm text-news-muted text-center max-w-xs">
                    No tools are currently ranked for this {type}. Check back after more tools are added.
                </p>
                <button
                    onClick={onBack}
                    className="text-xs text-news-accent font-bold flex items-center gap-1 hover:underline"
                >
                    <ArrowLeft size={12} /> Back to Best AI Tools
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-news-bg">
            <div className="max-w-4xl mx-auto px-4 py-6 md:py-10 space-y-12">

                {/* ── 1. Breadcrumb + Header ─────────────────────────────────── */}
                <div>
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-1.5 text-[10px] text-news-muted mb-5 flex-wrap">
                        <button
                            onClick={() => onHubNavigate?.('home')}
                            className="hover:text-white transition-colors"
                        >
                            Home
                        </button>
                        <ChevronRight size={10} />
                        <button
                            onClick={() => onHubNavigate?.('best-ai-tools')}
                            className="hover:text-white transition-colors"
                        >
                            Best AI Tools
                        </button>
                        <ChevronRight size={10} />
                        {type === 'workflow' && (
                            <>
                                <span>By Workflow</span>
                                <ChevronRight size={10} />
                            </>
                        )}
                        {type === 'category' && (
                            <>
                                <span>By Category</span>
                                <ChevronRight size={10} />
                            </>
                        )}
                        <span className="text-white font-bold">{label}</span>
                    </nav>

                    {/* Back button */}
                    <button
                        onClick={onBack}
                        className="inline-flex items-center gap-1.5 text-xs text-news-muted hover:text-white transition-colors mb-6 font-bold"
                    >
                        <ArrowLeft size={13} /> Back to Best Software
                    </button>

                    {/* Title */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-news-accent/10 border border-news-accent/20 text-news-accent font-black uppercase tracking-widest">
                                {type === 'workflow' ? 'Workflow Ranking' : 'Category Ranking'}
                            </span>
                            {lastUpdated && (
                                <span className="text-[9px] text-news-muted font-bold uppercase tracking-widest">
                                    Updated {lastUpdated}
                                </span>
                            )}
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                            {type === 'workflow'
                                ? `Best Tools for ${label}`
                                : `Best ${label} Tools`}
                        </h1>
                        <p className="text-sm text-news-muted leading-relaxed max-w-2xl">
                            {type === 'workflow'
                                ? `${rankedTools.length} tool${rankedTools.length !== 1 ? 's' : ''} ranked for ${label} workflows — scored on how well each fits your specific use cases, not just general features.`
                                : `${rankedTools.length} tool${rankedTools.length !== 1 ? 's' : ''} ranked in the ${label} category — scored on features, pricing, integrations, and real-world performance.`}
                        </p>
                    </div>
                </div>

                {/* ── 2. Top Pick Card ───────────────────────────────────────── */}
                {topPick && (
                    <section>
                        <h2 className="text-xs font-black text-teal-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Award size={14} /> Top Pick
                        </h2>
                        <div className="rounded-2xl border-2 border-teal-500/40 bg-teal-500/5 p-6 sm:p-8">
                            {/* Logo + name/score row */}
                            <div className="flex items-start gap-5 mb-5">
                                <div className="relative flex-shrink-0">
                                    <div className="relative w-16 h-16 rounded-2xl bg-white border border-border-subtle overflow-hidden">
                                        {topPick.tool.logo
                                            ? <Image src={topPick.tool.logo} alt={topPick.tool.name} fill style={{ objectFit: 'contain', padding: '8px' }} unoptimized={topPick.tool.logo?.startsWith('https://res.cloudinary.com')} />
                                            : <Layers size={24} className="text-news-muted" />
                                        }
                                    </div>
                                    <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center shadow-sm">
                                        <span className="text-[9px] font-black text-white">1</span>
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start gap-3 flex-wrap mb-2">
                                        <h3 className="text-xl font-black text-white leading-tight">{topPick.tool.name}</h3>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {topPick.tool.category_primary && (
                                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-news-muted font-bold uppercase tracking-widest">
                                                    {topPick.tool.category_primary}
                                                </span>
                                            )}
                                            {topPick.tool.pricing_model && (
                                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-news-muted font-bold uppercase tracking-widest">
                                                    {topPick.tool.pricing_model}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {topPick.score !== null && (
                                        <div className="flex items-center gap-1.5">
                                            <Star size={14} className="text-teal-400" fill="currentColor" />
                                            <span className="text-lg font-black text-white">{topPick.score}</span>
                                            <span className="text-xs text-news-muted">/10</span>
                                            <span className="text-[9px] text-teal-400 font-bold uppercase tracking-widest ml-1">
                                                {type === 'workflow' ? `${label} Score` : 'Rating'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Full-width: evidence, bars, CTAs */}
                            {(topPick.evidence || topPick.tool.short_description) && (
                                <p className="text-sm text-news-muted leading-relaxed mb-4">
                                    {topPick.evidence || topPick.tool.short_description}
                                </p>
                            )}
                            {topPick.tool.rating_breakdown && Object.keys(topPick.tool.rating_breakdown).length > 0 && (
                                <div className="mb-5">
                                    <RatingBarStrip breakdown={topPick.tool.rating_breakdown} />
                                </div>
                            )}
                            <div className="flex items-center gap-3 flex-wrap">
                                <button
                                    onClick={() => onToolClick(topPick.tool.slug, slug)}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-black hover:bg-teal-500/20 transition-colors"
                                >
                                    View Profile <ArrowRight size={12} />
                                </button>
                                {(topPick.tool.affiliate_url || topPick.tool.website_url) && (
                                    <a
                                        href={topPick.tool.affiliate_url || topPick.tool.website_url}
                                        target="_blank"
                                        rel="noopener noreferrer nofollow"
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-news-muted text-xs font-black hover:bg-white/10 transition-colors"
                                    >
                                        Visit Site <ArrowRight size={12} />
                                    </a>
                                )}
                            </div>
                        </div>
                    </section>
                )}

                {/* ── 3. Ranked List (#2+) ──────────────────────────────────── */}
                {visibleTools.length > 0 && (
                    <section>
                        <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                            <TrendingUp size={20} className="text-news-accent" />
                            {type === 'workflow' ? `All Tools for ${label}` : `All ${label} Tools`}
                        </h2>
                        <div className="space-y-3">
                            {visibleTools.map((ranked, i) => {
                                const position = i + 2;
                                const isExpanded = expandedCards.has(ranked.tool.slug);
                                return (
                                    <div
                                        key={ranked.tool.slug}
                                        className="rounded-2xl bg-surface-card border border-border-subtle hover:border-news-accent/30 transition-all"
                                    >
                                        {/* Collapsed row */}
                                        <div
                                            className="flex items-center gap-4 px-5 py-4 cursor-pointer group"
                                            onClick={() => toggleCard(ranked.tool.slug)}
                                        >
                                            <div className="w-7 h-7 rounded-full border border-border-subtle flex items-center justify-center flex-shrink-0">
                                                <span className="text-[11px] font-black text-news-muted">{position}</span>
                                            </div>
                                            <div className="relative w-10 h-10 rounded-xl bg-white border border-border-subtle flex-shrink-0 overflow-hidden">
                                                {ranked.tool.logo
                                                    ? <Image src={ranked.tool.logo} alt={ranked.tool.name} fill style={{ objectFit: 'contain', padding: '6px' }} unoptimized={ranked.tool.logo?.startsWith('https://res.cloudinary.com')} />
                                                    : <Layers size={14} className="text-news-muted" />
                                                }
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className="text-sm font-black text-white group-hover:text-news-accent transition-colors leading-tight truncate block">
                                                    {ranked.tool.name}
                                                </span>
                                                {ranked.tool.category_primary && (
                                                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-news-accent/10 border border-news-accent/20 text-news-accent font-bold uppercase tracking-widest hidden sm:inline-block mt-0.5">
                                                        {ranked.tool.category_primary}
                                                    </span>
                                                )}
                                            </div>
                                            {ranked.score !== null && (
                                                <div className="flex items-center gap-1 flex-shrink-0">
                                                    <Star size={10} className="text-news-accent" fill="currentColor" />
                                                    <span className="text-sm font-black text-white">{ranked.score}</span>
                                                </div>
                                            )}
                                            <div className="flex-shrink-0 text-news-muted group-hover:text-news-accent transition-colors">
                                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </div>
                                        </div>

                                        {/* Expanded content */}
                                        {isExpanded && (
                                            <div className="px-5 pb-6">
                                                {(ranked.evidence || ranked.tool.short_description) && (
                                                    <p className="text-sm text-news-muted leading-relaxed mb-4">
                                                        {ranked.evidence || ranked.tool.short_description}
                                                    </p>
                                                )}
                                                {ranked.tool.rating_breakdown && Object.keys(ranked.tool.rating_breakdown).length > 0 && (
                                                    <div className="mb-4">
                                                        <RatingBarStrip breakdown={ranked.tool.rating_breakdown} />
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); onToolClick(ranked.tool.slug, slug); }}
                                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-news-accent/10 border border-news-accent/30 text-news-accent text-xs font-black hover:bg-news-accent/20 transition-colors"
                                                    >
                                                        View Profile <ArrowRight size={12} />
                                                    </button>
                                                    {(ranked.tool.affiliate_url || ranked.tool.website_url) && (
                                                        <a
                                                            href={(ranked.tool.affiliate_url || ranked.tool.website_url) as string}
                                                            target="_blank"
                                                            rel="noopener noreferrer nofollow"
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-news-muted text-xs font-black hover:bg-white/10 transition-colors"
                                                        >
                                                            Visit Site <ArrowRight size={12} />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Load more */}
                        {hasMore && (
                            <button
                                onClick={() => setVisibleCount(c => c + 10)}
                                className="w-full mt-4 py-3 rounded-2xl border border-border-subtle bg-surface-card hover:border-news-accent/40 hover:bg-surface-hover text-sm font-black text-news-muted hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                                Load 10 more <ChevronDown size={14} />
                            </button>
                        )}
                    </section>
                )}

                {/* ── 4. HOW THIS RANKING WORKS ──────────────────────────────── */}
                <section className="rounded-2xl border border-border-subtle bg-surface-card p-6 sm:p-8">
                    <h2 className="text-base font-black text-white uppercase tracking-wider mb-5 flex items-center gap-2">
                        <Info size={15} className="text-news-accent" /> How This Ranking Works
                    </h2>
                    <div className="space-y-3 text-sm text-news-muted leading-relaxed">
                        {type === 'workflow' ? (
                            <>
                                <p>
                                    This ranking scores each tool specifically for <strong className="text-white">{label}</strong> workflows.
                                    Rather than using a single overall rating, we extract the workflow-specific score from each tool's
                                    evaluation — which reflects how well the tool serves {label.toLowerCase()} use cases in practice.
                                </p>
                                <p>
                                    Scores are sourced from each tool's workflow breakdown, which documents specific evidence for each
                                    workflow context. Tools without a workflow-specific score are ranked by their overall rating as a fallback.
                                </p>
                                <p>
                                    Rankings are updated as tools are re-evaluated. Affiliate relationships are disclosed but never affect ranking position.
                                </p>
                            </>
                        ) : (
                            <>
                                <p>
                                    This ranking covers all tools in the <strong className="text-white">{label}</strong> category,
                                    sorted by overall rating score. Scores are based on a structured evaluation across five dimensions:
                                    core features, ease of use, pricing fairness, integration depth, and AI-native capability.
                                </p>
                                <p>
                                    Rankings are updated quarterly to reflect product updates, pricing changes, and market shifts.
                                    Affiliate relationships are disclosed but never affect ranking position.
                                </p>
                            </>
                        )}
                    </div>
                </section>

                {/* ── 5. Also Compare ─────────────────────────────────────────── */}
                {comparePairs.length >= 2 && (
                    <section>
                        <h2 className="text-xl font-black text-white mb-2 flex items-center gap-2">
                            <BarChart2 size={18} className="text-news-accent" /> Also Compare
                        </h2>
                        <p className="text-sm text-news-muted mb-5">
                            Head-to-head comparisons between the top-ranked tools.
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {comparePairs.map(({ a, b }) => {
                                const compSlug = `${a.slug}-vs-${b.slug}`;
                                return (
                                    <button
                                        key={compSlug}
                                        onClick={() => onComparisonClick(compSlug)}
                                        className="group p-4 rounded-2xl bg-surface-card border border-border-subtle hover:border-blue-500/30 hover:bg-blue-500/5 transition-all text-left"
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="flex items-center -space-x-2">
                                                <div className="relative w-8 h-8 rounded-lg bg-white border border-border-subtle flex items-center justify-center z-10">
                                                    {a.logo
                                                        ? <Image src={a.logo} alt={a.name} fill style={{ objectFit: 'contain', padding: '4px' }} unoptimized={a.logo?.startsWith('https://res.cloudinary.com')} />
                                                        : <Layers size={11} className="text-news-muted" />
                                                    }
                                                </div>
                                                <div className="relative w-8 h-8 rounded-lg bg-white border border-border-subtle flex items-center justify-center">
                                                    {b.logo
                                                        ? <Image src={b.logo} alt={b.name} fill style={{ objectFit: 'contain', padding: '4px' }} unoptimized={b.logo?.startsWith('https://res.cloudinary.com')} />
                                                        : <Layers size={11} className="text-news-muted" />
                                                    }
                                                </div>
                                            </div>
                                            <BarChart2 size={12} className="text-blue-400 flex-shrink-0" />
                                        </div>
                                        <p className="text-xs font-black text-white group-hover:text-blue-400 transition-colors leading-snug">
                                            {a.name} vs {b.name}
                                        </p>
                                        <p className="text-[10px] text-news-muted mt-1.5 flex items-center gap-1 group-hover:text-white transition-colors">
                                            Compare <ArrowRight size={9} className="group-hover:translate-x-0.5 transition-transform" />
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* ── 6. Related Rankings ──────────────────────────────────────── */}
                {relatedRankings.length > 0 && (
                    <section>
                        <h2 className="text-xl font-black text-white mb-5 flex items-center gap-2">
                            <TrendingUp size={18} className="text-news-accent" /> Related Rankings
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {relatedRankings.map(relLabel => {
                                const relSlug = labelToSlug(relLabel);
                                const relCount = type === 'workflow'
                                    ? allTools.filter(t => ((t as any).workflow_tags || []).includes(relLabel)).length
                                    : allTools.filter(t => t.category_primary === relLabel).length;
                                return (
                                    <button
                                        key={relLabel}
                                        onClick={() => onRankingClick(type, relSlug)}
                                        className="group p-4 rounded-2xl bg-surface-card border border-border-subtle hover:border-news-accent/40 hover:-translate-y-0.5 transition-all text-left"
                                    >
                                        <p className="text-sm font-black text-white group-hover:text-news-accent transition-colors leading-snug">
                                            {type === 'workflow' ? `Best Tools for ${relLabel}` : `Best ${relLabel} Tools`}
                                        </p>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-[10px] text-news-muted">
                                                {relCount} tool{relCount !== 1 ? 's' : ''}
                                            </span>
                                            <span className="text-[10px] text-news-accent font-bold flex items-center gap-1 group-hover:text-white transition-colors">
                                                View ranking <ArrowRight size={9} className="group-hover:translate-x-0.5 transition-transform" />
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </section>
                )}

            </div>
        </div>
    );
};

export default RankingPage;
