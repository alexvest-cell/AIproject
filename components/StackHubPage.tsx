'use client';
import React, { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { Stack, Article } from '../types';
import {
  Layers, ArrowRight, Play, Server, Command, Cpu, Layout,
  Zap, Users, Code2, Megaphone, Palette, Briefcase, ChevronDown,
  BookOpen, BarChart2, CheckCircle, X
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface StackHubPageProps {
  onStackClick: (slug: string) => void;
  articles?: Article[];
  onArticleClick?: (article: Article) => void;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Marketing':           <Layout size={10} />,
  'Development':         <Command size={10} />,
  'Startup Operations':  <Server size={10} />,
  'Operations':          <Server size={10} />,
  'Content Creation':    <Play size={10} />,
  'Automation':          <Cpu size={10} />,
  'Research':            <BookOpen size={10} />,
  'Creative':            <Palette size={10} />,
};

const CATEGORY_COLORS: Record<string, string> = {
  'Marketing':           'bg-pink-500/10 text-pink-400 border-pink-500/20',
  'Development':         'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Startup Operations':  'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Operations':          'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Content Creation':    'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Automation':          'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'Research':            'bg-green-500/10 text-green-400 border-green-500/20',
  'Creative':            'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

const ROLES = [
  { label: 'All',           icon: <Layers size={14} />,    category: null },
  { label: 'Students',      icon: <BookOpen size={14} />,  category: 'Research' },
  { label: 'Startups',      icon: <Zap size={14} />,       category: 'Startup Operations' },
  { label: 'Developers',    icon: <Code2 size={14} />,     category: 'Development' },
  { label: 'Marketers',     icon: <Megaphone size={14} />, category: 'Marketing' },
  { label: 'Creators',      icon: <Palette size={14} />,   category: 'Content Creation' },
  { label: 'Small Business',icon: <Briefcase size={14} />, category: 'Operations' },
];

const CATEGORIES = ['All', 'Marketing', 'Development', 'Startup Operations', 'Content Creation', 'Operations', 'Automation', 'Research', 'Creative'];
const COMPLEXITIES = ['All', 'Simple', 'Medium', 'Advanced'];

const WHAT_IS_BENEFITS = [
  { icon: <CheckCircle size={20} className="text-news-accent" />, title: 'Pre-validated', desc: 'Every stack is tested by real teams — no guesswork.' },
  { icon: <Zap size={20} className="text-yellow-400" />,          title: 'Ship faster',   desc: 'Skip the research phase and deploy proven ecosystems.' },
  { icon: <Users size={20} className="text-purple-400" />,        title: 'Role-matched',  desc: 'Stacks tailored to your role, not generic lists.' },
];

const SEO_CONTENT = [
  {
    heading: 'Popular AI Software Stacks in 2026',
    body: 'The most effective teams in 2026 are not just using individual AI tools — they are deploying complete AI-native software stacks. From marketing automation pipelines to full-stack AI developer toolchains, the right combination of tools determines how fast you can move and how much leverage you get per person on your team.',
  },
  {
    heading: 'AI Workflows That Actually Scale',
    body: 'A repeatable AI workflow is worth more than any single tool subscription. Whether you are running content operations, managing a dev team, or scaling a startup, the stacks listed here represent the workflows that consistently outperform ad-hoc tool selection. Each stack has been assembled with real integration paths and proven hand-offs between tools.',
  },
  {
    heading: 'Automation Setups for Every Team Size',
    body: 'Modern automation stacks work at every scale — from solo founders running lean operations to mid-size teams managing complex multi-channel workflows. The key is choosing tools that integrate natively, eliminate context-switching, and allow you to add or swap components without rebuilding from scratch.',
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getComplexity(stack: Stack): 'Simple' | 'Medium' | 'Advanced' {
  const n = stack.tools?.length || 0;
  if (n <= 3) return 'Simple';
  if (n <= 6) return 'Medium';
  return 'Advanced';
}

const COMPLEXITY_COLORS = {
  Simple:   'bg-green-500/10 text-green-400 border-green-500/20',
  Medium:   'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  Advanced: 'bg-red-500/10 text-red-400 border-red-500/20',
};

// ─── Sub-components ──────────────────────────────────────────────────────────

const ToolLogoAvatar: React.FC<{ logo?: string | null; name: string }> = ({ logo, name }) => {
  if (logo) {
    return (
      <Image
        src={logo}
        alt={name}
        title={name}
        width={24}
        height={24}
        className="rounded-full object-cover bg-white border border-border-subtle ring-1 ring-surface-card"
        unoptimized={logo?.startsWith('https://res.cloudinary.com')}
      />
    );
  }
  return (
    <div
      title={name}
      className="w-6 h-6 rounded-full bg-surface-alt border border-border-subtle ring-1 ring-surface-card flex items-center justify-center text-[9px] font-black text-news-muted uppercase"
    >
      {name.charAt(0)}
    </div>
  );
}

interface StackCardProps {
  stack: Stack;
  onStackClick: (slug: string) => void;
  featured?: boolean;
}

const StackCard: React.FC<StackCardProps> = ({ stack, onStackClick, featured }) => {
  const complexity = getComplexity(stack);
  const complexityClass = COMPLEXITY_COLORS[complexity];
  const catColorClass = CATEGORY_COLORS[stack.workflow_category] || 'bg-surface-alt text-news-muted border-border-subtle';

  return (
    <button
      onClick={() => onStackClick(stack.slug)}
      className={`group flex flex-col text-left bg-surface-card border rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-elevation hover:-translate-y-1 h-full ${
        featured
          ? 'border-news-accent/40 hover:border-news-accent'
          : 'border-border-subtle hover:border-news-accent/50'
      }`}
    >
      {/* Image */}
      <div className="relative h-44 w-full bg-surface-alt overflow-hidden flex-shrink-0">
        {stack.hero_image ? (
          <Image
            src={stack.hero_image}
            alt={stack.name}
            fill
            style={{ objectFit: 'cover' }}
            className="transition-transform duration-700 group-hover:scale-105"
            unoptimized={stack.hero_image?.startsWith('https://res.cloudinary.com')}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-alt to-surface-hover">
            <Layers size={40} className="text-news-muted/30" />
          </div>
        )}
        {/* Category badge */}
        <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest">
          {CATEGORY_ICONS[stack.workflow_category] || <Layers size={10} />}
          {stack.workflow_category}
        </div>
        {featured && (
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-news-accent text-black text-[9px] font-black uppercase tracking-widest">
            Popular
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Use case tag */}
        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wide w-fit mb-3 ${catColorClass}`}>
          {CATEGORY_ICONS[stack.workflow_category] || <Layers size={9} />}
          {stack.workflow_category}
        </div>

        <h2 className="text-lg font-black text-white mb-2 group-hover:text-news-accent transition-colors line-clamp-2 leading-snug">
          {stack.name}
        </h2>
        <p className="text-sm text-news-muted leading-relaxed line-clamp-3 flex-grow mb-4">
          {stack.short_description}
        </p>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-auto pt-4 border-t border-border-subtle">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Tool logo previews */}
            {stack.toolPreviews && stack.toolPreviews.length > 0 && (
              <div className="flex -space-x-1.5">
                {stack.toolPreviews.map(t => (
                  <ToolLogoAvatar key={t.slug} logo={t.logo} name={t.name} />
                ))}
              </div>
            )}
            <span className="text-xs font-bold text-news-text">{stack.tools?.length || 0} Tools</span>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${complexityClass}`}>
              {complexity}
            </span>
          </div>
          <span className="flex items-center gap-1 text-xs font-black text-news-accent group-hover:gap-2 transition-all">
            View Stack <ArrowRight size={13} />
          </span>
        </div>
      </div>
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const StackHubPage: React.FC<StackHubPageProps> = ({ onStackClick, articles = [], onArticleClick }) => {
  const [stacks, setStacks] = useState<Stack[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('All');
  const [catFilter, setCatFilter] = useState('All');
  const [complexityFilter, setComplexityFilter] = useState('All');
  const [complexityMobile, setComplexityMobile] = useState('All');

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Best Software Stacks (2026) | ToolCurrent';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Discover curated software stacks and tool ecosystems for marketing, development, startups, and more. Find the perfect workflow for your team.');
    }
    fetch('/api/stacks')
      .then(res => res.json())
      .then(data => setStacks(data || []))
      .catch(err => console.error('Failed to load stacks:', err))
      .finally(() => setLoading(false));
  }, []);

  // Derived data
  const featuredStacks = useMemo(() => stacks.filter(s => s.featured).slice(0, 4), [stacks]);

  const filteredStacks = useMemo(() => {
    return stacks.filter(s => {
      const roleCategory = ROLES.find(r => r.label === roleFilter)?.category;
      const matchRole = !roleCategory || s.workflow_category === roleCategory;
      const matchCat  = catFilter === 'All' || s.workflow_category === catFilter;
      const matchComp = complexityFilter === 'All' || getComplexity(s) === complexityFilter;
      return matchRole && matchCat && matchComp;
    });
  }, [stacks, roleFilter, catFilter, complexityFilter]);

  const relatedGuides = useMemo(() =>
    articles.filter(a =>
      (a as any).article_type === 'guide' &&
      ['stack', 'workflow', 'setup', 'automat', 'tool'].some(kw =>
        `${a.title} ${a.excerpt}`.toLowerCase().includes(kw)
      )
    ).slice(0, 3),
    [articles]
  );

  const relatedRankings = useMemo(() =>
    articles.filter(a =>
      (a as any).article_type === 'best-of' &&
      ['stack', 'workflow', 'tool', 'software', 'automat'].some(kw =>
        `${a.title} ${a.excerpt}`.toLowerCase().includes(kw)
      )
    ).slice(0, 4),
    [articles]
  );

  const activeFilterCount = (roleFilter !== 'All' ? 1 : 0) + (catFilter !== 'All' ? 1 : 0) + (complexityFilter !== 'All' ? 1 : 0);

  function handleRoleSelect(role: string) {
    setRoleFilter(role);
    setCatFilter('All'); // mutually exclusive
  }

  function handleCatSelect(cat: string) {
    setCatFilter(cat);
    setRoleFilter('All'); // mutually exclusive
  }

  function clearFilters() {
    setRoleFilter('All');
    setCatFilter('All');
    setComplexityFilter('All');
    setComplexityMobile('All');
  }

  return (
    <div className="min-h-screen bg-surface-base text-news-text font-sans pt-16 md:pt-[112px]">

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <div className="bg-surface-card border-b border-border-divider relative overflow-hidden">
        <div className="absolute inset-0 bg-news-accent/5 pointer-events-none" />
        <div className="container mx-auto px-4 md:px-8 py-16 md:py-24 max-w-7xl relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-news-accent/10 border border-news-accent/20 text-news-accent text-xs font-bold uppercase tracking-widest mb-6">
              <Layers size={14} /> Ecosystems
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6 leading-tight">
              Software Stacks
            </h1>
            <p className="text-xl md:text-2xl text-news-muted font-light leading-relaxed">
              Discover the perfect combination of tools for any workflow. Instead of hunting for individual apps, deploy proven ecosystems used by top teams.
            </p>
          </div>
        </div>
      </div>

      {/* ── What Is a Stack ─────────────────────────────────────────────── */}
      <div className="border-b border-border-divider bg-surface-card/50">
        <div className="container mx-auto px-4 md:px-8 py-12 max-w-7xl">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-3">What Is a Software Stack?</h2>
            <p className="text-news-muted leading-relaxed">
              A software stack is a curated collection of tools that work together seamlessly for a specific workflow. Instead of building your toolset from scratch, you start with a proven combination — then adapt it to your needs.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {WHAT_IS_BENEFITS.map((b, i) => (
              <div key={i} className="flex flex-col items-center text-center p-5 rounded-xl bg-surface-card border border-border-subtle gap-3">
                {b.icon}
                <p className="font-bold text-white text-sm">{b.title}</p>
                <p className="text-xs text-news-muted leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Choose Your Workflow (Role Pills) ────────────────────────────── */}
      <div className="border-b border-border-divider bg-surface-base sticky top-[112px] z-20 shadow-sm">
        <div className="container mx-auto px-4 md:px-8 py-4 max-w-7xl">
          <p className="text-[10px] font-bold uppercase tracking-widest text-news-muted mb-3 hidden md:block">Choose Your Workflow</p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
            {ROLES.map(role => (
              <button
                key={role.label}
                onClick={() => handleRoleSelect(role.label)}
                className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all whitespace-nowrap ${
                  roleFilter === role.label
                    ? 'bg-news-accent text-black border-news-accent'
                    : 'bg-surface-card border-border-subtle text-news-muted hover:border-news-accent/40 hover:text-news-text'
                }`}
              >
                {role.icon}
                {role.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-16 max-w-7xl space-y-20">

        {/* ── Popular Stacks ──────────────────────────────────────────────── */}
        {!loading && featuredStacks.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-6 bg-news-accent rounded-full" />
              <h2 className="text-xl font-black text-white">Popular Stacks</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredStacks.map(stack => (
                <StackCard key={stack.id} stack={stack} onStackClick={onStackClick} featured />
              ))}
            </div>
          </section>
        )}

        {/* ── Filter Bar ──────────────────────────────────────────────────── */}
        <section>
          <div className="flex flex-wrap items-center gap-3 p-4 bg-surface-card rounded-2xl border border-border-subtle mb-6">
            {/* Category pills — desktop */}
            <div className="hidden md:flex items-center gap-2 flex-wrap flex-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => handleCatSelect(cat)}
                  className={`px-3 py-1 rounded-full border text-xs font-bold transition-all ${
                    catFilter === cat
                      ? 'bg-news-accent text-black border-news-accent'
                      : 'bg-surface-alt border-border-subtle text-news-muted hover:border-news-accent/40 hover:text-news-text'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Category — mobile dropdown */}
            <div className="md:hidden flex-1 relative">
              <select
                value={catFilter}
                onChange={e => handleCatSelect(e.target.value)}
                className="w-full appearance-none bg-surface-alt border border-border-subtle rounded-xl px-3 py-2 text-xs text-news-text font-bold pr-8 focus:outline-none focus:border-news-accent"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-news-muted pointer-events-none" />
            </div>

            {/* Complexity — desktop pills */}
            <div className="hidden md:flex items-center gap-1 border-l border-border-subtle pl-3">
              {COMPLEXITIES.map(c => (
                <button
                  key={c}
                  onClick={() => setComplexityFilter(c)}
                  className={`px-2.5 py-1 rounded-full border text-[11px] font-bold transition-all ${
                    complexityFilter === c
                      ? 'bg-surface-alt border-news-accent/60 text-news-text'
                      : 'border-border-subtle text-news-muted hover:text-news-text'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Complexity — mobile dropdown */}
            <div className="md:hidden relative">
              <select
                value={complexityMobile}
                onChange={e => { setComplexityMobile(e.target.value); setComplexityFilter(e.target.value); }}
                className="appearance-none bg-surface-alt border border-border-subtle rounded-xl px-3 py-2 text-xs text-news-text font-bold pr-7 focus:outline-none focus:border-news-accent"
              >
                {COMPLEXITIES.map(c => <option key={c} value={c}>{c === 'All' ? 'Any Complexity' : c}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-news-muted pointer-events-none" />
            </div>

            {/* Clear filters */}
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-hover border border-border-subtle text-[11px] text-news-muted hover:text-white transition-colors"
              >
                <X size={11} /> Clear ({activeFilterCount})
              </button>
            )}
          </div>

          {/* ── Main Grid ─────────────────────────────────────────────────── */}
          <p className="text-xs text-news-muted uppercase tracking-widest mb-5">
            {loading ? 'Loading…' : `${filteredStacks.length} Stack${filteredStacks.length !== 1 ? 's' : ''}`}
          </p>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-news-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredStacks.length === 0 ? (
            <div className="text-center py-20 text-news-muted">
              <Layers size={40} className="mx-auto mb-4 opacity-30" />
              <p className="font-bold text-white mb-2">No stacks match your filters</p>
              <p className="text-sm mb-4">Try adjusting your role or category selection.</p>
              <button onClick={clearFilters} className="px-4 py-2 rounded-xl bg-news-accent text-black text-xs font-black">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {filteredStacks.map(stack => (
                <StackCard key={stack.id} stack={stack} onStackClick={onStackClick} />
              ))}
            </div>
          )}
        </section>

        {/* ── Build Your Own Stack CTA ─────────────────────────────────────── */}
        <section className="rounded-2xl border border-news-accent/20 bg-news-accent/5 p-10 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-news-accent/10 border border-news-accent/20 mb-5">
            <Layers size={22} className="text-news-accent" />
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white mb-3">Build Your Own Stack</h2>
          <p className="text-news-muted max-w-lg mx-auto mb-8 leading-relaxed">
            Have a unique workflow? Use the ToolCurrent admin to assemble a custom stack — pick your tools, define your workflow steps, and publish it for your team.
          </p>
          <a
            href="/admin"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-news-accent text-black text-sm font-black hover:opacity-90 transition-opacity"
          >
            Get Started <ArrowRight size={16} />
          </a>
        </section>

        {/* ── Related Rankings ─────────────────────────────────────────────── */}
        {relatedRankings.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-6 bg-yellow-400 rounded-full" />
              <h2 className="text-xl font-black text-white">Related Rankings</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedRankings.map(article => (
                <button
                  key={article.id}
                  onClick={() => onArticleClick?.(article)}
                  className="group text-left bg-surface-card border border-border-subtle hover:border-news-accent/40 rounded-xl overflow-hidden transition-all hover:-translate-y-0.5"
                >
                  {article.imageUrl && (
                    <div className="relative w-full h-32 overflow-hidden"><Image src={article.imageUrl} alt={article.title} fill style={{ objectFit: 'cover' }} unoptimized={article.imageUrl?.startsWith('https://res.cloudinary.com')} /></div>
                  )}
                  <div className="p-4">
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[9px] font-bold uppercase tracking-widest mb-2">
                      <BarChart2 size={9} /> Ranking
                    </div>
                    <p className="text-sm font-bold text-white group-hover:text-news-accent transition-colors line-clamp-2 leading-snug">
                      {article.title}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ── Related Guides ───────────────────────────────────────────────── */}
        {relatedGuides.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-6 bg-purple-400 rounded-full" />
              <h2 className="text-xl font-black text-white">Implementation Guides</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedGuides.map(article => (
                <button
                  key={article.id}
                  onClick={() => onArticleClick?.(article)}
                  className="group text-left bg-surface-card border border-border-subtle hover:border-purple-400/40 rounded-xl overflow-hidden transition-all hover:-translate-y-0.5"
                >
                  {article.imageUrl && (
                    <div className="relative w-full h-32 overflow-hidden"><Image src={article.imageUrl} alt={article.title} fill style={{ objectFit: 'cover' }} unoptimized={article.imageUrl?.startsWith('https://res.cloudinary.com')} /></div>
                  )}
                  <div className="p-4">
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[9px] font-bold uppercase tracking-widest mb-2">
                      <BookOpen size={9} /> Guide
                    </div>
                    <p className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors line-clamp-2 leading-snug">
                      {article.title}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ── SEO Content Block ────────────────────────────────────────────── */}
        <section className="border-t border-border-divider pt-16 space-y-10">
          {SEO_CONTENT.map((block, i) => (
            <div key={i} className="max-w-3xl">
              <h2 className="text-xl font-black text-white mb-3">{block.heading}</h2>
              <p className="text-news-muted leading-relaxed text-sm">{block.body}</p>
            </div>
          ))}
        </section>

      </div>
    </div>
  );
};

export default StackHubPage;
