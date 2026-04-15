'use client';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { categorySlugToName, workflowNameToSlug } from '../lib/utils/slugs';
import { Article, Tool, Comparison, Stack } from '../types';
import { ArrowRight, Star, PenLine, Code2, ImageIcon, Zap, Layers, LayoutGrid, Users, Megaphone, Search, X, ChevronDown, TrendingUp, Briefcase, BookOpen, Headphones, Rocket, Brain, GraduationCap, Workflow, Flame, Radio, BarChart2, Filter, Video, Mic, Building2, Database, Clipboard, UserRound, Info, Microscope, PenTool, Music } from 'lucide-react';

type HubType = 'ai-tools' | 'best-ai-tools' | 'reviews' | 'comparisons' | 'use-cases' | 'guides' | 'news';

interface HubPageProps {
    hub: HubType;
    articles: Article[];
    onArticleClick: (article: Article) => void;
    onToolClick: (slug: string) => void;
    onComparisonClick: (slug: string, useCase?: string) => void;
    onBack: () => void;
    onHubNavigate?: (hub: string) => void;
    workflowFilter?: string;
    queryString?: string;
    onStackClick?: (slug: string) => void;
}

const HUB_META: Record<HubType, { label: string; description: string; titleTag: string; articleType?: string; showTools?: boolean; showComparisons?: boolean }> = {
    'ai-tools': {
        label: 'AI Tools',
        description: 'Browse and filter 200+ AI and software tools by category, use case, pricing, and platform. This is your discovery layer — explore tools, compare features, and build your workflow.',
        titleTag: 'AI Tools Directory: Explore & Discover Software (2026)',
        showTools: true
    },
    'best-ai-tools': {
        label: 'Best AI Tools',
        description: 'Too many AI tools, too much noise. These rankings cut through it — every tool scored across six dimensions so you can compare like for like.',
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

const CATEGORY_META: Record<string, { label: string; icon: React.ElementType }> = {
    'AI Chatbots':        { label: 'AI CHATBOTS',        icon: Brain },
    'AI Writing':         { label: 'AI WRITING',          icon: PenLine },
    'AI Image Generation':{ label: 'AI IMAGE GENERATION', icon: ImageIcon },
    'AI Video':           { label: 'AI VIDEO',            icon: Video },
    'AI Audio':           { label: 'AI AUDIO',            icon: Mic },
    'Productivity':       { label: 'PRODUCTIVITY',        icon: Layers },
    'Automation':         { label: 'AUTOMATION',          icon: Zap },
    'Design':             { label: 'DESIGN',              icon: ImageIcon },
    'Development':        { label: 'DEVELOPMENT',         icon: Code2 },
    'Marketing':          { label: 'MARKETING',           icon: Megaphone },
    'Sales & CRM':        { label: 'SALES & CRM',         icon: TrendingUp },
    'Customer Support':   { label: 'CUSTOMER SUPPORT',    icon: Headphones },
    'Data Analysis':      { label: 'DATA ANALYSIS',       icon: BarChart2 },
    'SEO Tools':          { label: 'SEO TOOLS',           icon: Search },
    'Other':              { label: 'OTHER',               icon: LayoutGrid },
};

const WORKFLOW_KEYWORDS: Record<string, string[]> = {
    students:            ['student', 'academic', 'education'],
    developers:          ['developer', 'development', 'coding', 'engineer'],
    marketing:           ['market', 'marketing', 'content team', 'agency'],
    startups:            ['startup', 'start-up', 'founder'],
    creators:            ['creator', 'creative', 'writer', 'freelance'],
    'small-business':    ['small business', 'smb', 'small team'],
    enterprise:          ['enterprise', 'organization', 'compliance', 'sso', 'audit', 'team'],
    researchers:         ['research', 'academic', 'analysis', 'study', 'scholar'],
    designers:           ['design', 'designer', 'creative', 'visual', 'graphic', 'ui', 'ux'],
    'sales-teams':       ['sales', 'crm', 'pipeline', 'lead', 'revenue', 'prospecting'],
    agencies:            ['agency', 'agenc', 'client', 'marketing team', 'creative team'],
    educators:           ['educat', 'teacher', 'teaching', 'course', 'learning', 'classroom'],
    freelancers:         ['freelance', 'freelancer', 'solo', 'independent', 'contractor'],
    'product-managers':  ['product manager', 'product team', 'roadmap', 'product management'],
    'data-scientists':   ['data scientist', 'data science', 'machine learning', 'ml', 'analyst'],
    musicians:           ['music', 'musician', 'audio', 'sound', 'producer', 'recording'],
};

const PRICING_OPTIONS = ['All', 'Free', 'Freemium', 'Paid', 'Enterprise', 'Trial', 'Open Source'];
const PLATFORM_OPTIONS = ['All', 'Web', 'Mobile', 'Desktop', 'API', 'Browser Extension'];
const dynCatFilters = ['All', 'AI Writing', 'Productivity', 'Automation', 'Developer Tools', 'Marketing Tools', 'CRM', 'AI Image'];
const dynUseCaseFilters = ['All', 'Content Creation', 'Coding', 'Workflow Automation', 'Note Taking', 'Customer Support'];

const SUGGESTED_QUERIES = [
    'writing assistant', 'code generation', 'image generation',
    'marketing automation', 'CRM', 'note taking', 'project management',
    'free AI tools', 'no-code automation', 'chatbot builder',
];

const EXPLORE_BY_WORKFLOW = [
    { label: 'Students',         icon: GraduationCap, key: 'students',         color: 'text-green-400',   bg: 'bg-green-500/10 border-green-500/20' },
    { label: 'Developers',       icon: Code2,         key: 'developers',       color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20' },
    { label: 'Marketers',        icon: Megaphone,     key: 'marketing',        color: 'text-pink-400',    bg: 'bg-pink-500/10 border-pink-500/20' },
    { label: 'Startups',         icon: Rocket,        key: 'startups',         color: 'text-orange-400',  bg: 'bg-orange-500/10 border-orange-500/20' },
    { label: 'Creators',         icon: PenLine,       key: 'creators',         color: 'text-purple-400',  bg: 'bg-purple-500/10 border-purple-500/20' },
    { label: 'Small Business',   icon: Briefcase,     key: 'small-business',   color: 'text-yellow-400',  bg: 'bg-yellow-500/10 border-yellow-500/20' },
    { label: 'Enterprise',       icon: Building2,     key: 'enterprise',       color: 'text-cyan-400',    bg: 'bg-cyan-500/10 border-cyan-500/20' },
    { label: 'Researchers',      icon: Microscope,    key: 'researchers',      color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Designers',        icon: PenTool,       key: 'designers',        color: 'text-rose-400',    bg: 'bg-rose-500/10 border-rose-500/20' },
    { label: 'Sales Teams',      icon: TrendingUp,    key: 'sales-teams',      color: 'text-indigo-400',  bg: 'bg-indigo-500/10 border-indigo-500/20' },
    { label: 'Agencies',         icon: Building2,     key: 'agencies',         color: 'text-violet-400',  bg: 'bg-violet-500/10 border-violet-500/20' },
    { label: 'Educators',        icon: BookOpen,      key: 'educators',        color: 'text-teal-400',    bg: 'bg-teal-500/10 border-teal-500/20' },
    { label: 'Freelancers',      icon: UserRound,     key: 'freelancers',      color: 'text-sky-400',     bg: 'bg-sky-500/10 border-sky-500/20' },
    { label: 'Product Managers', icon: Clipboard,     key: 'product-managers', color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20' },
    { label: 'Data Scientists',  icon: Database,      key: 'data-scientists',  color: 'text-lime-400',    bg: 'bg-lime-500/10 border-lime-500/20' },
    { label: 'Musicians',        icon: Music,         key: 'musicians',        color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10 border-fuchsia-500/20' },
];

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

// Maps workflow card key → canonical workflow_tags values stored in DB
const WORKFLOW_TAG_LABELS: Record<string, string[]> = {
    'students':         ['Students'],
    'developers':       ['Developers'],
    'marketing':        ['Marketers'],
    'startups':         ['Startups'],
    'creators':         ['Content Creators'],
    'small-business':   ['Small Business'],
    'enterprise':       ['Enterprise'],
    'researchers':      ['Researchers'],
    'designers':        ['Designers'],
    'sales-teams':      ['Sales Teams'],
    'agencies':         ['Agencies'],
    'educators':        ['Educators'],
    'freelancers':      ['Freelancers'],
    'product-managers': ['Product Managers'],
    'data-scientists':  ['Data Scientists'],
    'musicians':        ['Musicians'],
};

// Normalizes homepage workflow slugs → hub internal keys
const WORKFLOW_SLUG_TO_KEY: Record<string, string> = {
    'marketers':        'marketing',
    'content-creators': 'creators',
    'researchers':      'researchers',
    'enterprise':       'enterprise',
};

// Maps ALL_WORKFLOW_TAGS display names → internal filter key used by workflowMatchesTool
const WORKFLOW_LABEL_TO_KEY: Record<string, string> = {
    'Students':         'students',
    'Developers':       'developers',
    'Marketers':        'marketing',
    'Content Creators': 'creators',
    'Startups':         'startups',
    'Small Business':   'small-business',
    'Enterprise':       'enterprise',
    'Researchers':      'researchers',
    'Designers':        'designers',
    'Sales Teams':      'sales-teams',
    'Agencies':         'agencies',
    'Educators':        'educators',
    'Freelancers':      'freelancers',
    'Product Managers': 'product-managers',
    'Data Scientists':  'data-scientists',
    'Musicians':        'musicians',
};
const WORKFLOW_KEY_TO_LABEL: Record<string, string> =
    Object.fromEntries(Object.entries(WORKFLOW_LABEL_TO_KEY).map(([l, k]) => [k, l]));

// Maps workflow display label → primary use_case for hybrid OR count/filter
const WORKFLOW_PRIMARY_USE_CASE: Record<string, string> = {
    'Students':         'Education',
    'Developers':       'Coding',
    'Marketers':        'Marketing',
    'Content Creators': 'Content Creation',
    'Startups':         'Automation',
    'Small Business':   'Automation',
    'Enterprise':       '',
    'Researchers':      'Research',
    'Designers':        'Design',
    'Sales Teams':      'Sales',
    'Agencies':         'Marketing',
    'Educators':        'Education',
    'Freelancers':      'Content Creation',
    'Product Managers': 'Automation',
    'Data Scientists':  'Data Analysis',
    'Musicians':        'Audio Generation',
};

type CapChip = { label: string; field: keyof Tool; values: string[] };
const CAP_CHIPS: CapChip[] = [
    { label: 'Free Tier',         field: 'pricing_model',    values: ['Free', 'Freemium'] },
    { label: 'Image Generation',  field: 'image_generation', values: ['yes'] },
    { label: 'Memory',            field: 'memory_persistence', values: ['yes'] },
    { label: 'Computer Use',      field: 'computer_use',     values: ['yes'] },
    { label: 'Multimodal',        field: 'multimodal',       values: ['yes'] },
    { label: 'Open Source',       field: 'open_source',      values: ['yes', 'partial'] },
    { label: 'Browser Extension', field: 'browser_extension',values: ['yes'] },
    { label: 'API Available',     field: 'api_available',    values: ['yes'] },
];

// ─── URL slug → filter value helpers ─────────────────────────────────────────

function slugToUseCase(slug: string): string {
    const map: Record<string, string> = {
        'content-creation':      'Content Creation',
        'marketing':             'Marketing',
        'research':              'Research',
        'coding':                'Coding',
        'automation':            'Automation',
        'lead-generation':       'Lead Generation',
        'customer-support':      'Customer Support',
        'data-analysis':         'Data Analysis',
        'design':                'Design',
        'education':             'Education',
        'personal-productivity': 'Personal Productivity',
        'image-generation':      'Image Generation',
        'video-generation':      'Video Generation',
        'audio-generation':      'Audio Generation',
        'seo':                   'SEO',
        'sales':                 'Sales',
        'note-taking':           'Note Taking',
        'workflow-automation':   'Workflow Automation',
    };
    // Fallback: replace hyphens with spaces (case-insensitive contains match still works)
    return map[slug] || slug.replace(/-/g, ' ');
}

function parseInitialFilters(queryString: string, workflowFilter?: string) {
    if (workflowFilter && WORKFLOW_CONFIG[workflowFilter]) {
        return {
            catFilter:     WORKFLOW_CONFIG[workflowFilter].catFilter || 'All',
            useCaseFilter: 'All',
            pricingFilter: 'All' as string,
            platformFilter:'All',
            capFilters:    [] as string[],
            activeWorkflow:null as string | null,
            search:        '',
        };
    }
    const params = new URLSearchParams(queryString.replace(/^\?/, ''));

    const catSlug = params.get('category');
    const catFilter = catSlug ? (categorySlugToName(catSlug) || 'All') : 'All';

    const useCaseSlug = params.get('use_case');
    const useCaseFilter = useCaseSlug ? slugToUseCase(useCaseSlug) : 'All';

    const pricingSlug = params.get('pricing') || params.get('price');
    const pricingFilter = pricingSlug
        ? (PRICING_OPTIONS.find(p => p.toLowerCase() === pricingSlug.toLowerCase()) || 'All')
        : 'All';

    const platformSlug = params.get('platform');
    const platformFilter = platformSlug
        ? (PLATFORM_OPTIONS.find(p => p.toLowerCase() === platformSlug.toLowerCase()) || 'All')
        : 'All';

    const capabilitySlug = params.get('capability');
    const chip = capabilitySlug ? CAP_CHIPS.find(c => c.label.toLowerCase().replace(/\s+/g, '-') === capabilitySlug) : null;
    const capFilters = chip ? [chip.label] : [];

    // Normalize homepage slugs (e.g. 'marketers') → hub internal keys (e.g. 'marketing')
    const rawWorkflow = params.get('workflow') || null;
    const activeWorkflow = rawWorkflow ? (WORKFLOW_SLUG_TO_KEY[rawWorkflow] || rawWorkflow) : null;

    const search = params.get('search') || '';

    return { catFilter, useCaseFilter, pricingFilter, platformFilter, capFilters, activeWorkflow, search };
}

export const AIToolsHub: React.FC<{
    onToolClick: (s: string) => void;
    articles: Article[];
    onArticleClick: (a: Article) => void;
    onComparisonClick?: (slug: string) => void;
    workflowFilter?: string;
    queryString?: string;
    onStackClick?: (slug: string) => void;
    initialTools?: Tool[];
    initialSearch?: string;
    onSearchChange?: (term: string) => void;
    onWorkflowChange?: (slug: string | null) => void;
    autoFocusSearch?: boolean;
    onFocusSearchDone?: () => void;
}> = ({ onToolClick, articles, onArticleClick, onComparisonClick, workflowFilter, queryString, onStackClick, initialTools, initialSearch, onSearchChange, onWorkflowChange, autoFocusSearch, onFocusSearchDone }) => {
    const [tools, setTools] = useState<Tool[]>(initialTools ?? []);
    const [stacks, setStacks] = useState<Stack[]>([]);
    const [loading, setLoading] = useState(true);

    const wfConfig = workflowFilter ? WORKFLOW_CONFIG[workflowFilter] : null;

    // Parse all filter state directly from queryString on first render — no flash
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const initialFilters = React.useMemo(() => parseInitialFilters(queryString || '', workflowFilter), []);

    const [search, setSearch] = useState(initialSearch ?? initialFilters.search);
    const [debouncedSearch, setDebouncedSearch] = useState(initialSearch ?? initialFilters.search);
    const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [searchFocusRing, setSearchFocusRing] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [pricingFilter, setPricingFilter] = useState<string>(initialFilters.pricingFilter);
    const [platformFilter, setPlatformFilter] = useState(initialFilters.platformFilter);
    const [catFilter, setCatFilter] = useState(initialFilters.catFilter);
    const [useCaseFilter, setUseCaseFilter] = useState(initialFilters.useCaseFilter);
    const [sortBy, setSortBy] = useState<'popular' | 'most-used' | 'newest' | 'price' | 'rating'>('most-used');
    const [visibleCount, setVisibleCount] = useState(TOOLS_PER_PAGE);
    const [activeWorkflow, setActiveWorkflow] = useState<string | null>(initialFilters.activeWorkflow);
    const [capFilters, setCapFilters] = useState<string[]>(initialFilters.capFilters);
    const [showFilterInfo, setShowFilterInfo] = useState(false);
    const toolGridRef = useRef<HTMLDivElement>(null);
    const filterInfoRef = useRef<HTMLDivElement>(null);
    const isFirstMount = useRef(true);

    // Sync query string to filters — skips first mount (state already initialized correctly)
    useEffect(() => {
        if (isFirstMount.current) {
            isFirstMount.current = false;
            return;
        }
        const filters = parseInitialFilters(queryString || '', workflowFilter);
        setCatFilter(filters.catFilter);
        setUseCaseFilter(filters.useCaseFilter);
        setPricingFilter(filters.pricingFilter);
        setPlatformFilter(filters.platformFilter);
        setCapFilters(filters.capFilters);
        setActiveWorkflow(filters.activeWorkflow);
    }, [queryString, workflowFilter]);

    useEffect(() => {
        if (initialTools?.length) { setLoading(false); } else {
            fetch('/api/tools')
                .then(r => r.json())
                .then(d => { setTools(Array.isArray(d) ? d : []); setLoading(false); })
                .catch(() => setLoading(false));
        }
        fetch('/api/stacks')
            .then(r => r.ok ? r.json() : [])
            .then(d => setStacks(d))
            .catch(() => {});
    }, []);

    // Debounce search input → debouncedSearch used for filtering + URL sync
    useEffect(() => {
        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
        searchDebounceRef.current = setTimeout(() => {
            setDebouncedSearch(search);
            onSearchChange?.(search);
        }, 300);
        return () => { if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current); };
    }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

    // Auto-focus search when navigated here via ?focus=search
    useEffect(() => {
        if (!autoFocusSearch) return;
        const timer = setTimeout(() => {
            searchInputRef.current?.focus();
            searchInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setSearchFocusRing(true);
            setTimeout(() => setSearchFocusRing(false), 2000);
            onFocusSearchDone?.();
        }, 100);
        return () => clearTimeout(timer);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Reset pagination when filters change
    useEffect(() => { setVisibleCount(TOOLS_PER_PAGE); }, [debouncedSearch, pricingFilter, catFilter, useCaseFilter, sortBy, platformFilter, activeWorkflow, capFilters]);

    const getBadge = (tool: Tool): string | null => {
        if (tool.ai_enabled && tool.rating_score >= 4.7) return 'Trending';
        if (tool.review_count >= 50) return 'Most Used';
        return null;
    };

    // Autocomplete suggestions
    const suggestions = React.useMemo(() => {
        if (!search || search.length < 2) return [];
        const q = search.toLowerCase();
        const toolMatches = tools
            .filter(t => t.name.toLowerCase().includes(q) || t.short_description?.toLowerCase().includes(q))
            .slice(0, 4)
            .map(t => ({ type: 'tool' as const, label: t.name, slug: t.slug }));
        const queryMatches = SUGGESTED_QUERIES
            .filter(s => s.toLowerCase().includes(q) && !toolMatches.some(t => t.label.toLowerCase() === s))
            .slice(0, 3)
            .map(s => ({ type: 'query' as const, label: s, slug: '' }));
        return [...toolMatches, ...queryMatches].slice(0, 6);
    }, [search, tools]);

    // Combined OR workflow matching: workflow_tags, use_case_tags, best_for text
    const workflowMatchesTool = useCallback((t: Tool, key: string): boolean => {
        const tagLabels = WORKFLOW_TAG_LABELS[key] || [];
        if (tagLabels.some(tag => t.workflow_tags?.some((wt: string) => wt.toLowerCase() === tag.toLowerCase()))) return true;
        const keywords = WORKFLOW_KEYWORDS[key] || [key];
        if (t.use_case_tags?.some((u: string) => keywords.some(kw => u.toLowerCase().includes(kw.toLowerCase())))) return true;
        if (t.best_for?.some((b: string) => keywords.some(kw => b.toLowerCase().includes(kw.toLowerCase())))) return true;
        return false;
    }, []);

    const filtered = tools.filter(t => {
        const q = debouncedSearch.toLowerCase();
        const matchSearch = !debouncedSearch ||
            t.name.toLowerCase().includes(q) ||
            t.short_description?.toLowerCase().includes(q) ||
            t.category_tags?.some((c: string) => c.toLowerCase().includes(q)) ||
            t.use_case_tags?.some((u: string) => u.toLowerCase().includes(q));
        const matchPrice    = pricingFilter === 'All' || t.pricing_model === pricingFilter;
        const matchCat      = catFilter === 'All' || t.category_primary === catFilter || t.category_tags?.some((c: string) => c.toLowerCase().includes(catFilter.toLowerCase()));
        const matchPlatform = platformFilter === 'All' || t.supported_platforms?.some((p: string) => p.toLowerCase().includes(platformFilter.toLowerCase()));
        const matchCaps     = capFilters.length === 0 || capFilters.every(label => {
            const chip = CAP_CHIPS.find(c => c.label === label);
            if (!chip) return true;
            const val = (t as any)[chip.field];
            return Array.isArray(val) ? val.some((v: string) => chip.values.includes(v)) : chip.values.includes(val);
        });
        // Hybrid OR logic: when activeWorkflow is set, use workflow tag match OR primary use_case match
        // Primary use case is looked up internally — useCaseFilter only reflects explicit user selection
        let matchWorkflowAndUse: boolean;
        if (activeWorkflow) {
            const wfLabel = WORKFLOW_KEY_TO_LABEL[activeWorkflow] || '';
            const primaryUseCase = wfLabel ? (WORKFLOW_PRIMARY_USE_CASE[wfLabel] || '') : '';
            const matchWf = workflowMatchesTool(t, activeWorkflow);
            const matchPrimaryUC = primaryUseCase
                ? t.use_case_tags?.some((u: string) => u.toLowerCase().includes(primaryUseCase.toLowerCase()))
                : false;
            // AND with explicit use case filter if user set one separately
            const matchExplicitUC = useCaseFilter === 'All' || t.use_case_tags?.some((u: string) => u.toLowerCase().includes(useCaseFilter.toLowerCase()));
            matchWorkflowAndUse = (matchWf || matchPrimaryUC) && matchExplicitUC;
        } else {
            const matchUse  = useCaseFilter === 'All' || t.use_case_tags?.some((u: string) => u.toLowerCase().includes(useCaseFilter.toLowerCase()));
            matchWorkflowAndUse = matchUse;
        }
        return matchSearch && matchPrice && matchCat && matchWorkflowAndUse && matchPlatform && matchCaps;
    });

    const sorted = [...filtered].sort((a, b) => {
        if (sortBy === 'most-used') return (b.review_count || 0) - (a.review_count || 0);
        if (sortBy === 'rating')    return (b.rating_score || 0) - (a.rating_score || 0);
        if (sortBy === 'popular')   return (b.rating_score || 0) - (a.rating_score || 0);
        if (sortBy === 'price') {
            const pa = parseFloat((a.starting_price || '9999').replace(/[^0-9.]/g, ''));
            const pb = parseFloat((b.starting_price || '9999').replace(/[^0-9.]/g, ''));
            return pa - pb;
        }
        return 0; // newest = API order
    });

    const visible = sorted.slice(0, visibleCount);
    const hasActiveFilters = pricingFilter !== 'All' || catFilter !== 'All' || useCaseFilter !== 'All' || platformFilter !== 'All' || !!search || !!activeWorkflow || capFilters.length > 0;

    const clearAllFilters = () => { setSearch(''); setDebouncedSearch(''); onSearchChange?.(''); setPricingFilter('All'); setCatFilter('All'); setUseCaseFilter('All'); setPlatformFilter('All'); setActiveWorkflow(null); setCapFilters([]); onWorkflowChange?.(null); };

    const dynCatFilters = React.useMemo(() => {
        const freq: Record<string, number> = {};
        tools.forEach(t => { if (t.category_primary) freq[t.category_primary] = (freq[t.category_primary] || 0) + 1; });
        return ['All', ...Object.entries(freq).sort((a, b) => b[1] - a[1]).map(([k]) => k)];
    }, [tools]);

    const dynUseCaseFilters = React.useMemo(() => {
        const freq: Record<string, number> = {};
        tools.forEach(t => t.use_case_tags?.forEach(u => { freq[u] = (freq[u] || 0) + 1; }));
        return ['All', ...Object.entries(freq).sort((a, b) => b[1] - a[1]).map(([k]) => k)];
    }, [tools]);

    // Workflow options for dropdown: all 16 workflows with non-zero hybrid count
    const dynWorkflowOptions = React.useMemo(() => {
        return Object.entries(WORKFLOW_KEY_TO_LABEL)
            .filter(([key, label]) => {
                const primaryUseCase = WORKFLOW_PRIMARY_USE_CASE[label] || '';
                return tools.some(t =>
                    workflowMatchesTool(t, key) ||
                    (primaryUseCase ? t.use_case_tags?.some((u: string) => u.toLowerCase().includes(primaryUseCase.toLowerCase())) : false)
                );
            })
            .map(([key, label]) => ({ key, label }));
    }, [tools, workflowMatchesTool]);

    const handleWorkflowDropdownChange = useCallback((label: string) => {
        if (label === 'All') {
            setActiveWorkflow(null);
            setUseCaseFilter('All');
            if (pricingFilter === 'Enterprise') setPricingFilter('All');
            onWorkflowChange?.(null);
        } else {
            const key = WORKFLOW_LABEL_TO_KEY[label];
            if (!key) return;
            setActiveWorkflow(key);
            if (key === 'enterprise') setPricingFilter('Enterprise');
            onWorkflowChange?.(workflowNameToSlug(label));
            setTimeout(() => toolGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
        }
    }, [pricingFilter, onWorkflowChange]);

    // Click-outside to close filter info tooltip
    useEffect(() => {
        if (!showFilterInfo) return;
        const handler = (e: MouseEvent) => {
            if (filterInfoRef.current && !filterInfoRef.current.contains(e.target as Node)) {
                setShowFilterInfo(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showFilterInfo]);

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
        <div className="space-y-12">

            {/* ── Search (always visible, at top) ──────────────────────── */}
            <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-news-muted" />
                <input
                    ref={searchInputRef}
                    type="text"
                    value={search}
                    onChange={e => { setSearch(e.target.value); setShowSuggestions(true); }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                    placeholder="Search tools — e.g. writing, automation, CRM, free AI…"
                    className={`w-full bg-surface-card border rounded-2xl pl-11 pr-10 py-3.5 text-base md:text-sm text-white placeholder:text-news-muted focus:outline-none transition-all duration-500 ${searchFocusRing ? 'border-teal-400 ring-2 ring-teal-400/40 shadow-[0_0_12px_rgba(45,212,191,0.25)]' : 'border-border-subtle focus:border-news-accent'}`}
                />
                {search && (
                    <button onClick={() => { setSearch(''); setDebouncedSearch(''); onSearchChange?.(''); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-news-muted hover:text-white">
                        <X size={14} />
                    </button>
                )}
                {/* Autocomplete dropdown */}
                {showSuggestions && (search.length >= 2 ? suggestions.length > 0 : true) && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-surface-card border border-border-subtle rounded-xl shadow-elevation overflow-hidden z-30">
                        {search.length < 2 ? (
                            <div className="p-3">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-news-muted mb-2 px-1">Suggested Searches</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {SUGGESTED_QUERIES.slice(0, 8).map(q => (
                                        <button key={q} onMouseDown={() => { setSearch(q); setShowSuggestions(false); }}
                                            className="text-xs px-2.5 py-1 rounded-full bg-surface-alt border border-border-subtle text-news-muted hover:text-white hover:border-news-accent/40 transition-colors"
                                        >{q}</button>
                                    ))}
                                </div>
                            </div>
                        ) : suggestions.map(s => (
                            <button key={s.label} onMouseDown={() => {
                                if (s.type === 'tool') onToolClick(s.slug);
                                else { setSearch(s.label); setShowSuggestions(false); }
                            }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface-hover transition-colors text-left">
                                <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded flex-shrink-0 ${s.type === 'tool' ? 'bg-news-accent/10 text-news-accent' : 'bg-surface-alt text-news-muted'}`}>
                                    {s.type === 'tool' ? 'Tool' : 'Search'}
                                </span>
                                <span className="text-sm text-white">{s.label}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Workflow Banner (when arriving via workflow filter) ──── */}
            {wfConfig && (
                <div className="p-5 rounded-2xl border border-news-accent/30 bg-news-accent/5 flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-news-accent mb-1">Explore by Workflow</p>
                            <h2 className="text-xl font-black text-white">Tools for {wfConfig.label}</h2>
                            <p className="text-sm text-news-muted mt-1">Showing tools relevant to your workflow. Use filters to explore further.</p>
                        </div>
                        <button onClick={() => setCatFilter('All')}
                            className="text-[10px] font-bold text-news-muted hover:text-white border border-border-subtle rounded-lg px-3 py-2 transition-colors flex-shrink-0"
                        >Clear</button>
                    </div>
                    {recommendedStack && onStackClick && (
                        <div className="p-4 rounded-xl border border-border-subtle bg-surface-card flex flex-col md:flex-row items-center gap-4 justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-news-accent/10 flex items-center justify-center flex-shrink-0">
                                    <Layers className="text-news-accent" size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-news-muted mb-0.5">Recommended Stack</p>
                                    <h3 className="text-sm font-bold text-white leading-snug">{recommendedStack.name}</h3>
                                </div>
                            </div>
                            <button onClick={() => onStackClick(recommendedStack.slug)}
                                className="w-full md:w-auto px-4 py-2 rounded-lg bg-news-accent text-black font-bold text-[10px] uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-1"
                            >View Stack <ArrowRight size={12} /></button>
                        </div>
                    )}
                </div>
            )}

            {/* ── Explore by Workflow (always visible, no active filter) ─ */}
            {!wfConfig && !hasActiveFilters && (
                <section>
                    <h2 className="text-xl font-black text-white mb-2 flex items-center gap-2">
                        <Users size={18} className="text-news-accent" /> Explore by Workflow
                    </h2>
                    <p className="text-sm text-news-muted mb-5">Filter the full tool database by your role.</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                        {EXPLORE_BY_WORKFLOW.map(({ label, icon: Icon, key, color, bg }) => {
                            const primaryUseCase = WORKFLOW_PRIMARY_USE_CASE[label] || '';
                            const count = key === 'enterprise'
                                ? tools.filter(t =>
                                    workflowMatchesTool(t, key) ||
                                    (t as any).pricing_model?.toLowerCase() === 'enterprise'
                                ).length
                                : tools.filter(t =>
                                    workflowMatchesTool(t, key) ||
                                    (primaryUseCase ? t.use_case_tags?.some((u: string) => u.toLowerCase().includes(primaryUseCase.toLowerCase())) : false)
                                ).length;
                            if (count === 0) return null;
                            const isActive = activeWorkflow === key;
                            return (
                                <button key={key} onClick={() => {
                                    if (isActive) {
                                        setActiveWorkflow(null);
                                        setUseCaseFilter('All');
                                        if (key === 'enterprise' && (pricingFilter as string) === 'Enterprise') setPricingFilter('All');
                                        onWorkflowChange?.(null);
                                    } else {
                                        setActiveWorkflow(key);
                                        if (key === 'enterprise') setPricingFilter('Enterprise');
                                        onWorkflowChange?.(workflowNameToSlug(label));
                                        setTimeout(() => toolGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
                                    }
                                }}
                                    className={`group flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all text-center hover:-translate-y-0.5 ${isActive ? 'border-news-accent bg-news-accent/10' : bg}`}
                                >
                                    <Icon size={20} className={isActive ? 'text-news-accent' : color} />
                                    <span className="text-xs font-bold text-white">{label}</span>
                                    <span className="text-[9px] text-news-muted">{count} tools</span>
                                </button>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* ── Category Explorer (no filter active) ─────────────────── */}
            {!wfConfig && !hasActiveFilters && (
                <section>
                    <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                        <LayoutGrid size={20} className="text-news-accent" /> Browse by Category
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                        {Object.entries(
                            tools.reduce((acc, t) => {
                                if (t.category_primary) acc[t.category_primary] = (acc[t.category_primary] || 0) + 1;
                                return acc;
                            }, {} as Record<string, number>)
                        )
                        .sort((a, b) => (b[1] as number) - (a[1] as number))
                        .map(([cat, count]) => {
                            const meta = CATEGORY_META[cat];
                            if (!meta) return null;
                            const Icon = meta.icon;
                            return (
                                <button key={cat} onClick={() => setCatFilter(cat)}
                                    className="group flex flex-col items-center justify-center p-4 bg-surface-card border border-border-subtle rounded-2xl hover:border-news-accent/50 hover:bg-surface-hover hover:-translate-y-0.5 transition-all"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-surface-base border border-border-subtle flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <Icon className="text-news-accent" size={18} />
                                    </div>
                                    <span className="text-[10px] font-black text-white uppercase tracking-wide text-center mb-1 group-hover:text-news-accent transition-colors leading-tight">{meta.label}</span>
                                    <span className="text-[9px] text-news-muted">{count}</span>
                                </button>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* ── Best Software CTA ────────────────────────────────────── */}
            {!wfConfig && !hasActiveFilters && (
                <section className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-7 flex flex-col md:flex-row items-center gap-6 justify-between">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-yellow-400 mb-2">Curated Rankings</p>
                        <h3 className="text-lg font-black text-white mb-2">Looking for the Best Tools?</h3>
                        <p className="text-sm text-news-muted max-w-md leading-relaxed">Looking for ranked recommendations? Browse Best Software for curated rankings, head-to-head comparisons, and expert recommendations.</p>
                    </div>
                    <a href="/best-ai-tools"
                        className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm font-black hover:bg-yellow-500/20 transition-colors whitespace-nowrap"
                    >
                        Best AI Tools Hub <ArrowRight size={14} />
                    </a>
                </section>
            )}

            {/* ── Trending (no filter active) ───────────────────────────── */}
            {!wfConfig && !hasActiveFilters && (
                <section>
                    <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                        <Flame size={20} className="text-news-accent" /> Trending Tools
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {TRENDING_TOOL_SLUGS.map(slug => {
                            const tool = tools.find(t => t.slug === slug);
                            if (!tool) return null;
                            return (
                                <button key={tool.slug} onClick={() => onToolClick(tool.slug)}
                                    className="group flex items-center gap-3 px-4 py-3.5 bg-surface-card border border-border-subtle rounded-2xl hover:border-news-accent/40 hover:bg-surface-hover transition-all"
                                >
                                    {tool.logo
                                        ? <div className="w-9 h-9 rounded-xl bg-white border border-border-subtle overflow-hidden flex-shrink-0"><img src={tool.logo} alt={tool.name} className="w-full h-full object-contain p-1" loading="lazy" /></div>
                                        : <div className="w-9 h-9 rounded-xl bg-surface-base border border-border-subtle flex items-center justify-center text-sm font-black text-news-muted flex-shrink-0">{tool.name[0]}</div>
                                    }
                                    <div className="text-left min-w-0 flex-1">
                                        <p className="font-bold text-white group-hover:text-news-accent transition-colors text-sm truncate">{tool.name}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] text-news-muted truncate">{tool.category_tags?.[0]}</span>
                                            {tool.rating_score > 0 && <span className="text-[10px] font-bold text-news-accent flex items-center gap-0.5 flex-shrink-0"><Star size={9} className="fill-news-accent" />{tool.rating_score.toFixed(1)}</span>}
                                        </div>
                                    </div>
                                    <ArrowRight size={13} className="text-news-muted group-hover:text-news-accent transition-colors flex-shrink-0" />
                                </button>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* ── Recently Added (no filter) ───────────────────────────── */}
            {!wfConfig && !hasActiveFilters && (
                <section>
                    <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                        <Zap size={20} className="text-news-accent" /> Recently Added
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[...tools].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 4).map(tool => (
                            <button key={tool.id} onClick={() => onToolClick(tool.slug)}
                                className="group flex items-center gap-3 p-4 bg-surface-card border border-border-subtle rounded-xl hover:border-news-accent/30 hover:bg-surface-hover transition-all text-left"
                            >
                                {tool.logo
                                    ? <div className="w-9 h-9 rounded-xl bg-white border border-border-subtle overflow-hidden flex-shrink-0"><img src={tool.logo} alt={tool.name} className="w-full h-full object-contain p-1" loading="lazy" /></div>
                                    : <div className="w-9 h-9 rounded-xl bg-surface-base border border-border-subtle flex items-center justify-center text-base font-black text-news-muted flex-shrink-0">{tool.name[0]}</div>
                                }
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-bold text-white truncate group-hover:text-news-accent transition-colors">{tool.name}</h3>
                                    <p className="text-[10px] text-news-muted truncate mt-0.5">{tool.short_description}</p>
                                    <span className="text-[9px] font-bold text-emerald-400">New</span>
                                </div>
                                <ArrowRight size={13} className="text-news-muted group-hover:text-news-accent transition-colors flex-shrink-0" />
                            </button>
                        ))}
                    </div>
                </section>
            )}

            {/* ── Capability quick-filter chips ────────────────────────── */}
            <section>
                <div className="flex flex-wrap gap-2">
                    {CAP_CHIPS.map(chip => {
                        const isOn = capFilters.includes(chip.label);
                        const count = tools.filter(t => {
                            const val = (t as any)[chip.field];
                            return Array.isArray(val) ? val.some((v: string) => chip.values.includes(v)) : chip.values.includes(val);
                        }).length;
                        if (count === 0) return null;
                        return (
                            <button key={chip.label}
                                onClick={() => setCapFilters(prev => isOn ? prev.filter(l => l !== chip.label) : [...prev, chip.label])}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${isOn ? 'bg-news-accent/15 border-news-accent/50 text-news-accent' : 'bg-surface-card border-border-subtle text-news-muted hover:border-border-divider hover:text-white'}`}
                            >
                                {chip.label}
                                <span className={`text-[9px] ${isOn ? 'text-news-accent/70' : 'text-news-muted/70'}`}>{count}</span>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* ── Filter explanation line ──────────────────────────────── */}
            <div className="flex items-center gap-2 -mt-8" ref={filterInfoRef}>
                <button
                    onClick={() => setShowFilterInfo(v => !v)}
                    className="flex items-center gap-1.5 text-[10px] text-news-muted hover:text-white transition-colors"
                    aria-label="Filter legend"
                >
                    <Info size={12} className="text-news-muted" />
                    <span className="hidden sm:inline">Categories = type of tool · Use Cases = what you can do · Workflows = who it&apos;s built for</span>
                    <span className="sm:hidden">Filter guide</span>
                </button>
                {showFilterInfo && (
                    <div className="absolute mt-7 z-20 bg-surface-card border border-border-subtle rounded-xl p-3 shadow-elevation text-[11px] text-news-muted max-w-xs leading-relaxed">
                        <p><span className="text-white font-bold">Categories</span> — the type of tool (e.g. AI Writing, Automation)</p>
                        <p className="mt-1"><span className="text-white font-bold">Use Cases</span> — what you can do with it (e.g. Content Creation, Coding)</p>
                        <p className="mt-1"><span className="text-white font-bold">Workflows</span> — who it&apos;s built for (e.g. Developers, Marketers)</p>
                    </div>
                )}
            </div>

            {/* ── Filter bar ───────────────────────────────────────────── */}
            <section ref={toolGridRef}>
                {/* Filter dropdowns — shared desktop + mobile */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-3">
                    {([
                        { label: 'All Categories', opts: dynCatFilters,    value: catFilter,     set: setCatFilter },
                        { label: 'All Pricing',    opts: PRICING_OPTIONS,  value: pricingFilter, set: setPricingFilter },
                        { label: 'All Platforms',  opts: PLATFORM_OPTIONS, value: platformFilter, set: setPlatformFilter },
                        { label: 'All Use Cases',  opts: dynUseCaseFilters, value: useCaseFilter,  set: setUseCaseFilter },
                    ] as const).map(({ label, opts, value, set }) => {
                        const isActive = value !== 'All';
                        return (
                            <div key={label} className="relative">
                                <select
                                    value={value}
                                    onChange={e => (set as (v: string) => void)(e.target.value)}
                                    className={`w-full appearance-none pl-3 pr-8 py-2.5 rounded-xl text-xs font-bold border transition-all focus:outline-none cursor-pointer ${
                                        isActive
                                            ? 'bg-news-accent/10 border-news-accent/50 text-news-accent'
                                            : 'bg-surface-card border-border-subtle text-news-muted hover:border-border-divider hover:text-white'
                                    }`}
                                >
                                    <option value="All">{label}</option>
                                    {opts.filter(o => o !== 'All').map(o => (
                                        <option key={o} value={o}>{o}</option>
                                    ))}
                                </select>
                                <ChevronDown size={11} className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${isActive ? 'text-news-accent' : 'text-news-muted'}`} />
                            </div>
                        );
                    })}
                    {/* Workflow dropdown — 5th column */}
                    <div className="relative">
                        <select
                            value={activeWorkflow ? (WORKFLOW_KEY_TO_LABEL[activeWorkflow] || activeWorkflow) : 'All'}
                            onChange={e => handleWorkflowDropdownChange(e.target.value)}
                            className={`w-full appearance-none pl-3 pr-8 py-2.5 rounded-xl text-xs font-bold border transition-all focus:outline-none cursor-pointer ${
                                activeWorkflow
                                    ? 'bg-news-accent/10 border-news-accent/50 text-news-accent'
                                    : 'bg-surface-card border-border-subtle text-news-muted hover:border-border-divider hover:text-white'
                            }`}
                        >
                            <option value="All">All Workflows</option>
                            {dynWorkflowOptions.map(({ label }) => (
                                <option key={label} value={label}>{label}</option>
                            ))}
                        </select>
                        <ChevronDown size={11} className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${activeWorkflow ? 'text-news-accent' : 'text-news-muted'}`} />
                    </div>
                </div>

                {/* Count + sort + clear row */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <p className="text-xs text-news-muted uppercase tracking-widest">{filtered.length} Tools</p>
                        {hasActiveFilters && (
                            <div className="flex flex-wrap gap-1.5">
                                {[
                                    search && { label: `"${search}"`, clear: () => { setSearch(''); setDebouncedSearch(''); onSearchChange?.(''); } },
                                    catFilter !== 'All' && { label: catFilter, clear: () => setCatFilter('All') },
                                    pricingFilter !== 'All' && !(activeWorkflow === 'enterprise' && pricingFilter === 'Enterprise') && { label: pricingFilter, clear: () => setPricingFilter('All') },
                                    platformFilter !== 'All' && { label: platformFilter, clear: () => setPlatformFilter('All') },
                                    activeWorkflow && { label: `Workflow: ${WORKFLOW_KEY_TO_LABEL[activeWorkflow] || activeWorkflow}`, clear: () => { setActiveWorkflow(null); setUseCaseFilter('All'); if (pricingFilter === 'Enterprise') setPricingFilter('All'); onWorkflowChange?.(null); } },
                                    (!activeWorkflow && useCaseFilter !== 'All') && { label: useCaseFilter, clear: () => setUseCaseFilter('All') },
                                    ...capFilters.map(cap => ({ label: cap, clear: () => setCapFilters(prev => prev.filter(c => c !== cap)) })),
                                ].filter(Boolean).map((chip: any) => (
                                    <span key={chip.label} className="flex items-center gap-1 text-[10px] bg-news-accent/15 text-news-accent border border-news-accent/30 rounded-full px-2 py-0.5">
                                        {chip.label} <button onClick={chip.clear} className="hover:text-white transition-colors"><X size={9} /></button>
                                    </span>
                                ))}
                                <button onClick={clearAllFilters} className="text-[10px] font-bold text-news-muted hover:text-white transition-colors">× Clear all</button>
                            </div>
                        )}
                    </div>
                    <div className="relative flex-shrink-0">
                        <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
                            className="appearance-none bg-surface-card border border-border-subtle text-news-muted text-xs font-bold rounded-xl pl-3 py-2 pr-7 focus:outline-none focus:border-news-accent cursor-pointer hover:text-white hover:border-border-divider transition-colors"
                        >
                            <option value="most-used">Most Used</option>
                            <option value="rating">Top Rated</option>
                            <option value="newest">Newest</option>
                            <option value="price">Lowest Price</option>
                        </select>
                        <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-news-muted pointer-events-none" />
                    </div>
                </div>

                {/* Tool Grid */}
                {visible.length === 0 ? (
                    <div className="text-center py-16 text-gray-500 border border-dashed border-border-subtle rounded-2xl">
                        No tools match your filters.
                        <button onClick={clearAllFilters} className="block mx-auto mt-3 text-news-accent text-xs font-bold hover:underline">Clear filters</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {visible.map(tool => {
                            const badge = getBadge(tool);
                            return (
                                <div key={tool.id} className="group relative bg-surface-card border border-border-subtle hover:bg-surface-hover hover:-translate-y-0.5 hover:border-news-accent/40 rounded-2xl p-5 transition-all flex flex-col">
                                    {badge && (
                                        <span className={`absolute top-3 right-3 text-[9px] font-bold px-2 py-0.5 rounded-full border ${badge === 'Trending' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' : 'bg-blue-500/15 text-blue-400 border-blue-500/30'}`}>{badge}</span>
                                    )}
                                    {/* Logo + Name */}
                                    <button onClick={() => onToolClick(tool.slug)} className="flex items-center gap-3 mb-3 text-left w-full">
                                        {tool.logo
                                            ? <div className="w-10 h-10 rounded-xl bg-white border border-border-subtle overflow-hidden flex-shrink-0"><img src={tool.logo} alt={tool.name} className="w-full h-full object-contain p-1" loading="lazy" /></div>
                                            : <div className="w-10 h-10 rounded-xl bg-surface-base border border-border-subtle flex items-center justify-center text-base font-black text-news-muted flex-shrink-0">{tool.name[0]}</div>
                                        }
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-bold text-white truncate group-hover:text-news-accent transition-colors pr-14">{tool.name}</h3>
                                            {tool.rating_score > 0 && <div className="flex items-center gap-1"><Star size={9} className="text-news-accent fill-news-accent" /><span className="text-[10px] font-bold text-news-accent">{tool.rating_score.toFixed(1)}</span></div>}
                                        </div>
                                    </button>
                                    {/* Category + use case tags */}
                                    <div className="flex flex-wrap gap-1.5 mb-2">
                                        {tool.category_tags?.slice(0, 2).map(tag => (
                                            <span key={tag} className="text-[9px] px-2 py-0.5 rounded-full bg-surface-base border border-border-subtle text-news-muted">{tag}</span>
                                        ))}
                                        {tool.use_case_tags?.slice(0, 1).map(tag => (
                                            <span key={tag} className="text-[9px] px-2 py-0.5 rounded-full bg-news-accent/10 border border-news-accent/20 text-news-accent">{tag}</span>
                                        ))}
                                    </div>
                                    <p className="text-news-text text-xs leading-relaxed line-clamp-2 flex-1 mb-4">{tool.short_description}</p>
                                    {/* Footer */}
                                    <div className="pt-3 border-t border-border-divider flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            <span className={`text-[10px] px-2.5 py-1 rounded-lg border font-bold flex-shrink-0 ${tool.pricing_model === 'Free' || tool.pricing_model === 'Freemium' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' : 'bg-blue-500/15 text-blue-400 border-blue-500/20'}`}>
                                                {tool.pricing_model}
                                            </span>
                                            {tool.starting_price && tool.starting_price !== 'Free' && (
                                                <span className="text-[10px] text-news-muted truncate">from {tool.starting_price.split(/[·(;]/)[0].trim()}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/comparisons?tool=${tool.slug}`}
                                                className="text-[10px] font-bold text-news-muted hover:text-white border border-border-subtle hover:border-news-accent/40 px-2 py-1 rounded-lg transition-colors"
                                            >Compare</Link>
                                            <button onClick={() => onToolClick(tool.slug)}
                                                className="text-[10px] font-bold text-news-accent hover:text-white flex items-center gap-1 transition-colors"
                                            >View <ArrowRight size={10} /></button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Load More */}
                {sorted.length > visibleCount && (
                    <div className="mt-8 text-center">
                        <button onClick={() => setVisibleCount(v => v + TOOLS_PER_PAGE)}
                            className="px-8 py-3 rounded-xl bg-surface-card border border-border-subtle text-sm font-bold text-white hover:bg-surface-hover hover:border-border-divider transition-all"
                        >Load More — {Math.min(TOOLS_PER_PAGE, sorted.length - visibleCount)} more tools</button>
                    </div>
                )}
            </section>

            {/* ── Cross-Hub Workflow Recs (workflow mode) ──────────────── */}
            {wfConfig && (wfBestOf.length > 0 || wfGuides.length > 0 || wfUseCases.length > 0) && (
                <section className="pt-10 border-t border-border-divider space-y-10">
                    {wfBestOf.length > 0 && (
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-news-muted mb-4">Rankings for {wfConfig.label}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {wfBestOf.map(a => (
                                    <button key={a.id} onClick={() => onArticleClick(a)}
                                        className="group text-left bg-surface-card border border-border-subtle rounded-2xl p-4 hover:bg-surface-hover hover:-translate-y-0.5 hover:border-border-divider transition-all"
                                    >
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-news-accent mb-2">Ranking</p>
                                        <h4 className="text-sm font-bold text-white group-hover:text-news-accent transition-colors leading-snug line-clamp-2">{a.title}</h4>
                                        <span className="text-[10px] text-news-muted flex items-center gap-1 mt-2 group-hover:text-white transition-colors">View <ArrowRight size={9} /></span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {wfGuides.length > 0 && (
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-news-muted mb-4">Guides for {wfConfig.label}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {wfGuides.map(a => (
                                    <button key={a.id} onClick={() => onArticleClick(a)}
                                        className="group text-left bg-surface-card border border-border-subtle rounded-2xl p-4 hover:bg-surface-hover hover:-translate-y-0.5 transition-all"
                                    >
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-blue-400 mb-2">Guide</p>
                                        <h4 className="text-sm font-bold text-white group-hover:text-news-accent transition-colors leading-snug line-clamp-2">{a.title}</h4>
                                        <span className="text-[10px] text-news-muted flex items-center gap-1 mt-2 group-hover:text-white transition-colors">Read <ArrowRight size={9} /></span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {wfUseCases.length > 0 && (
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-news-muted mb-4">Use Cases for {wfConfig.label}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {wfUseCases.map(a => (
                                    <button key={a.id} onClick={() => onArticleClick(a)}
                                        className="group text-left bg-surface-card border border-border-subtle rounded-2xl p-4 hover:bg-surface-hover hover:-translate-y-0.5 transition-all"
                                    >
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-400 mb-2">Use Case</p>
                                        <h4 className="text-sm font-bold text-white group-hover:text-news-accent transition-colors leading-snug line-clamp-2">{a.title}</h4>
                                        <span className="text-[10px] text-news-muted flex items-center gap-1 mt-2 group-hover:text-white transition-colors">Read <ArrowRight size={9} /></span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </section>
            )}

        </div>
    );
};

// ─── Best Software Hub ──────────────────────────────────────────────────────────────

const WORKFLOW_ICON_MAP: Record<string, React.ElementType> = {
    'Students':          GraduationCap,
    'Developers':        Code2,
    'Marketers':         Megaphone,
    'Content Creators':  PenLine,
    'Startups':          Rocket,
    'Small Business':    Briefcase,
    'Enterprise':        Layers,
    'Researchers':       Search,
    'Designers':         ImageIcon,
    'Sales Teams':       TrendingUp,
    'Agencies':          Building2,
    'Educators':         BookOpen,
    'Freelancers':       UserRound,
    'Product Managers':  Clipboard,
    'Data Scientists':   Database,
    'Musicians':         Headphones,
};

const WORKFLOW_COLOR_MAP: Record<string, string> = {
    'Students':          'text-green-400',
    'Developers':        'text-blue-400',
    'Marketers':         'text-pink-400',
    'Content Creators':  'text-purple-400',
    'Startups':          'text-orange-400',
    'Small Business':    'text-yellow-400',
    'Enterprise':        'text-cyan-400',
    'Researchers':       'text-emerald-400',
    'Designers':         'text-rose-400',
    'Sales Teams':       'text-indigo-400',
    'Agencies':          'text-violet-400',
    'Educators':         'text-teal-400',
    'Freelancers':       'text-sky-400',
    'Product Managers':  'text-amber-400',
    'Data Scientists':   'text-lime-400',
    'Musicians':         'text-fuchsia-400',
};

const ALL_WORKFLOW_TAGS = [
    'Students', 'Developers', 'Marketers', 'Content Creators', 'Startups',
    'Small Business', 'Enterprise', 'Researchers', 'Designers', 'Sales Teams',
    'Agencies', 'Educators', 'Freelancers', 'Product Managers', 'Data Scientists',
    'Musicians',
];

const BS_TRUST = [
    { icon: Search,   title: 'Independent Research',    desc: 'Every ranking is based on hands-on testing, public data, and community feedback — not vendor submissions.' },
    { icon: Star,     title: 'No Pay-to-Rank',          desc: 'Tools are ranked on merit. Affiliate relationships are disclosed but never influence ranking position.' },
    { icon: Workflow, title: 'Structured Methodology',  desc: 'Each ranking uses a consistent scoring system: features, pricing, integrations, user experience, and AI capability.' },
];

const BS_SEO = [
    {
        h2: 'The Best AI Tool Rankings in 2026',
        body: 'Finding the right AI tool in 2026 is harder than it used to be. There are now hundreds of AI-powered tools competing in every category — from writing and coding to marketing automation and project management. Our rankings cut through the noise by testing each tool against a consistent methodology: features, real-world performance, pricing transparency, and integration depth.',
    },
    {
        h2: 'How We Rank AI Tools',
        body: 'Every ranking on ToolCurrent is built from structured evaluation criteria, not editorial opinion alone. We assess tools across five dimensions: core feature set, ease of onboarding, pricing fairness, integration ecosystem, and AI-native capability. Tools are re-evaluated quarterly to reflect product updates and market shifts.',
    },
];

export const BestSoftwareHub: React.FC<{
    articles: Article[];
    onArticleClick: (a: Article) => void;
    onToolClick?: (slug: string) => void;
    onComparisonClick?: (slug: string) => void;
    onHubNavigate?: (hub: string) => void;
    workflowFilter?: string;
    queryString?: string;
    initialTools?: Tool[];
}> = ({ onToolClick, onComparisonClick, onHubNavigate, initialTools }) => {
    const [allTools, setAllTools] = useState<Tool[]>(initialTools ?? []);
    useEffect(() => {
        if (initialTools?.length) return;
        fetch('/api/tools').then(r => r.json()).then(d => setAllTools(Array.isArray(d) ? d : [])).catch(() => {});
    }, []);

    // ── Dynamic data ──────────────────────────────────────────────────────────
    type RankingCard = { title: string; url: string; description: string; count: number; topTools: Tool[]; avgScore?: number };

    const featuredRankings = React.useMemo((): RankingCard[] => {
        const catSlug = (cat: string) => cat.toLowerCase().replace(/\s*&\s*/g, '-').replace(/\s+/g, '-').replace(/-+/g, '-');
        const wfSlug = (tag: string) => tag.toLowerCase().replace(/\s+/g, '-');

        const catDescs: Record<string, string> = {
            'AI Chatbots':        'The best AI conversation tools for productivity, research, and everyday tasks.',
            'AI Writing':         'Top AI writing assistants ranked by content quality, features, and value.',
            'AI Image Generation':'Leading image generation models ranked by output quality and ease of use.',
            'AI Video':           'AI video creation and editing tools ranked by realism and workflow speed.',
            'AI Audio':           'AI audio tools for voice cloning, transcription, and music generation.',
            'Productivity':       'The best productivity tools to organize work and get more done.',
            'Automation':         'Top workflow automation platforms to eliminate repetitive tasks.',
            'Development':        'Developer tools powered by AI to ship code faster.',
            'Marketing':          'AI marketing tools ranked by campaign performance and ease of use.',
            'Sales & CRM':        'CRM and sales tools to manage pipelines and close deals faster.',
            'Design':             'AI design tools ranked by creative output and collaboration features.',
            'Customer Support':   'AI-powered support tools to resolve tickets faster at scale.',
            'Data Analysis':      'Data analysis tools that turn raw numbers into actionable insights.',
            'SEO Tools':          'SEO tools ranked by ranking lift, technical audit depth, and ease of use.',
        };

        const cards: RankingCard[] = [];

        // Build sorted category data inline (same as catData memo)
        const catGroups: Record<string, Tool[]> = {};
        allTools.forEach(t => {
            if (!t.category_primary) return;
            if (!catGroups[t.category_primary]) catGroups[t.category_primary] = [];
            catGroups[t.category_primary].push(t);
        });
        const sortedCats = Object.entries(catGroups)
            .map(([cat, tools]) => ({ cat, count: tools.length, tools }))
            .sort((a, b) => b.count - a.count);

        // Build sorted workflow data inline (same as workflowData memo)
        const sortedWfs = ALL_WORKFLOW_TAGS.map(tag => {
            const tools = allTools.filter(t => ((t as any).workflow_tags || []).includes(tag));
            const scores = tools.map(t => {
                const wb = (t as any).workflow_breakdown as string | null;
                if (!wb) return null;
                const line = wb.split('\n').find((l: string) => l.toLowerCase().startsWith(tag.toLowerCase() + ':'));
                if (!line) return null;
                const m = line.match(/(\d+(?:\.\d+)?)\s*\/\s*10/);
                return m ? parseFloat(m[1]) : null;
            }).filter((s): s is number => s !== null);
            const avgScore = scores.length >= 3 ? +(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : null;
            return { tag, count: tools.length, avgScore, tools };
        }).filter(w => w.count > 0 && w.avgScore !== null).sort((a, b) => (b.avgScore || 0) - (a.avgScore || 0));

        // 1. Most populated category
        if (sortedCats.length > 0) {
            const { cat, count, tools } = sortedCats[0];
            const topTools = [...tools].sort((a, b) => (b.rating_score || 0) - (a.rating_score || 0)).slice(0, 3);
            cards.push({ title: `Best ${cat} Tools 2026`, url: `/best-ai-tools/${catSlug(cat)}`, description: catDescs[cat] || `Top ${cat} tools ranked by features, pricing, and performance.`, count, topTools });
        }
        // 2. Highest avg-score workflow (min 3 tools with scores)
        if (sortedWfs.length > 0) {
            const { tag, count, tools, avgScore } = sortedWfs[0];
            const topTools = [...tools].sort((a, b) => (b.rating_score || 0) - (a.rating_score || 0)).slice(0, 3);
            cards.push({ title: `Best Tools for ${tag} 2026`, url: `/best-ai-tools/for/${wfSlug(tag)}`, description: `Top-rated tools built for ${tag.toLowerCase()} workflows, ranked by overall score.`, count, topTools, avgScore: avgScore ?? undefined });
        }
        // 3. Second most populated category
        if (sortedCats.length > 1) {
            const { cat, count, tools } = sortedCats[1];
            const topTools = [...tools].sort((a, b) => (b.rating_score || 0) - (a.rating_score || 0)).slice(0, 3);
            cards.push({ title: `Best ${cat} Tools 2026`, url: `/best-ai-tools/${catSlug(cat)}`, description: catDescs[cat] || `Top ${cat} tools ranked by features, pricing, and performance.`, count, topTools });
        }
        // 4. Second highest scoring workflow
        if (sortedWfs.length > 1) {
            const { tag, count, tools, avgScore } = sortedWfs[1];
            const topTools = [...tools].sort((a, b) => (b.rating_score || 0) - (a.rating_score || 0)).slice(0, 3);
            cards.push({ title: `Best Tools for ${tag} 2026`, url: `/best-ai-tools/for/${wfSlug(tag)}`, description: `Top-rated tools built for ${tag.toLowerCase()} workflows, ranked by overall score.`, count, topTools, avgScore: avgScore ?? undefined });
        }
        // 5. Best Free AI Tools
        const freeTools = allTools.filter(t => t.pricing_model === 'Free' || t.pricing_model === 'Freemium');
        const freeCatFreq: Record<string, number> = {};
        freeTools.forEach(t => { if (t.category_primary) freeCatFreq[t.category_primary] = (freeCatFreq[t.category_primary] || 0) + 1; });
        const topFreeCat = Object.entries(freeCatFreq).sort((a, b) => b[1] - a[1])[0];
        const freeCatSlug = topFreeCat ? catSlug(topFreeCat[0]) : 'ai-chatbots';
        const topFreeTools = [...freeTools].sort((a, b) => (b.rating_score || 0) - (a.rating_score || 0)).slice(0, 3);
        cards.push({ title: 'Best Free AI Tools 2026', url: `/best-ai-tools/${freeCatSlug}`, description: 'Free and freemium AI tools that deliver real value without a paid plan.', count: freeTools.length, topTools: topFreeTools });
        // 6. Top Rated Tools
        const topRatedTools = [...allTools].sort((a, b) => (b.rating_score || 0) - (a.rating_score || 0)).slice(0, 3);
        const topCatSlug = sortedCats.length > 0 ? catSlug(sortedCats[0].cat) : 'ai-chatbots';
        cards.push({ title: 'Top Rated Tools 2026', url: `/best-ai-tools/${topCatSlug}`, description: 'The highest-rated AI tools across all categories, scored by features, pricing, and performance.', count: allTools.length, topTools: topRatedTools });

        return cards.slice(0, 6);
    }, [allTools]);

    const workflowData = React.useMemo(() =>
        ALL_WORKFLOW_TAGS.map(tag => {
            const tools = allTools.filter(t => ((t as any).workflow_tags || []).includes(tag));
            const scores = tools
                .map(t => {
                    const wb = (t as any).workflow_breakdown as string | null;
                    if (!wb) return null;
                    const line = wb.split('\n').find((l: string) => l.toLowerCase().startsWith(tag.toLowerCase() + ':'));
                    if (!line) return null;
                    const m = line.match(/(\d+(?:\.\d+)?)\s*\/\s*10/);
                    return m ? parseFloat(m[1]) : null;
                })
                .filter((s): s is number => s !== null);
            const avgScore = scores.length >= 3
                ? +(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
                : null;
            return { tag, count: tools.length, avgScore };
        }).filter(w => w.count > 0),
        [allTools]
    );

    const catData = React.useMemo(() => {
        const groups: Record<string, Tool[]> = {};
        allTools.forEach(t => {
            if (!t.category_primary) return;
            if (!groups[t.category_primary]) groups[t.category_primary] = [];
            groups[t.category_primary].push(t);
        });
        return Object.entries(groups)
            .map(([cat, tools]) => {
                const sorted = [...tools].sort((a, b) => (b.rating_score || 0) - (a.rating_score || 0));
                return { cat, topTool: sorted[0], count: tools.length };
            })
            .sort((a, b) => b.count - a.count);
    }, [allTools]);

    const recentTools = React.useMemo(() =>
        [...allTools]
            .filter(t => t.last_updated)
            .sort((a, b) => new Date(b.last_updated!).getTime() - new Date(a.last_updated!).getTime())
            .slice(0, 4),
        [allTools]
    );


    return (
        <div className="space-y-16">

            {/* ── 1. Featured Rankings ─────────────────────────────────────── */}
            {featuredRankings.length > 0 && (
                <section>
                    <h2 className="text-xl font-black text-white mb-2 flex items-center gap-2">
                        <Star size={20} className="text-news-accent" /> Featured Rankings
                    </h2>
                    <p className="text-sm text-news-muted mb-6">Curated ranking pages across every major category and workflow.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {featuredRankings.map((ranking, i) => (
                            <a
                                key={i}
                                href={ranking.url}
                                className="group w-full text-left bg-surface-card border border-border-subtle hover:bg-surface-hover hover:-translate-y-0.5 hover:border-news-accent/40 rounded-2xl transition-all p-5 flex flex-col gap-3 no-underline"
                            >
                                {/* Header row */}
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-news-accent">BEST OF</span>
                                    {ranking.avgScore != null && (
                                        <span className="text-[9px] font-black text-news-accent flex items-center gap-0.5">
                                            <Star size={8} fill="currentColor" /> {ranking.avgScore}/10
                                        </span>
                                    )}
                                </div>
                                {/* Title */}
                                <h3 className="text-sm font-bold text-white group-hover:text-news-accent transition-colors leading-tight">{ranking.title}</h3>
                                {/* Description */}
                                <p className="text-[11px] text-news-muted leading-relaxed line-clamp-2 flex-1">{ranking.description}</p>
                                {/* Tool count */}
                                <span className="text-[10px] text-news-muted">{ranking.count} tools ranked</span>
                                {/* Footer: overlapping logos + VIEW RANKINGS */}
                                <div className="pt-3 border-t border-border-divider flex items-center justify-between">
                                    <div className="flex items-center">
                                        {ranking.topTools.map((tool, ti) => (
                                            <div
                                                key={tool.slug}
                                                title={tool.name}
                                                className="w-8 h-8 rounded-full bg-white border-2 border-surface-card flex items-center justify-center p-1 flex-shrink-0 overflow-hidden"
                                                style={{ marginLeft: ti > 0 ? '-8px' : 0 }}
                                            >
                                                {tool.logo
                                                    ? <img src={tool.logo} alt={tool.name} className="max-w-full max-h-full object-contain" loading="lazy" />
                                                    : <Layers size={12} className="text-news-muted" />
                                                }
                                            </div>
                                        ))}
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-news-accent flex items-center gap-1 group-hover:text-white transition-colors">
                                        View Rankings <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                                    </span>
                                </div>
                            </a>
                        ))}
                    </div>
                </section>
            )}

            {/* ── 2. Browse by Workflow ─────────────────────────────────────── */}
            {workflowData.length > 0 && (
                <section>
                    <h2 className="text-xl font-black text-white mb-2 flex items-center gap-2">
                        <Workflow size={20} className="text-news-accent" /> Browse by Workflow
                    </h2>
                    <p className="text-sm text-news-muted mb-6">Find the best tools for your specific role and workflow.</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                        {workflowData.map(({ tag, count, avgScore }) => {
                            const Icon = WORKFLOW_ICON_MAP[tag] || Layers;
                            const color = WORKFLOW_COLOR_MAP[tag] || 'text-news-muted';
                            const wfSlug = tag.toLowerCase().replace(/\s+/g, '-');
                            return (
                                <a
                                    key={tag}
                                    href={`/best-ai-tools/for/${wfSlug}`}
                                    className="group flex flex-col items-center gap-2 px-3 py-4 rounded-2xl border bg-surface-card border-border-subtle hover:bg-surface-hover hover:border-border-divider transition-all text-center no-underline"
                                >
                                    <Icon size={20} className={`flex-shrink-0 ${color}`} />
                                    <span className="text-[11px] font-bold text-white leading-tight group-hover:text-news-accent transition-colors">{tag}</span>
                                    <div className="flex flex-col items-center gap-0.5">
                                        <span className="text-[9px] text-news-muted">{count} tool{count !== 1 ? 's' : ''}</span>
                                        {avgScore !== null && (
                                            <span className="flex items-center gap-0.5 text-[9px] text-news-accent font-bold">
                                                <Star size={8} fill="currentColor" />{avgScore}/10
                                            </span>
                                        )}
                                    </div>
                                </a>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* ── 3. Browse by Category ─────────────────────────────────────── */}
            {catData.length > 0 && (
                <section>
                    <h2 className="text-xl font-black text-white mb-2 flex items-center gap-2">
                        <LayoutGrid size={20} className="text-news-accent" /> Browse by Category
                    </h2>
                    <p className="text-sm text-news-muted mb-6">Explore rankings in every major software category.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {catData.map(({ cat, topTool, count }) => {
                            const meta = CATEGORY_META[cat];
                            const Icon = meta?.icon || Layers;
                            return (
                                <a
                                    key={cat}
                                    href={`/best-ai-tools/${cat.toLowerCase().replace(/\s*&\s*/g, '-').replace(/\s+/g, '-').replace(/-+/g, '-')}`}
                                    className="group w-full text-left bg-surface-card border border-border-subtle hover:bg-surface-hover hover:-translate-y-0.5 hover:border-news-accent/40 rounded-2xl transition-all p-5 flex items-start gap-4 no-underline"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-news-accent/10 border border-news-accent/20 flex items-center justify-center flex-shrink-0">
                                        <Icon size={18} className="text-news-accent" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className="text-sm font-black text-white group-hover:text-news-accent transition-colors leading-tight">{cat}</h3>
                                            <span className="text-[9px] text-news-muted font-bold flex-shrink-0">{count} tools</span>
                                        </div>
                                        {topTool && (
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-[9px] text-news-muted uppercase tracking-widest font-bold">Top rated:</span>
                                                <div className="flex items-center gap-1.5">
                                                    {topTool.logo && (
                                                        <div className="w-4 h-4 rounded bg-white border border-border-subtle flex items-center justify-center p-0.5 flex-shrink-0">
                                                            <img src={topTool.logo} alt={topTool.name} className="max-w-full max-h-full object-contain" loading="lazy" />
                                                        </div>
                                                    )}
                                                    <span className="text-[10px] font-bold text-news-text truncate">{topTool.name}</span>
                                                    {topTool.rating_score > 0 && (
                                                        <span className="text-[9px] text-news-accent font-bold flex items-center gap-0.5 flex-shrink-0">
                                                            <Star size={8} fill="currentColor" />{topTool.rating_score}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </a>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* ── 4. Recently Updated Rankings ─────────────────────────────── */}
            {recentTools.length > 0 && (
                <section>
                    <h2 className="text-xl font-black text-white mb-2 flex items-center gap-2">
                        <Radio size={18} className="text-news-accent" /> Recently Updated
                    </h2>
                    <p className="text-sm text-news-muted mb-6">Rankings refreshed with the latest product updates and pricing.</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        {recentTools.map(tool => {
                            const updatedLabel = new Date(tool.last_updated!).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                            return (
                                <button
                                    key={tool.slug}
                                    onClick={() => onToolClick?.(tool.slug)}
                                    className="group flex flex-col items-center gap-3 p-4 rounded-2xl bg-surface-card border border-border-subtle hover:border-news-accent/50 hover:-translate-y-0.5 transition-all text-center"
                                >
                                    <div className="flex flex-col items-center gap-1.5">
                                        <div className="w-12 h-12 rounded-2xl bg-white border border-border-subtle flex items-center justify-center p-2 flex-shrink-0">
                                            {tool.logo
                                                ? <img src={tool.logo} alt={tool.name} className="max-w-full max-h-full object-contain" loading="lazy" />
                                                : <Layers size={18} className="text-news-muted" />
                                            }
                                        </div>
                                        <span className="text-[7px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-black uppercase tracking-widest whitespace-nowrap">
                                            UPDATED
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-[11px] font-bold text-white group-hover:text-news-accent transition-colors leading-tight line-clamp-1 block">{tool.name}</span>
                                        {tool.category_primary && (
                                            <span className="text-[9px] text-news-muted">{tool.category_primary}</span>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-center gap-1">
                                        {tool.rating_score > 0 && (
                                            <span className="flex items-center gap-0.5 text-[9px] text-news-accent font-bold">
                                                <Star size={9} fill="currentColor" />{tool.rating_score}
                                            </span>
                                        )}
                                        <span className="text-[8px] text-news-muted font-bold">{updatedLabel}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* ── 5. Trust Section ───────────────────────────────────────── */}
            <section className="rounded-2xl border border-border-subtle bg-surface-card p-8">
                <h2 className="text-base font-black text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                    <Star size={16} className="text-news-accent" /> How We Rank
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {BS_TRUST.map(({ icon: Icon, title, desc }) => (
                        <div key={title} className="flex gap-4">
                            <div className="w-9 h-9 rounded-xl bg-news-accent/10 border border-news-accent/20 flex items-center justify-center flex-shrink-0">
                                <Icon size={16} className="text-news-accent" />
                            </div>
                            <div>
                                <p className="text-sm font-black text-white mb-1">{title}</p>
                                <p className="text-xs text-news-muted leading-relaxed">{desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── 6 & 7. CTA pair ───────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Compare Tools */}
                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-7 flex flex-col gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                        <BarChart2 size={18} className="text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-base font-black text-white mb-2">Compare Tools Side by Side</h3>
                        <p className="text-sm text-news-muted leading-relaxed mb-4">Not sure which tool is right for you? Our comparison pages break down features, pricing, and use cases head to head.</p>
                    </div>
                    <button
                        onClick={() => onComparisonClick?.('comparisons')}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-black hover:bg-blue-500/20 transition-colors self-start mt-auto"
                    >
                        Browse Comparisons <ArrowRight size={13} />
                    </button>
                </div>

                {/* AI Tools Directory */}
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-7 flex flex-col gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <Search size={18} className="text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-base font-black text-white mb-2">Just exploring? Try the AI Tools Directory</h3>
                        <p className="text-sm text-news-muted leading-relaxed mb-4">Not ready to pick a winner yet? Browse 200+ AI tools by category, platform, and use case — no ranking bias, just exploration.</p>
                    </div>
                    <button
                        onClick={() => onHubNavigate?.('ai-tools')}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black hover:bg-emerald-500/20 transition-colors self-start mt-auto"
                    >
                        Explore AI Tools <ArrowRight size={13} />
                    </button>
                </div>
            </div>

            {/* ── 11. SEO Content Block ──────────────────────────────────── */}
            <section className="border-t border-border-divider pt-12">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                {BS_SEO.map((block, i) => (
                    <div key={i}>
                        <h2 className="text-lg font-black text-white mb-3">{block.h2}</h2>
                        <p className="text-sm text-news-muted leading-relaxed">{block.body}</p>
                    </div>
                ))}
                </div>
            </section>

        </div>
    );
};


// ─── Generated comparison pair type ──────────────────────────────────────────
interface GenPair {
    toolA: Tool;
    toolB: Tool;
    sharedUseCase: string | null;
    combinedScore: number;
    isEditorialPick: boolean;
    slug: string;
    ucSlug: string | null;
}

// Build pairs from top-rated tools' competitor relationships
function buildTrendingPairs(tools: Tool[], cmsPairs: Comparison[]): GenPair[] {
    const rated = tools.filter(t => (t.rating_score || 0) > 0);
    const top12 = [...rated].sort((a, b) => (b.rating_score || 0) - (a.rating_score || 0)).slice(0, 12);
    const toolById: Record<string, Tool> = {};
    tools.forEach(t => { toolById[(t as any).id] = t; toolById[t.slug] = t; });
    const seen = new Set<string>();
    const pairs: GenPair[] = [];
    for (const tA of top12) {
        const competitorIds: string[] = (tA as any).competitors || [];
        for (const cId of competitorIds) {
            const tB = toolById[cId];
            if (!tB) continue;
            const [hiT, loT] = (tA.rating_score || 0) >= (tB.rating_score || 0) ? [tA, tB] : [tB, tA];
            const key = `${hiT.slug}|${loT.slug}`;
            if (seen.has(key)) continue;
            seen.add(key);
            const ucA: string[] = (hiT as any).use_case_tags || [];
            const ucB: string[] = (loT as any).use_case_tags || [];
            const sharedUC = ucA.find((uc: string) => ucB.includes(uc)) || null;
            const editPick = cmsPairs.some(c =>
                ((c.tool_a_slug === hiT.slug && c.tool_b_slug === loT.slug) ||
                 (c.tool_a_slug === loT.slug && c.tool_b_slug === hiT.slug)) &&
                (c as any).is_override === true
            );
            pairs.push({
                toolA: hiT, toolB: loT, sharedUseCase: sharedUC,
                combinedScore: (hiT.rating_score || 0) + (loT.rating_score || 0),
                isEditorialPick: editPick,
                slug: `${hiT.slug}-vs-${loT.slug}`,
                ucSlug: sharedUC ? sharedUC.toLowerCase().replace(/\s+/g, '-') : null,
            });
        }
    }
    return pairs.sort((a, b) => b.combinedScore - a.combinedScore).slice(0, 9);
}

// Build ALL pairs for category browsing (all rated tools, not just top 12)
function buildAllPairs(tools: Tool[], cmsPairs: Comparison[]): GenPair[] {
    const toolById: Record<string, Tool> = {};
    tools.forEach(t => { toolById[(t as any).id] = t; toolById[t.slug] = t; });
    const seen = new Set<string>();
    const pairs: GenPair[] = [];
    for (const tA of tools) {
        if (!((tA.rating_score || 0) > 0)) continue;
        const competitorIds: string[] = (tA as any).competitors || [];
        for (const cId of competitorIds) {
            const tB = toolById[cId];
            if (!tB || !((tB.rating_score || 0) > 0)) continue;
            const [hiT, loT] = (tA.rating_score || 0) >= (tB.rating_score || 0) ? [tA, tB] : [tB, tA];
            const key = `${hiT.slug}|${loT.slug}`;
            if (seen.has(key)) continue;
            seen.add(key);
            const ucA: string[] = (hiT as any).use_case_tags || [];
            const ucB: string[] = (loT as any).use_case_tags || [];
            const sharedUC = ucA.find((uc: string) => ucB.includes(uc)) || null;
            const editPick = cmsPairs.some(c =>
                ((c.tool_a_slug === hiT.slug && c.tool_b_slug === loT.slug) ||
                 (c.tool_a_slug === loT.slug && c.tool_b_slug === hiT.slug)) &&
                (c as any).is_override === true
            );
            pairs.push({
                toolA: hiT, toolB: loT, sharedUseCase: sharedUC,
                combinedScore: (hiT.rating_score || 0) + (loT.rating_score || 0),
                isEditorialPick: editPick,
                slug: `${hiT.slug}-vs-${loT.slug}`,
                ucSlug: sharedUC ? sharedUC.toLowerCase().replace(/\s+/g, '-') : null,
            });
        }
    }
    return pairs.sort((a, b) => b.combinedScore - a.combinedScore);
}

const CAT_KEYWORDS: Record<string, string[]> = {
    'AI Assistants':        ['chatbot', 'ai chatbot', 'ai assistant'],
    'Productivity Tools':   ['productivity'],
    'Automation Platforms': ['automation'],
    'AI Writing':           ['ai writing', 'writing'],
    'Developer Tools':      ['development', 'developer', 'coding'],
    'Image Generation':     ['design', 'image'],
};

function toolMatchesCat(tool: Tool, cat: string): boolean {
    if (cat === 'All') return true;
    const keywords = CAT_KEYWORDS[cat] || [cat.toLowerCase().replace(/ tools?| platforms?| generation/g, '')];
    const tags = [(tool as any).category_primary, ...(tool.category_tags || [])].filter(Boolean)
        .map((s: string) => s.toLowerCase());
    return keywords.some(kw => tags.some(tag => tag.includes(kw)));
}

// ─── Pair card skeleton ────────────────────────────────────────────────────────
const PairCardSkeleton: React.FC = () => (
    <div className="flex flex-col bg-surface-card border border-border-subtle rounded-2xl overflow-hidden animate-pulse">
        <div className="px-4 pt-3 pb-1">
            <div className="w-14 h-3.5 bg-surface-alt rounded" />
        </div>
        <div className="flex items-stretch px-3 py-3 gap-1">
            <div className="flex-1 flex flex-col items-center gap-2 px-2 py-2">
                <div className="w-10 h-10 rounded-xl bg-surface-alt flex-shrink-0" />
                <div className="h-2.5 bg-surface-alt rounded w-3/4" />
                <div className="h-7 bg-surface-alt rounded w-1/2" />
                <div className="h-2 bg-surface-alt rounded w-1/3" />
            </div>
            <div className="w-6 flex flex-col items-center justify-center gap-1">
                <div className="w-px flex-1 bg-surface-alt" />
                <div className="w-5 h-5 rounded-full bg-surface-alt flex-shrink-0" />
                <div className="w-px flex-1 bg-surface-alt" />
            </div>
            <div className="flex-1 flex flex-col items-center gap-2 px-2 py-2">
                <div className="w-10 h-10 rounded-xl bg-surface-alt flex-shrink-0" />
                <div className="h-2.5 bg-surface-alt rounded w-3/4" />
                <div className="h-7 bg-surface-alt rounded w-1/2" />
                <div className="h-2 bg-surface-alt rounded w-1/3" />
            </div>
        </div>
        <div className="border-t border-border-divider px-4 py-2.5">
            <div className="h-3 bg-surface-alt rounded w-2/3 mx-auto" />
        </div>
    </div>
);

// ─── Pair card — shared between Trending and Browse sections ──────────────────
const PairCard: React.FC<{ pair: GenPair; onClick: () => void }> = ({ pair, onClick }) => {
    const { toolA, toolB, sharedUseCase, isEditorialPick, slug } = pair;

    const scoreA = (() => {
        if (sharedUseCase) {
            const entry = ((toolA as any).use_case_scores || []).find(
                (s: any) => s.use_case?.toLowerCase() === sharedUseCase.toLowerCase()
            );
            if (entry?.score != null) return entry.score as number;
        }
        return toolA.rating_score || 0;
    })();
    const scoreB = (() => {
        if (sharedUseCase) {
            const entry = ((toolB as any).use_case_scores || []).find(
                (s: any) => s.use_case?.toLowerCase() === sharedUseCase.toLowerCase()
            );
            if (entry?.score != null) return entry.score as number;
        }
        return toolB.rating_score || 0;
    })();

    const tied = scoreA === scoreB;
    const aWins = !tied && scoreA >= scoreB;
    const bWins = !tied && scoreB > scoreA;

    return (
        <a href={`/compare/${slug}`}
            onClick={e => { e.preventDefault(); onClick(); }}
            className="group flex flex-col bg-surface-card border border-border-subtle rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 ease-out hover:border-news-accent/60 hover:bg-surface-hover hover:-translate-y-1 no-underline">

            {/* Category tag + editorial badge */}
            <div className="flex items-center justify-between px-4 pt-3 pb-0">
                <span className={`text-[9px] px-1.5 py-0.5 rounded border font-medium uppercase tracking-wider ${sharedUseCase ? 'border-news-accent/25 text-news-accent/60' : 'border-border-subtle text-news-muted/60'}`}>
                    {sharedUseCase || 'Overall'}
                </span>
                {isEditorialPick && (
                    <span className="text-[8px] font-bold uppercase tracking-widest text-news-accent/50">Pick</span>
                )}
            </div>

            {/* Three-zone comparison area */}
            <div className="flex items-stretch px-3 py-3 gap-0.5">

                {/* Tool A */}
                <div className={`flex-1 flex flex-col items-center gap-2 px-2 pt-2 pb-2.5 rounded-xl transition-colors duration-200 ${aWins ? 'bg-news-accent/5' : ''}`}>
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center overflow-hidden flex-shrink-0 p-1">
                        {toolA.logo
                            ? <img src={toolA.logo} alt={toolA.name} width={40} height={40}
                                className="w-full h-full object-contain"
                                onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                            : <span className="text-sm font-black text-surface-base">{toolA.name[0]}</span>
                        }
                    </div>
                    <p className={`text-[11px] font-semibold text-center leading-tight w-full truncate ${aWins ? 'text-white' : tied ? 'text-white/80' : 'text-white/45'}`}>
                        {toolA.name}
                    </p>
                    <p className={`text-2xl font-black leading-none tabular-nums ${aWins ? 'text-news-accent' : tied ? 'text-news-accent/70' : 'text-white/35'}`}>
                        {scoreA > 0 ? scoreA.toFixed(1) : '—'}
                    </p>
                    <div className="h-3 flex items-center justify-center">
                        {aWins
                            ? <span className="text-[8px] font-bold uppercase tracking-widest text-news-accent/60">Top rated</span>
                            : <span className="text-[8px] invisible select-none">x</span>
                        }
                    </div>
                </div>

                {/* VS divider */}
                <div className="flex flex-col items-center justify-center gap-1 w-6 flex-shrink-0">
                    <div className="w-px flex-1 bg-border-subtle" />
                    <div className="w-5 h-5 rounded-full bg-surface-base border border-border-subtle flex items-center justify-center flex-shrink-0">
                        <span className="text-[7px] font-black text-news-muted/70 leading-none">VS</span>
                    </div>
                    <div className="w-px flex-1 bg-border-subtle" />
                </div>

                {/* Tool B */}
                <div className={`flex-1 flex flex-col items-center gap-2 px-2 pt-2 pb-2.5 rounded-xl transition-colors duration-200 ${bWins ? 'bg-news-accent/5' : ''}`}>
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center overflow-hidden flex-shrink-0 p-1">
                        {toolB.logo
                            ? <img src={toolB.logo} alt={toolB.name} width={40} height={40}
                                className="w-full h-full object-contain"
                                onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                            : <span className="text-sm font-black text-surface-base">{toolB.name[0]}</span>
                        }
                    </div>
                    <p className={`text-[11px] font-semibold text-center leading-tight w-full truncate ${bWins ? 'text-white' : tied ? 'text-white/80' : 'text-white/45'}`}>
                        {toolB.name}
                    </p>
                    <p className={`text-2xl font-black leading-none tabular-nums ${bWins ? 'text-news-accent' : tied ? 'text-news-accent/70' : 'text-white/35'}`}>
                        {scoreB > 0 ? scoreB.toFixed(1) : '—'}
                    </p>
                    <div className="h-3 flex items-center justify-center">
                        {bWins
                            ? <span className="text-[8px] font-bold uppercase tracking-widest text-news-accent/60">Top rated</span>
                            : <span className="text-[8px] invisible select-none">x</span>
                        }
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="border-t border-border-divider px-4 py-2.5">
                <p className="text-xs text-center font-semibold text-news-muted/70 group-hover:text-news-accent transition-colors duration-150">
                    View full comparison <span className="inline-block group-hover:translate-x-0.5 transition-transform duration-150">→</span>
                </p>
            </div>
        </a>
    );
};

// ─── Comparisons Hub ──────────────────────────────────────────────────────────
const COMP_CATEGORIES = ['All', 'AI Assistants', 'Productivity Tools', 'Automation Platforms', 'AI Writing', 'Developer Tools', 'Image Generation'];

export const ComparisonsHub: React.FC<{
    onComparisonClick: (s: string, uc?: string) => void;
    articles: Article[];
    onArticleClick: (a: Article) => void;
    initialToolSlug?: string;
    onToolAChange?: (slug: string | null) => void;
}> = ({ onComparisonClick, articles, onArticleClick, initialToolSlug, onToolAChange }) => {
    // ── Core data state ──────────────────────────────────────────────────────
    const [tools, setTools] = useState<Tool[]>([]);
    const [cmsPairs, setCmsPairs] = useState<Comparison[]>([]);
    const [loading, setLoading] = useState(true);

    // ── Browse / sort state ──────────────────────────────────────────────────
    const [catFilter, setCatFilter] = useState('All');
    const [sortBy, setSortBy] = useState<'popular' | 'rated'>('popular');

    // ── Tool selector state — builderA initialized from URL param ────────────
    const [builderA, setBuilderA] = useState(initialToolSlug || '');
    const [builderB, setBuilderB] = useState('');
    const [builderC, setBuilderC] = useState('');
    const [builderUC, setBuilderUC] = useState('');
    const browseRef = React.useRef<HTMLElement>(null);

    // ── Animation motion preference ──────────────────────────────────────────
    const prefersReducedMotion = React.useRef(
        typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ).current;

    // ── Data fetch ───────────────────────────────────────────────────────────
    useEffect(() => {
        Promise.all([
            fetch('/api/tools').then(r => r.json()),
            fetch('/api/comparisons').then(r => r.json()).catch(() => []),
        ]).then(([t, comps]) => {
            setTools(Array.isArray(t) ? t : []);
            setCmsPairs(Array.isArray(comps) ? comps : []);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    // ── Generated pairs ──────────────────────────────────────────────────────
    const trendingPairs = React.useMemo(() => buildTrendingPairs(tools, cmsPairs), [tools, cmsPairs]);
    const allPairs      = React.useMemo(() => buildAllPairs(tools, cmsPairs),      [tools, cmsPairs]);

    // ── Tool selector derived state ──────────────────────────────────────────
    const toolObjA = tools.find(t => t.slug === builderA);
    const toolObjB = tools.find(t => t.slug === builderB);
    const toolsForB = tools.filter(t => t.slug !== builderA);
    const toolsForC = tools.filter(t => t.slug !== builderA && t.slug !== builderB);

    const ucIntersection: string[] = React.useMemo(() => {
        if (!toolObjA || !toolObjB) return [];
        const ucA: string[] = (toolObjA as any).use_case_tags || [];
        const ucB: string[] = (toolObjB as any).use_case_tags || [];
        return ucA.filter((uc: string) => ucB.includes(uc));
    }, [toolObjA, toolObjB]);

    // Auto-select if exactly one shared use case
    useEffect(() => {
        if (ucIntersection.length === 1) setBuilderUC(ucIntersection[0]);
        else setBuilderUC('');
    }, [ucIntersection.join(',')]);

    const handleCompare = () => {
        if (!builderA || !builderB) return;
        const slug = builderC
            ? `${builderA}-vs-${builderB}-vs-${builderC}`
            : `${builderA}-vs-${builderB}`;
        const ucSlug = builderUC ? builderUC.toLowerCase().replace(/\s+/g, '-') : undefined;
        onComparisonClick(slug, ucSlug);
    };

    // ── Browse by category ───────────────────────────────────────────────────
    const filteredPairs = React.useMemo(() => {
        const base = catFilter === 'All'
            ? trendingPairs
            : allPairs.filter(p => toolMatchesCat(p.toolA, catFilter) && toolMatchesCat(p.toolB, catFilter));
        return sortBy === 'rated'
            ? [...base].sort((a, b) => b.combinedScore - a.combinedScore)
            : base;
    }, [catFilter, sortBy, trendingPairs, allPairs]);

    const relatedRankings = articles.filter(a => (a as any).article_type === 'best-of').slice(0, 4);

    // ── Shared styles ────────────────────────────────────────────────────────
    const heroGradientStyle: React.CSSProperties = {
        background: 'radial-gradient(ellipse 90% 70% at 50% 0%, rgba(43,212,195,0.05) 0%, transparent 70%)',
    };
    const dotGridStyle: React.CSSProperties = {
        backgroundImage: 'radial-gradient(circle, rgba(43,212,195,0.04) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
    };

    // ── Loading skeleton ─────────────────────────────────────────────────────
    if (loading) return (
        <div>
            <section className="relative overflow-hidden" style={heroGradientStyle}>
                <div className="hidden md:block absolute inset-0 pointer-events-none" style={dotGridStyle} />
                <div className="container mx-auto px-4 md:px-8 pt-[140px] md:pt-[150px] pb-8 md:pb-10">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-news-accent mb-2">ToolCurrent Comparisons</p>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-4">Comparisons</h1>
                    <p className="text-lg md:text-xl text-news-muted mb-8 max-w-xl leading-relaxed">Compare any two AI tools instantly. See scores, features, and a clear verdict.</p>
                </div>
                <div className="absolute bottom-0 inset-x-0 h-10 pointer-events-none"
                    style={{ background: 'linear-gradient(to bottom, transparent, #0B0F14)' }} />
            </section>
            <div className="container mx-auto px-4 md:px-8 py-10">
                <div className="space-y-16">
                    <div>
                        <div className="flex items-end justify-between mb-6">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-news-accent mb-1">Popular</p>
                                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Trending Comparisons</h2>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {Array.from({ length: 8 }).map((_, i) => <PairCardSkeleton key={i} />)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div>
            {/* ─── Hero section ─────────────────────────────────────────────── */}
            <section className="relative overflow-hidden" style={heroGradientStyle}>
                {/* Dot grid overlay — desktop only */}
                <div className="hidden md:block absolute inset-0 pointer-events-none" style={dotGridStyle} />

                <div className="container mx-auto px-4 md:px-8 pt-[140px] md:pt-[150px] pb-8 md:pb-10">
                    {/* Eyebrow */}
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-news-accent mb-2">ToolCurrent Comparisons</p>

                    {/* Title */}
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-4">Comparisons</h1>

                    {/* Supporting line */}
                    <p className="text-lg md:text-xl text-news-muted mb-8 max-w-xl leading-relaxed">
                        Compare any two AI tools instantly. See scores, features, and a clear verdict.
                    </p>

                    {/* Crosslink banner */}
                    <a href="/best-ai-tools"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-news-accent border border-news-accent/30 bg-news-accent/5 rounded-lg px-3 py-2 hover:bg-news-accent/10 transition-colors">
                        Not sure which tools to compare? Browse Best Software to find your options
                        <ArrowRight size={11} />
                    </a>
                </div>

                {/* Bottom fade */}
                <div className="absolute bottom-0 inset-x-0 h-10 pointer-events-none"
                    style={{ background: 'linear-gradient(to bottom, transparent, #0B0F14)' }} />
            </section>

            {/* ─── Main content ─────────────────────────────────────────────── */}
            <div className="container mx-auto px-4 md:px-8 py-10">
            <div className="space-y-16">

            {/* ── 1. Tool Selector ─────────────────────────────────────────── */}
            <section>
                <div className="mb-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-news-accent mb-1">Compare Tools</p>
                    <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Compare Any Tools Side by Side</h2>
                </div>
                <div className="p-5 bg-surface-card border border-border-subtle rounded-2xl shadow-elevation">
                    {/* Tool A / VS / Tool B / VS / Tool C — all on one row */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        {/* Tool A */}
                        <div className="relative flex-1">
                            <select
                                value={builderA}
                                onChange={e => { const s = e.target.value; setBuilderA(s); setBuilderB(''); setBuilderC(''); setBuilderUC(''); onToolAChange?.(s || null); }}
                                className={`w-full appearance-none bg-surface-base border border-border-subtle text-sm font-medium rounded-xl px-4 py-2.5 pr-9 focus:outline-none focus:border-news-accent cursor-pointer transition-colors ${builderA ? 'text-white' : 'text-news-muted'}`}
                            >
                                <option value="" disabled>Select Tool A</option>
                                {tools.map(t => <option key={t.slug} value={t.slug}>{t.name}</option>)}
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-news-muted pointer-events-none" />
                        </div>

                        <span className="text-xs font-black text-news-muted px-2 py-2 rounded-full bg-surface-base border border-border-divider flex-shrink-0 text-center">VS</span>

                        {/* Tool B */}
                        <div className="relative flex-1">
                            <select
                                value={builderB}
                                onChange={e => { setBuilderB(e.target.value); setBuilderC(''); setBuilderUC(''); }}
                                disabled={!builderA}
                                className={`w-full appearance-none bg-surface-base text-sm font-medium rounded-xl px-4 py-2.5 pr-9 focus:outline-none focus:border-news-accent cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed ${builderB ? 'text-white' : 'text-news-muted'} ${builderA && !builderB ? 'border border-news-accent/50 shadow-[0_0_0_2px_rgba(43,212,195,0.12)]' : 'border border-border-subtle'}`}
                            >
                                <option value="" disabled>Select Tool B</option>
                                {toolsForB.map(t => <option key={t.slug} value={t.slug}>{t.name}</option>)}
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-news-muted pointer-events-none" />
                        </div>

                        <span className="text-xs font-black text-news-muted px-2 py-2 rounded-full bg-surface-base border border-border-divider flex-shrink-0 text-center opacity-50">VS</span>

                        {/* Tool C — optional */}
                        <div className="relative flex-1">
                            <select
                                value={builderC}
                                onChange={e => setBuilderC(e.target.value)}
                                disabled={!builderB}
                                className={`w-full appearance-none bg-surface-base border border-border-subtle text-sm font-medium rounded-xl px-4 py-2.5 pr-9 focus:outline-none focus:border-news-accent cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${builderC ? 'text-white' : 'text-news-muted'}`}
                            >
                                <option value="">+ Tool C (optional)</option>
                                {toolsForC.map(t => <option key={t.slug} value={t.slug}>{t.name}</option>)}
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-news-muted pointer-events-none" />
                        </div>

                        {/* Compare button — same row, matches select height */}
                        <button
                            onClick={handleCompare}
                            disabled={!builderA || !builderB}
                            className={`flex-shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 ${builderA && builderB
                                ? `bg-news-accent text-white hover:bg-news-accentHover cursor-pointer${!prefersReducedMotion ? ' scale-[1.02]' : ''}`
                                : 'bg-surface-alt text-news-muted opacity-60 cursor-not-allowed'
                            }`}
                        >
                            Compare <ArrowRight size={14} />
                        </button>
                    </div>

                    {/* Prompt — shown when Tool A is pre-selected but Tool B is empty */}
                    {builderA && !builderB && toolObjA && (
                        <p className="mt-3 text-xs text-news-accent/70">
                            Now select a tool to compare with {toolObjA.name} →
                        </p>
                    )}

                    {/* Use case selector — revealed after A and B both selected */}
                    {builderA && builderB && (
                        <div className="mt-4 pt-4 border-t border-border-divider">
                            {ucIntersection.length > 0 ? (
                                <div>
                                    <p className="text-xs text-news-muted mb-2.5">
                                        <span className="font-semibold text-white">Optimised for</span>
                                        <span className="ml-1">(optional) — select a use case for a focused comparison, or leave blank for an overall comparison.</span>
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        <button onClick={() => setBuilderUC('')}
                                            className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${!builderUC ? 'bg-news-accent text-white border-news-accent' : 'bg-surface-base border-border-subtle text-news-muted hover:border-news-accent/50 hover:text-news-accent'}`}>
                                            Overall
                                        </button>
                                        {ucIntersection.map(uc => (
                                            <button key={uc} onClick={() => setBuilderUC(builderUC === uc ? '' : uc)}
                                                className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${builderUC === uc ? 'bg-news-accent text-white border-news-accent' : 'bg-surface-base border-border-subtle text-news-muted hover:border-news-accent/50 hover:text-news-accent'}`}>
                                                {uc}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-xs text-news-muted italic">These tools serve different primary use cases — you'll see an overall comparison.</p>
                            )}
                        </div>
                    )}
                </div>
            </section>


            {/* ── 2. Trending Comparisons ──────────────────────────────────── */}
            <section>
                <div className="flex items-end justify-between mb-6">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-news-accent mb-1">Popular</p>
                        <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Trending Comparisons</h2>
                    </div>
                    <button
                        onClick={() => browseRef.current?.scrollIntoView({ behavior: 'smooth' })}
                        className="text-xs text-news-accent hover:underline font-medium flex items-center gap-1 mb-1 flex-shrink-0">
                        See all <ArrowRight size={11} />
                    </button>
                </div>
                {trendingPairs.length === 0 ? (
                    <p className="text-sm text-news-muted py-10 text-center border border-dashed border-border-subtle rounded-2xl">
                        Add more tools to the database to generate comparisons.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {trendingPairs.map(pair => (
                            <PairCard key={pair.slug} pair={pair}
                                onClick={() => onComparisonClick(pair.slug, pair.ucSlug || undefined)} />
                        ))}
                    </div>
                )}
            </section>

            {/* ── 3. Browse by Category ────────────────────────────────────── */}
            <section ref={browseRef}>
                <div className="flex items-end justify-between mb-5">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-news-accent mb-1">Browse</p>
                        <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Compare by Category</h2>
                    </div>
                    <div className="relative flex-shrink-0 mb-1">
                        <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
                            className="appearance-none bg-surface-base border border-border-subtle text-news-muted text-xs font-bold rounded-xl px-3 py-2 pr-7 focus:outline-none focus:border-news-accent cursor-pointer">
                            <option value="popular">Most Popular</option>
                            <option value="rated">Highest Rated</option>
                        </select>
                        <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-news-muted pointer-events-none" />
                    </div>
                </div>
                {/* Category tabs — scrollable on mobile */}
                <div className="flex gap-2 overflow-x-auto pb-1 mb-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {COMP_CATEGORIES.map(cat => (
                        <button key={cat} onClick={() => setCatFilter(cat)}
                            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${catFilter === cat ? 'bg-news-accent text-white border-news-accent' : 'bg-surface-base border-border-subtle text-news-muted hover:text-white hover:bg-surface-hover'}`}>
                            {cat}
                        </button>
                    ))}
                </div>
                {filteredPairs.length === 0 ? (
                    <div className="py-12 text-center">
                        <p className="text-sm text-news-muted mb-3">No comparisons available in this category yet.</p>
                        <a href={`/best-ai-tools?category=${encodeURIComponent(catFilter)}`}
                            className="text-xs text-news-accent hover:underline font-medium">
                            Browse {catFilter} tools →
                        </a>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {filteredPairs.map(pair => (
                                <PairCard key={`browse-${pair.slug}-${catFilter}`} pair={pair}
                                    onClick={() => onComparisonClick(pair.slug, pair.ucSlug || undefined)} />
                            ))}
                        </div>
                        {catFilter === 'All' && (
                            <p className="text-xs text-news-muted text-center mt-5 italic">
                                Showing top comparisons across all categories — select a category to filter.
                            </p>
                        )}
                    </>
                )}
            </section>

            {/* ── 4. Related Rankings ──────────────────────────────────────── */}
            {relatedRankings.length > 0 && (
                <section className="pt-10 border-t border-border-divider">
                    <div className="flex items-end justify-between mb-5">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-news-accent mb-1">Best AI Tools</p>
                            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Related Rankings</h2>
                        </div>
                        <a href="/best-ai-tools" className="text-xs text-news-accent hover:underline font-medium flex items-center gap-1 mb-1 flex-shrink-0">
                            Browse all rankings <ArrowRight size={11} />
                        </a>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {relatedRankings.map(a => (
                            <button key={a.id} onClick={() => onArticleClick(a)}
                                className="group text-left bg-surface-card border border-border-subtle rounded-2xl p-4 hover:bg-surface-hover hover:-translate-y-0.5 hover:border-border-divider transition-all shadow-elevation">
                                <p className="text-[9px] font-bold uppercase tracking-widest text-news-accent mb-2">Best Of</p>
                                <h4 className="text-sm font-bold text-white group-hover:text-news-accent transition-colors leading-snug line-clamp-2">{a.title}</h4>
                                <span className="text-[10px] text-news-muted flex items-center gap-1 mt-2 group-hover:text-white transition-colors">View ranking <ArrowRight size={9} /></span>
                            </button>
                        ))}
                    </div>
                </section>
            )}

            </div>{/* end space-y-16 */}
            </div>{/* end container */}
        </div>
    );
};

// ─── Reviews Hub ──────────────────────────────────────────────────────────────
const REVIEW_CATEGORIES = ['All', 'AI Writing', 'Productivity', 'Automation', 'Developer Tools', 'CRM', 'Marketing Tools'];

const ReviewsHub: React.FC<{
    articles: Article[];
    onArticleClick: (a: Article) => void;
    onComparisonClick: (s: string, uc?: string) => void;
}> = ({ articles, onArticleClick, onComparisonClick }) => {
    const [tools, setTools] = useState<Tool[]>([]);
    const [comparisons, setComparisons] = useState<Comparison[]>([]);
    const [catFilter, setCatFilter] = useState('All');
    const [sortBy, setSortBy] = useState<'newest' | 'highest-rated'>('newest');

    useEffect(() => {
        fetch('/api/tools').then(r => r.json()).then(d => setTools(Array.isArray(d) ? d : [])).catch(() => {});
        fetch('/api/comparisons').then(r => r.json()).then(d => setComparisons(Array.isArray(d) ? d : [])).catch(() => {});
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
                                    <div className="w-8 h-8 rounded-lg bg-white border border-border-subtle overflow-hidden flex-shrink-0">
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
                                            <div className="absolute top-2 left-2 w-9 h-9 rounded-xl bg-white border border-border-subtle shadow-elevation overflow-hidden p-1">
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
                                            <div className="w-9 h-9 rounded-xl bg-white border border-border-subtle overflow-hidden flex-shrink-0 p-1">
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
                                                                <div className="w-3.5 h-3.5 rounded-sm bg-white overflow-hidden flex-shrink-0 flex items-center justify-center"><img src={otherTool.logo} alt={otherTool.name} className="w-full h-full object-contain" /></div>
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
        fetch('/api/tools').then(r => r.json()).then(d => setAllTools(Array.isArray(d) ? d : [])).catch(() => {});
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
                                                {t.logo && <div className="w-4 h-4 rounded bg-white overflow-hidden flex-shrink-0 flex items-center justify-center"><img src={t.logo} alt={t.name} className="w-full h-full object-contain" loading="lazy" /></div>}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                                                    <div key={slug} title={t.name} className="w-5 h-5 rounded bg-white border border-border-subtle overflow-hidden flex-shrink-0">
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
        fetch('/api/tools').then(r => r.json()).then(d => setAllTools(Array.isArray(d) ? d : [])).catch(() => {});
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                                                    <div key={slug} title={t.name} className="w-5 h-5 rounded bg-white border border-border-subtle overflow-hidden flex-shrink-0">
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
const HubPage: React.FC<HubPageProps> = ({ hub: rawHub, articles, onArticleClick, onToolClick, onComparisonClick, onBack, onHubNavigate, workflowFilter, queryString, onStackClick }) => {
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
    } else if (hub === 'best-ai-tools' && (queryString || workflowFilter)) {
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
        if (hub === 'ai-tools') return <AIToolsHub onToolClick={onToolClick} articles={articles} onArticleClick={onArticleClick} onComparisonClick={onComparisonClick} workflowFilter={workflowFilter} queryString={queryString} onStackClick={onStackClick} />;
        if (hub === 'best-ai-tools') return <BestSoftwareHub articles={articles} onArticleClick={onArticleClick} onToolClick={onToolClick} onComparisonClick={onComparisonClick} onHubNavigate={onHubNavigate} workflowFilter={workflowFilter} queryString={queryString} />;
        if (hub === 'comparisons') return <ComparisonsHub onComparisonClick={onComparisonClick} articles={articles} onArticleClick={onArticleClick} />;
        if (hub === 'reviews') return <ReviewsHub articles={articles} onArticleClick={onArticleClick} onComparisonClick={onComparisonClick} />;
        if (hub === 'use-cases') return <UseCasesHubInner articles={articles} onArticleClick={onArticleClick} />;
        if (hub === 'guides') return <GuidesHubInner articles={articles} onArticleClick={onArticleClick} />;
        if (hub === 'news') return <NewsHubInner articles={articles} onArticleClick={onArticleClick} />;
        return <ArticleGridHub hub={hub} articles={articles} onArticleClick={onArticleClick} />;
    };

    return (
        <div className="min-h-screen bg-surface-base text-news-text font-sans">
            {hub !== 'comparisons' && <HubHeader hub={hub} onBack={onBack} titleOverride={dynamicLabel} />}
            {hub === 'comparisons'
                ? renderContent()
                : <div className="container mx-auto px-4 md:px-8 py-10">{renderContent()}</div>
            }
        </div>
    );
};

export default HubPage;
