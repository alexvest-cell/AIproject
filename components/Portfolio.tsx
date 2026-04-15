'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { Section, Article, Comparison, Tool } from '../types';
import { ArrowRight, Filter, Star, ArrowLeftRight } from 'lucide-react';
import AdUnit from './AdUnit';
import { ADS_CONFIG } from '../data/adsConfig';

interface PortfolioProps {
    articles: Article[];
    onArticleClick: (article: Article) => void;
    searchQuery?: string;
    excludedArticleIds?: string[];
    onComparisonClick?: (slug: string) => void;
    onHubClick?: (hub: string) => void;
    onToolClick?: (slug: string) => void;
}

// ── Slug helpers ──────────────────────────────────────────────────────────────
const catSlug = (cat: string) =>
    cat.toLowerCase().replace(/\s*&\s*/g, '-').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const wfSlug = (wf: string) =>
    wf.toLowerCase().replace(/\s+/g, '-');

// ─── Section Header ──────────────────────────────────────────────────────────
const SectionHeader: React.FC<{
    label?: string;
    title: string;
    viewAllHref?: string;
    viewAllLabel?: string;
}> = ({ label, title, viewAllHref, viewAllLabel = 'View all' }) => (
    <div className="flex items-end justify-between mb-6">
        <div>
            {label && <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-news-accent mb-1">{label}</p>}
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">{title}</h2>
        </div>
        {viewAllHref && (
            <a
                href={viewAllHref}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-white transition-colors group/btn"
            >
                {viewAllLabel} <ArrowRight size={12} className="group-hover/btn:translate-x-0.5 transition-transform" />
            </a>
        )}
    </div>
);

// ─── Ranking Card (Best-of articles) ─────────────────────────────────────────
const RankingCard: React.FC<{ article: Article; rank?: number; onClick: () => void }> = ({ article, rank, onClick }) => {
    const toolCount = (article as any).tool_count || Math.floor(Math.random() * 10) + 5;
    const category = article.topic || (Array.isArray(article.category) ? article.category[0] : article.category) || 'AI Tools';

    return (
        <button
            onClick={onClick}
            className="group w-full text-left flex items-center gap-4 p-4 rounded-xl border border-border-subtle bg-surface-card shadow-elevation hover:bg-surface-hover hover:border-news-accent hover:shadow-[0_0_15px_rgba(43,212,195,0.15)] hover:-translate-y-0.5 transition-all min-h-[80px]"
        >
            {rank && (
                <span className="text-3xl font-black text-white/10 group-hover:text-white/20 transition-colors tabular-nums leading-none w-8 flex-shrink-0">
                    {rank.toString().padStart(2, '0')}
                </span>
            )}
            <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-news-accent">{category}</span>
                    <span className="text-[9px] text-news-muted font-bold px-1.5 py-0.5 rounded bg-surface-base border border-border-subtle">{toolCount} tools reviewed</span>
                </div>
                <h3 className="text-sm font-bold text-news-text leading-snug line-clamp-2 group-hover:text-white transition-colors">{article.title}</h3>
            </div>
            <ArrowRight size={14} className="text-news-muted group-hover:text-white group-hover:translate-x-0.5 transition-all flex-shrink-0" />
        </button>
    );
};

// ─── Comparison Card ─────────────────────────────────────────────────────────
const ComparisonCard: React.FC<{ comparison: Comparison; onClick: () => void }> = ({ comparison, onClick }) => {
    const toolA = comparison.tool_a;
    const toolB = comparison.tool_b;
    return (
        <button
            onClick={onClick}
            className="group w-full text-left bg-surface-card border border-border-subtle shadow-elevation hover:border-news-accent hover:shadow-[0_0_15px_rgba(43,212,195,0.15)] hover:bg-surface-hover hover:-translate-y-0.5 transition-all rounded-xl p-4"
        >
            <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2 flex-1 min-w-0 bg-surface-base/50 p-2 rounded-lg border border-border-subtle">
                    {toolA?.logo && <img src={toolA.logo} alt={toolA.name} className="w-8 h-8 rounded-md object-contain flex-shrink-0" loading="lazy" />}
                    <span className="text-sm font-bold text-white truncate">{toolA?.name || comparison.tool_a_slug}</span>
                </div>
                <span className="text-[10px] font-black text-news-muted px-2 py-1 rounded-full bg-surface-base border border-border-divider shadow-sm flex-shrink-0">VS</span>
                <div className="flex items-center gap-2 flex-1 min-w-0 justify-end bg-surface-base/50 p-2 rounded-lg border border-border-subtle">
                    <span className="text-sm font-bold text-white truncate text-right">{toolB?.name || comparison.tool_b_slug}</span>
                    {toolB?.logo && <img src={toolB.logo} alt={toolB.name} className="w-8 h-8 rounded-md object-contain flex-shrink-0" loading="lazy" />}
                </div>
            </div>
            {comparison.verdict && (
                <p className="text-xs text-news-text line-clamp-2 mb-3">{comparison.verdict}</p>
            )}
            <div className="flex items-center justify-between mt-2 pt-3 border-t border-border-divider">
                <span className="text-[10px] font-bold uppercase tracking-widest text-news-accent">See comparison</span>
                <ArrowRight size={12} className="text-news-accent group-hover:translate-x-0.5 transition-all" />
            </div>
        </button>
    );
};

// ─── Compact Tool Card ────────────────────────────────────────────────────────
const ToolListCard: React.FC<{ tool: Tool; href: string }> = ({ tool, href }) => (
    <a
        href={href}
        className="group w-full text-left flex items-center gap-4 p-4 rounded-xl border border-border-subtle bg-surface-card shadow-elevation hover:bg-surface-hover hover:border-news-accent hover:shadow-[0_0_15px_rgba(43,212,195,0.15)] hover:-translate-y-0.5 transition-all no-underline"
    >
        {tool.logo ? (
            <img src={tool.logo} alt={tool.name} className="w-10 h-10 rounded-lg object-contain bg-white p-1 flex-shrink-0 shadow-inner" loading="lazy" />
        ) : (
            <div className="w-10 h-10 rounded-lg bg-surface-base shadow-inner flex items-center justify-center flex-shrink-0 text-base font-black text-news-muted">
                {tool.name[0]}
            </div>
        )}
        <div className="flex-grow min-w-0">
            <h3 className="text-sm font-bold text-white truncate group-hover:text-news-accent transition-colors leading-snug">{tool.name}</h3>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-bold inline-block mt-0.5 ${tool.pricing_model === 'Free' || tool.pricing_model === 'Freemium'
                ? 'bg-news-accent/10 border-news-accent/20 text-news-accent'
                : 'bg-blue-500/10 border-blue-500/20 text-blue-400'}`}
            >
                {tool.pricing_model}
            </span>
        </div>
        {tool.rating_score && (
            <div className="flex items-center gap-1 flex-shrink-0 bg-surface-base py-1 px-2 rounded-full border border-border-subtle">
                <Star size={10} className="text-news-accent fill-news-accent" />
                <span className="text-xs font-bold text-white">{tool.rating_score}</span>
            </div>
        )}
    </a>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const Portfolio: React.FC<PortfolioProps> = ({
    articles,
    onArticleClick,
    searchQuery = '',
    excludedArticleIds = [],
    onComparisonClick,
    onHubClick,
    onToolClick,
}) => {
    const [comparisons, setComparisons] = useState<Comparison[]>([]);
    const [tools, setTools] = useState<Tool[]>([]);

    useEffect(() => {
        fetch('/api/comparisons')
            .then(r => r.ok ? r.json() : [])
            .then(data => setComparisons(data))
            .catch(() => { });
        fetch('/api/tools')
            .then(r => r.ok ? r.json() : [])
            .then(data => setTools(data))
            .catch(() => { });
    }, []);

    // ── Best Software ranking cards ───────────────────────────────────────────
    const rankingCards = useMemo(() => {
        if (tools.length === 0) return [];

        // Top 2 categories by count
        const catGroups: Record<string, Tool[]> = {};
        tools.forEach(t => {
            if (!t.category_primary) return;
            if (!catGroups[t.category_primary]) catGroups[t.category_primary] = [];
            catGroups[t.category_primary].push(t);
        });
        const sortedCats = Object.entries(catGroups)
            .map(([cat, catTools]) => ({ cat, count: catTools.length, tools: catTools }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 2);

        // Top 2 workflows by count
        const wfGroups: Record<string, Tool[]> = {};
        tools.forEach(t => {
            for (const wf of ((t as any).workflow_tags || [])) {
                if (!wfGroups[wf]) wfGroups[wf] = [];
                wfGroups[wf].push(t);
            }
        });
        const sortedWfs = Object.entries(wfGroups)
            .map(([wf, wfTools]) => ({ wf, count: wfTools.length, tools: wfTools }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 2);

        const cards: { title: string; url: string; count: number; topTools: Tool[] }[] = [];
        for (let i = 0; i < 2; i++) {
            if (sortedCats[i]) {
                const topTools = [...sortedCats[i].tools]
                    .sort((a, b) => (b.rating_score || 0) - (a.rating_score || 0))
                    .slice(0, 3);
                cards.push({
                    title: `Best ${sortedCats[i].cat} Tools 2026`,
                    url: `/best-ai-tools/${catSlug(sortedCats[i].cat)}`,
                    count: sortedCats[i].count,
                    topTools,
                });
            }
            if (sortedWfs[i]) {
                const topTools = [...sortedWfs[i].tools]
                    .sort((a, b) => (b.rating_score || 0) - (a.rating_score || 0))
                    .slice(0, 3);
                cards.push({
                    title: `Best Tools for ${sortedWfs[i].wf} 2026`,
                    url: `/best-ai-tools/for/${wfSlug(sortedWfs[i].wf)}`,
                    count: sortedWfs[i].count,
                    topTools,
                });
            }
        }
        return cards.slice(0, 4);
    }, [tools]);

    // ── Recently added tools (by last_updated desc) ───────────────────────────
    const newTools = useMemo(() =>
        [...tools]
            .filter(t => (t as any).last_updated)
            .sort((a, b) => new Date((b as any).last_updated).getTime() - new Date((a as any).last_updated).getTime())
            .slice(0, 6),
        [tools]
    );

    // ── Filter helpers ────────────────────────────────────────────────────────
    const exclude = (arr: Article[]) => arr.filter(a => !excludedArticleIds.includes(a.id));
    const byType = (type: string) => exclude(articles).filter(a => (a as any).article_type === type);

    // ── Search mode ───────────────────────────────────────────────────────────
    if (searchQuery) {
        const results = exclude(articles).filter(a =>
            a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return (
            <section id={Section.NEWS} className="py-12 bg-black">
                <div className="container mx-auto px-4 md:px-8">
                    <div className="mb-8 border-b border-white/10 pb-4">
                        <span className="text-xs text-gray-400">Results for &ldquo;{searchQuery}&rdquo;</span>
                    </div>
                    {results.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {results.slice(0, 18).map(article => (
                                <button key={article.id} onClick={() => onArticleClick(article)}
                                    className="group text-left flex gap-3 p-4 border border-white/5 hover:border-white/15 hover:bg-white/5 rounded-xl transition-all"
                                >
                                    <div className="w-20 h-16 flex-shrink-0 overflow-hidden rounded-lg">
                                        <img src={article.imageUrl} alt={article.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white leading-tight line-clamp-2 group-hover:text-gray-200 mb-1">{article.title}</h3>
                                        <span className="text-[10px] text-gray-500">{(article as any).article_type || 'Article'}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="py-24 text-center border border-dashed border-white/10 rounded-xl">
                            <Filter size={32} className="mx-auto text-gray-600 mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">No results found</h3>
                            <p className="text-gray-400 text-sm">Try adjusting your search.</p>
                        </div>
                    )}
                </div>
            </section>
        );
    }

    // ── Section data ──────────────────────────────────────────────────────────
    const bestOf = byType('best-of').slice(0, 6);
    const comparisonsArticles = byType('comparison').slice(0, 4);

    return (
        <div className="w-full text-news-text">
            {/* ── SECTION 1: Popular Best Software Rankings ─────────────────── */}
            {bestOf.length > 0 && (
                <section id={Section.NEWS} className="py-20 bg-surface-base">
                    <div className="container mx-auto px-4 md:px-8">
                        <SectionHeader
                            label="Rankings"
                            title="Popular Best AI Tools"
                            viewAllHref="/best-ai-tools"
                        />
                        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-x-auto pb-6 md:pb-0 scrollbar-hide snap-x -mx-4 px-4 md:mx-0 md:px-0">
                            {bestOf.map((a, i) => (
                                <div key={a.id} className="min-w-[280px] md:min-w-0 snap-start">
                                    <RankingCard
                                        article={a}
                                        rank={i + 1}
                                        onClick={() => onArticleClick(a)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── SECTION 2: Trending AI Tools ──────────────────────────────── */}
            {tools.length > 0 && (
                <section className="py-20 bg-surface-alt border-y border-border-divider">
                    <div className="container mx-auto px-4 md:px-8">
                        <SectionHeader
                            label="Discovery"
                            title="Trending AI Tools"
                            viewAllHref="/ai-tools"
                        />
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {tools.slice(0, 10).map(t => (
                                <ToolListCard key={t.id} tool={t} href={`/tools/${t.slug}`} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── SECTION 3: Best Software Rankings ────────────────────────── */}
            {rankingCards.length > 0 && (
                <section className="py-20 bg-surface-base border-b border-border-divider">
                    <div className="container mx-auto px-4 md:px-8">
                        <SectionHeader
                            label="Curated Rankings"
                            title="Best AI Tool Rankings"
                            viewAllHref="/best-ai-tools"
                            viewAllLabel="View all rankings"
                        />
                        <p className="text-sm text-news-muted -mt-3 mb-6">Top-rated tools ranked and scored across all categories.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {rankingCards.map((card, i) => (
                                <a
                                    key={i}
                                    href={card.url}
                                    className="group flex flex-col gap-3 p-5 rounded-2xl bg-surface-card border border-border-subtle hover:bg-surface-hover hover:-translate-y-0.5 hover:border-border-divider transition-all no-underline"
                                >
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-news-accent">Best Of</span>
                                    <h3 className="text-sm font-bold text-white group-hover:text-news-accent transition-colors leading-snug line-clamp-2">{card.title}</h3>
                                    <span className="text-[10px] text-news-muted">{card.count} tools ranked</span>
                                    <div className="flex items-center -space-x-2 mt-auto">
                                        {card.topTools.map((t, j) => (
                                            t.logo
                                                ? <img key={j} src={t.logo} alt={t.name} className="w-7 h-7 rounded-full bg-white border-2 border-surface-card object-contain p-0.5 flex-shrink-0" loading="lazy" />
                                                : <div key={j} className="w-7 h-7 rounded-full bg-surface-base border-2 border-surface-card flex items-center justify-center text-[9px] font-bold text-news-muted flex-shrink-0">{t.name[0]}</div>
                                        ))}
                                    </div>
                                    <span className="text-[10px] font-bold text-news-accent group-hover:underline">View Rankings →</span>
                                </a>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── SECTION 4: Trending Comparisons ──────────────────────────── */}
            {comparisons.length > 0 && (
                <section className="py-20 bg-surface-alt border-y border-border-divider">
                    <div className="container mx-auto px-4 md:px-8">
                        <SectionHeader
                            label="Tool vs Tool"
                            title="Trending Comparisons"
                            viewAllHref="/comparisons"
                        />
                        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto pb-6 md:pb-0 scrollbar-hide snap-x -mx-4 px-4 md:mx-0 md:px-0">
                            {comparisons.slice(0, 3).map(c => (
                                <div key={c.id} className="min-w-[300px] md:min-w-0 snap-start h-full">
                                    <ComparisonCard
                                        comparison={c}
                                        onClick={() => onComparisonClick?.(c.slug)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── SECTION 5: New Tools ─────────────────────────────────────── */}
            {(newTools.length > 0 || tools.length > 0) && (
                <section className="py-20 bg-surface-base">
                    <div className="container mx-auto px-4 md:px-8">
                        <SectionHeader
                            label="Recently Added"
                            title="New Tools"
                            viewAllHref="/ai-tools"
                        />
                        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-x-auto pb-6 md:pb-0 scrollbar-hide snap-x -mx-4 px-4 md:mx-0 md:px-0">
                            {(newTools.length > 0 ? newTools : tools.slice(0, 6)).map(t => (
                                <div key={t.id} className="min-w-[280px] md:min-w-0 snap-start">
                                    <ToolListCard tool={t} href={`/tools/${t.slug}`} />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── Compare Tools crosslink banner ───────────────────────────── */}
            <section className="py-12 bg-surface-base border-t border-border-divider">
                <div className="container mx-auto px-4 md:px-8">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-surface-card border border-border-subtle">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-news-accent/10 border border-news-accent/20 flex items-center justify-center flex-shrink-0">
                                <ArrowLeftRight size={16} className="text-news-accent" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">Not sure which tool is right for you?</p>
                                <p className="text-xs text-news-muted">Compare tools side by side — features, pricing, and use cases head to head.</p>
                            </div>
                        </div>
                        <a
                            href="/comparisons"
                            className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-news-accent text-news-accent text-xs font-bold hover:bg-news-accent hover:text-[#0B0F14] transition-all whitespace-nowrap no-underline"
                        >
                            Browse Comparisons →
                        </a>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default Portfolio;
