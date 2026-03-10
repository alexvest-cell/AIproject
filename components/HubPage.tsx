import React, { useEffect, useState } from 'react';
import { Article, Tool, Comparison, Stack } from '../types';
import { ArrowRight, Star, Filter, PenLine, Code2, ImageIcon, Zap, Layers, LayoutGrid, Users, Megaphone, Search, X, ChevronDown, TrendingUp, Briefcase, BookOpen, Headphones, Rocket, Brain, GraduationCap, Workflow, Flame, Radio } from 'lucide-react';

type HubType = 'ai-tools' | 'best-software' | 'reviews' | 'comparisons' | 'use-cases' | 'guides' | 'news';

interface HubPageProps {
    hub: HubType;
    articles: Article[];
    onArticleClick: (article: Article) => void;
    onToolClick: (slug: string) => void;
    onComparisonClick: (slug: string) => void;
    onBack: () => void;
    workflowFilter?: string;
    queryString?: string;
    onStackClick?: (slug: string) => void;
}

const HUB_META: Record<HubType, { label: string; description: string; titleTag: string; articleType?: string; showTools?: boolean; showComparisons?: boolean }> = {
    'ai-tools': { 
        label: 'AI Tools', 
        description: 'Explore the leading AI and software tools across writing, productivity, automation, development, and more. Filter by category, pricing, and use case to find the right tool for your workflow.', 
        titleTag: 'AI Tools Directory: Top-Rated Software & Solutions (2026)',
        showTools: true 
    },
    'best-software': { 
        label: 'Best Software', 
        description: 'Explore curated rankings of the best AI tools and software platforms across productivity, automation, development, marketing, and more.', 
        titleTag: 'Best AI Software & Tools: 2026 Rankings & Reviews',
        articleType: 'best-of' 
    },
    'reviews': { 
        label: 'Reviews', 
        description: 'Independent, in-depth evaluations of modern software tools. Each review analyzes features, pricing, performance, and real-world use cases.', 
        titleTag: 'Software Reviews: Unbiased AI & Tool Evaluations',
        articleType: 'review' 
    },
    'comparisons': { 
        label: 'Comparisons', 
        description: 'Compare the leading AI and software tools side-by-side to find the best option for your workflow.', 
        titleTag: 'AI Tool Comparisons: Compare Side-by-Side',
        showComparisons: true 
    },
    'use-cases': { 
        label: 'Use Cases', 
        description: 'Explore real-world workflows showing how modern teams combine AI and software tools to automate tasks, improve productivity, and build smarter systems.', 
        titleTag: 'AI Use Cases & Workflows: Practical Implementations',
        articleType: 'use-case' 
    },
    'guides': { 
        label: 'Guides', 
        description: 'Step-by-step guides for mastering modern software tools, building smarter workflows, and automating everyday work.', 
        titleTag: 'Software Guides & Tutorials: Master Your Stack',
        articleType: 'guide' 
    },
    'news': { 
        label: 'News', 
        description: 'Breaking developments, product launches, and major updates across AI and modern software tools.', 
        titleTag: 'AI News & Software Updates: Latest Developments',
        articleType: 'news' 
    },
};

const ITEMS_PER_PAGE = 12;

// ─── Shared Components ────────────────────────────────────────────────────────

