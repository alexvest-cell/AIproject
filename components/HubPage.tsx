import React, { useEffect, useState } from 'react';
import { Article, Tool, Comparison } from '../types';
import { ChevronLeft, ArrowRight, Star, ExternalLink, Filter } from 'lucide-react';

type HubType = 'ai-tools' | 'best-software' | 'reviews' | 'comparisons' | 'use-cases' | 'guides' | 'news';

interface HubPageProps {
    hub: HubType;
    articles: Article[];
    onArticleClick: (article: Article) => void;
    onToolClick: (slug: string) => void;
    onComparisonClick: (slug: string) => void;
    onBack: () => void;
}

const HUB_META: Record<HubType, { label: string; description: string; articleType?: string; showTools?: boolean; showComparisons?: boolean }> = {
    'ai-tools': { label: 'AI Tools', description: 'The definitive index of AI and software tools. Filter by category, pricing, or use case.', showTools: true },
    'best-software': { label: 'Best Software', description: 'Curated rankings of the best tools and software for every workflow and team size.', articleType: 'best-of' },
    'reviews': { label: 'Reviews', description: 'Deep-dive reviews of the tools shaping the modern software stack.', articleType: 'review' },
    'comparisons': { label: 'Comparisons', description: 'Head-to-head comparisons of the leading tools in every category.', showComparisons: true },
    'use-cases': { label: 'Use Cases', description: 'Find the best tools for your specific workflow or industry.', articleType: 'use-case' },
    'guides': { label: 'Guides', description: 'Practical guides for getting the most out of modern software.', articleType: 'guide' },
    'news': { label: 'News', description: 'The latest developments across the AI and software landscape.', articleType: 'news' },
};

const ITEMS_PER_PAGE = 12;

// ─── Shared Components ────────────────────────────────────────────────────────

const HubHeader: React.FC<{ hub: HubType; onBack: () => void }> = ({ hub, onBack }) => {
    const meta = HUB_META[hub];
    return (
        <div className="bg-surface-alt border-b border-border-divider">
            <div className="container mx-auto px-4 md:px-8 pt-[140px] md:pt-[150px] pb-10 md:pb-12">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-news-accent mb-2">ToolCurrent</p>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3 text-white">{meta.label}</h1>
                <p className="text-news-text max-w-xl">{meta.description}</p>
            </div>
        </div>
    );
};

const EmptyState: React.FC<{ hub: HubType }> = ({ hub }) => {
    const meta = HUB_META[hub];
    return (
        <div className="text-center py-24 border border-dashed border-border-subtle bg-surface-card/50 rounded-2xl">
            <div className="text-4xl mb-4">📭</div>
            <p className="text-lg font-bold text-white mb-2">No {meta.label} yet</p>
            {meta.articleType && (
                <p className="text-sm text-news-muted max-w-sm mx-auto">
                    Open the CMS and set an article&apos;s &ldquo;Article Type&rdquo; to{' '}
                    <span className="text-blue-400 font-mono">{meta.articleType}</span>.
                </p>
            )}
        </div>
    );
};

// ─── AI Tools Hub ─────────────────────────────────────────────────────────────
const TOOL_CATEGORIES = ['All', 'AI Writing', 'AI Image', 'Productivity', 'Project Management', 'Automation', 'CRM', 'Developer Tools', 'Creative'];
const PRICING_OPTIONS = ['All', 'Free', 'Freemium', 'Paid'];

