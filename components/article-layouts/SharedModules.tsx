// @ts-nocheck
'use client';
import React, { useEffect, useState } from 'react';
import { Article, Tool, Comparison, Stack } from '../../types';
import * as toolsService from '../../services/toolsService';
import ToolCard from '../ToolCard';
import { ShieldCheck, Check, X, Loader2, BookOpen, Star, AlertCircle, TrendingUp, Info, ArrowRight, Layers, Maximize2, Image as ImageIcon } from 'lucide-react';

export const InlineToolCard: React.FC<{ slug: string }> = ({ slug }) => {
    const [tool, setTool] = useState<Tool | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        toolsService.fetchToolBySlug(slug)
            .then(data => setTool(data.tool))
            .catch(() => setTool(null))
            .finally(() => setLoading(false));
    }, [slug]);

    if (loading) return (
        <div className="my-8 w-full max-w-sm h-32 bg-surface-alt animate-pulse rounded-xl border border-border-subtle flex items-center justify-center">
            <Loader2 size={20} className="text-news-muted animate-spin" />
        </div>
    );
    if (!tool) return null;

    return (
        <div className="my-10 w-full max-w-2xl shadow-elevation rounded-2xl overflow-hidden bg-surface-card border border-border-subtle">
            <ToolCard tool={tool} />
        </div>
    );
};

