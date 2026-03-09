import React, { useEffect, useState } from 'react';
import { Article, Tool, Comparison } from '../types';
import { ArrowRight, Star, Filter, PenLine, Code2, ImageIcon, Zap, Layers, LayoutGrid, Users, Megaphone, Search, X, ChevronDown, TrendingUp, Briefcase, BookOpen, Headphones, Rocket, Brain, GraduationCap, Workflow, Flame, Radio } from 'lucide-react';

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
    'ai-tools': { label: 'AI Tools', description: 'Explore the leading AI and software tools across writing, productivity, automation, development, and more. Filter by category, pricing, and use case to find the right tool for your workflow.', showTools: true },
    'best-software': { label: 'Best Software', description: 'Curated rankings of the best tools and software for every workflow and team size.', articleType: 'best-of' },
    'reviews': { label: 'Reviews', description: 'Independent, in-depth evaluations of modern software tools. Each review analyzes features, pricing, performance, and real-world use cases.', articleType: 'review' },
    'comparisons': { label: 'Comparisons', description: 'Compare the leading AI and software tools side-by-side to find the best option for your workflow.', showComparisons: true },
    'use-cases': { label: 'Use Cases', description: 'Explore real-world workflows showing how modern teams combine AI and software tools to automate tasks, improve productivity, and build smarter systems.', articleType: 'use-case' },
    'guides': { label: 'Guides', description: 'Step-by-step guides for mastering modern software tools, building smarter workflows, and automating everyday work.', articleType: 'guide' },
    'news': { label: 'News', description: 'Breaking developments, product launches, and major updates across AI and modern software tools.', articleType: 'news' },
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
                {hub === 'reviews' && (
                    <p className="text-xs text-news-muted mt-3 max-w-xl border-l-2 border-border-divider pl-3">
                        Every ToolCurrent review is based on hands-on testing, feature analysis, pricing evaluation, and comparison with competing tools.
                    </p>
                )}
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

// ─── Horizontal Scroll Row (arrow buttons on desktop, scrollbar-free) ────────
const HScrollRow: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const ref = React.useRef<HTMLDivElement>(null);
    const scroll = (dir: 'left' | 'right') => {
        ref.current?.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' });
    };
    return (
        <div className="relative group/scroll">
            {/* Prev button — desktop only */}
            <button
                onClick={() => scroll('left')}
                className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center rounded-full bg-surface-card border border-border-subtle shadow-elevation text-news-muted hover:text-white hover:bg-surface-hover transition-all opacity-0 group-hover/scroll:opacity-100"
                aria-label="Scroll left"
            >
                <ArrowRight size={14} className="rotate-180" />
            </button>
            {/* Scroll container — scrollbar hidden everywhere */}
            <div
                ref={ref}
                className="flex gap-3 overflow-x-auto pb-1"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {/* webkit scrollbar hide */}
                <style>{`.hscroll::-webkit-scrollbar{display:none}`}</style>
                {children}
            </div>
            {/* Next button — desktop only */}
            <button
                onClick={() => scroll('right')}
                className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center rounded-full bg-surface-card border border-border-subtle shadow-elevation text-news-muted hover:text-white hover:bg-surface-hover transition-all opacity-0 group-hover/scroll:opacity-100"
                aria-label="Scroll right"
            >
                <ArrowRight size={14} />
            </button>
        </div>
    );
};

// ─── AI Tools Hub ─────────────────────────────────────────────────────────────
const TOOLS_PER_PAGE = 24;

const CATEGORY_EXPLORER = [
    { label: 'AI Writing',          icon: PenLine,      filter: 'AI Writing' },
    { label: 'AI Coding',           icon: Code2,        filter: 'Developer Tools' },
    { label: 'AI Image',            icon: ImageIcon,    filter: 'AI Image' },
    { label: 'Automation',          icon: Zap,          filter: 'Automation' },
    { label: 'Productivity',        icon: Layers,       filter: 'Productivity' },
    { label: 'Project Management',  icon: LayoutGrid,   filter: 'Project Management' },
    { label: 'CRM',                 icon: Users,        filter: 'CRM' },
    { label: 'Marketing',           icon: Megaphone,    filter: 'Marketing' },
];

const PRICING_OPTIONS = ['All', 'Free', 'Freemium', 'Paid'];
const CAT_FILTERS = ['All', 'AI Writing', 'Productivity', 'Automation', 'Developer Tools', 'Marketing Tools', 'CRM', 'AI Image'];
const USE_CASE_FILTERS = ['All', 'Content Creation', 'Coding', 'Workflow Automation', 'Note Taking', 'Customer Support'];