const AIToolsHub: React.FC<{ onToolClick: (s: string) => void }> = ({ onToolClick }) => {
    const [tools, setTools] = useState<Tool[]>([]);
    const [loading, setLoading] = useState(true);
    const [catFilter, setCatFilter] = useState('All');
    const [pricingFilter, setPricingFilter] = useState('All');

    useEffect(() => {
        fetch('/api/tools')
            .then(r => r.json())
            .then(d => { setTools(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const filtered = tools.filter(t => {
        const matchCat = catFilter === 'All' || t.category_tags?.some(c => c.toLowerCase().includes(catFilter.toLowerCase()));
        const matchPrice = pricingFilter === 'All' || t.pricing_model === pricingFilter;
        return matchCat && matchPrice;
    });

    if (loading) return <div className="flex items-center justify-center py-24 text-gray-500"><div className="w-6 h-6 border-2 border-news-accent border-t-transparent rounded-full animate-spin mr-3" /> Loading tools…</div>;

    return (
        <div>
            {/* Filter bar */}
            <div className="flex flex-wrap items-center gap-4 mb-8 p-4 bg-surface-card rounded-2xl border border-border-subtle shadow-elevation">
                <div className="flex items-center gap-2 text-xs text-news-muted font-bold uppercase tracking-widest mr-2">
                    <Filter size={12} /> Filter
                </div>
                <div className="flex flex-wrap gap-2">
                    {PRICING_OPTIONS.map(p => (
                        <button
                            key={p}
                            onClick={() => setPricingFilter(p)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors shadow-sm ${pricingFilter === p ? 'bg-news-accent text-white border-news-accent' : 'bg-surface-base border-border-subtle text-news-muted hover:text-white hover:bg-surface-hover'}`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
                <div className="w-px h-6 bg-border-divider hidden sm:block mx-1" />
                <div className="flex flex-wrap gap-2">
                    {TOOL_CATEGORIES.slice(0, 5).map(c => (
                        <button
                            key={c}
                            onClick={() => setCatFilter(c)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors shadow-sm ${catFilter === c ? 'bg-news-accent text-white border-news-accent' : 'bg-surface-base border-border-subtle text-news-muted hover:text-white hover:bg-surface-hover'}`}
                        >
                            {c}
                        </button>
                    ))}
                </div>
            </div>

            <p className="text-xs text-news-muted uppercase tracking-widest mb-5">{filtered.length} Tools</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map(tool => (
                    <button
                        key={tool.id}
                        onClick={() => onToolClick(tool.slug)}
                        className="group text-left bg-surface-card border border-border-subtle shadow-elevation hover:shadow-elevation-hover hover:bg-surface-hover hover:-translate-y-0.5 rounded-2xl p-5 transition-all"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            {tool.logo ? (
                                <div className="w-10 h-10 rounded-xl bg-surface-base border border-border-subtle overflow-hidden flex-shrink-0 shadow-inner">
                                    <img src={tool.logo} alt={tool.name} className="w-full h-full object-contain p-1" loading="lazy" />
                                </div>
                            ) : (
                                <div className="w-10 h-10 rounded-xl bg-surface-base border border-border-subtle flex items-center justify-center text-base font-black text-news-muted flex-shrink-0 shadow-inner">
                                    {tool.name[0]}
                                </div>
                            )}
                            <div className="min-w-0">
                                <h3 className="font-bold text-white truncate group-hover:text-news-accent transition-colors">{tool.name}</h3>
                                <span className={`text-[9px] px-2 py-0.5 rounded border border-transparent font-bold ${tool.pricing_model === 'Free' || tool.pricing_model === 'Freemium' ? 'bg-news-accent/15 text-news-accent' : 'bg-blue-500/15 text-blue-400'}`}>
                                    {tool.pricing_model} {tool.starting_price && `· ${tool.starting_price}`}
                                </span>
                            </div>
                        </div>
                        <p className="text-news-text text-xs leading-relaxed line-clamp-2 mb-4">{tool.short_description}</p>
                        <div className="flex items-center justify-between pt-3 border-t border-border-divider">
                            <div className="flex flex-wrap gap-1.5">
                                {tool.category_tags?.slice(0, 2).map(t => (
                                    <span key={t} className="text-[9px] px-2 py-0.5 rounded-full bg-surface-base text-news-muted border border-border-subtle shadow-sm">{t}</span>
                                ))}
                            </div>
                            {tool.rating_score && (
                                <div className="flex items-center gap-1">
                                    <Star size={10} className="text-news-accent fill-news-accent" />
                                    <span className="text-xs font-bold text-white">{tool.rating_score}</span>
                                </div>
                            )}
                        </div>
                    </button>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-16 text-gray-500">No tools match the selected filters.</div>
            )}
        </div>
    );
};

// ─── Best Software Hub ────────────────────────────────────────────────────────
const BEST_OF_GROUPS = [
    { label: 'AI Tools', cats: ['AI Writing', 'AI Image', 'AI Video', 'Chatbot'] },
    { label: 'Productivity Software', cats: ['Productivity', 'Project Management', 'Knowledge Base'] },
    { label: 'Business Software', cats: ['CRM', 'Marketing', 'Sales'] },
    { label: 'Developer Tools', cats: ['Developer Tools', 'Automation', 'No-Code'] },
    { label: 'Creative Software', cats: ['Design', 'Creative Tools', 'AI Image'] },
];

const BestSoftwareHub: React.FC<{ articles: Article[]; onArticleClick: (a: Article) => void }> = ({ articles, onArticleClick }) => {
    const bestOf = articles.filter(a => (a as any).article_type === 'best-of');

    return (
        <div className="space-y-12">
            {BEST_OF_GROUPS.map(group => {
                const items = bestOf.filter(a => {
                    const cats = Array.isArray(a.category) ? a.category : [a.category];
                    const topic = (a as any).topic || '';
                    return group.cats.some(c =>
                        cats.some(ac => ac.toLowerCase().includes(c.toLowerCase())) ||
                        topic.toLowerCase().includes(c.toLowerCase())
                    );
                }).slice(0, 5);

                if (items.length === 0) return null;

                return (
                    <div key={group.label} className="bg-surface-alt rounded-2xl p-6 border border-border-subtle shadow-elevation">
                        <div className="flex items-end justify-between mb-5 pb-4 border-b border-border-divider">
                            <div>
                                <h2 className="text-base font-black text-white">{group.label}</h2>
                                <p className="text-[10px] text-news-muted uppercase tracking-widest mt-1">{items.length} Tracked Categories</p>
                            </div>
                            <Star size={16} className="text-news-accent opacity-50 mb-1" />
                        </div>
                        <div className="space-y-2">
                            {items.map((a, i) => (
                                <button
                                    key={a.id}
                                    onClick={() => onArticleClick(a)}
                                    className="group w-full text-left flex items-center gap-4 p-3 rounded-xl border border-border-subtle bg-surface-card shadow-sm hover:bg-surface-hover hover:-translate-y-0.5 hover:shadow-elevation transition-all"
                                >
                                    <span className="text-2xl font-black text-white/5 group-hover:text-white/20 w-8 flex-shrink-0 tabular-nums">{(i + 1).toString().padStart(2, '0')}</span>
                                    <div className="flex-grow min-w-0">
                                        <h3 className="text-sm font-bold text-news-text leading-snug line-clamp-2 group-hover:text-white">{a.title}</h3>
                                    </div>
                                    <ArrowRight size={14} className="text-news-muted group-hover:text-white flex-shrink-0" />
                                </button>
                            ))}
                        </div>
                    </div>
                );
            })}

            {bestOf.length === 0 && <EmptyState hub="best-software" />}
        </div>
    );
};

// ─── Comparisons Hub ──────────────────────────────────────────────────────────
const ComparisonsHub: React.FC<{ onComparisonClick: (s: string) => void }> = ({ onComparisonClick }) => {
    const [comparisons, setComparisons] = useState<Comparison[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/comparisons')
            .then(r => r.json())
            .then(d => { setComparisons(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex items-center justify-center py-24 text-gray-500"><div className="w-6 h-6 border-2 border-news-accent border-t-transparent rounded-full animate-spin mr-3" /> Loading…</div>;

    return (
        <div>
            {comparisons.length === 0 ? <EmptyState hub="comparisons" /> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {comparisons.map(c => {
                        const toolA = c.tool_a;
                        const toolB = c.tool_b;
                        return (
                            <button
                                key={c.id}
                                onClick={() => onComparisonClick(c.slug)}
                                className="group text-left bg-surface-card border border-border-subtle shadow-elevation hover:border-border-divider hover:shadow-elevation-hover hover:bg-surface-hover hover:-translate-y-0.5 rounded-2xl p-5 transition-all"
                            >
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="flex items-center gap-2 flex-1 min-w-0 bg-surface-base/50 p-2 rounded-lg border border-border-subtle">
                                        {toolA?.logo && <img src={toolA.logo} alt={toolA.name} className="w-8 h-8 rounded-md object-contain flex-shrink-0" loading="lazy" />}
                                        <span className="text-sm font-bold text-white truncate">{toolA?.name || c.tool_a_slug}</span>
                                    </div>
                                    <span className="text-[10px] font-black text-news-muted px-2 py-1 rounded-full bg-surface-base border border-border-divider shadow-sm flex-shrink-0">VS</span>
                                    <div className="flex items-center gap-2 flex-1 min-w-0 justify-end bg-surface-base/50 p-2 rounded-lg border border-border-subtle">
                                        <span className="text-sm font-bold text-white truncate text-right">{toolB?.name || c.tool_b_slug}</span>
                                        {toolB?.logo && <img src={toolB.logo} alt={toolB.name} className="w-8 h-8 rounded-md object-contain flex-shrink-0" loading="lazy" />}
                                    </div>
                                </div>
                                <h3 className="text-sm font-bold text-white leading-snug mb-2 group-hover:text-news-accent transition-colors">{c.title}</h3>
                                {c.verdict && <p className="text-xs text-news-text line-clamp-2 mb-4">{c.verdict}</p>}
                                <div className="pt-3 border-t border-border-divider">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-news-accent flex items-center gap-1 group-hover:text-white transition-colors">Read comparison <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" /></span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// ─── Generic Article Grid Hub ─────────────────────────────────────────────────
const ArticleGridHub: React.FC<{
    hub: HubType;
    articles: Article[];
    onArticleClick: (a: Article) => void;
}> = ({ hub, articles, onArticleClick }) => {
    const [page, setPage] = useState(1);
    const meta = HUB_META[hub];

    const filtered = articles.filter(a => {
        const type = (a as any).article_type;
        const cats = Array.isArray(a.category) ? a.category : [a.category];
        if (hub === 'news') return type === 'news' || cats.some(c => c === 'AI News');
        if (hub === 'reviews') return type === 'review' || cats.some(c => c === 'Reviews');
        if (hub === 'guides') return type === 'guide' || cats.some(c => c === 'Guides');
        if (hub === 'use-cases') return type === 'use-case';
        return type === meta.articleType;
    });

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    if (filtered.length === 0) return <EmptyState hub={hub} />;

    return (
        <div>
            <p className="text-xs text-news-muted uppercase tracking-widest mb-6">{filtered.length} {meta.label}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paged.map(article => (
                    <button key={article.id} onClick={() => onArticleClick(article)} className="group text-left bg-surface-card border border-border-subtle shadow-elevation hover:shadow-elevation-hover hover:bg-surface-hover hover:-translate-y-0.5 rounded-2xl p-4 transition-all flex flex-col">
                        {article.imageUrl && (
                            <div className="w-full aspect-video bg-surface-base rounded-xl overflow-hidden mb-4 border border-border-subtle relative before:absolute before:inset-0 before:bg-black/0 group-hover:before:bg-black/10 transition-all z-0">
                                <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" loading="lazy" />
                            </div>
                        )}
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-news-accent">
                                {(article as any).article_type || (Array.isArray(article.category) ? article.category[0] : article.category)}
                            </span>
                            <span className="text-border-subtle">•</span>
                            <span className="text-xs text-news-muted font-medium">{article.date}</span>
                        </div>
                        <h3 className="font-bold text-white group-hover:text-news-accent transition-colors leading-snug mb-2 line-clamp-2">{article.title}</h3>
                        <p className="text-news-text text-sm line-clamp-2">{article.excerpt}</p>
                    </button>
                ))}
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                    <button
                        onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo(0, 0); }}
                        disabled={page === 1}
                        className="px-4 py-2 rounded-lg bg-zinc-900 border border-white/10 text-sm disabled:opacity-30 hover:bg-zinc-800 transition-colors"
                    >
                        ← Prev
                    </button>
                    <span className="text-sm text-gray-400 px-3">Page {page} of {totalPages}</span>
                    <button
                        onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo(0, 0); }}
                        disabled={page === totalPages}
                        className="px-4 py-2 rounded-lg bg-zinc-900 border border-white/10 text-sm disabled:opacity-30 hover:bg-zinc-800 transition-colors"
                    >
                        Next →
                    </button>
                </div>
            )}
        </div>
    );
};

// ─── Main HubPage ─────────────────────────────────────────────────────────────
const HubPage: React.FC<HubPageProps> = ({ hub: rawHub, articles, onArticleClick, onToolClick, onComparisonClick, onBack }) => {
    // Safety: fall back to 'ai-tools' if we get an unrecognized hub value
    const hub: HubType = (rawHub && HUB_META[rawHub as HubType]) ? rawHub as HubType : 'ai-tools';
    const meta = HUB_META[hub];

    useEffect(() => {
        document.title = `${meta.label} | ToolCurrent`;
    }, [hub]);

    const renderContent = () => {
        if (hub === 'ai-tools') return <AIToolsHub onToolClick={onToolClick} />;
        if (hub === 'best-software') return <BestSoftwareHub articles={articles} onArticleClick={onArticleClick} />;
        if (hub === 'comparisons') return <ComparisonsHub onComparisonClick={onComparisonClick} />;
        return <ArticleGridHub hub={hub} articles={articles} onArticleClick={onArticleClick} />;
    };

    return (
        <div className="min-h-screen bg-surface-base text-news-text font-sans">
            <HubHeader hub={hub} onBack={onBack} />
            <div className="container mx-auto px-4 md:px-8 py-10">
                {renderContent()}
            </div>
        </div>
    );
};

export default HubPage;