const HubHeader: React.FC<{ hub: HubType; onBack: () => void; titleOverride?: string }> = ({ hub, onBack, titleOverride }) => {
    const meta = HUB_META[hub];
    
    // SEO: Update document title
    useEffect(() => {
        document.title = `${titleOverride || meta.titleTag} | ToolCurrent`;
    }, [hub, titleOverride, meta]);

    return (
        <div className="bg-surface-alt border-b border-border-divider">
            <div className="container mx-auto px-4 md:px-8 pt-[140px] md:pt-[150px] pb-10 md:pb-12 text-center md:text-left">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-news-accent mb-2">ToolCurrent Directory</p>
                <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4 text-white leading-tight">{titleOverride || meta.label}</h1>
                <p className="text-news-text text-base md:text-lg max-w-2xl leading-relaxed mx-auto md:mx-0">{meta.description}</p>
                {hub === 'reviews' && (
                    <p className="text-xs text-news-muted mt-5 max-w-xl border-l-2 border-border-divider pl-4 mx-auto md:mx-0">
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

// ─── Workflow config: category filters + display names ────────────────────────
const WORKFLOW_CONFIG: Record<string, {
    label: string;
    catFilter: string;
    relatedRankingKeywords: string[];
    relatedGuideKeywords: string[];
    relatedUseCaseKeywords: string[];
}> = {
    students:       { label: 'Students',      catFilter: 'Productivity',      relatedRankingKeywords: ['student', 'writing', 'note'],    relatedGuideKeywords: ['student', 'writing', 'productiv'],  relatedUseCaseKeywords: ['student', 'note', 'research'] },
    startups:       { label: 'Startups',      catFilter: 'Automation',        relatedRankingKeywords: ['startup', 'automati', 'crm'],     relatedGuideKeywords: ['startup', 'automat', 'growth'],     relatedUseCaseKeywords: ['startup', 'marketing', 'automat'] },
    developers:     { label: 'Developers',    catFilter: 'Developer Tools',   relatedRankingKeywords: ['coding', 'developer', 'ai cod'],  relatedGuideKeywords: ['coding', 'developer', 'github'],    relatedUseCaseKeywords: ['engineer', 'developer', 'coding'] },
    marketing:      { label: 'Marketers',     catFilter: 'Marketing',         relatedRankingKeywords: ['marketing', 'seo', 'writing'],    relatedGuideKeywords: ['marketing', 'seo', 'content'],      relatedUseCaseKeywords: ['marketing', 'content', 'seo'] },
    creators:       { label: 'Creators',      catFilter: 'AI Image',          relatedRankingKeywords: ['image', 'video', 'creative'],     relatedGuideKeywords: ['image', 'video', 'design'],         relatedUseCaseKeywords: ['creator', 'content', 'design'] },
    'small-business': { label: 'Small Business', catFilter: 'CRM',            relatedRankingKeywords: ['business', 'crm', 'automat'],    relatedGuideKeywords: ['business', 'crm', 'automat'],       relatedUseCaseKeywords: ['business', 'crm', 'automat'] },
    automation:     { label: 'Automation',    catFilter: 'Automation',        relatedRankingKeywords: ['automat', 'zapier', 'agent'],     relatedGuideKeywords: ['automat', 'zapier', 'make'],        relatedUseCaseKeywords: ['automat', 'workflow', 'agent'] },
    enterprise:     { label: 'Enterprise',    catFilter: 'CRM',               relatedRankingKeywords: ['enterprise', 'crm', 'project'],   relatedGuideKeywords: ['enterprise', 'project', 'security'], relatedUseCaseKeywords: ['enterprise', 'business', 'team'] },
};

const TRENDING_TOOL_SLUGS = ['chatgpt', 'claude', 'midjourney', 'notion', 'perplexity', 'runway'];

const POPULAR_CATEGORIES = [
    { label: 'AI Writing Tools',     icon: PenLine,      filter: 'AI Writing' },
    { label: 'AI Coding Tools',      icon: Code2,        filter: 'Developer Tools' },
    { label: 'AI Image Generators',  icon: ImageIcon,    filter: 'AI Image' },
    { label: 'AI Automation Tools',  icon: Zap,          filter: 'Automation' },
    { label: 'AI Productivity Tools', icon: Layers,       filter: 'Productivity' },
    { label: 'AI Marketing Tools',   icon: Megaphone,    filter: 'Marketing Tools' },
];

const AIToolsHub: React.FC<{
    onToolClick: (s: string) => void;
    articles: Article[];
    onArticleClick: (a: Article) => void;
    workflowFilter?: string;
    queryString?: string;
    onStackClick?: (slug: string) => void;
}> = ({ onToolClick, articles, onArticleClick, workflowFilter, queryString, onStackClick }) => {
    const [tools, setTools] = useState<Tool[]>([]);
    const [stacks, setStacks] = useState<Stack[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [pricingFilter, setPricingFilter] = useState('All');
    const wfConfig = workflowFilter ? WORKFLOW_CONFIG[workflowFilter] : null;
    const [catFilter, setCatFilter] = useState(wfConfig?.catFilter || 'All');
    const [useCaseFilter, setUseCaseFilter] = useState('All');
    const [sortBy, setSortBy] = useState<'rating' | 'popular' | 'newest' | 'price'>('rating');
    const [visibleCount, setVisibleCount] = useState(TOOLS_PER_PAGE);

    // Sync query string to filters
    useEffect(() => {
        if (workflowFilter && WORKFLOW_CONFIG[workflowFilter]) {
            setCatFilter(WORKFLOW_CONFIG[workflowFilter].catFilter || 'All');
            return;
        }

        const params = new URLSearchParams(queryString || '');
        const cat = params.get('category');
        const sort = params.get('sort');
        const price = params.get('pricing') || params.get('price');

        if (cat) {
            const low = cat.toLowerCase();
            if (low.includes('coding') || low.includes('developer')) setCatFilter('Developer Tools');
            else if (low.includes('writing')) setCatFilter('AI Writing');
            else if (low.includes('image')) setCatFilter('AI Image');
            else if (low.includes('automation')) setCatFilter('Automation');
            else if (low.includes('productivity')) setCatFilter('Productivity');
            else if (low.includes('crm')) setCatFilter('CRM');
            else if (low.includes('marketing')) setCatFilter('Marketing Tools');
            else setCatFilter('All');
        } else {
            setCatFilter('All');
        }

        if (sort === 'new' || sort === 'newest') setSortBy('newest');
        else if (sort === 'rating') setSortBy('rating');
        else setSortBy('rating');

        if (price) {
            const lowMatch = PRICING_OPTIONS.find(p => p.toLowerCase() === (price || '').toLowerCase());
            setPricingFilter(lowMatch || 'All');
        } else {
            setPricingFilter('All');
        }
    }, [queryString, workflowFilter]);

    useEffect(() => {
        fetch('/api/tools')
            .then(r => r.json())
            .then(d => { setTools(d); setLoading(false); })
            .catch(() => setLoading(false));

        fetch('/api/stacks')
            .then(r => r.ok ? r.json() : [])
            .then(d => setStacks(d))
            .catch(() => {});
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

    // Cross-hub recommendations for workflow
    const wfBestOf = wfConfig ? articles.filter(a => (a as any).article_type === 'best-of' &&
        wfConfig.relatedRankingKeywords.some(kw => `${a.title} ${a.excerpt}`.toLowerCase().includes(kw))).slice(0, 3) : [];
    const wfGuides = wfConfig ? articles.filter(a => (a as any).article_type === 'guide' &&
        wfConfig.relatedGuideKeywords.some(kw => `${a.title} ${a.excerpt}`.toLowerCase().includes(kw))).slice(0, 3) : [];
    const wfUseCases = wfConfig ? articles.filter(a => (a as any).article_type === 'use-case' &&
        wfConfig.relatedUseCaseKeywords.some(kw => `${a.title} ${a.excerpt}`.toLowerCase().includes(kw))).slice(0, 3) : [];

    // Recommended stack based on workflow
    const recommendedStack = wfConfig ? stacks.find(s => {
        const swf = s.workflow_category?.toLowerCase() || '';
        const l = wfConfig.label.toLowerCase();
        if (l.includes('develop') && swf.includes('develop')) return true;
        if (l.includes('market') && swf.includes('market')) return true;
        if (l.includes('startup') && swf.includes('startup')) return true;
        if (l.includes('creator') && (swf.includes('creation') || swf.includes('creator'))) return true;
        if (l.includes('automat') && swf.includes('automat')) return true;
        return false;
    }) : undefined;

    return (
        <div>
            {/* Workflow Banner — shown when arriving via a workflow button */}
            {wfConfig && (
                <div className="mb-8 p-5 rounded-2xl border border-news-accent/30 bg-news-accent/5 flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-news-accent mb-1">Workflow Discovery</p>
                            <h2 className="text-xl font-black text-white">Tools for {wfConfig.label}</h2>
                            <p className="text-sm text-news-muted mt-1">Showing tools relevant to your workflow. Use filters below to explore further.</p>
                        </div>
                        <button
                            onClick={() => setCatFilter('All')}
                            className="text-[10px] font-bold text-news-muted hover:text-white border border-border-subtle hover:border-border-divider rounded-lg px-3 py-2 transition-colors flex-shrink-0"
                        >
                            Clear workflow
                        </button>
                    </div>

                    {recommendedStack && onStackClick && (
                        <div className="mt-2 p-4 rounded-xl border border-border-subtle bg-surface-card flex flex-col md:flex-row items-center gap-4 justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-news-accent/10 flex items-center justify-center flex-shrink-0">
                                    <Layers className="text-news-accent" size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-news-muted mb-0.5">Recommended Stack</p>
                                    <h3 className="text-sm font-bold text-white leading-snug">{recommendedStack.name}</h3>
                                </div>
                            </div>
                            <button
                                onClick={() => onStackClick(recommendedStack.slug)}
                                className="w-full md:w-auto flex-shrink-0 px-4 py-2 rounded-lg bg-news-accent text-black font-bold text-[10px] uppercase tracking-widest hover:bg-news-accentHover transition-colors flex items-center justify-center gap-1"
                            >
                                View Stack <ArrowRight size={12} />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Popular AI Tool Categories */}
            {!wfConfig && !hasActiveFilters && (
                <div className="mb-12">
                    <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                        <LayoutGrid size={20} className="text-news-accent" /> Popular AI Tool Categories
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {POPULAR_CATEGORIES.map(({ label, icon: Icon, filter }) => {
                            const count = tools.filter(t => t.category_tags?.some(c => c.toLowerCase().includes(filter.toLowerCase()))).length;
                            return (
                                <button
                                    key={label}
                                    onClick={() => setCatFilter(filter)}
                                    className="group flex flex-col items-center justify-center p-6 bg-surface-card border border-border-subtle rounded-2xl hover:border-news-accent/50 hover:bg-surface-hover hover:-translate-y-1 transition-all shadow-elevation"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-surface-base border border-border-subtle flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Icon className="text-news-accent" size={24} />
                                    </div>
                                    <span className="text-[11px] font-black text-white uppercase tracking-wider text-center mb-1 group-hover:text-news-accent transition-colors">{label}</span>
                                    <span className="text-[10px] text-news-muted">{count} tools</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Trending AI Tools */}
            {!wfConfig && !hasActiveFilters && (
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-black text-white flex items-center gap-2">
                            <Flame size={20} className="text-news-accent" /> Trending AI Tools
                        </h2>
                    </div>
                    <HScrollRow>
                        {TRENDING_TOOL_SLUGS.map(slug => {
                            const tool = tools.find(t => t.slug === slug);
                            if (!tool) return null;
                            return (
                                <button
                                    key={tool.slug}
                                    onClick={() => onToolClick(tool.slug)}
                                    className="group flex-shrink-0 flex items-center gap-4 px-5 py-4 bg-surface-card border border-border-subtle rounded-2xl hover:border-news-accent/40 hover:bg-surface-hover transition-all shadow-elevation min-w-[240px]"
                                >
                                    {tool.logo ? (
                                        <div className="w-10 h-10 rounded-xl bg-surface-base border border-border-subtle overflow-hidden flex-shrink-0">
                                            <img src={tool.logo} alt={tool.name} className="w-full h-full object-contain p-1.5" loading="lazy" />
                                        </div>
                                    ) : (
                                        <div className="w-10 h-10 rounded-xl bg-surface-base border border-border-subtle flex items-center justify-center text-sm font-black text-news-muted flex-shrink-0">
                                            {tool.name[0]}
                                        </div>
                                    )}
                                    <div className="text-left">
                                        <p className="font-bold text-white group-hover:text-news-accent transition-colors">{tool.name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] text-news-muted">{tool.category_tags?.[0]}</span>
                                            {tool.rating_score > 0 && (
                                                <span className="text-[10px] font-bold text-news-accent flex items-center gap-0.5">
                                                    <Star size={9} className="fill-news-accent" />{tool.rating_score.toFixed(1)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </HScrollRow>
                </div>
            )}

            {/* Recently Added Tools (only on initial view) */}
            {!wfConfig && !hasActiveFilters && (
                <div className="mb-12">
                     <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                        <Zap size={20} className="text-news-accent" /> Recently Added
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[...tools].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 3).map(tool => (
                            <button
                                key={tool.id}
                                onClick={() => onToolClick(tool.slug)}
                                className="group flex items-center gap-4 p-5 bg-surface-card border border-border-subtle rounded-2xl hover:border-news-accent/30 hover:bg-surface-hover transition-all shadow-elevation text-left"
                            >
                                {tool.logo ? (
                                    <div className="w-10 h-10 rounded-xl bg-surface-base border border-border-subtle overflow-hidden flex-shrink-0 shadow-inner">
                                        <img src={tool.logo} alt={tool.name} className="w-full h-full object-contain p-1" loading="lazy" />
                                    </div>
                                ) : (
                                    <div className="w-10 h-10 rounded-xl bg-surface-base border border-border-subtle flex items-center justify-center text-base font-black text-news-muted flex-shrink-0 shadow-inner">
                                        {tool.name[0]}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-bold text-white truncate group-hover:text-news-accent transition-colors">{tool.name}</h3>
                                    <p className="text-[10px] text-news-muted truncate mt-0.5">{tool.short_description}</p>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-surface-base border border-border-subtle text-news-muted">{tool.category_tags?.[0]}</span>
                                        <span className="text-[9px] font-bold text-emerald-400">New</span>
                                    </div>
                                </div>
                                <ArrowRight size={14} className="text-news-muted group-hover:text-news-accent group-hover:translate-x-1 transition-all" />
                            </button>
                        ))}
                    </div>
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
                                <div className="pt-4 border-t border-border-divider flex items-center justify-between">
                                    <span className={`text-[10px] px-2.5 py-1 rounded-lg border font-bold ${
                                        tool.pricing_model === 'Free' || tool.pricing_model === 'Freemium'
                                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                                            : 'bg-blue-500/15 text-blue-400 border-blue-500/20'
                                    }`}>
                                        {tool.pricing_model}{tool.starting_price && tool.starting_price !== 'Free' ? ` · ${tool.starting_price}` : ''}
                                    </span>
                                    <span className="text-[10px] font-bold text-news-muted group-hover:text-white transition-colors flex items-center gap-1">
                                        View Tool <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
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

            {/* Cross-Hub Workflow Recommendations (workflow mode) */}
            {wfConfig && (wfBestOf.length > 0 || wfGuides.length > 0 || wfUseCases.length > 0) && (
                <div className="mt-16 pt-10 border-t border-border-divider space-y-10">
                    {wfBestOf.length > 0 && (
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-news-muted mb-4">Related Rankings for {wfConfig.label}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {wfBestOf.map(a => (
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
                    {wfGuides.length > 0 && (
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-news-muted mb-4">Related Guides for {wfConfig.label}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {wfGuides.map(a => (
                                    <button key={a.id} onClick={() => onArticleClick(a)}
                                        className="group text-left bg-surface-card border border-border-subtle rounded-2xl p-4 hover:bg-surface-hover hover:-translate-y-0.5 hover:border-border-divider transition-all shadow-elevation"
                                    >
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-blue-400 mb-2">Guide</p>
                                        <h4 className="text-sm font-bold text-white group-hover:text-news-accent transition-colors leading-snug line-clamp-2">{a.title}</h4>
                                        <span className="text-[10px] text-news-muted flex items-center gap-1 mt-2 group-hover:text-white transition-colors">Read guide <ArrowRight size={9} /></span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {wfUseCases.length > 0 && (
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-news-muted mb-4">Related Use Cases for {wfConfig.label}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {wfUseCases.map(a => (
                                    <button key={a.id} onClick={() => onArticleClick(a)}
                                        className="group text-left bg-surface-card border border-border-subtle rounded-2xl p-4 hover:bg-surface-hover hover:-translate-y-0.5 hover:border-border-divider transition-all shadow-elevation"
                                    >
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-400 mb-2">Use Case</p>
                                        <h4 className="text-sm font-bold text-white group-hover:text-news-accent transition-colors leading-snug line-clamp-2">{a.title}</h4>
                                        <span className="text-[10px] text-news-muted flex items-center gap-1 mt-2 group-hover:text-white transition-colors">Read workflow <ArrowRight size={9} /></span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Related Research & Insights (Structured) */}
            {!wfConfig && (
                <div className="mt-20 pt-12 border-t border-border-divider space-y-16">
                    {/* Related Rankings */}
                    {relatedRankings.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-black text-white flex items-center gap-2">
                                    <BookOpen size={20} className="text-news-accent" /> Expert Rankings
                                </h2>
                                <button className="text-[10px] font-bold text-news-muted hover:text-white transition-colors">View all rankings →</button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                                {relatedRankings.map(a => (
                                    <button
                                        key={a.id}
                                        onClick={() => onArticleClick(a)}
                                        className="group text-left bg-surface-card border border-border-subtle rounded-2xl p-5 hover:bg-surface-hover hover:-translate-y-1 hover:border-news-accent/30 transition-all shadow-elevation"
                                    >
                                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-news-accent mb-3">Best Of</p>
                                        <h4 className="font-bold text-white group-hover:text-news-accent transition-colors leading-snug mb-3 line-clamp-2">{a.title}</h4>
                                        <span className="text-[10px] text-news-muted flex items-center gap-1 group-hover:text-white transition-colors">
                                            View ranking <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Related Guides */}
                    {articles.filter(a => (a as any).article_type === 'guide').length > 0 && (
                        <div>
                             <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-black text-white flex items-center gap-2">
                                    <Workflow size={20} className="text-blue-400" /> Implementation Guides
                                </h2>
                                <button className="text-[10px] font-bold text-news-muted hover:text-white transition-colors">View all guides →</button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                {articles.filter(a => (a as any).article_type === 'guide').slice(0, 3).map(a => (
                                    <button
                                        key={a.id}
                                        onClick={() => onArticleClick(a)}
                                        className="group flex flex-col bg-surface-card border border-border-subtle rounded-2xl overflow-hidden hover:bg-surface-hover hover:-translate-y-1 hover:border-blue-400/30 transition-all shadow-elevation text-left"
                                    >
                                        {a.imageUrl && (
                                            <div className="w-full aspect-video overflow-hidden">
                                                <img src={a.imageUrl} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                                            </div>
                                        )}
                                        <div className="p-5">
                                            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-blue-400 mb-2">Guide</p>
                                            <h4 className="font-bold text-white group-hover:text-news-accent transition-colors leading-snug line-clamp-2">{a.title}</h4>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ─── Best Software Hub ──────────────────────────────────────────────────────────────
const RANKING_CATEGORY_EXPLORER = [
    { label: 'AI Tools',              icon: Brain,       filter: 'ai' },
    { label: 'Productivity Software', icon: Layers,      filter: 'productiv' },
    { label: 'Automation Platforms',  icon: Zap,         filter: 'automat' },
    { label: 'Developer Tools',       icon: Code2,       filter: 'dev' },
    { label: 'Marketing Software',    icon: Megaphone,   filter: 'market' },
    { label: 'Business Software',     icon: Briefcase,   filter: 'business' },
];

const RANKING_FILTERS = ['All', 'AI Tools', 'Productivity', 'Automation', 'Developer Tools', 'Marketing'];

const BestSoftwareHub: React.FC<{ 
    articles: Article[]; 
    onArticleClick: (a: Article) => void;
    workflowFilter?: string;
    queryString?: string;
}> = ({ articles, onArticleClick, workflowFilter, queryString }) => {
    const [allTools, setAllTools] = useState<Tool[]>([]);
    const [catFilter, setCatFilter] = useState('All');
    const [wfFilter, setWfFilter] = useState(workflowFilter || 'All');
    const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'most-tools'>('popular');

    // Sync query string to filters
    useEffect(() => {
        const params = new URLSearchParams(queryString || '');
        const cat = params.get('category');
        const wf = workflowFilter || params.get('workflow');

        if (cat) {
            const low = cat.toLowerCase();
            if (low.includes('ai-tools')) setCatFilter('AI Tools');
            else if (low.includes('productivity')) setCatFilter('Productivity');
            else if (low.includes('automation')) setCatFilter('Automation');
            else if (low.includes('developer')) setCatFilter('Developer Tools');
            else if (low.includes('marketing')) setCatFilter('Marketing');
            else if (low.includes('business')) setCatFilter('Business Software');
            else if (low.includes('writing')) setCatFilter('AI Writing');
            else if (low.includes('coding')) setCatFilter('AI Coding');
            else if (low.includes('crm')) setCatFilter('CRM');
            else setCatFilter('All');
        } else {
            setCatFilter('All');
        }

        if (wf) {
            setWfFilter(wf);
        } else {
            setWfFilter('All');
        }
    }, [queryString, workflowFilter]);

    useEffect(() => {
        fetch('/api/tools').then(r => r.json()).then(setAllTools).catch(() => {});
    }, []);

    const toolMap = React.useMemo(() => {
        const m: Record<string, Tool> = {};
        allTools.forEach(t => { m[t.slug] = t; });
        return m;
    }, [allTools]);

    const bestOf = articles.filter(a => (a as any).article_type === 'best-of');
    const reviews = articles.filter(a => (a as any).article_type === 'review').slice(0, 4);

    // Popular = featured or first 4
    const popularRankings = bestOf.filter(a => a.isFeaturedDiscover || (a as any).isFeaturedCategory).slice(0, 4)
        .concat(bestOf.slice(0, 4)).filter((v, i, arr) => arr.findIndex(x => x.id === v.id) === i).slice(0, 4);
    // New = last 3 added
    const newRankings = bestOf.slice(-3).reverse();

    const matchesCat = (a: Article) => {
        const text = `${a.title} ${a.excerpt} ${(a as any).topic || ''} ${(Array.isArray(a.category) ? a.category : [a.category]).join(' ')}`.toLowerCase();
        
        // Workflow filter (from query/mega menu)
        if (wfFilter !== 'All') {
            const wf = wfFilter.toLowerCase();
            if (!text.includes(wf)) return false;
        }

        // Category filter (chip/query)
        if (catFilter === 'All') return true;
        const q = catFilter.toLowerCase().replace(' tools', '').replace(' software', '').replace(' platforms', '');
        return text.includes(q);
    };

    const filtered = bestOf.filter(matchesCat);
    const sorted = [...filtered].sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
        if (sortBy === 'most-tools') return ((b as any).tools_reviewed || 0) - ((a as any).tools_reviewed || 0);
        return 0;
    });

    if (bestOf.length === 0) return <EmptyState hub="best-software" />;

    // Shared ranking card sub-component
    const RankingCard: React.FC<{ a: Article; index: number; large?: boolean }> = ({ a, index, large = false }) => {
        const toolSlugs: string[] = (a as any).primary_tools || [];
        const toolsReviewed: number = (a as any).tools_reviewed || toolSlugs.length || 0;
        const category = (Array.isArray(a.category) ? a.category[0] : a.category) || (a as any).topic || 'Rankings';
        return (
            <button
                onClick={() => onArticleClick(a)}
                className={`group w-full text-left bg-surface-card border border-border-subtle shadow-elevation hover:shadow-elevation-hover hover:bg-surface-hover hover:-translate-y-0.5 hover:border-news-accent/40 rounded-2xl transition-all flex flex-col ${large ? 'p-6' : 'p-4'}`}
            >
                <div className="flex items-start justify-between gap-3 mb-4">
                    <span className={`font-black text-white/10 group-hover:text-news-accent/20 transition-colors leading-none tabular-nums flex-shrink-0 ${large ? 'text-5xl' : 'text-4xl'}`}>
                        {(index + 1).toString().padStart(2, '0')}
                    </span>
                    {a.imageUrl && (
                        <div className="w-20 h-14 rounded-xl overflow-hidden border border-border-subtle flex-shrink-0">
                            <img src={a.imageUrl} alt={a.title} className="w-full h-full object-cover" loading="lazy" />
                        </div>
                    )}
                </div>
                <h3 className={`font-black text-white group-hover:text-news-accent transition-colors leading-snug mb-3 ${large ? 'text-lg' : 'text-sm'} line-clamp-2`}>
                    {a.title}
                </h3>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-surface-base border border-border-subtle text-news-muted mb-3 self-start">
                    {category}
                </span>
                {toolsReviewed > 0 && (
                    <p className="text-[10px] text-news-muted mb-3">{toolsReviewed} tools reviewed</p>
                )}
                {toolSlugs.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap mb-3">
                        <span className="text-[8px] font-bold uppercase tracking-widest text-news-muted mr-1">Top tools:</span>
                        {toolSlugs.slice(0, 4).map(slug => {
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
                <div className="mt-auto pt-3 border-t border-border-divider">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-news-accent flex items-center gap-1 group-hover:text-white transition-colors">
                        View ranking <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                    </span>
                </div>
            </button>
        );
    };

    return (
        <div className="space-y-16">
            {/* 1. Popular Rankings */}
            {popularRankings.length > 0 && (
                <section>
                    <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                        <TrendingUp size={20} className="text-news-accent" /> Popular Rankings
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {popularRankings.map((a, i) => <RankingCard key={a.id} a={a} index={i} large />)}
                    </div>
                </section>
            )}

            {/* 2. Category Explorer */}
            <section>
                <h2 className="text-xl font-black text-white mb-6">Explore Rankings by Category</h2>
                <HScrollRow>
                    {RANKING_CATEGORY_EXPLORER.map(({ label, icon: Icon, filter }) => {
                        const count = bestOf.filter(a => {
                            const text = `${a.title} ${a.excerpt} ${(a as any).topic || ''} ${(Array.isArray(a.category) ? a.category : [a.category]).join(' ')}`;
                            return text.toLowerCase().includes(filter);
                        }).length;
                        return (
                            <button
                                key={label}
                                onClick={() => setCatFilter(catFilter === label ? 'All' : label)}
                                className={`group flex-shrink-0 flex flex-col items-center gap-2 px-5 py-4 rounded-2xl border transition-all shadow-elevation min-w-[120px] ${
                                    catFilter === label
                                        ? 'bg-news-accent/10 border-news-accent/50 text-news-accent'
                                        : 'bg-surface-card border-border-subtle hover:bg-surface-hover hover:border-border-divider text-news-muted hover:text-white'
                                }`}
                            >
                                <Icon size={20} className="flex-shrink-0" />
                                <span className="text-xs font-bold text-center leading-tight">{label}</span>
                                <span className="text-[9px] opacity-60">{count} rankings</span>
                            </button>
                        );
                    })}
                </HScrollRow>
            </section>

            {/* 3. New Rankings */}
            {newRankings.length > 0 && (
                <section>
                    <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                        <Flame size={18} className="text-news-accent" /> New Rankings
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        {newRankings.map((a, i) => <RankingCard key={a.id} a={a} index={i} />)}
                    </div>
                </section>
            )}

            {/* 4. All Rankings with Filter + Sort */}
            <section>
                <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-surface-card rounded-2xl border border-border-subtle shadow-elevation">
                    <div className="flex items-center gap-2 text-xs text-news-muted font-bold uppercase tracking-widest">
                        <Filter size={12} /> Filter
                    </div>
                    <div className="flex flex-wrap gap-2 flex-1">
                        {RANKING_FILTERS.map(f => (
                            <button key={f} onClick={() => setCatFilter(f)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                                    catFilter === f
                                        ? 'bg-news-accent text-white border-news-accent'
                                        : 'bg-surface-base border-border-subtle text-news-muted hover:text-white hover:bg-surface-hover'
                                }`}>{f}
                            </button>
                        ))}
                    </div>
                    <div className="relative flex-shrink-0">
                        <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
                            className="appearance-none bg-surface-base border border-border-subtle text-news-muted text-xs font-bold rounded-xl px-3 py-2 pr-7 focus:outline-none focus:border-news-accent cursor-pointer"
                        >
                            <option value="popular">Most Popular</option>
                            <option value="newest">Newest</option>
                            <option value="most-tools">Most Tools Reviewed</option>
                        </select>
                        <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-news-muted pointer-events-none" />
                    </div>
                </div>

                <p className="text-xs text-news-muted uppercase tracking-widest mb-6">{sorted.length} Rankings</p>

                {sorted.length === 0 ? (
                    <div className="text-center py-16 border border-dashed border-border-subtle rounded-2xl text-gray-500">No rankings in this category yet.</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {sorted.map((a, i) => <RankingCard key={a.id} a={a} index={i} />)}
                    </div>
                )}
            </section>

            {/* 5. Related Reviews */}
            {reviews.length > 0 && (
                <div className="pt-10 border-t border-border-divider">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-news-muted mb-5">Related Reviews</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {reviews.map(a => (
                            <button key={a.id} onClick={() => onArticleClick(a)}
                                className="group text-left bg-surface-card border border-border-subtle rounded-2xl p-4 hover:bg-surface-hover hover:-translate-y-0.5 hover:border-border-divider transition-all shadow-elevation"
                            >
                                <p className="text-[9px] font-bold uppercase tracking-widest text-news-accent mb-2">Review</p>
                                <h4 className="text-sm font-bold text-white group-hover:text-news-accent transition-colors leading-snug line-clamp-2">{a.title}</h4>
                                <span className="text-[10px] text-news-muted flex items-center gap-1 mt-2 group-hover:text-white transition-colors">Read review <ArrowRight size={9} /></span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
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
const NewsHubInner: React.FC<{
    articles: Article[];
    onArticleClick: (a: Article) => void;
}> = ({ articles, onArticleClick }) => {
    const [activeTopic, setActiveTopic] = useState('All');
    const [sortBy, setSortBy] = useState<'latest' | 'trending'>('latest');

    const newsArticles = articles.filter(a => {
        const type = (a as any).article_type;
        const cats = Array.isArray(a.category) ? a.category : [a.category];
        return type === 'news' || cats.some(c => c === 'AI News');
    });

    const topics = ['All', 'AI Models', 'Product Launches', 'Open Source', 'Funding', 'Regulation'];

    const filtered = newsArticles.filter(a => 
        activeTopic === 'All' || a.topic === activeTopic || (Array.isArray(a.category) && a.category.includes(activeTopic))
    );

    // Featured is the newest "featured" news or just the latest news
    const featured = filtered.find(a => a.isFeaturedDiscover) || filtered[0];
    const latestDevelopments = filtered.filter(a => a.id !== featured?.id);

    if (newsArticles.length === 0) return <EmptyState hub="news" />;

    return (
        <div className="space-y-16">
            {/* 1. Featured Story */}
            {featured && (
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-black text-white flex items-center gap-2">
                            <Star size={20} className="text-news-accent fill-news-accent" />
                            Featured Story
                        </h2>
                    </div>
                    <button 
                        onClick={() => onArticleClick(featured)}
                        className="group w-full relative aspect-[21/9] rounded-3xl overflow-hidden border border-border-divider shadow-elevation-hover hover:border-news-accent transition-all"
                    >
                        <img src={featured.imageUrl} alt={featured.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-101 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                        <div className="absolute bottom-0 left-0 p-8 md:p-12 text-left max-w-3xl">
                            <span className="inline-block px-3 py-1 rounded-full bg-news-accent text-black text-[10px] font-black uppercase tracking-widest mb-4">Must Read</span>
                            <h3 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4 group-hover:text-news-accent transition-colors">{featured.title}</h3>
                            <p className="text-gray-300 text-lg line-clamp-2 mb-6 hidden md:block">{featured.excerpt}</p>
                            <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
                                <span>{featured.date}</span>
                                <span>•</span>
                                <span>{featured.topic}</span>
                            </div>
                        </div>
                    </button>
                </section>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* 2. ChronoFeed (Main Column) */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="flex items-center justify-between border-b border-border-divider pb-4">
                        <h2 className="text-xl font-black text-white">Latest Developments</h2>
                        <div className="flex items-center gap-4">
                            <select 
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="bg-surface-card border border-border-subtle text-[10px] font-bold uppercase tracking-widest text-news-muted rounded-lg px-3 py-1.5 focus:outline-none focus:border-news-accent"
                            >
                                <option value="latest">Sort: Newest</option>
                                <option value="trending">Sort: Trending</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {latestDevelopments.map(a => (
                            <button 
                                key={a.id} 
                                onClick={() => onArticleClick(a)}
                                className="group w-full text-left flex gap-6 p-4 rounded-2xl bg-surface-card border border-border-subtle hover:bg-surface-hover hover:border-news-accent transition-all shadow-elevation"
                            >
                                <div className="w-48 h-32 flex-shrink-0 rounded-xl overflow-hidden border border-border-subtle">
                                    <img src={a.imageUrl} alt={a.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all" />
                                </div>
                                <div className="flex-grow py-1">
                                    <div className="flex items-center gap-3 mb-2 text-[10px] font-bold uppercase tracking-widest">
                                        <span className="text-news-accent">{a.topic}</span>
                                        <span className="text-news-muted">{a.date}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2 leading-snug group-hover:text-news-accent transition-colors">{a.title}</h3>
                                    <p className="text-sm text-news-text line-clamp-2">{a.excerpt}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 3. Sidebar (Filters & Trending) */}
                <div className="lg:col-span-4 space-y-12">
                    {/* Filters */}
                    <div className="bg-surface-alt border border-border-divider rounded-3xl p-6">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                             <Filter size={14} className="text-news-accent" />
                             Topic Navigation
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {topics.map(t => (
                                <button
                                    key={t}
                                    onClick={() => setActiveTopic(t)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                                        activeTopic === t 
                                        ? 'bg-news-accent text-black border-news-accent shadow-[0_0_15px_rgba(43,212,195,0.3)]' 
                                        : 'bg-surface-card text-news-muted border-border-subtle hover:border-news-accent hover:text-white'
                                    }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Major Updates / Trending */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest px-2">Major Updates</h3>
                        <div className="space-y-4">
                            {newsArticles.slice(0, 3).map((a, i) => (
                                <button 
                                    key={a.id} 
                                    onClick={() => onArticleClick(a)}
                                    className="group w-full text-left flex items-start gap-4 p-4 rounded-2xl bg-surface-card border border-border-subtle hover:bg-surface-hover hover:border-news-accent transition-all"
                                >
                                    <span className="text-2xl font-black text-white/5 group-hover:text-news-accent/20 transition-colors mt-1">0{i+1}</span>
                                    <div>
                                        <p className="text-[10px] font-bold text-news-accent uppercase tracking-widest mb-1">{a.topic}</p>
                                        <h4 className="text-sm font-bold text-white group-hover:text-news-accent transition-colors leading-tight line-clamp-2">{a.title}</h4>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
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
const HubPage: React.FC<HubPageProps> = ({ hub: rawHub, articles, onArticleClick, onToolClick, onComparisonClick, onBack, workflowFilter, queryString, onStackClick }) => {
    // Safety: fall back to 'ai-tools' if we get an unrecognized hub value
    const hub: HubType = (rawHub && HUB_META[rawHub as HubType]) ? rawHub as HubType : 'ai-tools';
    const meta = HUB_META[hub];

    let dynamicLabel = meta.label;
    if (hub === 'ai-tools' && queryString) {
        const params = new URLSearchParams(queryString);
        const cat = params.get('category');
        const sort = params.get('sort');
        const price = params.get('pricing') || params.get('price');
        
        if (cat) {
            const low = cat.toLowerCase();
            if (low.includes('writing')) dynamicLabel = 'AI Writing Tools';
            else if (low.includes('coding') || low.includes('developer')) dynamicLabel = 'AI Coding Tools';
            else if (low.includes('image')) dynamicLabel = 'AI Image Tools';
            else if (low.includes('automation')) dynamicLabel = 'Automation Tools';
            else if (low.includes('productivity')) dynamicLabel = 'Productivity Tools';
            else if (low.includes('crm')) dynamicLabel = 'CRM Software';
            else if (low.includes('marketing')) dynamicLabel = 'Marketing Tools';
        } else if (price === 'free') {
            dynamicLabel = 'Free AI Tools';
        } else if (price === 'freemium') {
            dynamicLabel = 'Freemium AI Tools';
        } else if (sort === 'new' || sort === 'newest') {
            dynamicLabel = 'Newest AI Tools';
        } else if (sort === 'rating') {
            dynamicLabel = 'Top Rated AI Tools';
        }
    } else if (hub === 'best-software' && (queryString || workflowFilter)) {
        const params = new URLSearchParams(queryString || '');
        const cat = params.get('category');
        const wf = workflowFilter || params.get('workflow');
        
        if (cat) {
            const low = cat.toLowerCase();
            if (low.includes('ai-tools')) dynamicLabel = 'AI Software Rankings';
            else if (low.includes('productivity')) dynamicLabel = 'Productivity Software Rankings';
            else if (low.includes('automation')) dynamicLabel = 'Automation Software Rankings';
            else if (low.includes('developer')) dynamicLabel = 'Developer Tools Rankings';
            else if (low.includes('marketing')) dynamicLabel = 'Marketing Software Rankings';
            else if (low.includes('business')) dynamicLabel = 'Business Software Rankings';
            else if (low.includes('writing')) dynamicLabel = 'AI Writing Rankings';
            else if (low.includes('coding')) dynamicLabel = 'AI Coding Rankings';
            else if (low.includes('crm')) dynamicLabel = 'CRM Platform Rankings';
        } else if (wf) {
            const low = wf.toLowerCase();
            if (low === 'students') dynamicLabel = 'Best Tools for Students';
            else if (low === 'startups') dynamicLabel = 'Best Tools for Startups';
            else if (low === 'creators') dynamicLabel = 'Best Tools for Creators';
            else if (low === 'small-business') dynamicLabel = 'Best Tools for Small Business';
            else if (low === 'developers') dynamicLabel = 'Best Tools for Developers';
            else if (low === 'marketing') dynamicLabel = 'Best Tools for Marketers';
        }
    }

    useEffect(() => {
        document.title = `${dynamicLabel} | ToolCurrent`;
    }, [dynamicLabel]);

    const renderContent = () => {
        if (hub === 'ai-tools') return <AIToolsHub onToolClick={onToolClick} articles={articles} onArticleClick={onArticleClick} workflowFilter={workflowFilter} queryString={queryString} onStackClick={onStackClick} />;
        if (hub === 'best-software') return <BestSoftwareHub articles={articles} onArticleClick={onArticleClick} workflowFilter={workflowFilter} queryString={queryString} />;
        if (hub === 'comparisons') return <ComparisonsHub onComparisonClick={onComparisonClick} articles={articles} onArticleClick={onArticleClick} />;
        if (hub === 'reviews') return <ReviewsHub articles={articles} onArticleClick={onArticleClick} onComparisonClick={onComparisonClick} />;
        if (hub === 'use-cases') return <UseCasesHubInner articles={articles} onArticleClick={onArticleClick} />;
        if (hub === 'guides') return <GuidesHubInner articles={articles} onArticleClick={onArticleClick} />;
        if (hub === 'news') return <NewsHubInner articles={articles} onArticleClick={onArticleClick} />;
        return <ArticleGridHub hub={hub} articles={articles} onArticleClick={onArticleClick} />;
    };

    return (
        <div className="min-h-screen bg-surface-base text-news-text font-sans">
            <HubHeader hub={hub} onBack={onBack} titleOverride={dynamicLabel} />
            <div className="container mx-auto px-4 md:px-8 py-10">
                {renderContent()}
            </div>
        </div>
    );
};

export default HubPage;