const AIToolsHub: React.FC<{
    onToolClick: (s: string) => void;
    articles: Article[];
    onArticleClick: (a: Article) => void;
}> = ({ onToolClick, articles, onArticleClick }) => {
    const [tools, setTools] = useState<Tool[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [pricingFilter, setPricingFilter] = useState('All');
    const [catFilter, setCatFilter] = useState('All');
    const [useCaseFilter, setUseCaseFilter] = useState('All');
    const [sortBy, setSortBy] = useState<'rating' | 'popular' | 'newest' | 'price'>('rating');
    const [visibleCount, setVisibleCount] = useState(TOOLS_PER_PAGE);

    useEffect(() => {
        fetch('/api/tools')
            .then(r => r.json())
            .then(d => { setTools(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    // Reset pagination when filters change
    useEffect(() => { setVisibleCount(TOOLS_PER_PAGE); }, [search, pricingFilter, catFilter, useCaseFilter, sortBy]);

    const getBadge = (tool: Tool): string | null => {
        if (tool.ai_enabled && tool.rating_score >= 4.7) return "Editor's Pick";
        if (tool.review_count >= 50) return 'Popular';
        return null;
    };

    const filtered = tools.filter(t => {
        const q = search.toLowerCase();
        const matchSearch = !search ||
            t.name.toLowerCase().includes(q) ||
            t.short_description?.toLowerCase().includes(q) ||
            t.category_tags?.some(c => c.toLowerCase().includes(q)) ||
            t.use_case_tags?.some(u => u.toLowerCase().includes(q));
        const matchPrice = pricingFilter === 'All' || t.pricing_model === pricingFilter;
        const matchCat = catFilter === 'All' || t.category_tags?.some(c => c.toLowerCase().includes(catFilter.toLowerCase()));
        const matchUse = useCaseFilter === 'All' || t.use_case_tags?.some(u => u.toLowerCase().includes(useCaseFilter.toLowerCase()));
        return matchSearch && matchPrice && matchCat && matchUse;
    });

    const sorted = [...filtered].sort((a, b) => {
        if (sortBy === 'rating') return (b.rating_score || 0) - (a.rating_score || 0);
        if (sortBy === 'popular') return (b.review_count || 0) - (a.review_count || 0);
        if (sortBy === 'price') {
            const pa = parseFloat((a.starting_price || '9999').replace(/[^0-9.]/g, ''));
            const pb = parseFloat((b.starting_price || '9999').replace(/[^0-9.]/g, ''));
            return pa - pb;
        }
        return 0; // newest = API order
    });

    const visible = sorted.slice(0, visibleCount);
    const topRated = [...tools].sort((a, b) => (b.rating_score || 0) - (a.rating_score || 0)).slice(0, 6);
    const hasActiveFilters = pricingFilter !== 'All' || catFilter !== 'All' || useCaseFilter !== 'All' || !!search;

    const relatedRankings = articles.filter(a => (a as any).article_type === 'best-of').slice(0, 4);

    if (loading) return <div className="flex items-center justify-center py-24 text-gray-500"><div className="w-6 h-6 border-2 border-news-accent border-t-transparent rounded-full animate-spin mr-3" /> Loading tools…</div>;

    return (
        <div>
            {/* Category Explorer */}
            <div className="mb-10">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-news-muted mb-4">Explore by Category</p>
                <HScrollRow>
                    {CATEGORY_EXPLORER.map(({ label, icon: Icon, filter }) => {
                        const count = tools.filter(t => t.category_tags?.some(c => c.toLowerCase().includes(filter.toLowerCase()))).length;
                        if (count === 0) return null;
                        return (
                            <button
                                key={label}
                                onClick={() => setCatFilter(catFilter === filter ? 'All' : filter)}
                                className={`group flex-shrink-0 flex flex-col items-center gap-2 px-5 py-4 rounded-2xl border transition-all shadow-elevation min-w-[96px] ${
                                    catFilter === filter
                                        ? 'bg-news-accent/10 border-news-accent/50 text-news-accent'
                                        : 'bg-surface-card border-border-subtle hover:bg-surface-hover hover:border-border-divider text-news-muted hover:text-white'
                                }`}
                            >
                                <Icon size={20} className="flex-shrink-0" />
                                <span className="text-xs font-bold text-center leading-tight">{label}</span>
                                <span className="text-[9px] opacity-60">{count} tools</span>
                            </button>
                        );
                    })}
                </HScrollRow>
            </div>

            {/* Top Rated strip */}
            {topRated.length >= 2 && (
                <div className="mb-10">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp size={12} className="text-news-accent" />
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-news-muted">Top Rated Tools</p>
                    </div>
                    <HScrollRow>
                        {topRated.map(tool => (
                            <button
                                key={tool.slug}
                                onClick={() => onToolClick(tool.slug)}
                                className="group flex-shrink-0 flex items-center gap-3 px-4 py-3 bg-surface-card border border-border-subtle rounded-2xl hover:border-news-accent/40 hover:bg-surface-hover transition-all shadow-elevation"
                            >
                                {tool.logo ? (
                                    <div className="w-8 h-8 rounded-lg bg-surface-base border border-border-subtle overflow-hidden flex-shrink-0">
                                        <img src={tool.logo} alt={tool.name} className="w-full h-full object-contain p-0.5" loading="lazy" />
                                    </div>
                                ) : (
                                    <div className="w-8 h-8 rounded-lg bg-surface-base border border-border-subtle flex items-center justify-center text-xs font-black text-news-muted flex-shrink-0">
                                        {tool.name[0]}
                                    </div>
                                )}
                                <div className="text-left">
                                    <p className="text-sm font-bold text-white group-hover:text-news-accent transition-colors whitespace-nowrap">{tool.name}</p>
                                    <div className="flex items-center gap-1.5">
                                        {tool.rating_score > 0 && (
                                            <span className="text-[10px] font-bold text-news-accent flex items-center gap-0.5">
                                                <Star size={9} className="fill-news-accent" />{tool.rating_score.toFixed(1)}
                                            </span>
                                        )}
                                        <span className="text-[9px] text-news-muted">{tool.category_tags?.[0]}</span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </HScrollRow>
                </div>
            )}

            {/* Search + Filter + Sort */}
            <div className="mb-6 space-y-3">
                {/* Search */}
                <div className="relative">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-news-muted" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search tools (e.g. writing, automation, coding…)"
                        className="w-full bg-surface-card border border-border-subtle rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-news-muted focus:outline-none focus:border-news-accent transition-colors"
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-news-muted hover:text-white">
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Multi-filter bar */}
                <div className="p-4 bg-surface-card rounded-2xl border border-border-subtle shadow-elevation space-y-3">
                    {/* Row 1: Pricing */}
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-news-muted w-16 flex-shrink-0">Pricing</span>
                        {PRICING_OPTIONS.map(p => (
                            <button key={p} onClick={() => setPricingFilter(p)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                                    pricingFilter === p ? 'bg-news-accent text-white border-news-accent' : 'bg-surface-base border-border-subtle text-news-muted hover:text-white hover:bg-surface-hover'
                                }`}>{p}</button>
                        ))}
                    </div>
                    <div className="h-px bg-border-divider" />
                    {/* Row 2: Category */}
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-news-muted w-16 flex-shrink-0">Category</span>
                        {CAT_FILTERS.map(c => (
                            <button key={c} onClick={() => setCatFilter(c)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                                    catFilter === c ? 'bg-news-accent text-white border-news-accent' : 'bg-surface-base border-border-subtle text-news-muted hover:text-white hover:bg-surface-hover'
                                }`}>{c}</button>
                        ))}
                    </div>
                    <div className="h-px bg-border-divider" />
                    {/* Row 3: Use Case */}
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-news-muted w-16 flex-shrink-0">Use Case</span>
                        {USE_CASE_FILTERS.map(u => (
                            <button key={u} onClick={() => setUseCaseFilter(u)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                                    useCaseFilter === u ? 'bg-news-accent text-white border-news-accent' : 'bg-surface-base border-border-subtle text-news-muted hover:text-white hover:bg-surface-hover'
                                }`}>{u}</button>
                        ))}
                    </div>

                    {/* Active filter chips + Clear all */}
                    {hasActiveFilters && (
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                            <span className="text-[9px] text-news-muted">Active:</span>
                            {search && (
                                <span className="flex items-center gap-1 text-[10px] bg-news-accent/15 text-news-accent border border-news-accent/30 rounded-full px-2.5 py-0.5">
                                    "{search}" <button onClick={() => setSearch('')}><X size={9} /></button>
                                </span>
                            )}
                            {pricingFilter !== 'All' && (
                                <span className="flex items-center gap-1 text-[10px] bg-news-accent/15 text-news-accent border border-news-accent/30 rounded-full px-2.5 py-0.5">
                                    {pricingFilter} <button onClick={() => setPricingFilter('All')}><X size={9} /></button>
                                </span>
                            )}
                            {catFilter !== 'All' && (
                                <span className="flex items-center gap-1 text-[10px] bg-news-accent/15 text-news-accent border border-news-accent/30 rounded-full px-2.5 py-0.5">
                                    {catFilter} <button onClick={() => setCatFilter('All')}><X size={9} /></button>
                                </span>
                            )}
                            {useCaseFilter !== 'All' && (
                                <span className="flex items-center gap-1 text-[10px] bg-news-accent/15 text-news-accent border border-news-accent/30 rounded-full px-2.5 py-0.5">
                                    {useCaseFilter} <button onClick={() => setUseCaseFilter('All')}><X size={9} /></button>
                                </span>
                            )}
                            <button
                                onClick={() => { setSearch(''); setPricingFilter('All'); setCatFilter('All'); setUseCaseFilter('All'); }}
                                className="text-[10px] font-bold text-news-muted hover:text-white transition-colors ml-1"
                            >× Clear all</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Count + Sort */}
            <div className="flex items-center justify-between mb-6">
                <p className="text-xs text-news-muted uppercase tracking-widest">{filtered.length} Tools</p>
                <div className="relative">
                    <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value as any)}
                        className="appearance-none bg-surface-card border border-border-subtle text-news-muted text-xs font-bold rounded-xl px-3 py-2 pr-7 focus:outline-none focus:border-news-accent cursor-pointer"
                    >
                        <option value="rating">Top Rated</option>
                        <option value="popular">Most Popular</option>
                        <option value="newest">Newest</option>
                        <option value="price">Lowest Price</option>
                    </select>
                    <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-news-muted pointer-events-none" />
                </div>
            </div>

            {/* Tool Grid */}
            {visible.length === 0 ? (
                <div className="text-center py-16 text-gray-500 border border-dashed border-border-subtle rounded-2xl">No tools match your filters.</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {visible.map(tool => {
                        const badge = getBadge(tool);
                        return (
                            <button
                                key={tool.id}
                                onClick={() => onToolClick(tool.slug)}
                                className="group relative text-left bg-surface-card border border-border-subtle shadow-elevation hover:shadow-elevation-hover hover:bg-surface-hover hover:-translate-y-0.5 rounded-2xl p-5 transition-all flex flex-col"
                            >
                                {/* Badge */}
                                {badge && (
                                    <span className={`absolute top-3 right-3 text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                                        badge === "Editor's Pick" ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                                    }`}>{badge}</span>
                                )}

                                {/* Logo + Name */}
                                <div className="flex items-center gap-3 mb-3">
                                    {tool.logo ? (
                                        <div className="w-10 h-10 rounded-xl bg-surface-base border border-border-subtle overflow-hidden flex-shrink-0 shadow-inner">
                                            <img src={tool.logo} alt={tool.name} className="w-full h-full object-contain p-1" loading="lazy" />
                                        </div>
                                    ) : (
                                        <div className="w-10 h-10 rounded-xl bg-surface-base border border-border-subtle flex items-center justify-center text-base font-black text-news-muted flex-shrink-0 shadow-inner">
                                            {tool.name[0]}
                                        </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-bold text-white truncate group-hover:text-news-accent transition-colors pr-12">{tool.name}</h3>
                                        {tool.rating_score > 0 && (
                                            <div className="flex items-center gap-1">
                                                <Star size={9} className="text-news-accent fill-news-accent" />
                                                <span className="text-[10px] font-bold text-news-accent">{tool.rating_score.toFixed(1)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Category tag */}
                                <div className="flex flex-wrap gap-1.5 mb-3">
                                    {tool.category_tags?.slice(0, 2).map(tag => (
                                        <span key={tag} className="text-[9px] px-2 py-0.5 rounded-full bg-surface-base border border-border-subtle text-news-muted">{tag}</span>
                                    ))}
                                </div>

                                {/* Description */}
                                <p className="text-news-text text-xs leading-relaxed line-clamp-2 flex-1 mb-4">{tool.short_description}</p>

                                {/* Pricing footer */}
                                <div className="pt-3 border-t border-border-divider">
                                    <span className={`text-[9px] px-2 py-0.5 rounded border font-bold ${
                                        tool.pricing_model === 'Free' || tool.pricing_model === 'Freemium'
                                            ? 'bg-news-accent/15 text-news-accent border-news-accent/20'
                                            : 'bg-blue-500/15 text-blue-400 border-blue-500/20'
                                    }`}>
                                        {tool.pricing_model}{tool.starting_price ? ` · ${tool.starting_price}` : ''}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Load More */}
            {sorted.length > visibleCount && (
                <div className="mt-10 text-center">
                    <button
                        onClick={() => setVisibleCount(v => v + TOOLS_PER_PAGE)}
                        className="px-8 py-3 rounded-xl bg-surface-card border border-border-subtle text-sm font-bold text-white hover:bg-surface-hover hover:border-border-divider transition-all shadow-elevation"
                    >
                        Load More — {Math.min(TOOLS_PER_PAGE, sorted.length - visibleCount)} more tools
                    </button>
                </div>
            )}

            {/* Related Rankings */}
            {relatedRankings.length > 0 && (
                <div className="mt-16 pt-10 border-t border-border-divider">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-news-muted mb-5">Related Rankings</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {relatedRankings.map(a => (
                            <button
                                key={a.id}
                                onClick={() => onArticleClick(a)}
                                className="group text-left bg-surface-card border border-border-subtle rounded-2xl p-4 hover:bg-surface-hover hover:-translate-y-0.5 hover:border-border-divider transition-all shadow-elevation"
                            >
                                <p className="text-[9px] font-bold uppercase tracking-widest text-news-accent mb-2">Best Of</p>
                                <h4 className="text-sm font-bold text-white group-hover:text-news-accent transition-colors leading-snug line-clamp-2">{a.title}</h4>
                                <span className="text-[10px] text-news-muted flex items-center gap-1 mt-2 group-hover:text-white transition-colors">View ranking <ArrowRight size={9} /></span>
                            </button>
                        ))}
                    </div>
                </div>
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
const COMP_CATEGORIES = ['All', 'AI Assistants', 'Productivity Tools', 'Automation Platforms', 'AI Writing', 'Developer Tools', 'Image Generation'];

const ComparisonsHub: React.FC<{
    onComparisonClick: (s: string) => void;
    articles: Article[];
    onArticleClick: (a: Article) => void;
}> = ({ onComparisonClick, articles, onArticleClick }) => {
    const [comparisons, setComparisons] = useState<Comparison[]>([]);
    const [tools, setTools] = useState<Tool[]>([]);
    const [loading, setLoading] = useState(true);
    const [catFilter, setCatFilter] = useState('All');
    const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'rated'>('popular');
    const [builderA, setBuilderA] = useState('');
    const [builderB, setBuilderB] = useState('');

    useEffect(() => {
        Promise.all([
            fetch('/api/comparisons').then(r => r.json()),
            fetch('/api/tools').then(r => r.json()),
        ]).then(([comps, t]) => {
            setComparisons(comps);
            setTools(t);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    // Category matching: check if either tool in comparison has matching tags
    const catMatch = (c: Comparison) => {
        if (catFilter === 'All') return true;
        const q = catFilter.toLowerCase();
        const tagsA = c.tool_a?.category_tags || [];
        const tagsB = c.tool_b?.category_tags || [];
        return [...tagsA, ...tagsB].some(t => t.toLowerCase().includes(q.replace(' tools','').replace(' platforms','').replace(' generation','')));
    };

    const avgRating = (c: Comparison) => {
        const rA = c.tool_a?.rating_score || 0;
        const rB = c.tool_b?.rating_score || 0;
        return rA && rB ? (rA + rB) / 2 : rA || rB;
    };

    const filtered = comparisons.filter(catMatch);

    const sorted = [...filtered].sort((a, b) => {
        if (sortBy === 'rated') return avgRating(b) - avgRating(a);
        return 0; // popular/newest = API order
    });

    // Popular = first 6 from unfiltered list
    const popular = comparisons.slice(0, 6);

    const relatedRankings = articles.filter(a => (a as any).article_type === 'best-of').slice(0, 4);

    const handleCompare = () => {
        if (!builderA || !builderB || builderA === builderB) return;
        const slug = `${builderA}-vs-${builderB}`;
        onComparisonClick(slug);
    };

    if (loading) return <div className="flex items-center justify-center py-24 text-gray-500"><div className="w-6 h-6 border-2 border-news-accent border-t-transparent rounded-full animate-spin mr-3" /> Loading…</div>;

    return (
        <div>
            {/* Comparison Builder */}
            <div className="mb-10 p-5 bg-surface-card border border-border-subtle rounded-2xl shadow-elevation">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-news-muted mb-4">Compare Tools</p>
                <div className="flex flex-wrap items-center gap-3">
                    <select
                        value={builderA}
                        onChange={e => setBuilderA(e.target.value)}
                        className="flex-1 min-w-[160px] appearance-none bg-surface-base border border-border-subtle text-sm font-medium text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-news-accent cursor-pointer"
                    >
                        <option value="" disabled>Select Tool A</option>
                        {tools.map(t => <option key={t.slug} value={t.slug}>{t.name}</option>)}
                    </select>
                    <span className="text-xs font-black text-news-muted px-3 py-1.5 rounded-full bg-surface-base border border-border-divider flex-shrink-0">VS</span>
                    <select
                        value={builderB}
                        onChange={e => setBuilderB(e.target.value)}
                        className="flex-1 min-w-[160px] appearance-none bg-surface-base border border-border-subtle text-sm font-medium text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-news-accent cursor-pointer"
                    >
                        <option value="" disabled>Select Tool B</option>
                        {tools.filter(t => t.slug !== builderA).map(t => <option key={t.slug} value={t.slug}>{t.name}</option>)}
                    </select>
                    <button
                        onClick={handleCompare}
                        disabled={!builderA || !builderB || builderA === builderB}
                        className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-news-accent text-white text-sm font-bold hover:bg-news-accent/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Compare Tools <ArrowRight size={14} />
                    </button>
                </div>
            </div>

            {/* Popular Comparisons strip */}
            {popular.length >= 2 && (
                <div className="mb-10">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-news-muted mb-4">Popular Comparisons</p>
                    <HScrollRow>
                        {popular.map(c => {
                            const tA = c.tool_a;
                            const tB = c.tool_b;
                            return (
                                <button
                                    key={c.id}
                                    onClick={() => onComparisonClick(c.slug)}
                                    className="group flex-shrink-0 w-56 text-left bg-surface-card border border-border-subtle rounded-2xl p-4 hover:border-news-accent/40 hover:bg-surface-hover transition-all shadow-elevation"
                                >
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                            {tA?.logo && <img src={tA.logo} alt={tA.name} className="w-6 h-6 rounded-md object-contain flex-shrink-0" loading="lazy" />}
                                            <span className="text-xs font-bold text-white truncate">{tA?.name || c.tool_a_slug}</span>
                                        </div>
                                        <span className="text-[9px] font-black text-news-muted px-1.5 py-0.5 rounded-full bg-surface-base border border-border-divider flex-shrink-0">VS</span>
                                        <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
                                            <span className="text-xs font-bold text-white truncate text-right">{tB?.name || c.tool_b_slug}</span>
                                            {tB?.logo && <img src={tB.logo} alt={tB.name} className="w-6 h-6 rounded-md object-contain flex-shrink-0" loading="lazy" />}
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-news-muted group-hover:text-news-accent transition-colors flex items-center gap-1">Read comparison <ArrowRight size={9} /></p>
                                </button>
                            );
                        })}
                    </HScrollRow>
                </div>
            )}

            {/* Category filter + Sort */}
            <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-surface-card rounded-2xl border border-border-subtle shadow-elevation">
                <div className="flex flex-wrap gap-2 flex-1">
                    {COMP_CATEGORIES.map(cat => (
                        <button key={cat} onClick={() => setCatFilter(cat)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                                catFilter === cat ? 'bg-news-accent text-white border-news-accent' : 'bg-surface-base border-border-subtle text-news-muted hover:text-white hover:bg-surface-hover'
                            }`}>{cat}</button>
                    ))}
                </div>
                <div className="relative flex-shrink-0">
                    <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
                        className="appearance-none bg-surface-base border border-border-subtle text-news-muted text-xs font-bold rounded-xl px-3 py-2 pr-7 focus:outline-none focus:border-news-accent cursor-pointer"
                    >
                        <option value="popular">Most Popular</option>
                        <option value="newest">Newest</option>
                        <option value="rated">Highest Rated</option>
                    </select>
                    <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-news-muted pointer-events-none" />
                </div>
            </div>

            {/* Count */}
            <p className="text-xs text-news-muted uppercase tracking-widest mb-6">{sorted.length} Comparisons</p>

            {/* Comparison Grid */}
            {comparisons.length === 0 ? <EmptyState hub="comparisons" /> : sorted.length === 0 ? (
                <div className="text-center py-16 text-gray-500 border border-dashed border-border-subtle rounded-2xl">No comparisons in this category yet.</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {sorted.map(c => {
                        const tA = c.tool_a;
                        const tB = c.tool_b;
                        const catTag = tA?.category_tags?.[0] || tB?.category_tags?.[0];
                        return (
                            <button
                                key={c.id}
                                onClick={() => onComparisonClick(c.slug)}
                                className="group text-left bg-surface-card border border-border-subtle shadow-elevation hover:border-border-divider hover:shadow-elevation-hover hover:bg-surface-hover hover:-translate-y-0.5 rounded-2xl p-5 transition-all flex flex-col"
                            >
                                {/* Tool A vs Tool B logos */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
                                        <div className="flex items-center gap-2 w-full bg-surface-base/50 p-2 rounded-lg border border-border-subtle">
                                            {tA?.logo && <img src={tA.logo} alt={tA.name} className="w-7 h-7 rounded-md object-contain flex-shrink-0" loading="lazy" />}
                                            <span className="text-xs font-bold text-white truncate">{tA?.name || c.tool_a_slug}</span>
                                        </div>
                                        {tA?.rating_score > 0 && (
                                            <span className="text-[9px] font-bold text-news-accent flex items-center gap-0.5">
                                                <Star size={8} className="fill-news-accent" />{tA.rating_score.toFixed(1)}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-[10px] font-black text-news-muted px-2 py-1 rounded-full bg-surface-base border border-border-divider shadow-sm flex-shrink-0">VS</span>
                                    <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
                                        <div className="flex items-center gap-2 justify-end w-full bg-surface-base/50 p-2 rounded-lg border border-border-subtle">
                                            <span className="text-xs font-bold text-white truncate text-right">{tB?.name || c.tool_b_slug}</span>
                                            {tB?.logo && <img src={tB.logo} alt={tB.name} className="w-7 h-7 rounded-md object-contain flex-shrink-0" loading="lazy" />}
                                        </div>
                                        {tB?.rating_score > 0 && (
                                            <span className="text-[9px] font-bold text-news-accent flex items-center gap-0.5">
                                                <Star size={8} className="fill-news-accent" />{tB.rating_score.toFixed(1)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Category tag */}
                                {catTag && <span className="text-[9px] px-2 py-0.5 rounded-full bg-surface-base border border-border-subtle text-news-muted mb-3 self-start">{catTag}</span>}

                                {/* Title + verdict */}
                                <h3 className="text-sm font-bold text-white leading-snug mb-2 group-hover:text-news-accent transition-colors flex-1">{c.title}</h3>
                                {c.verdict && <p className="text-xs text-news-text line-clamp-2 mb-4">{c.verdict}</p>}

                                {/* CTA */}
                                <div className="pt-3 border-t border-border-divider mt-auto">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-news-accent flex items-center gap-1 group-hover:text-white transition-colors">
                                        Read comparison <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Related Rankings */}
            {relatedRankings.length > 0 && (
                <div className="mt-16 pt-10 border-t border-border-divider">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-news-muted mb-5">Related Rankings</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {relatedRankings.map(a => (
                            <button key={a.id} onClick={() => onArticleClick(a)}
                                className="group text-left bg-surface-card border border-border-subtle rounded-2xl p-4 hover:bg-surface-hover hover:-translate-y-0.5 hover:border-border-divider transition-all shadow-elevation"
                            >
                                <p className="text-[9px] font-bold uppercase tracking-widest text-news-accent mb-2">Best Of</p>
                                <h4 className="text-sm font-bold text-white group-hover:text-news-accent transition-colors leading-snug line-clamp-2">{a.title}</h4>
                                <span className="text-[10px] text-news-muted flex items-center gap-1 mt-2 group-hover:text-white transition-colors">View ranking <ArrowRight size={9} /></span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Reviews Hub ──────────────────────────────────────────────────────────────
const REVIEW_CATEGORIES = ['All', 'AI Writing', 'Productivity', 'Automation', 'Developer Tools', 'CRM', 'Marketing Tools'];

const ReviewsHub: React.FC<{
    articles: Article[];
    onArticleClick: (a: Article) => void;
    onComparisonClick: (s: string) => void;
}> = ({ articles, onArticleClick, onComparisonClick }) => {
    const [tools, setTools] = useState<Tool[]>([]);
    const [comparisons, setComparisons] = useState<Comparison[]>([]);
    const [catFilter, setCatFilter] = useState('All');
    const [sortBy, setSortBy] = useState<'newest' | 'highest-rated'>('newest');

    useEffect(() => {
        fetch('/api/tools').then(r => r.json()).then(setTools).catch(() => {});
        fetch('/api/comparisons').then(r => r.json()).then(setComparisons).catch(() => {});
    }, []);

    const reviews = articles.filter(a => {
        const type = (a as any).article_type;
        const cats = Array.isArray(a.category) ? a.category : [a.category];
        return type === 'review' || cats.some(c => c === 'Reviews');
    });

    // Enrich each review with its primary tool
    const enriched = reviews.map(a => {
        const slugs: string[] = (a as any).primary_tools || [];
        const tool = tools.find(t => slugs.includes(t.slug)) || null;
        return { article: a, tool };
    });

    // Filter by category
    const categoryFiltered = enriched.filter(({ tool, article }) => {
        if (catFilter === 'All') return true;
        if (tool) return tool.category_tags?.some(c => c.toLowerCase().includes(catFilter.toLowerCase()));
        const cats = Array.isArray(article.category) ? article.category : [article.category];
        return cats.some(c => c.toLowerCase().includes(catFilter.toLowerCase()));
    });

    // Sort
    const sorted = [...categoryFiltered].sort((a, b) => {
        if (sortBy === 'highest-rated') {
            const rA = a.tool?.rating_score || (a.article as any).rating_score || 0;
            const rB = b.tool?.rating_score || (b.article as any).rating_score || 0;
            return rB - rA;
        }
        return 0; // newest = natural order from API
    });

    // Top reviewed tools strip — unique tools from all reviews
    const topTools: { tool: Tool; article: Article }[] = [];
    enriched.forEach(({ tool, article }) => {
        if (tool && !topTools.find(t => t.tool.slug === tool.slug)) {
            topTools.push({ tool, article });
        }
    });

    // Best-of articles for Related Rankings
    const relatedRankings = articles.filter(a => {
        const type = (a as any).article_type;
        return type === 'best-of';
    }).slice(0, 4);

    return (
        <div>
            {/* Top Reviewed Tools strip */}
            {topTools.length >= 2 && (
                <div className="mb-10">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-news-muted mb-4">Top Reviewed Tools</p>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {topTools.slice(0, 6).map(({ tool, article }) => (
                            <button
                                key={tool.slug}
                                onClick={() => onArticleClick(article)}
                                className="group flex-shrink-0 flex items-center gap-3 px-4 py-3 bg-surface-card border border-border-subtle rounded-2xl hover:border-news-accent/50 hover:bg-surface-hover transition-all shadow-elevation"
                            >
                                {tool.logo ? (
                                    <div className="w-8 h-8 rounded-lg bg-surface-base border border-border-subtle overflow-hidden flex-shrink-0">
                                        <img src={tool.logo} alt={tool.name} className="w-full h-full object-contain p-0.5" loading="lazy" />
                                    </div>
                                ) : (
                                    <div className="w-8 h-8 rounded-lg bg-surface-base border border-border-subtle flex items-center justify-center text-xs font-black text-news-muted flex-shrink-0">
                                        {tool.name[0]}
                                    </div>
                                )}
                                <div className="text-left">
                                    <p className="text-sm font-bold text-white group-hover:text-news-accent transition-colors whitespace-nowrap">{tool.name}</p>
                                    <div className="flex items-center gap-1.5">
                                        {tool.rating_score > 0 && (
                                            <span className="text-[10px] font-bold text-news-accent flex items-center gap-0.5">
                                                <Star size={9} className="fill-news-accent" />{tool.rating_score.toFixed(1)}
                                            </span>
                                        )}
                                        <span className="text-[9px] text-news-muted">{tool.category_tags?.[0]}</span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Filter & Sort bar */}
            <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-surface-card rounded-2xl border border-border-subtle shadow-elevation">
                <div className="flex items-center gap-2 text-xs text-news-muted font-bold uppercase tracking-widest mr-2">
                    <Filter size={12} /> Filter
                </div>
                <div className="flex flex-wrap gap-2 flex-1">
                    {REVIEW_CATEGORIES.map(c => (
                        <button
                            key={c}
                            onClick={() => setCatFilter(c)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors shadow-sm ${
                                catFilter === c
                                    ? 'bg-news-accent text-white border-news-accent'
                                    : 'bg-surface-base border-border-subtle text-news-muted hover:text-white hover:bg-surface-hover'
                            }`}
                        >
                            {c}
                        </button>
                    ))}
                </div>
                <div className="flex-shrink-0">
                    <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value as any)}
                        className="bg-surface-base border border-border-subtle text-news-muted text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none focus:border-news-accent cursor-pointer"
                    >
                        <option value="newest">Newest</option>
                        <option value="highest-rated">Highest Rated</option>
                    </select>
                </div>
            </div>

            {/* Count */}
            <p className="text-xs text-news-muted uppercase tracking-widest mb-6">{sorted.length} Tools Reviewed</p>

            {/* Review card grid */}
            {sorted.length === 0 ? <EmptyState hub="reviews" /> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sorted.map(({ article, tool }) => {
                        const rating = tool?.rating_score || (article as any).rating_score || 0;
                        const category = tool?.category_tags?.[0] ||
                            (Array.isArray(article.category) ? article.category[0] : article.category);

                        // Find comparisons for this tool
                        const relatedComps = comparisons.filter(c =>
                            tool && (c.tool_a_slug === tool.slug || c.tool_b_slug === tool.slug)
                        ).slice(0, 3);

                        return (
                            <div key={article.id} className="group bg-surface-card border border-border-subtle shadow-elevation hover:shadow-elevation-hover hover:bg-surface-hover hover:-translate-y-0.5 rounded-2xl transition-all flex flex-col overflow-hidden">
                                {/* Image with logo badge */}
                                {article.imageUrl && (
                                    <button onClick={() => onArticleClick(article)} className="relative w-full aspect-video bg-surface-base overflow-hidden flex-shrink-0">
                                        <img
                                            src={article.imageUrl}
                                            alt={article.title}
                                            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                                            loading="lazy"
                                        />
                                        {tool?.logo && (
                                            <div className="absolute top-2 left-2 w-9 h-9 rounded-xl bg-surface-card border border-border-subtle shadow-elevation overflow-hidden p-1">
                                                <img src={tool.logo} alt={tool.name} className="w-full h-full object-contain" />
                                            </div>
                                        )}
                                    </button>
                                )}

                                {/* Card body */}
                                <button onClick={() => onArticleClick(article)} className="flex-1 flex flex-col p-4 text-left">
                                    {/* Tool identity row */}
                                    <div className="flex items-center gap-2.5 mb-3">
                                        {!article.imageUrl && tool?.logo && (
                                            <div className="w-9 h-9 rounded-xl bg-surface-base border border-border-subtle overflow-hidden flex-shrink-0 p-1">
                                                <img src={tool.logo} alt={tool.name} className="w-full h-full object-contain" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {tool && <span className="text-sm font-bold text-white">{tool.name}</span>}
                                                {rating > 0 && (
                                                    <span className="flex items-center gap-0.5 text-xs font-bold text-news-accent">
                                                        <Star size={10} className="fill-news-accent" />{rating.toFixed(1)}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-surface-base border border-border-subtle text-news-muted">{category}</span>
                                        </div>
                                        {tool?.starting_price && (
                                            <span className="text-[9px] text-news-muted whitespace-nowrap flex-shrink-0">From {tool.starting_price}</span>
                                        )}
                                    </div>

                                    {/* Article title & excerpt */}
                                    <h3 className="font-bold text-white group-hover:text-news-accent transition-colors leading-snug mb-2 line-clamp-2">{article.title}</h3>
                                    <p className="text-news-text text-sm line-clamp-2 flex-1">{article.excerpt}</p>
                                </button>

                                {/* Compare with links */}
                                {relatedComps.length > 0 && (
                                    <div className="px-4 pb-4 pt-0">
                                        <div className="border-t border-border-divider pt-3">
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-news-muted mb-2">Compare with</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {relatedComps.map(comp => {
                                                    const otherSlug = comp.tool_a_slug === tool?.slug ? comp.tool_b_slug : comp.tool_a_slug;
                                                    const otherTool = tools.find(t => t.slug === otherSlug);
                                                    return (
                                                        <button
                                                            key={comp.slug}
                                                            onClick={() => onComparisonClick(comp.slug)}
                                                            className="text-[10px] font-medium text-news-accent hover:text-white border border-border-subtle hover:border-news-accent/50 rounded-full px-2.5 py-1 bg-surface-base transition-colors flex items-center gap-1"
                                                        >
                                                            {otherTool?.logo && (
                                                                <img src={otherTool.logo} alt={otherTool.name} className="w-3.5 h-3.5 rounded-sm object-contain" />
                                                            )}
                                                            {otherTool?.name || otherSlug}
                                                            <ArrowRight size={9} />
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Related Rankings */}
            {relatedRankings.length > 0 && (
                <div className="mt-16 pt-10 border-t border-border-divider">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-news-muted mb-5">Related Rankings</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {relatedRankings.map(a => (
                            <button
                                key={a.id}
                                onClick={() => onArticleClick(a)}
                                className="group text-left bg-surface-card border border-border-subtle rounded-2xl p-4 hover:bg-surface-hover hover:-translate-y-0.5 hover:border-border-divider transition-all shadow-elevation"
                            >
                                <p className="text-[9px] font-bold uppercase tracking-widest text-news-accent mb-2">Best Of</p>
                                <h4 className="text-sm font-bold text-white group-hover:text-news-accent transition-colors leading-snug line-clamp-2">{a.title}</h4>
                                <span className="text-[10px] text-news-muted flex items-center gap-1 mt-2 group-hover:text-white transition-colors">View ranking <ArrowRight size={9} /></span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Use Cases Hub ────────────────────────────────────────────────────────────
const WORKFLOW_CATEGORIES = [
    { label: 'Content Creation',      icon: PenLine,    filter: 'content' },
    { label: 'Marketing Automation',  icon: Megaphone,  filter: 'marketing' },
    { label: 'Software Development',  icon: Code2,      filter: 'development' },
    { label: 'Startup Operations',    icon: Rocket,     filter: 'startup' },
    { label: 'Knowledge Management',  icon: Brain,      filter: 'knowledge' },
    { label: 'Customer Support',      icon: Headphones, filter: 'customer' },
];
const INDUSTRY_FILTERS = ['All', 'Developers', 'Marketing', 'Startups', 'Content Creators', 'Small Business'];
const WORKFLOW_TYPE_FILTERS = ['All', 'Automation', 'AI Integration', 'Productivity', 'Research'];

const UseCasesHubInner: React.FC<{
    articles: Article[];
    onArticleClick: (a: Article) => void;
}> = ({ articles, onArticleClick }) => {
    const [allTools, setAllTools] = useState<Tool[]>([]);
    const [catFilter, setCatFilter] = useState('');
    const [industryFilter, setIndustryFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');
    const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'tools'>('popular');

    useEffect(() => {
        fetch('/api/tools').then(r => r.json()).then(setAllTools).catch(() => {});
    }, []);

    const toolMap = React.useMemo(() => {
        const m: Record<string, Tool> = {};
        allTools.forEach(t => { m[t.slug] = t; });
        return m;
    }, [allTools]);

    const useCases = articles.filter(a => (a as any).article_type === 'use-case');
    const relatedRankings = articles.filter(a => (a as any).article_type === 'best-of').slice(0, 4);
    const popularWorkflows = useCases.filter(a => a.isFeaturedDiscover || (a as any).isFeaturedCategory).slice(0, 4);
    const featuredWorkflow = useCases.find(a => a.isFeaturedDiscover) || useCases[0];

    const matchesCat = (a: Article) => {
        if (!catFilter) return true;
        return `${a.title} ${a.excerpt} ${a.topic}`.toLowerCase().includes(catFilter);
    };
    const matchesIndustry = (a: Article) => {
        if (industryFilter === 'All') return true;
        const q = industryFilter.toLowerCase().replace(' creators', '').replace(' business', '');
        return `${a.title} ${a.excerpt} ${a.topic}`.toLowerCase().includes(q);
    };
    const matchesType = (a: Article) => {
        if (typeFilter === 'All') return true;
        return `${a.title} ${a.excerpt} ${a.topic}`.toLowerCase().includes(typeFilter.toLowerCase().replace(' integration', ''));
    };

    const filtered = useCases.filter(a => matchesCat(a) && matchesIndustry(a) && matchesType(a));
    const sorted = [...filtered].sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (sortBy === 'tools') return (b.primary_tools?.length || 0) - (a.primary_tools?.length || 0);
        return 0;
    });
    const hasFilter = catFilter || industryFilter !== 'All' || typeFilter !== 'All';

    if (useCases.length === 0) return <EmptyState hub="use-cases" />;

    return (
        <div>
            {/* Workflow Category Explorer */}
            <div className="mb-10">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-news-muted mb-4">Explore Workflows by Category</p>
                <HScrollRow>
                    {WORKFLOW_CATEGORIES.map(({ label, icon: Icon, filter }) => (
                        <button
                            key={label}
                            onClick={() => setCatFilter(catFilter === filter ? '' : filter)}
                            className={`group flex-shrink-0 flex flex-col items-center gap-2 px-5 py-4 rounded-2xl border transition-all shadow-elevation min-w-[110px] ${
                                catFilter === filter
                                    ? 'bg-news-accent/10 border-news-accent/50 text-news-accent'
                                    : 'bg-surface-card border-border-subtle hover:bg-surface-hover hover:border-border-divider text-news-muted hover:text-white'
                            }`}
                        >
                            <Icon size={20} className="flex-shrink-0" />
                            <span className="text-xs font-bold text-center leading-tight">{label}</span>
                            <span className="text-[9px] opacity-60">
                                {useCases.filter(a => `${a.title} ${a.excerpt} ${a.topic}`.toLowerCase().includes(filter)).length} workflows
                            </span>
                        </button>
                    ))}
                </HScrollRow>
            </div>

            {/* Popular Workflows strip */}
            {popularWorkflows.length >= 2 && (
                <div className="mb-10">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-news-muted mb-4">Popular Workflows</p>
                    <HScrollRow>
                        {popularWorkflows.map(a => (
                            <button
                                key={a.id}
                                onClick={() => onArticleClick(a)}
                                className="group flex-shrink-0 w-60 text-left bg-surface-card border border-border-subtle rounded-2xl overflow-hidden hover:border-news-accent/40 hover:bg-surface-hover transition-all shadow-elevation"
                            >
                                {a.imageUrl && (
                                    <div className="w-full h-28 overflow-hidden">
                                        <img src={a.imageUrl} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                                    </div>
                                )}
                                <div className="p-3">
                                    <p className="text-xs font-bold text-white leading-snug line-clamp-2 group-hover:text-news-accent transition-colors mb-1">{a.title}</p>
                                    <span className="text-[10px] text-news-muted flex items-center gap-1 group-hover:text-news-accent transition-colors">Read workflow <ArrowRight size={9} /></span>
                                </div>
                            </button>
                        ))}
                    </HScrollRow>
                </div>
            )}

            {/* Featured Workflow */}
            {featuredWorkflow && (
                <div className="mb-10">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-news-muted mb-4">Featured Workflow</p>
                    <button
                        onClick={() => onArticleClick(featuredWorkflow)}
                        className="group w-full text-left bg-surface-card border border-border-subtle rounded-2xl overflow-hidden hover:border-news-accent/30 hover:bg-surface-hover transition-all shadow-elevation flex flex-col lg:flex-row"
                    >
                        {featuredWorkflow.imageUrl && (
                            <div className="lg:w-2/5 h-52 lg:h-auto overflow-hidden flex-shrink-0">
                                <img src={featuredWorkflow.imageUrl} alt={featuredWorkflow.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" loading="lazy" />
                            </div>
                        )}
                        <div className="p-6 flex flex-col justify-center flex-1">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-news-accent mb-2">Featured Workflow</span>
                            <h2 className="text-lg font-black text-white leading-snug mb-3 group-hover:text-news-accent transition-colors line-clamp-2">{featuredWorkflow.title}</h2>
                            <p className="text-sm text-news-text line-clamp-3 mb-4">{featuredWorkflow.excerpt}</p>
                            {featuredWorkflow.primary_tools && featuredWorkflow.primary_tools.length > 0 && (
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-news-muted">Tools:</span>
                                    {featuredWorkflow.primary_tools.slice(0, 5).map(slug => {
                                        const t = toolMap[slug];
                                        return t ? (
                                            <div key={slug} className="flex items-center gap-1 bg-surface-base border border-border-subtle rounded-lg px-2 py-1">
                                                {t.logo && <img src={t.logo} alt={t.name} className="w-4 h-4 rounded object-contain" loading="lazy" />}
                                                <span className="text-[9px] font-bold text-news-muted">{t.name}</span>
                                            </div>
                                        ) : (
                                            <span key={slug} className="text-[9px] px-2 py-1 bg-surface-base border border-border-subtle rounded-lg text-news-muted">{slug}</span>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </button>
                </div>
            )}

            {/* Filter bar */}
            <div className="mb-6 p-4 bg-surface-card rounded-2xl border border-border-subtle shadow-elevation space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-news-muted w-20 flex-shrink-0">Industry</span>
                    <div className="flex flex-wrap gap-2 flex-1">
                        {INDUSTRY_FILTERS.map(f => (
                            <button key={f} onClick={() => setIndustryFilter(f)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                                    industryFilter === f ? 'bg-news-accent text-white border-news-accent' : 'bg-surface-base border-border-subtle text-news-muted hover:text-white hover:bg-surface-hover'
                                }`}>{f}</button>
                        ))}
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-news-muted w-20 flex-shrink-0">Type</span>
                    <div className="flex flex-wrap gap-2 flex-1">
                        {WORKFLOW_TYPE_FILTERS.map(f => (
                            <button key={f} onClick={() => setTypeFilter(f)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                                    typeFilter === f ? 'bg-news-accent text-white border-news-accent' : 'bg-surface-base border-border-subtle text-news-muted hover:text-white hover:bg-surface-hover'
                                }`}>{f}</button>
                        ))}
                    </div>
                    <div className="relative flex-shrink-0 ml-auto">
                        <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
                            className="appearance-none bg-surface-base border border-border-subtle text-news-muted text-xs font-bold rounded-xl px-3 py-2 pr-7 focus:outline-none focus:border-news-accent cursor-pointer"
                        >
                            <option value="popular">Most Popular</option>
                            <option value="newest">Newest</option>
                            <option value="tools">Most Tools Used</option>
                        </select>
                        <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-news-muted pointer-events-none" />
                    </div>
                </div>
                {hasFilter && (
                    <button onClick={() => { setCatFilter(''); setIndustryFilter('All'); setTypeFilter('All'); }}
                        className="text-[10px] font-bold text-news-muted hover:text-white transition-colors">
                        &times; Clear all filters
                    </button>
                )}
            </div>

            {/* Count */}
            <p className="text-xs text-news-muted uppercase tracking-widest mb-6">{sorted.length} Workflows</p>

            {/* Workflow Grid */}
            {sorted.length === 0 ? (
                <div className="text-center py-16 text-gray-500 border border-dashed border-border-subtle rounded-2xl">No workflows match your filters.</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {sorted.map(a => {
                        const toolSlugs = a.primary_tools?.slice(0, 4) || [];
                        return (
                            <button
                                key={a.id}
                                onClick={() => onArticleClick(a)}
                                className="group text-left bg-surface-card border border-border-subtle shadow-elevation hover:border-border-divider hover:shadow-elevation-hover hover:bg-surface-hover hover:-translate-y-0.5 rounded-2xl overflow-hidden transition-all flex flex-col"
                            >
                                {a.imageUrl && (
                                    <div className="w-full h-40 overflow-hidden flex-shrink-0">
                                        <img src={a.imageUrl} alt={a.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" loading="lazy" />
                                    </div>
                                )}
                                <div className="p-4 flex flex-col flex-1">
                                    <h3 className="font-bold text-white group-hover:text-news-accent transition-colors leading-snug mb-2 line-clamp-2 flex-1">{a.title}</h3>
                                    <p className="text-news-text text-xs line-clamp-2 mb-3">{a.excerpt}</p>
                                    {toolSlugs.length > 0 && (
                                        <div className="flex items-center gap-1.5 flex-wrap mb-3">
                                            <span className="text-[8px] font-bold uppercase tracking-widest text-news-muted mr-1">Tools:</span>
                                            {toolSlugs.map(slug => {
                                                const t = toolMap[slug];
                                                return t?.logo ? (
                                                    <div key={slug} title={t.name} className="w-5 h-5 rounded bg-surface-base border border-border-subtle overflow-hidden flex-shrink-0">
                                                        <img src={t.logo} alt={t.name} className="w-full h-full object-contain p-0.5" loading="lazy" />
                                                    </div>
                                                ) : (
                                                    <span key={slug} className="text-[8px] px-1.5 py-0.5 bg-surface-base border border-border-subtle rounded text-news-muted">{slug}</span>
                                                );
                                            })}
                                        </div>
                                    )}
                                    <div className="pt-2 border-t border-border-divider mt-auto">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-news-accent flex items-center gap-1 group-hover:text-white transition-colors">
                                            Read Workflow <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                                        </span>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Related Rankings */}
            {relatedRankings.length > 0 && (
                <div className="mt-16 pt-10 border-t border-border-divider">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-news-muted mb-5">Related Rankings</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {relatedRankings.map(a => (
                            <button key={a.id} onClick={() => onArticleClick(a)}
                                className="group text-left bg-surface-card border border-border-subtle rounded-2xl p-4 hover:bg-surface-hover hover:-translate-y-0.5 hover:border-border-divider transition-all shadow-elevation"
                            >
                                <p className="text-[9px] font-bold uppercase tracking-widest text-news-accent mb-2">Best Of</p>
                                <h4 className="text-sm font-bold text-white group-hover:text-news-accent transition-colors leading-snug line-clamp-2">{a.title}</h4>
                                <span className="text-[10px] text-news-muted flex items-center gap-1 mt-2 group-hover:text-white transition-colors">View ranking <ArrowRight size={9} /></span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Guides Hub ───────────────────────────────────────────────────────────────
const GUIDE_TOPICS = [
    { label: 'AI Prompting',         icon: Brain,     filter: 'prompt' },
    { label: 'Workflow Automation',  icon: Workflow,  filter: 'automat' },
    { label: 'AI Coding',            icon: Code2,     filter: 'coding' },
    { label: 'Productivity Systems', icon: Layers,    filter: 'productiv' },
    { label: 'Marketing Automation', icon: Megaphone, filter: 'marketing' },
    { label: 'AI Content Creation',  icon: PenLine,   filter: 'content' },
];
const LEARNING_PATHS = [
    { title: 'AI Productivity Stack',   description: 'Master the core AI tools that supercharge daily work.',  tags: ['prompt', 'productiv', 'content'] },
    { title: 'Automation Fundamentals', description: 'Build automated workflows without writing code.',          tags: ['automat', 'marketing'] },
    { title: 'AI Coding Workflow',      description: 'Level up your development process with AI copilots.',     tags: ['coding'] },
];
const DIFFICULTY_COLORS: Record<string, string> = {
    Beginner:     'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Intermediate: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Advanced:     'bg-red-500/10 text-red-400 border-red-500/20',
};
const GUIDE_DIFFICULTY_FILTERS = ['All', 'Beginner', 'Intermediate', 'Advanced'];
const GUIDE_TOPIC_FILTERS = ['All', 'AI Prompting', 'Automation', 'Coding', 'Productivity'];

const GuidesHubInner: React.FC<{
    articles: Article[];
    onArticleClick: (a: Article) => void;
}> = ({ articles, onArticleClick }) => {
    const [allTools, setAllTools] = useState<Tool[]>([]);
    const [topicFilter, setTopicFilter] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState('All');
    const [topicPillFilter, setTopicPillFilter] = useState('All');
    const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'beginner'>('popular');

    useEffect(() => {
        fetch('/api/tools').then(r => r.json()).then(setAllTools).catch(() => {});
    }, []);

    const toolMap = React.useMemo(() => {
        const m: Record<string, Tool> = {};
        allTools.forEach(t => { m[t.slug] = t; });
        return m;
    }, [allTools]);

    const guides = articles.filter(a =>
        (a as any).article_type === 'guide' ||
        (Array.isArray(a.category) ? a.category : [a.category]).includes('Guides')
    );
    const relatedRankings = articles.filter(a => (a as any).article_type === 'best-of').slice(0, 4);
    const popularGuides = guides.filter(a => a.isFeaturedDiscover || (a as any).isFeaturedCategory).slice(0, 4);

    const inferDifficulty = (a: Article): string => {
        const kw = (a as any).difficulty || '';
        if (kw) return kw;
        const text = `${a.title} ${a.excerpt}`.toLowerCase();
        if (text.includes('advanced') || text.includes('deep dive') || text.includes('expert')) return 'Advanced';
        if (text.includes('intermediate') || text.includes('next level') || text.includes('in-depth')) return 'Intermediate';
        return 'Beginner';
    };

    const matchesTopic = (a: Article) => !topicFilter || `${a.title} ${a.excerpt} ${a.topic}`.toLowerCase().includes(topicFilter);
    const matchesDifficulty = (a: Article) => difficultyFilter === 'All' || inferDifficulty(a) === difficultyFilter;
    const matchesTopicPill = (a: Article) => {
        if (topicPillFilter === 'All') return true;
        const q = topicPillFilter.toLowerCase().replace('ai prompting', 'prompt');
        return `${a.title} ${a.excerpt} ${a.topic}`.toLowerCase().includes(q);
    };

    const filtered = guides.filter(a => matchesTopic(a) && matchesDifficulty(a) && matchesTopicPill(a));
    const sorted = [...filtered].sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (sortBy === 'beginner') {
            const order: Record<string, number> = { 'Beginner': 0, 'Intermediate': 1, 'Advanced': 2 };
            return (order[inferDifficulty(a)] ?? 0) - (order[inferDifficulty(b)] ?? 0);
        }
        return 0;
    });
    const hasFilter = topicFilter || difficultyFilter !== 'All' || topicPillFilter !== 'All';

    if (guides.length === 0) return <EmptyState hub="guides" />;

    return (
        <div>
            {/* Topic Explorer */}
            <div className="mb-10">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-news-muted mb-4">Explore Guides by Topic</p>
                <HScrollRow>
                    {GUIDE_TOPICS.map(({ label, icon: Icon, filter }) => (
                        <button
                            key={label}
                            onClick={() => setTopicFilter(topicFilter === filter ? '' : filter)}
                            className={`group flex-shrink-0 flex flex-col items-center gap-2 px-5 py-4 rounded-2xl border transition-all shadow-elevation min-w-[120px] ${
                                topicFilter === filter
                                    ? 'bg-news-accent/10 border-news-accent/50 text-news-accent'
                                    : 'bg-surface-card border-border-subtle hover:bg-surface-hover hover:border-border-divider text-news-muted hover:text-white'
                            }`}
                        >
                            <Icon size={20} className="flex-shrink-0" />
                            <span className="text-xs font-bold text-center leading-tight">{label}</span>
                            <span className="text-[9px] opacity-60">
                                {guides.filter(a => `${a.title} ${a.excerpt} ${a.topic}`.toLowerCase().includes(filter)).length} guides
                            </span>
                        </button>
                    ))}
                </HScrollRow>
            </div>

            {/* Learning Paths */}
            <div className="mb-10">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-news-muted mb-4">Learning Paths</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {LEARNING_PATHS.map(path => {
                        const count = guides.filter(a =>
                            path.tags.some(tag => `${a.title} ${a.excerpt} ${a.topic}`.toLowerCase().includes(tag))
                        ).length;
                        return (
                            <div key={path.title} className="flex flex-col bg-surface-card border border-border-subtle rounded-2xl p-5 shadow-elevation hover:border-border-divider hover:bg-surface-hover transition-all">
                                <div className="flex items-center gap-2 mb-3">
                                    <GraduationCap size={16} className="text-news-accent flex-shrink-0" />
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-news-accent">Learning Path</p>
                                </div>
                                <h3 className="text-sm font-black text-white leading-snug mb-2">{path.title}</h3>
                                <p className="text-xs text-news-text flex-1 mb-3">{path.description}</p>
                                <span className="text-[9px] font-bold text-news-muted">{count} guide{count !== 1 ? 's' : ''} in this path</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Popular Guides strip */}
            {popularGuides.length >= 2 && (
                <div className="mb-10">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-news-muted mb-4">Popular Guides</p>
                    <HScrollRow>
                        {popularGuides.map(a => (
                            <button key={a.id} onClick={() => onArticleClick(a)}
                                className="group flex-shrink-0 w-60 text-left bg-surface-card border border-border-subtle rounded-2xl overflow-hidden hover:border-news-accent/40 hover:bg-surface-hover transition-all shadow-elevation"
                            >
                                {a.imageUrl && (
                                    <div className="w-full h-28 overflow-hidden">
                                        <img src={a.imageUrl} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                                    </div>
                                )}
                                <div className="p-3">
                                    <p className="text-xs font-bold text-white leading-snug line-clamp-2 group-hover:text-news-accent transition-colors mb-1">{a.title}</p>
                                    <span className="text-[10px] text-news-muted flex items-center gap-1 group-hover:text-news-accent transition-colors">Read guide <ArrowRight size={9} /></span>
                                </div>
                            </button>
                        ))}
                    </HScrollRow>
                </div>
            )}

            {/* Filter bar */}
            <div className="mb-6 p-4 bg-surface-card rounded-2xl border border-border-subtle shadow-elevation space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-news-muted w-20 flex-shrink-0">Difficulty</span>
                    <div className="flex flex-wrap gap-2 flex-1">
                        {GUIDE_DIFFICULTY_FILTERS.map(f => (
                            <button key={f} onClick={() => setDifficultyFilter(f)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                                    difficultyFilter === f ? 'bg-news-accent text-white border-news-accent' : 'bg-surface-base border-border-subtle text-news-muted hover:text-white hover:bg-surface-hover'
                                }`}>{f}</button>
                        ))}
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-news-muted w-20 flex-shrink-0">Topic</span>
                    <div className="flex flex-wrap gap-2 flex-1">
                        {GUIDE_TOPIC_FILTERS.map(f => (
                            <button key={f} onClick={() => setTopicPillFilter(f)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                                    topicPillFilter === f ? 'bg-news-accent text-white border-news-accent' : 'bg-surface-base border-border-subtle text-news-muted hover:text-white hover:bg-surface-hover'
                                }`}>{f}</button>
                        ))}
                    </div>
                    <div className="relative flex-shrink-0 ml-auto">
                        <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
                            className="appearance-none bg-surface-base border border-border-subtle text-news-muted text-xs font-bold rounded-xl px-3 py-2 pr-7 focus:outline-none focus:border-news-accent cursor-pointer"
                        >
                            <option value="popular">Most Popular</option>
                            <option value="newest">Newest</option>
                            <option value="beginner">Beginner First</option>
                        </select>
                        <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-news-muted pointer-events-none" />
                    </div>
                </div>
                {hasFilter && (
                    <button onClick={() => { setTopicFilter(''); setDifficultyFilter('All'); setTopicPillFilter('All'); }}
                        className="text-[10px] font-bold text-news-muted hover:text-white transition-colors">
                        &times; Clear all filters
                    </button>
                )}
            </div>

            <p className="text-xs text-news-muted uppercase tracking-widest mb-6">{sorted.length} Guides</p>

            {sorted.length === 0 ? (
                <div className="text-center py-16 text-gray-500 border border-dashed border-border-subtle rounded-2xl">No guides match your filters.</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {sorted.map(a => {
                        const difficulty = inferDifficulty(a);
                        const diffColor = DIFFICULTY_COLORS[difficulty] || DIFFICULTY_COLORS['Beginner'];
                        const toolSlugs = a.primary_tools?.slice(0, 4) || [];
                        return (
                            <button key={a.id} onClick={() => onArticleClick(a)}
                                className="group text-left bg-surface-card border border-border-subtle shadow-elevation hover:border-border-divider hover:shadow-elevation-hover hover:bg-surface-hover hover:-translate-y-0.5 rounded-2xl overflow-hidden transition-all flex flex-col"
                            >
                                {a.imageUrl && (
                                    <div className="w-full h-40 overflow-hidden flex-shrink-0">
                                        <img src={a.imageUrl} alt={a.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" loading="lazy" />
                                    </div>
                                )}
                                <div className="p-4 flex flex-col flex-1">
                                    <span className={`self-start text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border mb-2 ${diffColor}`}>{difficulty}</span>
                                    <h3 className="font-bold text-white group-hover:text-news-accent transition-colors leading-snug mb-2 line-clamp-2 flex-1">{a.title}</h3>
                                    <p className="text-news-text text-xs line-clamp-2 mb-3">{a.excerpt}</p>
                                    {toolSlugs.length > 0 && (
                                        <div className="flex items-center gap-1.5 flex-wrap mb-3">
                                            <span className="text-[8px] font-bold uppercase tracking-widest text-news-muted mr-1">Tools:</span>
                                            {toolSlugs.map(slug => {
                                                const t = toolMap[slug];
                                                return t?.logo ? (
                                                    <div key={slug} title={t.name} className="w-5 h-5 rounded bg-surface-base border border-border-subtle overflow-hidden flex-shrink-0">
                                                        <img src={t.logo} alt={t.name} className="w-full h-full object-contain p-0.5" loading="lazy" />
                                                    </div>
                                                ) : (
                                                    <span key={slug} className="text-[8px] px-1.5 py-0.5 bg-surface-base border border-border-subtle rounded text-news-muted">{slug}</span>
                                                );
                                            })}
                                        </div>
                                    )}
                                    <div className="pt-2 border-t border-border-divider mt-auto">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-news-accent flex items-center gap-1 group-hover:text-white transition-colors">
                                            Read Guide <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                                        </span>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            {relatedRankings.length > 0 && (
                <div className="mt-16 pt-10 border-t border-border-divider">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-news-muted mb-5">Related Rankings</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {relatedRankings.map(a => (
                            <button key={a.id} onClick={() => onArticleClick(a)}
                                className="group text-left bg-surface-card border border-border-subtle rounded-2xl p-4 hover:bg-surface-hover hover:-translate-y-0.5 hover:border-border-divider transition-all shadow-elevation"
                            >
                                <p className="text-[9px] font-bold uppercase tracking-widest text-news-accent mb-2">Best Of</p>
                                <h4 className="text-sm font-bold text-white group-hover:text-news-accent transition-colors leading-snug line-clamp-2">{a.title}</h4>
                                <span className="text-[10px] text-news-muted flex items-center gap-1 mt-2 group-hover:text-white transition-colors">View ranking <ArrowRight size={9} /></span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── News Hub ──────────────────────────────────────────────────────────────────
// TODO: Implement full news hub redesign (featured story, chronofeed, filters, etc.)
const NewsHubInner: React.FC<{
    articles: Article[];
    onArticleClick: (a: Article) => void;
}> = ({ articles, onArticleClick }) => {
    return <ArticleGridHub hub="news" articles={articles} onArticleClick={onArticleClick} />;
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
        if (hub === 'ai-tools') return <AIToolsHub onToolClick={onToolClick} articles={articles} onArticleClick={onArticleClick} />;
        if (hub === 'best-software') return <BestSoftwareHub articles={articles} onArticleClick={onArticleClick} />;
        if (hub === 'comparisons') return <ComparisonsHub onComparisonClick={onComparisonClick} articles={articles} onArticleClick={onArticleClick} />;
        if (hub === 'reviews') return <ReviewsHub articles={articles} onArticleClick={onArticleClick} onComparisonClick={onComparisonClick} />;
        if (hub === 'use-cases') return <UseCasesHubInner articles={articles} onArticleClick={onArticleClick} />;
        if (hub === 'guides') return <GuidesHubInner articles={articles} onArticleClick={onArticleClick} />;
        if (hub === 'news') return <NewsHubInner articles={articles} onArticleClick={onArticleClick} />;
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
