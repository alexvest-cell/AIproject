'use client';
import React, { useEffect, useState } from 'react';
import { Section, Article, Comparison, Tool } from '../types';
import { ArrowRight, Filter, ExternalLink, Star } from 'lucide-react';
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

// ─── Section Header ──────────────────────────────────────────────────────────
const SectionHeader: React.FC<{
    label?: string;
    title: string;
    hub?: string;
    onHubClick?: (h: string) => void;
}> = ({ label, title, hub, onHubClick }) => (
    <div className="flex items-end justify-between mb-6">
        <div>
            {label && <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-news-accent mb-1">{label}</p>}
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">{title}</h2>
        </div>
        {hub && onHubClick && (
            <button
                onClick={() => onHubClick(hub)}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-white transition-colors group/btn"
            >
                View all <ArrowRight size={12} className="group-hover/btn:translate-x-0.5 transition-transform" />
            </button>
        )}
    </div>
);

// ─── Ranking Card (Best-of articles) ─────────────────────────────────────────
const RankingCard: React.FC<{ article: Article; rank?: number; onClick: () => void }> = ({ article, rank, onClick }) => {
    // In a real app, this would come from the article data. For now, we'll derive or use a fallback.
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
const ToolListCard: React.FC<{ tool: Tool; onClick: () => void }> = ({ tool, onClick }) => (
    <button
        onClick={onClick}
        className="group w-full text-left flex items-center gap-4 p-4 rounded-xl border border-border-subtle bg-surface-card shadow-elevation hover:bg-surface-hover hover:border-news-accent hover:shadow-[0_0_15px_rgba(43,212,195,0.15)] hover:-translate-y-0.5 transition-all"
    >
        {tool.logo ? (
            <img src={tool.logo} alt={tool.name} className="w-10 h-10 rounded-lg object-contain bg-surface-base p-1 flex-shrink-0 shadow-inner" loading="lazy" />
        ) : (
            <div className="w-10 h-10 rounded-lg bg-surface-base shadow-inner flex items-center justify-center flex-shrink-0 text-base font-black text-news-muted">
                {tool.name[0]}
            </div>
        )}
        <div className="flex-grow min-w-0">
            <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white truncate group-hover:text-news-accent transition-colors">{tool.name}</h3>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-bold flex-shrink-0 ${tool.pricing_model === 'Free' || tool.pricing_model === 'Freemium'
                    ? 'bg-news-accent/10 border-news-accent/20 text-news-accent'
                    : 'bg-blue-500/10 border-blue-500/20 text-blue-400'}`}
                >
                    {tool.pricing_model}
                </span>
            </div>
            <p className="text-xs text-news-text truncate mt-0.5">{tool.short_description}</p>
        </div>
        {tool.rating_score && (
            <div className="flex items-center gap-1 flex-shrink-0 bg-surface-base py-1 px-2 rounded-full border border-border-subtle">
                <Star size={10} className="text-news-accent fill-news-accent" />
                <span className="text-xs font-bold text-white">{tool.rating_score}</span>
            </div>
        )}
    </button>
);

// ─── News Row ─────────────────────────────────────────────────────────────────
const NewsRow: React.FC<{ article: Article; onClick: () => void }> = ({ article, onClick }) => (
    <button
        onClick={onClick}
        className="group w-full text-left flex gap-3 p-3 border border-border-subtle bg-surface-card shadow-elevation hover:border-news-accent hover:shadow-[0_0_15px_rgba(43,212,195,0.15)] hover:bg-surface-hover hover:-translate-y-0.5 rounded-xl transition-all"
    >
        <div className="w-20 h-14 flex-shrink-0 overflow-hidden rounded-lg">
            <img src={article.imageUrl} alt={article.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80 group-hover:opacity-100" />
        </div>
        <div className="flex-grow min-w-0">
            <h3 className="text-xs font-bold text-white leading-snug line-clamp-2 group-hover:text-news-accent transition-colors mb-1">{article.title}</h3>
            <div className="flex items-center gap-2 text-[10px] text-news-muted">
                <span className="font-bold text-news-accent/80">{article.topic || (Array.isArray(article.category) ? article.category[0] : article.category)}</span>
                <span>·</span>
                <span>{article.date}</span>
            </div>
        </div>
    </button>
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

    // ── Filter helpers ────────────────────────────────────────────────────────
    const exclude = (arr: Article[]) => arr.filter(a => !excludedArticleIds.includes(a.id));

    const byType = (type: string) =>
        exclude(articles).filter(a => (a as any).article_type === type);

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
    const reviews = byType('review').slice(0, 4);
    const guides = byType('guide').slice(0, 4);
    const news = byType('news').slice(0, 8);
    const useCases = byType('use-case').slice(0, 4);

    return (
        <div className="w-full text-news-text">
            {/* ── SECTION 1: Popular Best Software Rankings (Base Surface) ─────────────────── */}
            {bestOf.length > 0 && (
                <section id={Section.NEWS} className="py-20 bg-surface-base">
                    <div className="container mx-auto px-4 md:px-8">
                        <SectionHeader
                            label="Rankings"
                            title="Popular Best Software"
                            hub="best-software"
                            onHubClick={onHubClick}
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

            {/* ── TRENDING AI TOOLS SECTION (New) ────────────────────────────────────────── */}
            {tools.length > 0 && (
                <section className="py-20 bg-surface-alt border-y border-border-divider">
                    <div className="container mx-auto px-4 md:px-8">
                        <SectionHeader
                            label="Discovery"
                            title="Trending AI Tools"
                            hub="ai-tools"
                            onHubClick={onHubClick}
                        />
                        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 overflow-x-auto pb-6 md:pb-0 scrollbar-hide snap-x -mx-4 px-4 md:mx-0 md:px-0">
                            {tools.slice(0, 10).map(t => (
                                <div key={t.id} className="min-w-[240px] md:min-w-0 snap-start">
                                    <ToolListCard
                                        tool={t}
                                        onClick={() => onToolClick?.(t.slug)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── SECTION 2: Trending Comparisons (Alternating Surface) ──────────────────────────── */}
            {comparisons.length > 0 && (
                <section className="py-20 bg-surface-alt border-y border-border-divider">
                    <div className="container mx-auto px-4 md:px-8">
                        <SectionHeader
                            label="Tool vs Tool"
                            title="Trending Comparisons"
                            hub="comparisons"
                            onHubClick={onHubClick}
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

            {/* ── SECTION 3: Recently Reviewed Tools (Base Surface) ───────────────────────── */}
            {tools.length > 0 && (
                <section className="py-20 bg-surface-base">
                    <div className="container mx-auto px-4 md:px-8">
                        <SectionHeader
                            label="Software Reviews"
                            title="Recently Reviewed Tools"
                            hub="ai-tools"
                            onHubClick={onHubClick}
                        />
                        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-x-auto pb-6 md:pb-0 scrollbar-hide snap-x -mx-4 px-4 md:mx-0 md:px-0">
                            {tools.slice(0, 6).map(t => (
                                <div key={t.id} className="min-w-[280px] md:min-w-0 snap-start">
                                    <ToolListCard
                                        tool={t}
                                        onClick={() => onToolClick?.(t.slug)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── SECTION 4: Latest Guides & Reviews in a grid (Alternating Surface) ─────────────── */}
            {false && (reviews.length > 0 || guides.length > 0 || useCases.length > 0) && (
                <section className="py-20 bg-surface-alt border-y border-border-divider">
                    <div className="container mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/*  Reviews */}
                        {reviews.length > 0 && (
                            <div>
                                <div className="flex items-center justify-between mb-4 pb-3 border-b border-border-divider">
                                    <div>
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-news-accent mb-0.5">In-Depth</p>
                                        <h3 className="text-base font-black text-white">Reviews</h3>
                                    </div>
                                    {onHubClick && <button onClick={() => onHubClick('reviews')} className="text-xs text-news-muted hover:text-white transition-colors"><ArrowRight size={12} /></button>}
                                </div>
                                <div className="space-y-3">
                                    {reviews.map(a => <NewsRow key={a.id} article={a} onClick={() => onArticleClick(a)} />)}
                                </div>
                            </div>
                        )}

                        {/* Guides */}
                        {guides.length > 0 && (
                            <div>
                                <div className="flex items-center justify-between mb-4 pb-3 border-b border-border-divider">
                                    <div>
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-news-accent mb-0.5">How-To</p>
                                        <h3 className="text-base font-black text-white">Guides</h3>
                                    </div>
                                    {onHubClick && <button onClick={() => onHubClick('guides')} className="text-xs text-news-muted hover:text-white transition-colors"><ArrowRight size={12} /></button>}
                                </div>
                                <div className="space-y-3">
                                    {guides.map(a => <NewsRow key={a.id} article={a} onClick={() => onArticleClick(a)} />)}
                                </div>
                            </div>
                        )}

                        {/* Use Cases */}
                        {useCases.length > 0 && (
                            <div>
                                <div className="flex items-center justify-between mb-4 pb-3 border-b border-border-divider">
                                    <div>
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-news-accent mb-0.5">Real-World</p>
                                        <h3 className="text-base font-black text-white">Use Cases</h3>
                                    </div>
                                    {onHubClick && <button onClick={() => onHubClick('use-cases')} className="text-xs text-news-muted hover:text-white transition-colors"><ArrowRight size={12} /></button>}
                                </div>
                                <div className="space-y-3">
                                    {useCases.map(a => <NewsRow key={a.id} article={a} onClick={() => onArticleClick(a)} />)}
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* ── SECTION 5: Latest Intelligence — News (Base Surface) ────── */}
            {false && news.length > 0 && (
                <section className="py-20 bg-surface-base pb-32">
                    <div className="container mx-auto px-4 md:px-8">
                        <SectionHeader
                            label="Latest"
                            title="Latest Intelligence"
                            hub="news"
                            onHubClick={onHubClick}
                        />
                        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-6 md:pb-0 scrollbar-hide snap-x -mx-4 px-4 md:mx-0 md:px-0">
                            {news.map(a => (
                                <div key={a.id} onClick={() => onArticleClick(a)} className="group cursor-pointer bg-surface-card border border-border-subtle shadow-elevation hover:shadow-elevation-hover hover:bg-surface-hover hover:-translate-y-1 transition-all rounded-xl overflow-hidden p-4 min-w-[260px] md:min-w-0 snap-start">
                                    <div className="w-full aspect-[4/3] overflow-hidden rounded-lg mb-4 bg-surface-base">
                                        <img src={a.imageUrl} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100" />
                                    </div>
                                    <p className="text-[10px] uppercase font-bold text-news-accent tracking-widest mb-2">{a.topic || (Array.isArray(a.category) ? a.category[0] : a.category)}</p>
                                    <h3 className="font-bold text-white leading-snug line-clamp-3 mb-2">{a.title}</h3>
                                    <p className="text-xs text-news-muted">{a.date}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

        </div>
    );
};

export default Portfolio;