export const QuickComparisonTable = ({ toolSlugs }: { toolSlugs: string[] }) => {
    const [tools, setTools] = useState<Tool[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!toolSlugs?.length) return;
        Promise.all(toolSlugs.map(slug => toolsService.fetchToolBySlug(slug)))
            .then(results => setTools(results.map(r => r.tool).filter(Boolean)))
            .finally(() => setLoading(false));
    }, [toolSlugs]);

    if (loading || tools.length < 2) return null;

    return (
        <div className="my-12 overflow-x-auto -mx-4 md:mx-0 shadow-elevation rounded-xl">
            <div className="min-w-[600px] border border-border-subtle rounded-xl overflow-hidden bg-surface-card">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-border-divider bg-surface-base/50">
                            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-news-muted">Feature</th>
                            {tools.map(t => (
                                <th key={t.id} className="p-4 text-sm font-bold text-white text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        {t.logo && <img src={t.logo} className="w-8 h-8 object-contain" alt="" />}
                                        {t.name}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="text-xs text-news-text">
                        <tr className="border-b border-border-divider hover:bg-surface-hover/50 transition-colors">
                            <td className="p-4 font-bold text-news-muted">Pricing</td>
                            {tools.map(t => <td key={t.id} className="p-4 text-center text-white">{t.pricing_model || 'Varies'}</td>)}
                        </tr>
                        <tr className="border-b border-border-divider hover:bg-surface-hover/50 transition-colors">
                            <td className="p-4 font-bold text-news-muted">Score</td>
                            {tools.map(t => <td key={t.id} className="p-4 text-center font-bold text-news-accent">{t.rating_score || '-'}/10</td>)}
                        </tr>
                        <tr className="hover:bg-surface-hover/50 transition-colors">
                            <td className="p-4 font-bold text-news-muted">AI Enabled</td>
                            {tools.map(t => <td key={t.id} className="p-4 text-center text-white">{t.ai_enabled ? '✓' : '×'}</td>)}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const VerdictBox = ({ article, type }: { article: Article; type?: string }) => {
    if (!article.verdict) return null;

    return (
        <div className="my-10 bg-surface-card border border-border-subtle shadow-elevation rounded-xl p-6 md:p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-news-accent"></div>
            <div className="flex items-center gap-2 text-news-accent font-bold uppercase tracking-widest text-[10px] mb-4">
                <ShieldCheck size={14} />
                <span>TL;DR Verdict</span>
            </div>
            <p className="text-white text-lg font-serif italic leading-relaxed">
                "{article.verdict}"
            </p>

            {type === 'ranking' && article.comparison_tools && (
                <div className="mt-6 pt-4 border-t border-border-divider flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 bg-surface-base p-3 rounded-lg border border-border-divider">
                        <span className="text-[10px] text-news-muted uppercase font-bold tracking-widest block mb-1">Best Overall</span>
                        <span className="text-white font-bold text-sm cursor-pointer hover:text-news-accent transition-colors">{article.comparison_tools[0] || 'Top Pick'}</span>
                    </div>
                    {article.comparison_tools.length > 1 && (
                        <div className="flex-1 bg-surface-base p-3 rounded-lg border border-border-divider">
                            <span className="text-[10px] text-news-muted uppercase font-bold tracking-widest block mb-1">Best Alternative</span>
                            <span className="text-white font-bold text-sm cursor-pointer hover:text-news-accent transition-colors">{article.comparison_tools[1]}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export const ProsConsSection = ({ pros, cons }: { pros?: string[]; cons?: string[] }) => {
    if (!pros?.length && !cons?.length) return null;

    return (
        <div className="my-10 grid grid-cols-1 md:grid-cols-2 gap-4">
            {pros && pros.length > 0 && (
                <div className="bg-surface-card border border-border-subtle shadow-sm rounded-xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-news-accent"></div>
                    <h3 className="text-news-accent font-bold text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Check size={16} /> Pros
                    </h3>
                    <ul className="space-y-3">
                        {pros.map((p, i) => (
                            <li key={i} className="text-news-text text-sm flex items-start gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-news-accent mt-1.5 flex-shrink-0" />
                                {p}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {cons && cons.length > 0 && (
                <div className="bg-surface-card border border-border-subtle shadow-sm rounded-xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                    <h3 className="text-red-400 font-bold text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                        <X size={16} /> Cons
                    </h3>
                    <ul className="space-y-3">
                        {cons.map((c, i) => (
                            <li key={i} className="text-news-text text-sm flex items-start gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                                {c}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export const ArticleFAQ = ({ faq }: { faq?: { question: string; answer: string }[] }) => {
    if (!faq || faq.length === 0) return null;

    return (
        <div className="mt-12 mb-8 pt-10 border-t border-border-divider">
            <h3 className="text-xl md:text-2xl font-serif font-bold text-white mb-6">Frequently Asked Questions</h3>
            <div className="space-y-4">
                {faq.map((item, i) => (
                    <div key={i} className="bg-surface-card border border-border-subtle shadow-sm rounded-xl p-5 hover:border-white/20 transition-colors">
                        <h4 className="text-base font-bold text-white mb-2 flex items-center gap-3">
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-news-accent/20 text-news-accent flex items-center justify-center text-xs">?</span>
                            {item.question}
                        </h4>
                        <p className="text-news-muted text-sm leading-relaxed pl-8">
                            {item.answer}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const ToolSummaryCard = ({ slug }: { slug: string }) => {
    const [tool, setTool] = useState<Tool | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (slug) {
            toolsService.fetchToolBySlug(slug)
                .then(res => setTool(res.tool))
                .catch(() => setTool(null))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [slug]);

    if (loading) return (
        <div className="my-8 w-full h-40 bg-surface-alt animate-pulse rounded-2xl border border-border-subtle" />
    );
    if (!tool) return null;

    const hasFree = tool.pricing_model === 'Free' || tool.pricing_model === 'Freemium';

    return (
        <div className="my-4 bg-surface-card border border-border-subtle rounded-2xl shadow-elevation overflow-hidden">
            {/* Top accent bar */}
            <div className="h-1 w-full bg-gradient-to-r from-news-accent via-news-accentHover to-blue-500" />
            <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center md:items-start">
                {/* Logo */}
                {tool.logo ? (
                    <img src={tool.logo} alt={tool.name} className="w-20 h-20 rounded-2xl bg-white p-2 border border-border-divider shadow-inner object-contain flex-shrink-0" />
                ) : (
                    <div className="w-20 h-20 rounded-2xl bg-surface-base flex items-center justify-center border border-border-divider text-3xl font-black text-news-muted flex-shrink-0">{tool.name[0]}</div>
                )}

                {/* Info */}
                <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start mb-1">
                        <h3 className="text-2xl font-bold text-white tracking-tight">{tool.name}</h3>
                        {hasFree ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-news-accent/10 border border-news-accent/30 text-news-accent">Free Plan Available</span>
                        ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400">Paid Only</span>
                        )}
                    </div>
                    <p className="text-sm text-news-muted mb-4 max-w-lg leading-relaxed">{tool.short_description}</p>

                    {/* Quick stats */}
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-5 text-xs font-bold text-news-text mb-5">
                        <div className="flex items-center gap-1.5">
                            <Star size={13} className="text-news-accent fill-news-accent" />
                            <span className="text-white">{tool.rating_score}</span>/10 Score
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Info size={13} className="text-news-muted" />
                            Starting: <span className="text-white ml-1">{tool.pricing_tiers?.[0]?.price || tool.starting_price || 'Contact Sales'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Check size={13} className={hasFree ? 'text-news-accent' : 'text-news-muted'} />
                            Free plan: <span className={`ml-1 font-bold ${hasFree ? 'text-news-accent' : 'text-news-muted'}`}>{hasFree ? 'Yes' : 'No'}</span>
                        </div>
                    </div>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                        {tool.website_url && (
                            <a href={tool.website_url} target="_blank" rel="noopener noreferrer"
                                className="px-6 py-2.5 rounded-xl font-bold text-sm bg-news-accent text-white hover:brightness-110 transition-all text-center shadow-[0_0_20px_rgba(43,212,195,0.2)]">
                                Visit {tool.name} →
                            </a>
                        )}
                        <a href={`/tools/${tool.slug}`}
                            className="px-6 py-2.5 rounded-xl font-bold text-sm bg-surface-base text-white border border-border-subtle hover:bg-surface-hover transition-colors text-center">
                            Full Review
                        </a>
                        <a href={`/comparisons`}
                            className="px-6 py-2.5 rounded-xl font-bold text-sm bg-surface-base text-news-muted border border-border-subtle hover:text-white hover:bg-surface-hover transition-colors text-center">
                            Compare Tools
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};


export const RatingBreakdown = ({ breakdown }: { breakdown?: { ease_of_use?: number; features?: number; pricing?: number; integrations?: number; performance?: number } }) => {
    const categories: { label: string; key: keyof typeof breakdown }[] = [
        { label: 'Ease of Use', key: 'ease_of_use' },
        { label: 'Features', key: 'features' },
        { label: 'Pricing', key: 'pricing' },
        { label: 'Integrations', key: 'integrations' },
        { label: 'Performance', key: 'performance' },
    ];

    const hasData = breakdown && Object.values(breakdown).some(v => v != null && v > 0);
    if (!hasData) return null;

    const overall = Object.values(breakdown!).filter(Boolean).reduce((a, b) => a + b!, 0) / categories.length;

    return (
        <div className="my-10 bg-surface-card border border-border-subtle rounded-2xl p-6 md:p-8 shadow-elevation overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-news-accent" />
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-news-accent">Performance Breakdown</h3>
                <div className="text-right">
                    <span className="text-3xl font-bold text-white">{overall.toFixed(1)}</span>
                    <span className="text-news-muted text-sm">/10</span>
                </div>
            </div>
            <div className="space-y-4">
                {categories.map(({ label, key }) => {
                    const score = breakdown?.[key] ?? 0;
                    const pct = (score / 10) * 100;
                    return (
                        <div key={key} className="flex items-center gap-4 text-sm">
                            <span className="w-28 text-news-muted font-medium flex-shrink-0">{label}</span>
                            <div className="flex-1 h-2 bg-surface-base rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-news-accent to-news-accentHover transition-all duration-700"
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                            <span className="w-8 text-right font-bold text-white flex-shrink-0">{score.toFixed(1)}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


export const TopAlternativesModule = ({ tool, alternatives }: { tool: Tool; alternatives: Tool[] }) => {
    if (!alternatives || alternatives.length === 0) return null;

    return (
        <div className="my-16">
            <h3 className="text-xl md:text-2xl font-serif font-bold text-white mb-8">Top {tool.name} Alternatives</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {alternatives.slice(0, 3).map(alt => (
                    <a key={alt.id} href={`/tools/${alt.slug}`} className="group bg-surface-card border border-border-subtle rounded-2xl p-5 hover:border-news-accent/50 transition-all shadow-elevation flex flex-col h-full">
                        <div className="flex items-start justify-between mb-4">
                            {alt.logo ? (
                                <img src={alt.logo} alt={alt.name} className="w-12 h-12 rounded-xl bg-white p-2 border border-border-divider object-contain" />
                            ) : (
                                <div className="w-12 h-12 rounded-xl bg-surface-base flex items-center justify-center text-xl font-bold text-news-muted border border-border-divider">
                                    {alt.name[0]}
                                </div>
                            )}
                            <div className="flex flex-col items-end">
                                <div className="flex items-center gap-1 text-news-accent font-bold text-sm">
                                    <Star size={12} className="fill-news-accent" />
                                    {alt.rating_score}
                                </div>
                                <span className="text-[10px] text-news-muted font-bold uppercase tracking-wider mt-1">{alt.pricing_model}</span>
                            </div>
                        </div>
                        <h4 className="text-white font-bold mb-2 group-hover:text-news-accent transition-colors">{alt.name}</h4>
                        <p className="text-news-muted text-xs line-clamp-2 leading-relaxed mb-4 flex-grow">
                            {alt.short_description}
                        </p>
                        <div className="text-news-accent text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                            View {alt.name} Review <ArrowRight size={10} />
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
};

export const CompareWithModule = ({ tool, comparisons }: { tool: Tool; comparisons: Comparison[] }) => {
    if (!comparisons || comparisons.length === 0) return null;

    return (
        <div className="my-16 border-t border-border-divider pt-12">
            <h3 className="text-xl md:text-2xl font-serif font-bold text-white mb-8">Compare {tool.name}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {comparisons.slice(0, 4).map(cmp => (
                    <a key={cmp.id} href={`/compare/${cmp.slug}`} className="p-4 bg-surface-card border border-border-subtle rounded-xl flex items-center justify-between hover:border-white/20 transition-all group">
                        <span className="text-white font-bold text-sm group-hover:text-news-accent transition-colors">{cmp.title.split(':')[0]}</span>
                        <ArrowRight size={16} className="text-news-muted group-hover:text-news-accent transition-all translate-x-0 group-hover:translate-x-1" />
                    </a>
                ))}
            </div>
        </div>
    );
};

export const ProductScreenshotModule = ({ tool }: { tool: Tool }) => {
    const [selectedImg, setSelectedImg] = useState<string | null>(null);
    if (!tool.screenshots || tool.screenshots.length === 0) return null;

    return (
        <div className="my-16 border-t border-border-divider pt-12">
            <h3 className="text-xl md:text-2xl font-serif font-bold text-white mb-8">Product Interface</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tool.screenshots.map((s, i) => (
                    <div key={i} className="group relative rounded-xl overflow-hidden border border-border-subtle bg-surface-base aspect-video cursor-zoom-in" onClick={() => setSelectedImg(s.url)}>
                        <img src={s.url} alt={s.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                            <p className="text-white text-xs font-bold">{s.caption}</p>
                        </div>
                        <div className="absolute top-3 right-3 p-2 bg-black/40 rounded-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                            <Maximize2 size={16} className="text-white" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Lightbox */}
            {selectedImg && (
                <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-300" onClick={() => setSelectedImg(null)}>
                    <div className="relative max-w-6xl w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                        <img src={selectedImg} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" alt="Product Screenshot" />
                        <button 
                            className="absolute top-0 right-0 m-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                            onClick={() => setSelectedImg(null)}
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export const FeaturedInRankingsModule = ({ rankings }: { rankings: Article[] }) => {
    if (!rankings || rankings.length === 0) return null;

    return (
        <div className="my-12 py-8 bg-news-accent/5 border-y border-news-accent/10 rounded-xl px-6">
            <div className="flex items-center gap-3 mb-6">
                <TrendingUp size={20} className="text-news-accent" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-white">Featured in Rankings</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {rankings.map(article => (
                    <a key={article.id} href={`/article/${article.slug || article.id}`} className="flex items-center justify-between p-4 bg-surface-card/60 border border-border-subtle rounded-xl hover:bg-surface-card transition-all group">
                        <h4 className="text-sm font-bold text-news-text group-hover:text-white transition-colors">{article.title}</h4>
                        <ArrowRight size={16} className="text-news-muted group-hover:text-news-accent transition-all translate-x-1" />
                    </a>
                ))}
            </div>
        </div>
    );
};

export const StickyComparisonWidget = ({ tool, comparisons }: { tool: Tool; comparisons: Comparison[] }) => {
    if (!comparisons || comparisons.length === 0) return null;

    return (
        <div className="bg-surface-card border border-border-subtle rounded-xl p-5 shadow-elevation space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-news-accent border-b border-border-divider pb-2">
                Quick Matchups
            </h4>
            <div className="space-y-3">
                {comparisons.slice(0, 3).map(cmp => (
                    <a key={cmp.id} href={`/compare/${cmp.slug}`} className="block group">
                        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-base transition-colors border border-transparent hover:border-border-subtle">
                            <div className="w-8 h-8 rounded bg-surface-base flex items-center justify-center text-[10px] font-bold text-news-muted border border-border-divider">
                                VS
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-white group-hover:text-news-accent transition-colors truncate">
                                    {cmp.title.split(':')[0]}
                                </p>
                                <p className="text-[10px] text-news-muted">Head-to-head</p>
                            </div>
                        </div>
                    </a>
                ))}
            </div>
            <a href="/comparisons" className="block text-center py-2 text-[10px] font-bold text-news-muted hover:text-white transition-colors border-t border-border-divider mt-2">
                View All Comparisons →
            </a>
        </div>
    );
};


export const ArticleSidebar = ({ article, allArticles, type, tool, comparisons }: { article: Article, allArticles: Article[], type: string, tool?: Tool, comparisons?: Comparison[] }) => {
    const isRanking = type === 'best-of';
    const isReview = type === 'review';
    const isComparison = type === 'comparison';

    // Build sidebar modules based on type
    const related = allArticles.filter(a => a.id !== article.id).slice(0, 3);

    return (
        <div className="sticky top-24 space-y-6">
            {/* Quick Facts or Links */}
            <div className="bg-surface-card border border-border-subtle rounded-xl p-5 shadow-elevation">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-news-muted mb-4 border-b border-border-divider pb-2">
                    {isRanking ? 'Quick Links' : isReview ? 'Tool Specs' : 'Overview'}
                </h4>
                <div className="space-y-3">
                    {isRanking ? article.comparison_tools?.map((t, i) => (
                        <div key={i} className="text-sm font-bold text-white hover:text-news-accent transition-colors flex items-center justify-between cursor-pointer">
                            <span>{i + 1}. {t}</span>
                            <TrendingUp size={12} className="text-news-muted" />
                        </div>
                    )) : isReview && tool ? (
                        <div className="text-xs text-news-text leading-relaxed">
                            <ul className="space-y-2">
                                <li className="flex justify-between"><span className="text-news-muted">Price</span> <span className="text-white font-bold">{tool.starting_price}</span></li>
                                <li className="flex justify-between"><span className="text-news-muted">Model</span> <span className="text-white font-bold">{tool.pricing_model}</span></li>
                                <li className="flex justify-between"><span className="text-news-muted">AI Ready</span> <span className="text-news-accent font-bold">Yes</span></li>
                                <li className="flex justify-between"><span className="text-news-muted">Verified</span> <span className="text-news-accent font-bold">Yes</span></li>
                            </ul>
                        </div>
                    ) : (
                        <div className="text-xs text-news-text leading-relaxed">
                            <ul className="space-y-2">
                                <li className="flex justify-between"><span className="text-news-muted">Update Cycle</span> <span className="text-white font-bold">Bi-weekly</span></li>
                                <li className="flex justify-between"><span className="text-news-muted">Testing Hours</span> <span className="text-white font-bold">40+</span></li>
                                <li className="flex justify-between"><span className="text-news-muted">Verified</span> <span className="text-news-accent font-bold">Yes</span></li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* Sticky Widget for Reviews */}
            {isReview && comparisons && comparisons.length > 0 && (
                <StickyComparisonWidget tool={tool!} comparisons={comparisons} />
            )}

            {/* Related Content */}
            <div className="bg-surface-card border border-border-subtle rounded-xl p-5 shadow-elevation">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-news-muted mb-4 border-b border-border-divider pb-2">
                    {isComparison ? 'Related Matchups' : isRanking ? 'Top Alternatives' : 'Related Intelligence'}
                </h4>
                <div className="space-y-4">
                    {related.map(r => (
                        <div key={r.id} className="cursor-pointer group">
                            <h5 className="text-xs font-bold text-news-text group-hover:text-white transition-colors leading-snug line-clamp-2">{r.title}</h5>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export const ToolSectionBlock: React.FC<{ slug: string; rank: number }> = ({ slug, rank }) => {
    const [tool, setTool] = useState<Tool | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        toolsService.fetchToolBySlug(slug)
            .then(data => setTool(data.tool))
            .catch(() => setTool(null))
            .finally(() => setLoading(false));
    }, [slug]);

    if (loading) return (
        <div className="my-12 w-full h-64 bg-surface-alt animate-pulse rounded-2xl border border-border-subtle" />
    );
    if (!tool) return null;

    return (
        <div id={slug} className="scroll-mt-32 my-12 bg-surface-card border border-border-subtle rounded-3xl overflow-hidden shadow-elevation group">
            <div className="p-6 md:p-8 border-b border-border-divider flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative">
                <div className="flex items-center gap-4 md:gap-6">
                    <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl border border-border-divider p-2 flex items-center justify-center shadow-inner relative">
                        {tool.logo ? <img src={tool.logo} alt={tool.name} className="w-full h-full object-contain" /> : <span className="text-2xl font-bold text-news-muted">{tool.name[0]}</span>}
                        <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-news-accent text-white flex items-center justify-center font-bold text-sm shadow-lg border-2 border-surface-card">
                            #{rank}
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-2 group-hover:text-news-accent transition-colors">
                            <a href={`/tools/${tool.slug}`}>{tool.name}</a>
                        </h2>
                        <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-news-text uppercase tracking-widest">
                            <span className="flex items-center gap-1 text-news-accent"><Star size={14} className="fill-news-accent" /> {tool.rating_score || '-'}/10</span>
                            <span className="flex items-center gap-1"><Info size={14} className="text-news-muted" /> {tool.pricing_tiers?.[0]?.price || 'Varies'}</span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    {tool.website_url && (
                        <a href={tool.website_url} target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-xl font-bold text-sm bg-news-accent text-white hover:bg-news-accent-hover transition-colors text-center shadow-[0_0_15px_rgba(45,212,191,0.2)]">
                            Visit Website
                        </a>
                    )}
                    <a href={`/tools/${tool.slug}`} className="px-6 py-3 rounded-xl font-bold text-sm bg-surface-base text-white border border-border-subtle hover:bg-surface-hover transition-colors text-center">
                        Read Full Review
                    </a>
                </div>
            </div>

            <div className="p-6 md:p-8">
                {tool.short_description && (
                    <p className="text-news-text text-lg leading-relaxed mb-8">{tool.short_description}</p>
                )}
                <ProsConsSection pros={tool.pros} cons={tool.cons} />
            </div>
        </div>
    );
};

// ==========================================
// --- COMPARISON LAYOUT MODULES ---
// ==========================================

export const SideBySideHeader = ({ slugA, slugB }: { slugA: string; slugB: string }) => {
    const [toolA, setToolA] = useState<Tool | null>(null);
    const [toolB, setToolB] = useState<Tool | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            toolsService.fetchToolBySlug(slugA),
            toolsService.fetchToolBySlug(slugB)
        ]).then(([a, b]) => {
            setToolA(a.tool);
            setToolB(b.tool);
        }).finally(() => setLoading(false));
    }, [slugA, slugB]);

    if (loading) return (
        <div className="my-8 w-full h-48 bg-surface-alt animate-pulse rounded-2xl border border-border-subtle" />
    );
    if (!toolA || !toolB) return null;

    const ToolCard = ({ tool }: { tool: Tool }) => (
        <div className="flex-1 flex flex-col items-center text-center p-6 md:p-8 bg-surface-card rounded-2xl border border-border-subtle shadow-elevation">
            {tool.logo ? (
                <img src={tool.logo} alt={tool.name} className="w-16 h-16 rounded-xl bg-white p-1.5 border border-border-divider object-contain mb-4" />
            ) : (
                <div className="w-16 h-16 rounded-xl bg-surface-base flex items-center justify-center text-2xl font-black text-news-muted mb-4">{tool.name[0]}</div>
            )}
            <h3 className="text-xl font-bold text-white mb-1">{tool.name}</h3>
            <p className="text-xs text-news-muted mb-3 leading-relaxed max-w-[200px]">{tool.short_description}</p>
            <div className="flex items-center justify-center gap-4 text-xs font-bold mb-4">
                <span className="flex items-center gap-1 text-news-accent"><Star size={12} className="fill-news-accent" /> {tool.rating_score}/10</span>
                <span className="text-news-muted">{tool.starting_price || 'Varies'}</span>
            </div>
            {tool.website_url && (
                <a href={tool.website_url} target="_blank" rel="noopener noreferrer"
                    className="px-5 py-2 rounded-xl font-bold text-xs bg-news-accent text-white hover:brightness-110 transition-all w-full text-center">
                    Visit {tool.name}
                </a>
            )}
        </div>
    );

    return (
        <div className="my-6 flex flex-col md:flex-row gap-4 items-stretch">
            <ToolCard tool={toolA} />
            <div className="flex items-center justify-center flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-surface-elevated border-2 border-border-subtle flex items-center justify-center text-sm font-black text-white shadow-elevation">
                    VS
                </div>
            </div>
            <ToolCard tool={toolB} />
        </div>
    );
};

export const ComparisonDetailTable = ({
    rows,
    toolAName,
    toolBName
}: {
    rows?: { label: string; tool_a_value: string; tool_b_value: string }[];
    toolAName: string;
    toolBName: string;
}) => {
    if (!toolAName || !toolBName) return null;

    const defaultRows = [
        { label: 'Pricing', tool_a_value: 'Freemium / $20/mo', tool_b_value: 'Freemium / $20/mo' },
        { label: 'Ease of Use', tool_a_value: '★★★★★', tool_b_value: '★★★★☆' },
        { label: 'Best For', tool_a_value: 'Power users, developers', tool_b_value: 'Writers, researchers' },
        { label: 'Performance', tool_a_value: 'Excellent', tool_b_value: 'Excellent' },
        { label: 'Integrations', tool_a_value: '900+ via GPT Store', tool_b_value: 'Limited third-party' },
        { label: 'Context Limit', tool_a_value: '128k tokens', tool_b_value: '200k tokens' },
    ];

    const tableRows = (rows && rows.length > 0) ? rows : defaultRows;

    return (
        <div className="my-10 overflow-x-auto -mx-4 md:mx-0 shadow-elevation rounded-xl">
            <div className="min-w-[480px] border border-border-subtle rounded-xl overflow-hidden bg-surface-card">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-border-divider bg-surface-base/60">
                            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-news-muted w-1/3">Feature</th>
                            <th className="p-4 text-sm font-bold text-white text-center">{toolAName}</th>
                            <th className="p-4 text-sm font-bold text-white text-center">{toolBName}</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm text-news-text divide-y divide-border-divider">
                        {tableRows.map((row, i) => (
                            <tr key={i} className="hover:bg-surface-hover/40 transition-colors">
                                <td className="p-4 font-bold text-news-muted text-xs uppercase tracking-wide">{row.label}</td>
                                <td className="p-4 text-center text-white">{row.tool_a_value}</td>
                                <td className="p-4 text-center text-white">{row.tool_b_value}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const ComparisonDecisionSection = ({
    toolAName,
    toolBName,
    chooseA,
    chooseB,
}: {
    toolAName: string;
    toolBName: string;
    chooseA?: string[];
    chooseB?: string[];
}) => {
    if (!chooseA?.length && !chooseB?.length) return null;

    return (
        <div className="my-10 grid grid-cols-1 md:grid-cols-2 gap-4">
            {chooseA && chooseA.length > 0 && (
                <div className="bg-surface-card border border-border-subtle rounded-2xl p-6 shadow-elevation relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-news-accent" />
                    <h3 className="font-bold text-sm uppercase tracking-widest text-news-accent mb-4 flex items-center gap-2">
                        <Check size={15} /> Choose {toolAName} if…
                    </h3>
                    <ul className="space-y-3">
                        {chooseA.map((item, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-news-text">
                                <span className="w-1.5 h-1.5 rounded-full bg-news-accent mt-1.5 flex-shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {chooseB && chooseB.length > 0 && (
                <div className="bg-surface-card border border-border-subtle rounded-2xl p-6 shadow-elevation relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                    <h3 className="font-bold text-sm uppercase tracking-widest text-blue-400 mb-4 flex items-center gap-2">
                        <Check size={15} /> Choose {toolBName} if…
                    </h3>
                    <ul className="space-y-3">
                        {chooseB.map((item, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-news-text">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

// ==========================================
// --- INTELLIGENCE LAYOUT MODULES ---
// ==========================================

export const RelatedToolsModule: React.FC<{ toolSlugs: string[] }> = ({ toolSlugs }) => {
    const [tools, setTools] = useState<Tool[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!toolSlugs?.length) {
            setLoading(false);
            return;
        }
        Promise.all(toolSlugs.map(slug => toolsService.fetchToolBySlug(slug)))
            .then(results => setTools(results.map(r => r.tool).filter(Boolean)))
            .finally(() => setLoading(false));
    }, [toolSlugs]);

    if (loading || tools.length === 0) return null;

    return (
        <div className="my-16">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-news-accent mb-8 pb-2 border-b border-border-divider/50">Featured Intelligence Tools</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tools.map(tool => (
                    <div key={tool.id} className="bg-surface-card border border-border-subtle rounded-2xl p-5 hover:border-news-accent/30 transition-all group flex items-center gap-4">
                        {tool.logo ? (
                            <img src={tool.logo} alt="" className="w-12 h-12 rounded-lg bg-white p-1.5 border border-border-divider object-contain" />
                        ) : (
                            <div className="w-12 h-12 rounded-lg bg-surface-base flex items-center justify-center text-xl font-black text-news-muted">{tool.name[0]}</div>
                        )}
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-white group-hover:text-news-accent transition-colors truncate">{tool.name}</h4>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-[10px] text-news-accent font-bold"><Star size={10} className="inline mr-1 fill-news-accent" /> {tool.rating_score}/10</span>
                                <a href={`/tools/${tool.slug}`} className="text-[10px] text-news-muted hover:text-white transition-colors underline decoration-border-divider underline-offset-4">Full Review</a>
                            </div>
                        </div>
                        <a href={tool.website_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-surface-base border border-border-subtle text-news-muted hover:text-news-accent hover:border-news-accent/50 transition-all">
                            <ArrowRight size={16} />
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const RelatedRankingsModule: React.FC<{ rankings: string[]; allArticles: Article[] }> = ({ rankings, allArticles }) => {
    if (!rankings || rankings.length === 0) return null;

    const rankingArticles = allArticles.filter(a => rankings.includes(a.slug || a.id));

    if (rankingArticles.length === 0) return null;

    return (
        <div className="my-16 bg-surface-alt/30 border border-border-subtle rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
                <TrendingUp size={18} className="text-news-accent" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-white">Related Industry Rankings</h3>
            </div>
            <div className="space-y-4">
                {rankingArticles.map(article => (
                    <div key={article.id} className="flex items-center justify-between p-4 bg-surface-card border border-border-subtle rounded-xl hover:border-news-accent/40 transition-all group cursor-pointer">
                        <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-bold text-news-accent uppercase tracking-widest">Buyer's Guide</span>
                            <h4 className="text-base font-bold text-white group-hover:text-news-accent transition-colors">{article.title}</h4>
                        </div>
                        <ArrowRight size={20} className="text-news-muted group-hover:text-news-accent transition-all translate-x-0 group-hover:translate-x-1" />
                    </div>
                ))}
            </div>
        </div>
    );
};

// ==========================================
// --- GUIDE LAYOUT MODULES ---
// ==========================================

export const ToolsUsedSummary: React.FC<{ toolSlugs: string[] }> = ({ toolSlugs }) => {
    const [tools, setTools] = useState<Tool[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!toolSlugs?.length) {
            setLoading(false);
            return;
        }
        Promise.all(toolSlugs.map(slug => toolsService.fetchToolBySlug(slug)))
            .then(results => setTools(results.map(r => r.tool).filter(Boolean)))
            .finally(() => setLoading(false));
    }, [toolSlugs]);

    if (loading || tools.length === 0) return null;

    return (
        <div className="my-10 bg-surface-alt/20 border border-border-subtle rounded-2xl p-6">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-news-muted mb-4">Tools featured in this guide</h3>
            <div className="flex flex-wrap gap-3">
                {tools.map(tool => (
                    <a key={tool.id} href={`/tools/${tool.slug}`} className="flex items-center gap-2 px-3 py-2 bg-surface-card border border-border-subtle rounded-xl hover:border-news-accent/50 transition-all group">
                        {tool.logo ? (
                            <img src={tool.logo} alt="" className="w-5 h-5 rounded object-contain bg-white p-0.5" />
                        ) : (
                            <div className="w-5 h-5 rounded bg-surface-base flex items-center justify-center text-[10px] font-black">{tool.name[0]}</div>
                        )}
                        <span className="text-xs font-bold text-white group-hover:text-news-accent transition-colors">{tool.name}</span>
                    </a>
                ))}
            </div>
        </div>
    );
};

export const StepByStepModule: React.FC<{ steps: { title: string; content: string; tool_slug?: string }[] }> = ({ steps }) => {
    if (!steps || steps.length === 0) return null;

    return (
        <div className="space-y-12 my-12">
            {steps.map((step, index) => (
                <div key={index} className="relative pl-12 md:pl-16">
                    {/* Step Number Badge */}
                    <div className="absolute left-0 top-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-surface-card border-2 border-news-accent flex items-center justify-center text-news-accent font-black font-serif text-sm md:text-base shadow-[0_0_15px_rgba(43,212,195,0.2)]">
                        {index + 1}
                    </div>

                    {/* Step Content */}
                    <div className="flex flex-col gap-4">
                        <h3 className="text-xl md:text-2xl font-bold text-white leading-tight">
                            {step.title}
                        </h3>
                        <div className="prose prose-invert max-w-none text-news-text text-lg leading-relaxed font-sans">
                            {step.content.split('\n\n').map((p, i) => (
                                <p key={i} className="mb-4">{p}</p>
                            ))}
                        </div>

                        {/* Inline Tool Reference */}
                        {step.tool_slug && (
                            <div className="mt-4">
                                <span className="text-[9px] font-bold text-news-muted uppercase tracking-widest mb-2 block">Tool Recommendation</span>
                                <InlineToolCard slug={step.tool_slug} />
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export const WorkflowBreakdownModule: React.FC<{ stages: { stage_title: string; description: string; tool_slugs: string[] }[] }> = ({ stages }) => {
    if (!stages || stages.length === 0) return null;

    return (
        <div className="space-y-12 my-12 relative">
            {/* Vertical connector line */}
            <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-news-accent via-border-subtle to-news-accent opacity-20 hidden md:block" />

            {stages.map((stage, index) => (
                <div key={index} className="relative pl-0 md:pl-20">
                    {/* Stage Header */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="hidden md:flex absolute left-0 top-0 w-12 h-12 rounded-2xl bg-surface-card border border-border-subtle items-center justify-center text-news-accent font-black z-10 shadow-elevation">
                            {index + 1}
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-news-accent uppercase tracking-[0.2em]">Stage {index + 1}</span>
                            <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{stage.stage_title}</h3>
                        </div>
                    </div>

                    {/* Stage Description */}
                    <p className="text-news-text text-lg leading-relaxed mb-8 max-w-[700px]">
                        {stage.description}
                    </p>

                    {/* Recommended Tools Grid */}
                    {stage.tool_slugs && stage.tool_slugs.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                            {stage.tool_slugs.map(slug => (
                                <InlineToolCard key={slug} slug={slug} />
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export const ComparisonSummaryModule: React.FC<{ article: Article }> = ({ article }) => {
    if (!article.comparison_rows || article.comparison_rows.length === 0) return null;

    return (
        <div className="my-16 bg-surface-base border border-border-subtle rounded-3xl overflow-hidden shadow-elevation">
            <div className="p-8 border-b border-border-subtle bg-surface-alt/10">
                <h3 className="text-xl font-bold text-white mb-2">Comparison Summary</h3>
                <p className="text-news-muted text-sm">Quick decision matrix for the recommended tools in this workflow.</p>
            </div>
            <div className="p-0 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-surface-card/50">
                            <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-news-muted border-b border-border-subtle">Feature</th>
                            <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-news-accent border-b border-border-subtle">The Winner</th>
                            <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-news-muted border-b border-border-subtle">Alternative</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle/50">
                        {article.comparison_rows.map((row, i) => (
                            <tr key={i} className="hover:bg-white/5 transition-colors">
                                <td className="py-5 px-6 font-bold text-white text-sm">{row.label}</td>
                                <td className="py-5 px-6 text-news-accent font-medium text-sm">{row.tool_a_value}</td>
                                <td className="py-5 px-6 text-news-text text-sm">{row.tool_b_value}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {article.verdict && (
                <div className="p-8 bg-news-accent/5 border-t border-border-subtle">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-news-accent/20 flex items-center justify-center flex-shrink-0">
                            <ShieldCheck className="text-news-accent" size={24} />
                        </div>
                        <div>
                            <h4 className="text-news-accent font-black uppercase tracking-widest text-[10px] mb-2">Executive Verdict</h4>
                            <p className="text-white text-lg font-serif italic leading-relaxed">"{article.verdict}"</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export const RecommendedStackModule: React.FC<{ article: Article; onStackClick?: (slug: string) => void }> = ({ article, onStackClick }) => {
    const [stacks, setStacks] = useState<Stack[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/stacks')
            .then(res => res.ok ? res.json() : [])
            .then(data => setStacks(data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    if (loading || stacks.length === 0) return null;

    // Try to match stack by looking at article.category or tags
    const cats = Array.isArray(article.category) ? article.category : [article.category];
    const searchString = `${cats.join(' ')} ${article.title}`.toLowerCase();
    
    const recommendedStack = stacks.find(s => {
        const swf = s.workflow_category?.toLowerCase() || '';
        if (searchString.includes('develop') && swf.includes('develop')) return true;
        if (searchString.includes('market') && swf.includes('market')) return true;
        if (searchString.includes('startup') && swf.includes('startup')) return true;
        if (searchString.includes('creator') && (swf.includes('creation') || swf.includes('creator'))) return true;
        if (searchString.includes('automat') && swf.includes('automat')) return true;
        return false;
    });

    if (!recommendedStack) return null;

    return (
        <div className="my-12 p-6 md:p-8 rounded-2xl border border-news-accent/30 bg-surface-card flex flex-col items-start gap-4 shadow-elevation relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-news-accent" />
            <div className="flex items-center gap-3 w-full">
                <div className="w-12 h-12 rounded-xl bg-news-accent/10 flex items-center justify-center flex-shrink-0">
                    <Layers className="text-news-accent" size={24} />
                </div>
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-news-muted mb-1">Featured Tool Stack</p>
                    <h3 className="text-xl font-bold text-white leading-snug">{recommendedStack.name}</h3>
                </div>
            </div>
            <p className="text-news-text text-base leading-relaxed max-w-2xl">{recommendedStack.short_description}</p>
            <div className="mt-2 w-full pt-6 border-t border-border-divider/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-news-muted font-bold tracking-widest uppercase truncate">
                    Includes {recommendedStack.tools?.length || 0} essential tools
                </div>
                <button
                    onClick={() => {
                        if (onStackClick) onStackClick(recommendedStack.slug);
                        else window.location.href = `/stacks/${recommendedStack.slug}`;
                    }}
                    className="w-full sm:w-auto flex-shrink-0 px-6 py-3 rounded-xl bg-news-accent text-black font-bold text-xs uppercase tracking-widest hover:bg-news-accentHover transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(43,212,195,0.2)]"
                >
                    View Complete Stack <ArrowRight size={14} />
                </button>
            </div>
        </div>
    );
};
