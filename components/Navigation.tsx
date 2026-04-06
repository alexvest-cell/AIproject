'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { usePathname, useRouter } from 'next/navigation';
import { Section, Article } from '../types';
import { Menu, X, Search, Bell, ChevronRight, ChevronDown, PenLine, Code2, ImageIcon, Zap, Layers, Users, Megaphone, Briefcase, LayoutGrid, Star, Rocket, Sparkles, Flame, MousePointer2, Video, Mic, TrendingUp, Check } from 'lucide-react';

interface NavigationProps {
  activeSection: Section;
  scrollToSection: (section: Section) => void;
  onSearch: (query: string) => void;
  searchQuery: string;
  onArticleSelect: (article: Article) => void;
  onSupportClick: () => void;
  onSubscribeClick: () => void;
  onShowAbout: () => void;
  activeCategory: string;
  onCategorySelect: (category: string) => void;
  onHubClick?: (slug: string, workflow?: string, queryStr?: string) => void;
  newsArticles: Article[];
  currentView: string;
  lastSyncTime?: string;
}

import { CATEGORIES } from '../data/categories';
const navCategories = CATEGORIES;

// ─── Mega Menu Data ────────────────────────────────────────────────────────────

interface MegaMenuColumn {
  heading: string;
  items: { 
    label: string; 
    href: string; 
    hub?: string; 
    workflow?: string; 
    category?: string; 
    sort?: string;
    icon?: React.ElementType;
    description?: string;
    badge?: 'Popular' | 'New';
    logo?: string;
  }[];
}

const CATEGORY_ICON_MAP: Record<string, React.ElementType> = {
  'AI Writing': PenLine,
  'AI Chatbots': Sparkles,
  'AI Image Generation': ImageIcon,
  'AI Video': Video,
  'AI Audio': Mic,
  'Productivity': Layers,
  'Automation': Zap,
  'Design': ImageIcon,
  'Development': Code2,
  'Marketing': Megaphone,
  'Sales & CRM': TrendingUp,
  'Customer Support': Users,
  'Data Analysis': LayoutGrid,
  'SEO Tools': Search,
  'Other': LayoutGrid,
};

const MEGA_MENUS: Record<string, MegaMenuColumn[]> = {
  'ai-tools': [
    {
      heading: 'Tool Categories',
      items: [
        { label: 'AI Writing',          href: '/ai-tools?category=ai-writing',      hub: 'ai-tools', category: 'AI Writing', icon: PenLine },
        { label: 'AI Coding',           href: '/ai-tools?category=ai-coding',       hub: 'ai-tools', category: 'Developer Tools', icon: Code2 },
        { label: 'AI Image Generation', href: '/ai-tools?category=ai-image',        hub: 'ai-tools', category: 'AI Image', icon: ImageIcon },
        { label: 'Automation Tools',    href: '/ai-tools?category=automation',      hub: 'ai-tools', category: 'Automation', icon: Zap },
        { label: 'Productivity Tools',  href: '/ai-tools?category=productivity',    hub: 'ai-tools', category: 'Productivity', icon: Layers },
        { label: 'CRM Software',        href: '/ai-tools?category=crm',             hub: 'ai-tools', category: 'CRM', icon: Users },
        { label: 'Marketing Tools',     href: '/ai-tools?category=marketing',       hub: 'ai-tools', category: 'Marketing', icon: Megaphone },
        { label: 'Developer Tools',     href: '/ai-tools?category=developer-tools', hub: 'ai-tools', category: 'Developer Tools', icon: LayoutGrid },
      ],
    },
    {
      heading: 'Explore by Workflow',
      items: [
        { label: 'Students',      href: '/ai-tools?workflow=students',      hub: 'ai-tools', workflow: 'students' },
        { label: 'Developers',    href: '/ai-tools?workflow=developers',    hub: 'ai-tools', workflow: 'developers' },
        { label: 'Marketers',     href: '/ai-tools?workflow=marketing',     hub: 'ai-tools', workflow: 'marketing' },
        { label: 'Creators',      href: '/ai-tools?workflow=creators',      hub: 'ai-tools', workflow: 'creators' },
        { label: 'Startups',      href: '/ai-tools?workflow=startups',      hub: 'ai-tools', workflow: 'startups' },
        { label: 'Small Business', href: '/ai-tools?workflow=small-business', hub: 'ai-tools', workflow: 'small-business' },
        { label: 'Enterprise',    href: '/ai-tools?workflow=enterprise',    hub: 'ai-tools', workflow: 'enterprise' },
      ],
    },
    {
      heading: 'Tool Discovery',
      items: [
        { label: 'All AI Tools',       href: '/ai-tools',                         hub: 'ai-tools' },
        { label: 'Top Rated Tools',    href: '/ai-tools?sort=rating',             hub: 'ai-tools', sort: 'rating', badge: 'Popular' },
        { label: 'Newest Tools',       href: '/ai-tools?sort=newest',             hub: 'ai-tools', sort: 'newest', badge: 'New' },
        { label: 'Free Tools',         href: '/ai-tools?price=free',              hub: 'ai-tools' },
        { label: 'Open Source Tools',  href: '/ai-tools?price=open-source',       hub: 'ai-tools' },
        { label: 'Has Image Gen',      href: '/ai-tools?capability=image-gen',    hub: 'ai-tools', icon: ImageIcon },
        { label: 'Has Multimodal',     href: '/ai-tools?capability=multimodal',   hub: 'ai-tools', icon: Layers },
        { label: 'Browser Extension',  href: '/ai-tools?capability=browser-ext',  hub: 'ai-tools', icon: Check },
      ],
    },
    {
      heading: 'Featured Tools',
      items: [
        { label: 'ChatGPT',     href: '/tools/chatgpt', logo: 'https://cdn.worldvectorlogo.com/logos/chatgpt-icon.svg' },
        { label: 'Notion',      href: '/tools/notion', logo: 'https://cdn.worldvectorlogo.com/logos/notion-2.svg' },
        { label: 'Zapier',      href: '/tools/zapier', logo: 'https://cdn.worldvectorlogo.com/logos/zapier-2.svg' },
        { label: 'Claude',      href: '/tools/claude', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Claude_AI_logo.svg/1024px-Claude_AI_logo.svg.png' },
        { label: 'Midjourney',  href: '/tools/midjourney', logo: 'https://cdn.worldvectorlogo.com/logos/midjourney-logo.svg' },
        { label: 'Grammarly',   href: '/tools/grammarly', logo: 'https://cdn.worldvectorlogo.com/logos/grammarly-1.svg' },
        { label: 'Linear',      href: '/tools/linear', logo: 'https://cdn.worldvectorlogo.com/logos/linear-1.svg' },
      ],
    },
  ],
  'best-software': [
    {
      heading: 'Popular Rankings',
      items: [
        { label: 'Best AI Writing Tools',    href: '/best-software/ai-writing-tools', hub: 'best-software', description: 'Top AI tools for writing, research, and editing', badge: 'Popular' },
        { label: 'Best Automation Tools',    href: '/best-software/automation-tools', hub: 'best-software', description: 'Platforms for automating workflows', badge: 'Popular' },
        { label: 'Best AI Coding Assistants', href: '/best-software/ai-coding-assistants', hub: 'best-software', description: 'AI tools to accelerate development' },
        { label: 'Best Productivity Apps',   href: '/best-software/productivity-apps', hub: 'best-software', description: 'Stay organized and focused' },
        { label: 'Best CRM Platforms',       href: '/best-software/crm-software', hub: 'best-software', description: 'Manage customer relationships effectively' },
      ],
    },
    {
      heading: 'Rankings by Category',
      items: [
        { label: 'AI Tools',              href: '/best-software?category=ai-tools',    hub: 'best-software', category: 'AI Tools', icon: Sparkles },
        { label: 'Productivity Software', href: '/best-software?category=productivity', hub: 'best-software', category: 'Productivity', icon: Layers },
        { label: 'Automation Platforms',  href: '/best-software?category=automation',  hub: 'best-software', category: 'Automation', icon: Zap },
        { label: 'Developer Tools',       href: '/best-software?category=developer-tools', hub: 'best-software', category: 'Developer Tools', icon: LayoutGrid },
        { label: 'Marketing Software',    href: '/best-software?category=marketing',   hub: 'best-software', category: 'Marketing', icon: Megaphone },
        { label: 'Business Software',     href: '/best-software?category=business',    hub: 'best-software', category: 'Business', icon: Briefcase },
      ],
    },
    {
      heading: 'Rankings by Use Case',
      items: [
        { label: 'Best Tools for Students',      href: '/best-software?workflow=students',      hub: 'best-software', workflow: 'students' },
        { label: 'Best Tools for Startups',      href: '/best-software?workflow=startups',      hub: 'best-software', workflow: 'startups' },
        { label: 'Best Tools for Creators',      href: '/best-software?workflow=creators',      hub: 'best-software', workflow: 'creators' },
        { label: 'Best Tools for Small Business', href: '/best-software?workflow=small-business', hub: 'best-software', workflow: 'small-business' },
        { label: 'Best Tools for Developers',    href: '/best-software?workflow=developers',    hub: 'best-software', workflow: 'developers' },
      ],
    },
    {
      heading: 'Latest Rankings',
      items: [
        { label: 'Best AI Agents 2026',         href: '/best-software/ai-agents',         hub: 'best-software', description: 'The future of autonomous workflows', badge: 'New' },
        { label: 'Best Video AI Tools',         href: '/best-software/video-ai-tools',    hub: 'best-software', description: 'Create stunning video with AI' },
        { label: 'Best AI Research Tools',      href: '/best-software/ai-research-tools', hub: 'best-software', description: 'Accelerate your information gathering' },
        { label: 'Best Project Management Apps', href: '/best-software/project-management',hub: 'best-software', description: 'Keep your team on track' },
      ],
    },
  ],
};

// ─── Desktop Mega Menu Panel ───────────────────────────────────────────────────

interface MegaMenuPanelProps {
  slug: string;
  columns: MegaMenuColumn[];
  anchorRect: DOMRect | null;
  onItemClick: (item: MegaMenuColumn['items'][number]) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  activeParams?: URLSearchParams;
  activePath?: string;
}

const MegaMenuPanel: React.FC<MegaMenuPanelProps> = ({ slug, columns, anchorRect, onItemClick, onMouseEnter, onMouseLeave, activeParams, activePath }) => {
  const isItemActive = (item: MegaMenuColumn['items'][number]): boolean => {
    if (!activePath) return false;

    if (slug === 'best-software') {
      // Path-based: active when current page IS the ranking page the item links to
      return activePath === item.href;
    }

    // ai-tools: query param matching
    if (!activeParams || activePath !== '/ai-tools' || slug !== 'ai-tools') return false;
    const qIdx = item.href.indexOf('?');
    if (qIdx === -1) return false;
    const itemParams = new URLSearchParams(item.href.substring(qIdx));
    for (const [key, val] of itemParams.entries()) {
      if (activeParams.get(key) === val) return true;
    }
    return false;
  };
  if (!anchorRect) return null;

  const panelWidth = Math.min(1120, window.innerWidth - 32);
  const idealLeft = anchorRect.left + anchorRect.width / 2 - panelWidth / 2;
  const clampedLeft = Math.max(16, Math.min(idealLeft, window.innerWidth - panelWidth - 16));

  return ReactDOM.createPortal(
    <div
      role="menu"
      aria-label={`${slug} mega menu`}
      style={{
        position: 'fixed',
        top: anchorRect.bottom + 4,
        left: clampedLeft,
        width: panelWidth,
        zIndex: 9999,
      }}
      className="bg-surface-card border border-border-subtle rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.6)] overflow-hidden animate-fade-in"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Top accent bar */}
      <div className="h-0.5 w-full bg-gradient-to-r from-news-accent/0 via-news-accent/60 to-news-accent/0" />

      <div className="grid grid-cols-4 gap-0 p-6">
        {columns.map((col, ci) => (
          <div
            key={ci}
            className={`pr-6 ${ci < columns.length - 1 ? 'border-r border-border-subtle mr-6' : ''}`}
          >
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-news-accent mb-3 pb-2 border-b border-border-divider">
              {col.heading}
            </p>
            <ul className="space-y-0.5" role="none">
              {col.items.map((item, ii) => {
                const active = isItemActive(item);
                return (
                <li key={ii} role="none">
                  <button
                    role="menuitem"
                    onClick={() => onItemClick(item)}
                    className={`w-full text-left px-2 py-2.5 rounded-xl transition-all group/item flex items-start gap-3 hover:bg-surface-hover/80 hover:translate-x-1 ${active ? 'bg-news-accent/8' : ''}`}
                  >
                    {/* Icon or Logo */}
                    {item.logo ? (
                      <div className="w-7 h-7 rounded-lg bg-white border border-border-subtle p-1 flex-shrink-0 flex items-center justify-center group-hover/item:border-news-accent/30 transition-colors shadow-inner">
                        <img src={item.logo} alt={item.label} className="w-full h-full object-contain grayscale group-hover/item:grayscale-0 transition-all opacity-80 group-hover/item:opacity-100" />
                      </div>
                    ) : item.icon ? (
                      <div className="w-7 h-7 rounded-lg bg-surface-base/50 border border-border-subtle flex items-center justify-center flex-shrink-0 group-hover/item:border-news-accent/30 transition-colors">
                        <item.icon size={14} className="text-news-muted group-hover/item:text-news-accent transition-colors" />
                      </div>
                    ) : (
                      <div className="w-1.5 h-1.5 flex-shrink-0" /> // Spacer for alignment consistency
                    )}

                    <div className="flex-1 pr-4">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className={`text-xs font-bold transition-colors whitespace-normal break-words leading-tight ${active ? 'text-news-accent' : 'text-news-text group-hover/item:text-white'}`}>
                          {item.label}
                        </span>
                        {active && <span className="w-1.5 h-1.5 rounded-full bg-news-accent flex-shrink-0 mt-0.5" />}
                        {item.badge && (
                          <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-widest flex-shrink-0 ${
                            item.badge === 'Popular' ? 'bg-news-accent/15 text-news-accent border border-news-accent/20' : 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-[10px] text-news-muted group-hover/item:text-news-muted/80 leading-tight line-clamp-1 mt-0.5 font-medium">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <ChevronRight size={10} className="opacity-0 group-hover/item:opacity-60 transition-all translate-x-[-4px] group-hover/item:translate-x-0" />
                  </button>
                </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom footer strip */}
      <div className="border-t border-border-divider px-6 py-3 flex items-center justify-between bg-surface-base/40">
        <p className="text-[10px] text-news-muted">
          {slug === 'ai-tools' ? 'Explore 200+ AI & software tools' : 'Curated rankings across all categories'}
        </p>
        <button
          role="menuitem"
          onClick={() => onItemClick({ label: 'View all', href: `/${slug}`, hub: slug })}
          className="text-[10px] font-bold text-news-accent hover:text-white transition-colors flex items-center gap-1 group/cta"
        >
          {slug === 'ai-tools' ? 'Explore all AI tools' : 'Explore all rankings'} 
          <ChevronRight size={10} className="group-hover/cta:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>,
    document.body
  );
};

// ─── Navigation Component ──────────────────────────────────────────────────────

const Navigation: React.FC<NavigationProps> = ({
  activeSection,
  scrollToSection,
  onSearch,
  searchQuery,
  onArticleSelect,
  onSupportClick,
  onSubscribeClick,
  onShowAbout,
  activeCategory,
  onCategorySelect,
  onHubClick,
  newsArticles,
  currentView,
  lastSyncTime
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const [activeParams, setActiveParams] = useState<URLSearchParams>(() => new URLSearchParams());
  useEffect(() => {
    setActiveParams(new URLSearchParams(window.location.search));
  }, [pathname]);

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(searchQuery);
  const [suggestions, setSuggestions] = useState<Article[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [searchDropdownPos, setSearchDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  // Desktop mega menu state
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const dropdownTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const anchorRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 1024);

  // Mobile accordion state
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [mobileSubExpanded, setMobileSubExpanded] = useState<string | null>(null);

  // Dynamic AI tools menu data
  const [navTools, setNavTools] = useState<any[]>([]);
  useEffect(() => {
    fetch('/api/tools').then(r => r.json()).then(d => setNavTools(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const aiToolsColumns = React.useMemo((): MegaMenuColumn[] => {
    if (!navTools.length) return MEGA_MENUS['ai-tools'];

    // Column 1: Browse by Category
    const catFreq: Record<string, number> = {};
    navTools.forEach(t => { if (t.category_primary) catFreq[t.category_primary] = (catFreq[t.category_primary] || 0) + 1; });
    const catItems = Object.entries(catFreq)
      .sort((a, b) => b[1] - a[1]).slice(0, 8)
      .map(([cat, count]) => ({
        label: cat, href: `/ai-tools?category=${cat.toLowerCase().replace(/\s*&\s*/g, '-').replace(/\s+/g, '-')}`,
        hub: 'ai-tools', category: cat,
        description: `${count} tools`,
        icon: CATEGORY_ICON_MAP[cat],
      }));

    // Column 2: Filter by Capability
    const capCount = (field: string, value: string | string[]) =>
      navTools.filter(t => Array.isArray(value) ? value.includes(t[field]) : t[field] === value).length;
    const capItems = [
      { label: 'Has Free Tier',            href: '/ai-tools?capability=free-tier',          description: `${navTools.filter(t => t.pricing_model === 'Free' || t.pricing_model === 'Freemium').length} tools` },
      { label: 'Image Generation',         href: '/ai-tools?capability=image-generation',   description: `${capCount('image_generation', 'yes')} tools` },
      { label: 'Memory / Remembers You',   href: '/ai-tools?capability=memory',             description: `${capCount('memory_persistence', 'yes')} tools` },
      { label: 'Computer Use',             href: '/ai-tools?capability=computer-use',        description: `${capCount('computer_use', 'yes')} tools` },
      { label: 'Multimodal',               href: '/ai-tools?capability=multimodal',          description: `${capCount('multimodal', 'yes')} tools` },
      { label: 'Open Source',              href: '/ai-tools?capability=open-source',         description: `${navTools.filter(t => t.open_source === 'yes' || t.open_source === 'partial').length} tools` },
      { label: 'Browser Extension',        href: '/ai-tools?capability=browser-extension',   description: `${capCount('browser_extension', 'yes')} tools` },
      { label: 'API Available',            href: '/ai-tools?capability=api-available',       description: `${capCount('api_available', 'yes')} tools` },
    ].map(item => ({ ...item, hub: 'ai-tools' as const }));

    // Column 3: Filter by Use Case
    const useCaseFreq: Record<string, number> = {};
    navTools.forEach(t => (t.use_case_tags || []).forEach((u: string) => { useCaseFreq[u] = (useCaseFreq[u] || 0) + 1; }));
    const useCaseItems = Object.entries(useCaseFreq)
      .sort((a, b) => b[1] - a[1]).slice(0, 7)
      .map(([uc, count]) => ({
        label: uc, href: `/ai-tools?use_case=${uc.toLowerCase().replace(/\s+/g, '-')}`,
        hub: 'ai-tools', description: `${count} tools`,
      }));

    // Column 4: Featured Tools (top 6 by rating)
    const featuredItems = [...navTools]
      .sort((a, b) => (b.rating_score || 0) - (a.rating_score || 0)).slice(0, 6)
      .map(t => ({
        label: t.name, href: `/tools/${t.slug}`,
        logo: t.logo || undefined,
        description: t.category_primary || undefined,
      }));

    return [
      { heading: 'Browse by Category', items: catItems },
      { heading: 'Filter by Capability', items: capItems },
      { heading: 'Filter by Use Case', items: useCaseItems },
      { heading: 'Featured Tools', items: featuredItems },
    ];
  }, [navTools]);

  const bsNavColumns = React.useMemo((): MegaMenuColumn[] => {
    if (!navTools.length) return MEGA_MENUS['best-software'];

    const catSlug = (cat: string) => cat.toLowerCase().replace(/\s*&\s*/g, '-').replace(/\s+/g, '-').replace(/-+/g, '-');
    const wfSlug  = (tag: string) => tag.toLowerCase().replace(/\s+/g, '-');
    const now = Date.now();
    const DAY = 24 * 3600 * 1000;

    // Frequency maps
    const catFreq: Record<string, number> = {};
    navTools.forEach(t => { if (t.category_primary) catFreq[t.category_primary] = (catFreq[t.category_primary] || 0) + 1; });
    const sortedCats = Object.entries(catFreq).sort((a, b) => b[1] - a[1]);

    const wfFreq: Record<string, number> = {};
    navTools.forEach(t => ((t as any).workflow_tags || []).forEach((tag: string) => { wfFreq[tag] = (wfFreq[tag] || 0) + 1; }));
    const sortedWfs = Object.entries(wfFreq).sort((a, b) => b[1] - a[1]);

    // Column 1: Popular Rankings — alternating 2 categories + 2 workflows
    const popularItems: MegaMenuColumn['items'] = [];
    let ci = 0, wi = 0;
    while (popularItems.length < 4 && (ci < sortedCats.length || wi < sortedWfs.length)) {
      if (ci < sortedCats.length) {
        const [cat, count] = sortedCats[ci++];
        popularItems.push({
          label: `Best ${cat} Tools 2026`,
          href: `/best-software/${catSlug(cat)}`,
          hub: 'best-software',
          description: `${count} tools ranked`,
          badge: ci === 1 ? 'Popular' : undefined,
        });
      }
      if (popularItems.length < 4 && wi < sortedWfs.length) {
        const [tag, count] = sortedWfs[wi++];
        popularItems.push({
          label: `Best Tools for ${tag} 2026`,
          href: `/best-software/for/${wfSlug(tag)}`,
          hub: 'best-software',
          description: `${count} tools ranked`,
        });
      }
    }

    // Column 2: Rankings by Category
    const bsCatItems: MegaMenuColumn['items'] = sortedCats.map(([cat, count]) => ({
      label: cat,
      href: `/best-software/${catSlug(cat)}`,
      hub: 'best-software',
      description: `${count} tools`,
      icon: CATEGORY_ICON_MAP[cat],
    }));

    // Column 3: Rankings by Workflow
    const bsWfItems: MegaMenuColumn['items'] = sortedWfs.map(([tag, count]) => ({
      label: tag,
      href: `/best-software/for/${wfSlug(tag)}`,
      hub: 'best-software',
      description: `${count} tools`,
    }));

    // Column 4: Latest Rankings — most recently updated ranking pages
    const catMostRecent: Record<string, number> = {};
    const wfMostRecent: Record<string, number> = {};
    navTools.forEach(t => {
      const d = t.last_updated ? new Date(t.last_updated).getTime() : 0;
      if (!d) return;
      if (t.category_primary && (!catMostRecent[t.category_primary] || d > catMostRecent[t.category_primary])) catMostRecent[t.category_primary] = d;
      ((t as any).workflow_tags || []).forEach((tag: string) => {
        if (!wfMostRecent[tag] || d > wfMostRecent[tag]) wfMostRecent[tag] = d;
      });
    });
    const recentEntries = [
      ...Object.entries(catMostRecent).map(([cat, d]) => ({ label: `Best ${cat} Tools 2026`, href: `/best-software/${catSlug(cat)}`, date: d })),
      ...Object.entries(wfMostRecent).map(([tag, d]) => ({ label: `Best Tools for ${tag} 2026`, href: `/best-software/for/${wfSlug(tag)}`, date: d })),
    ].sort((a, b) => b.date - a.date).slice(0, 4);
    const latestItems: MegaMenuColumn['items'] = recentEntries.map(e => ({
      label: e.label,
      href: e.href,
      hub: 'best-software',
      badge: (now - e.date < 30 * DAY ? 'New' : undefined) as 'New' | undefined,
      description: new Date(e.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    }));

    return [
      { heading: 'Popular Rankings',       items: popularItems.length  ? popularItems  : MEGA_MENUS['best-software'][0].items },
      { heading: 'Rankings by Category',   items: bsCatItems.length    ? bsCatItems    : MEGA_MENUS['best-software'][1].items },
      { heading: 'Rankings by Workflow',   items: bsWfItems.length     ? bsWfItems     : MEGA_MENUS['best-software'][2].items },
      { heading: 'Latest Rankings',        items: latestItems.length   ? latestItems   : MEGA_MENUS['best-software'][3].items },
    ];
  }, [navTools]);

  // ── Viewport listener ──────────────────────────────────────────────────────
  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (!desktop) setActiveDropdown(null); // close mega menu when going mobile
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ── Scroll listener ────────────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── ESC key to close menus ─────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveDropdown(null);
        setIsMobileMenuOpen(false);
        setIsSearchOpen(false);
        setSuggestions([]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ── Sync search value ──────────────────────────────────────────────────────
  useEffect(() => {
    setSearchValue(searchQuery);
    if (!searchQuery) setSuggestions([]);
  }, [searchQuery]);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) searchInputRef.current.focus();
  }, [isSearchOpen]);

  // ── Search dropdown position ───────────────────────────────────────────────
  useEffect(() => {
    if (searchContainerRef.current && suggestions.length > 0) {
      const rect = searchContainerRef.current.getBoundingClientRect();
      setSearchDropdownPos({ top: rect.bottom + 8, left: rect.left, width: Math.max(320, rect.width) });
    }
  }, [suggestions, isSearchOpen]);

  // ── Desktop dropdown handlers ──────────────────────────────────────────────
  const openDropdown = useCallback((slug: string) => {
    if (dropdownTimer.current) clearTimeout(dropdownTimer.current);
    if (MEGA_MENUS[slug]) {
      setActiveDropdown(slug);
      const el = anchorRefs.current[slug];
      if (el) setAnchorRect(el.getBoundingClientRect());
    }
  }, []);

  const closeDropdown = useCallback(() => {
    dropdownTimer.current = setTimeout(() => setActiveDropdown(null), 180);
  }, []);

  const cancelClose = useCallback(() => {
    if (dropdownTimer.current) clearTimeout(dropdownTimer.current);
  }, []);

  // ── Mega menu item click ───────────────────────────────────────────────────
  const handleMegaItemClick = useCallback((item: MegaMenuColumn['items'][number]) => {
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);

    // /tools/[slug] pages use the old SPA pushState pattern — preserve exactly
    if (item.href.startsWith('/tools/')) {
      const slug = item.href.replace('/tools/', '');
      window.history.pushState({ view: 'tool', slug }, '', item.href);
      window.dispatchEvent(new PopStateEvent('popstate', { state: { view: 'tool', slug } }));
      return;
    }

    // Navigate directly to the full href — handles all path and query string cases
    if (item.href) {
      router.push(item.href);
      return;
    }

    // Fallback — should not be reached with correct item data
    if (onHubClick) {
      onHubClick(item.hub || 'ai-tools', item.workflow, '');
    }
  }, [router, onHubClick]);

  // ── Search ─────────────────────────────────────────────────────────────────
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchValue(val);
    if (val.trim().length > 1) {
      const filtered = newsArticles.filter(a => {
        const titleMatch = a.title.toLowerCase().includes(val.toLowerCase());
        const catMatch = Array.isArray(a.category)
          ? a.category.some(c => c.toLowerCase().includes(val.toLowerCase()))
          : (typeof a.category === 'string' && (a.category as string).toLowerCase().includes(val.toLowerCase()));
        return titleMatch || catMatch;
      }).slice(0, 10);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (article: Article) => {
    onArticleSelect(article);
    setSearchValue('');
    setSuggestions([]);
    onSearch('');
    setIsSearchOpen(false);
    setIsMobileMenuOpen(false);
  };

  const toggleSearch = () => {
    if (isSearchOpen) {
      setIsSearchOpen(false);
      setSearchValue('');
      setSuggestions([]);
      onSearch('');
    } else {
      setIsSearchOpen(true);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      className={`fixed top-0 left-0 w-full z-50 flex flex-col font-sans overflow-visible transition-colors duration-300 ${isScrolled ? 'bg-surface-base/90 backdrop-blur-md shadow-sm' : 'bg-surface-base'}`}
    >
      {/* ── Top Bar ─────────────────────────────────────────────────────────── */}
      <div className={`w-full border-b border-border-divider overflow-visible transition-all duration-300 ${isScrolled ? 'h-14' : 'h-16'}`}>
        <div className="container mx-auto px-4 md:px-8 h-full flex items-center overflow-visible">

          {/* Mobile: logo left, actions right */}
          <div className="flex md:hidden items-center justify-between w-full">
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => onCategorySelect('All')}
            >
              <div className={`flex items-center transition-all duration-300 ${isScrolled ? 'h-7' : 'h-8'}`}>
                <img src="/logo.png" alt="toolcurrent" className="h-full w-auto object-contain transition-transform group-hover:scale-105 duration-300" />
              </div>
            </div>
            <div className="flex items-center gap-5">
              <button onClick={toggleSearch} className={`transition-colors ${isSearchOpen ? 'text-news-accent' : 'text-gray-400 hover:text-white'}`} aria-label="Search">
                <Search size={22} />
              </button>
              <button className="text-white p-1 -mr-1" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'} aria-expanded={isMobileMenuOpen}>
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>

          {/* Desktop: 3-column — left spacer | centered logo | right actions */}
          <div className="hidden md:flex items-center w-full">
            {/* Left: spacer matching right column width */}
            <div className="flex-1" />
            {/* Center: logo */}
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => onCategorySelect('All')}
            >
              <div className={`flex items-center transition-all duration-300 ${isScrolled ? 'h-8' : 'h-10'}`}>
                <img src="/logo.png" alt="toolcurrent" className="h-full w-auto object-contain transition-transform group-hover:scale-105 duration-300" />
              </div>
            </div>
            {/* Right: search */}
            <div className="flex-1 flex justify-end overflow-visible">
              {isSearchOpen ? (
                <div ref={searchContainerRef} className="flex items-center bg-surface-card border border-border-subtle shadow-elevation rounded-full px-3 py-1.5 animate-fade-in relative w-48 md:w-64">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchValue}
                    onChange={handleSearchChange}
                    placeholder="Search..."
                    className="bg-transparent border-none focus:outline-none text-white text-base w-full placeholder:text-gray-500"
                    onKeyDown={(e) => e.key === 'Enter' && onSearch(searchValue)}
                    aria-label="Search"
                  />
                  <button onClick={toggleSearch} className="text-news-accent hover:text-white" aria-label="Close search">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button onClick={toggleSearch} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group" aria-label="Open search">
                  <Search size={18} />
                  <span className="text-xs font-bold uppercase tracking-widest group-hover:underline decoration-news-accent underline-offset-4">Search</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile search bar ─────────────────────────────────────────────── */}
      <div className={`md:hidden ${isSearchOpen ? 'block' : 'hidden'} w-full border-b border-border-divider p-4 animate-fade-in`}>
        <div className="flex items-center bg-surface-card border border-border-subtle shadow-inner rounded-lg px-3 py-2">
          <Search size={16} className="text-gray-500 mr-2" />
          <input
            type="text"
            value={searchValue}
            onChange={handleSearchChange}
            placeholder="Search..."
            className="bg-transparent border-none focus:outline-none text-white text-base w-full"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && onSearch(searchValue)}
          />
          <button onClick={toggleSearch} aria-label="Close search"><X size={16} className="text-gray-500" /></button>
        </div>
      </div>

      {/* ── Secondary Nav Bar (Desktop Only) ─────────────────────────────────────────────── */}
      <div className={`w-full border-b border-border-divider transition-all duration-300 ${isScrolled ? 'h-10' : 'h-12'} relative hidden md:block`}>
        <div className="container mx-auto px-4 md:px-8 h-full flex items-center justify-center overflow-x-auto hide-scrollbar">
          <div className="flex items-center gap-6 md:gap-8 min-w-max">
            {navCategories.map(cat => {
              const hasMega = !!MEGA_MENUS[cat.slug];
              return (
                <div
                  key={cat.id}
                  ref={el => { anchorRefs.current[cat.slug] = el; }}
                  className="relative"
                  onMouseEnter={() => isDesktop && hasMega && openDropdown(cat.slug)}
                  onMouseLeave={() => isDesktop && hasMega && closeDropdown()}
                >
                  <button
                    onClick={() => {
                      router.push(`/${cat.slug}`);
                      setActiveDropdown(null);
                    }}
                    aria-haspopup={hasMega ? 'true' : undefined}
                    aria-expanded={hasMega ? activeDropdown === cat.slug : undefined}
                    className={`text-[10px] md:text-xs font-bold uppercase tracking-widest transition-colors whitespace-nowrap relative px-2 py-1.5 rounded-md flex items-center gap-1 ${activeCategory === cat.id ? 'text-news-accent bg-surface-hover' : 'text-gray-400 hover:text-white hover:bg-surface-hover'}`}
                  >
                    {cat.label}
                    {hasMega && (
                      <ChevronDown
                        size={10}
                        className={`transition-transform duration-200 ${activeDropdown === cat.slug ? 'rotate-180 text-news-accent' : ''}`}
                      />
                    )}
                    {activeCategory === cat.id && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-news-accent rounded-full" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Desktop Mega Menu Panel (portal, desktop ≥1024px only) ─────────── */}
      {isDesktop && activeDropdown && (MEGA_MENUS[activeDropdown] || activeDropdown === 'ai-tools' || activeDropdown === 'best-software') && (
        <MegaMenuPanel
          slug={activeDropdown}
          columns={activeDropdown === 'ai-tools' ? aiToolsColumns : activeDropdown === 'best-software' ? bsNavColumns : MEGA_MENUS[activeDropdown]}
          anchorRect={anchorRect}
          onItemClick={handleMegaItemClick}
          onMouseEnter={cancelClose}
          onMouseLeave={closeDropdown}
          activeParams={activeParams}
          activePath={pathname}
        />
      )}

      {/* ── Mobile Menu Drawer ─────────────────────────────────────────────────── */}
      <div 
        className={`fixed inset-0 z-[100] md:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        {/* Backdrop overlay */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        
        {/* Drawer Content */}
        <div 
          className={`absolute top-0 right-0 h-full w-[85%] max-w-[320px] bg-surface-base border-l border-border-divider shadow-2xl flex flex-col transition-transform duration-300 ease-out transform ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-6 h-16 border-b border-border-divider flex-shrink-0">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-news-accent">Navigation</span>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-gray-400 hover:text-white p-2 -mr-2"
            >
              <X size={24} />
            </button>
          </div>

          {/* Drawer Links */}
          <div className="flex-1 overflow-y-auto py-6 px-6">
            <div className="space-y-8">
              {/* Explore Group */}
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Explore</p>
                <div className="grid gap-2">
                  {/* AI Tools Accordion */}
                  <div className="flex flex-col gap-1">
                    <button 
                      onClick={() => setMobileExpanded(mobileExpanded === 'ai-tools' ? null : 'ai-tools')}
                      className={`flex items-center justify-between p-3 rounded-xl bg-surface-card border border-border-subtle hover:border-news-accent/30 transition-all text-left ${mobileExpanded === 'ai-tools' ? 'border-news-accent/40 bg-surface-hover shadow-[0_0_20px_rgba(255,100,50,0.1)]' : ''}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-news-accent/10 flex items-center justify-center">
                          <Sparkles size={18} className="text-news-accent" />
                        </div>
                        <span className="text-sm font-bold text-white">AI Tools</span>
                      </div>
                      <ChevronDown size={16} className={`text-gray-500 transition-transform duration-300 ${mobileExpanded === 'ai-tools' ? 'rotate-180 text-news-accent' : ''}`} />
                    </button>

                    {/* AI Tools Sub-sections */}
                    {mobileExpanded === 'ai-tools' && (
                      <div className="pl-4 mt-2 space-y-2 animate-fade-in border-l-2 border-border-divider ml-7">
                        {aiToolsColumns.map((col, ci) => {
                          const colKey = `ai-tools-${ci}`;
                          const isSubExpanded = mobileSubExpanded === colKey;
                          const isFeatured = col.heading === 'Featured Tools';
                          return (
                            <div key={ci} className="flex flex-col gap-1">
                              <button
                                onClick={() => setMobileSubExpanded(isSubExpanded ? null : colKey)}
                                className="flex items-center justify-between py-2 px-3 text-xs font-bold uppercase tracking-widest text-news-accent hover:bg-surface-hover/50 rounded-lg transition-colors"
                              >
                                {col.heading}
                                <ChevronDown size={12} className={`text-gray-600 transition-transform ${isSubExpanded ? 'rotate-180' : ''}`} />
                              </button>

                              {isSubExpanded && (
                                <div className={`pl-3 py-1 ${isFeatured ? 'grid grid-cols-2 gap-1' : 'grid gap-1'}`}>
                                  {col.items.map((item, ii) => (
                                    <button
                                      key={ii}
                                      onClick={() => handleMegaItemClick(item)}
                                      className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-surface-hover/80 text-gray-400 hover:text-white transition-all text-left group"
                                    >
                                      <div className="flex items-center gap-3 min-w-0">
                                        {item.logo ? (
                                          <div className="w-6 h-6 rounded bg-white border border-border-subtle p-0.5 flex-shrink-0">
                                            <img src={item.logo} alt={item.label} className="w-full h-full object-contain" />
                                          </div>
                                        ) : item.icon ? (
                                          <item.icon size={14} className="text-gray-500 group-hover:text-news-accent flex-shrink-0" />
                                        ) : null}
                                        <div className="min-w-0">
                                          <span className="text-sm font-medium truncate block">{item.label}</span>
                                          {item.description && !isFeatured && (
                                            <span className="text-[10px] text-gray-600 truncate block">{item.description}</span>
                                          )}
                                        </div>
                                      </div>
                                      <ChevronRight size={12} className="text-gray-700 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0" />
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Best Software Accordion */}
                  <div className="flex flex-col gap-1">
                    <button 
                      onClick={() => setMobileExpanded(mobileExpanded === 'best-software' ? null : 'best-software')}
                      className={`flex items-center justify-between p-3 rounded-xl bg-surface-card border border-border-subtle hover:border-news-accent/30 transition-all text-left ${mobileExpanded === 'best-software' ? 'border-blue-500/40 bg-surface-hover shadow-[0_0_20px_rgba(59,130,246,0.1)]' : ''}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                          <Star size={18} className="text-blue-400" />
                        </div>
                        <span className="text-sm font-bold text-white">Best Software</span>
                      </div>
                      <ChevronDown size={16} className={`text-gray-500 transition-transform duration-300 ${mobileExpanded === 'best-software' ? 'rotate-180 text-blue-400' : ''}`} />
                    </button>

                    {/* Best Software Sub-sections */}
                    {mobileExpanded === 'best-software' && (
                      <div className="pl-4 mt-2 space-y-2 animate-fade-in border-l-2 border-border-divider ml-7">
                        {bsNavColumns.map((col, ci) => {
                          const colKey = `best-software-${ci}`;
                          const isSubExpanded = mobileSubExpanded === colKey;
                          return (
                            <div key={ci} className="flex flex-col gap-1">
                              <button 
                                onClick={() => setMobileSubExpanded(isSubExpanded ? null : colKey)}
                                className="flex items-center justify-between py-2 px-3 text-xs font-bold uppercase tracking-widest text-blue-400 hover:bg-surface-hover/50 rounded-lg transition-colors"
                              >
                                {col.heading}
                                <ChevronDown size={12} className={`text-gray-600 transition-transform ${isSubExpanded ? 'rotate-180' : ''}`} />
                              </button>
                              
                              {isSubExpanded && (
                                <div className="grid gap-1 pl-3 py-1">
                                  {col.items.map((item, ii) => (
                                    <button
                                      key={ii}
                                      onClick={() => handleMegaItemClick(item)}
                                      className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-surface-hover/80 text-gray-400 hover:text-white transition-all text-left group"
                                    >
                                      <div className="flex items-center gap-3 min-w-0">
                                        {item.icon ? (
                                          <item.icon size={14} className="text-gray-500 group-hover:text-blue-400" />
                                        ) : null}
                                        <div className="flex flex-col min-w-0">
                                          <span className="text-sm font-medium truncate">{item.label}</span>
                                        </div>
                                      </div>
                                      <ChevronRight size={12} className="text-gray-700 opacity-0 group-hover:opacity-100 transition-all" />
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Research Group */}
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Research</p>
                <div className="grid gap-2">
                  <button 
                    onClick={() => { onHubClick?.('reviews'); setIsMobileMenuOpen(false); }}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-hover transition-all text-left group"
                  >
                    <span className="text-sm font-bold text-gray-300 group-hover:text-white">Reviews</span>
                    <ChevronRight size={16} className="text-gray-600 group-hover:text-news-accent" />
                  </button>
                  <button 
                    onClick={() => { onHubClick?.('comparisons'); setIsMobileMenuOpen(false); }}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-hover transition-all text-left group"
                  >
                    <span className="text-sm font-bold text-gray-300 group-hover:text-white">Comparisons</span>
                    <ChevronRight size={16} className="text-gray-600 group-hover:text-news-accent" />
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-6 border-t border-border-divider space-y-4 flex-shrink-0">
            <button 
              onClick={() => { onShowAbout(); setIsMobileMenuOpen(false); }}
              className="w-full py-3 rounded-xl bg-surface-card border border-border-subtle text-xs font-bold uppercase tracking-widest text-white hover:bg-surface-hover transition-all"
            >
              About ToolCurrent
            </button>
          </div>
        </div>
      </div>

      {/* ── Search Suggestions Portal ──────────────────────────────────────── */}
      {suggestions.length > 0 && typeof document !== 'undefined' && ReactDOM.createPortal(
        <div
          style={{
            position: 'fixed',
            top: `${searchDropdownPos.top}px`,
            left: `${searchDropdownPos.left}px`,
            width: `${searchDropdownPos.width}px`,
            zIndex: 9999,
          }}
          className="bg-surface-card border border-border-subtle rounded-[14px] shadow-elevation overflow-hidden max-h-[400px] overflow-y-auto"
        >
          {suggestions.map(article => (
            <div
              key={article.id}
              onClick={() => handleSuggestionClick(article)}
              className="p-3 border-b border-border-divider hover:bg-surface-hover cursor-pointer flex items-center gap-3 transition-colors"
            >
              <div className="flex-grow min-w-0">
                <h4 className="text-xs font-bold text-white truncate">{article.title}</h4>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1 flex items-center gap-2">
                  <span>{(() => {
                    const cat = Array.isArray(article.category) ? article.category[0] : article.category;
                    return cat === 'Action' || cat === 'Act' ? 'Guides' : cat;
                  })()}</span>
                  <span className="text-gray-600">•</span>
                  <span>{article.date}</span>
                </p>
              </div>
              <ChevronRight size={12} className="text-gray-600" />
            </div>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
};

export default Navigation;