'use client';
import React, { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { StackPageData, Article, Tool, Stack } from '../types';
import {
  ChevronLeft, ArrowRight, Layers, ExternalLink, Star, AlertCircle,
  CheckCircle, XCircle, Clock, DollarSign, Zap, Users, ChevronRight,
  Lightbulb, Target, GitBranch, BookOpen, BarChart2, Package
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const PRICING_COLORS: Record<string, string> = {
  Free:       'bg-green-900/40 text-green-400 border-green-700/50',
  Freemium:   'bg-blue-900/40 text-blue-400 border-blue-700/50',
  Paid:       'bg-purple-900/40 text-purple-400 border-purple-700/50',
  Enterprise: 'bg-orange-900/40 text-orange-400 border-orange-700/50',
};

const SETUP_LABELS: Record<number, string> = {
  1: 'Under an hour', 2: 'A few hours', 4: 'Half a day',
  8: 'One day', 16: 'Two days', 24: 'Three days',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function setupLabel(hours?: number): string {
  if (!hours) return null!;
  const keys = Object.keys(SETUP_LABELS).map(Number).sort((a, b) => a - b);
  for (const k of keys) {
    if (hours <= k) return SETUP_LABELS[k];
  }
  return `~${hours}h`;
}

function estimateMonthlyCost(tools: Tool[]): { low: number; high: number; freeCount: number; paidCount: number } {
  let low = 0, high = 0, freeCount = 0, paidCount = 0;
  for (const t of tools) {
    if (t.pricing_model === 'Free') { freeCount++; continue; }
    paidCount++;
    if (t.pricing_model === 'Freemium') { high += 30; continue; }
    // Parse starting_price if available
    const raw = t.starting_price?.replace(/[^0-9.]/g, '');
    const parsed = raw ? parseFloat(raw) : 0;
    if (parsed) { low += parsed; high += parsed * 2; }
    else { low += 15; high += 50; }
  }
  return { low, high, freeCount, paidCount };
}

// ─── Section heading ──────────────────────────────────────────────────────────

function SectionHeading({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-6 pb-3 border-b border-border-subtle">
      <span className="text-news-accent">{icon}</span>
      <h2 className="text-base font-black text-white uppercase tracking-wider">{title}</h2>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface StackPageProps {
  slug: string;
  onBack: () => void;
  onToolClick: (slug: string) => void;
  onArticleClick: (article: Article) => void;
  onComparisonClick: (slug: string) => void;
  onStackClick?: (slug: string) => void;
}

// ─── Main Component ───────────────────────────────────────────────────────────

const StackPage: React.FC<StackPageProps> = ({
  slug, onBack, onToolClick, onArticleClick, onComparisonClick, onStackClick
}) => {
  const [data, setData] = useState<StackPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    window.scrollTo(0, 0);

    fetch(`/api/stacks/${slug}`)
      .then(r => r.ok ? r.json() : Promise.reject('Stack not found'))
      .then((d: StackPageData) => {
        setData(d);
        if (d.stack) {
          document.title = `${d.stack.name} | ToolCurrent`;
          const metaDesc = document.querySelector('meta[name="description"]');
          if (metaDesc) metaDesc.setAttribute('content', d.stack.short_description);

          const schema = {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: d.stack.name,
            description: d.stack.short_description,
            itemListElement: (d.tools || []).map((t: Tool, idx: number) => ({
              '@type': 'ListItem',
              position: idx + 1,
              name: t.name,
              url: `https://toolcurrent.com/tools/${t.slug}`
            }))
          };
          let el = document.getElementById('stack-schema');
          if (!el) {
            el = document.createElement('script');
            el.id = 'stack-schema';
            (el as HTMLScriptElement).type = 'application/ld+json';
            document.head.appendChild(el);
          }
          el.textContent = JSON.stringify(schema);
        }
      })
      .catch(err => setError(typeof err === 'string' ? err : 'Failed to load stack'))
      .finally(() => setLoading(false));

    return () => {
      const el = document.getElementById('stack-schema');
      if (el) el.remove();
      document.title = 'ToolCurrent | Software Discovery & Intelligence';
    };
  }, [slug]);

  const costEstimate = useMemo(() => data ? estimateMonthlyCost(data.tools) : null, [data]);

  if (loading) return (
    <div className="min-h-screen bg-surface-base flex items-center justify-center pt-16 md:pt-[112px]">
      <div className="flex flex-col items-center gap-4 text-news-muted">
        <div className="w-8 h-8 border-2 border-news-accent border-t-transparent rounded-full animate-spin" />
        <span className="text-sm uppercase tracking-widest">Loading Stack</span>
      </div>
    </div>
  );

  if (error || !data || !data.stack) return (
    <div className="min-h-screen bg-surface-base flex flex-col items-center justify-center text-news-muted pt-16 md:pt-[112px]">
      <AlertCircle size={48} className="mb-4 text-news-accent" />
      <p className="mb-4">{error || 'Stack not found'}</p>
      <button onClick={onBack} className="text-white hover:text-news-accent bg-surface-card px-4 py-2 border border-border-subtle rounded transition-colors text-sm">
        Return to Stacks
      </button>
    </div>
  );

  const { stack, tools, comparisons, relatedArticles, relatedStacks = [], alternativeTools = {} } = data;

  // Derive "Why it works" from tool pros if not set editorially
  const whyItWorks: string[] = stack.why_it_works?.length
    ? stack.why_it_works
    : tools.flatMap(t => t.pros?.slice(0, 1) || []).slice(0, 4);

  // Derive "Who it's for" from workflow_category if not set
  const whoItsFor: string[] = stack.who_its_for?.length
    ? stack.who_its_for
    : [
        `${stack.workflow_category} teams getting started`,
        `Professionals optimising their ${stack.workflow_category.toLowerCase()} workflow`,
        `Teams looking to reduce tool switching`,
      ];

  const notFor: string[] = stack.not_for?.length
    ? stack.not_for
    : [
        'Teams that already have a working toolset',
        'Large enterprises with custom IT requirements',
      ];

  // Separate rankings/guides from relatedArticles
  const rankings = relatedArticles.filter(a => a.title.toLowerCase().match(/best|top|ranked/));
  const guides   = relatedArticles.filter(a => !a.title.toLowerCase().match(/best|top|ranked/));

  // Infer tool role from workflow_steps
  function getToolRole(toolSlug: string): string | null {
    for (const step of stack.workflow_steps || []) {
      if (step.tool_slugs?.includes(toolSlug)) return step.title;
    }
    return null;
  }

  const setupTime = setupLabel(stack.setup_time_hours);

  return (
    <div className="min-h-screen bg-surface-base text-news-text font-sans pt-16 md:pt-[112px]">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-surface-card border-b border-border-divider">
        {stack.hero_image && (
          <div className="absolute inset-0 opacity-20 hidden md:block">
            <Image src={stack.hero_image} alt="" fill style={{ objectFit: 'cover' }} unoptimized={stack.hero_image?.startsWith('https://res.cloudinary.com')} />
            <div className="absolute inset-0 bg-gradient-to-r from-surface-card via-surface-card/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-card via-transparent to-transparent" />
          </div>
        )}
        <div className="container mx-auto px-4 md:px-8 py-10 md:py-16 max-w-5xl relative z-10">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-news-muted hover:text-white transition-colors text-xs font-bold uppercase tracking-widest mb-8"
          >
            <ChevronLeft size={14} /> Back to Stacks
          </button>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-[10px] px-2.5 py-1 rounded bg-news-accent/10 border border-news-accent/20 text-news-accent uppercase tracking-widest font-black">
              {stack.workflow_category}
            </span>
            <span className="text-[10px] px-2.5 py-1 rounded bg-surface-alt border border-border-subtle text-news-muted uppercase tracking-widest font-bold flex items-center gap-1.5">
              <Layers size={10} /> {tools.length} Tools
            </span>
            {setupTime && (
              <span className="text-[10px] px-2.5 py-1 rounded bg-surface-alt border border-border-subtle text-news-muted uppercase tracking-widest font-bold flex items-center gap-1.5">
                <Clock size={10} /> Setup: {setupTime}
              </span>
            )}
            {costEstimate && costEstimate.paidCount > 0 && (
              <span className="text-[10px] px-2.5 py-1 rounded bg-surface-alt border border-border-subtle text-news-muted uppercase tracking-widest font-bold flex items-center gap-1.5">
                <DollarSign size={10} /> ~${costEstimate.low}–${costEstimate.high}/mo
              </span>
            )}
            {costEstimate && costEstimate.freeCount === tools.length && (
              <span className="text-[10px] px-2.5 py-1 rounded bg-green-900/40 border border-green-700/50 text-green-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
                <DollarSign size={10} /> Free Stack
              </span>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-6">
            {stack.name}
          </h1>
          <p className="text-xl md:text-2xl text-news-muted font-light leading-relaxed max-w-3xl mb-8">
            {stack.short_description}
          </p>

          {/* Tool pill row */}
          <div className="flex flex-wrap items-center gap-2 mb-8">
            {tools.map((t, idx) => (
              <React.Fragment key={t.slug}>
                <button
                  onClick={() => onToolClick(t.slug)}
                  className="flex items-center gap-2 bg-surface-base hover:bg-surface-hover border border-border-subtle px-3 py-1.5 rounded-lg transition-colors group"
                >
                  {t.logo && <Image src={t.logo} alt="" width={16} height={16} className="object-contain" unoptimized={t.logo?.startsWith('https://res.cloudinary.com')} />}
                  <span className="text-xs font-bold text-white group-hover:text-news-accent">{t.name}</span>
                </button>
                {idx < tools.length - 1 && <ChevronRight size={12} className="text-border-subtle flex-shrink-0" />}
              </React.Fragment>
            ))}
          </div>

          {/* Hero CTAs */}
          <div className="flex flex-wrap gap-3">
            <a
              href="#toolset"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-news-accent text-black text-sm font-black hover:opacity-90 transition-opacity"
            >
              <Zap size={15} /> Start Building This Stack
            </a>
            <a
              href="#toolset"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-alt border border-border-subtle text-white text-sm font-bold hover:border-news-accent/40 transition-colors"
            >
              <Package size={15} /> Explore Tools
            </a>
          </div>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 md:px-8 py-12 max-w-5xl space-y-16">

        {/* ── Stack Overview ─────────────────────────────────────────────── */}
        <section>
          <SectionHeading icon={<BookOpen size={16} />} title="Stack Overview" />
          <p className="text-lg text-news-text leading-relaxed">
            {stack.full_description || stack.short_description}
          </p>
        </section>

        {/* ── Why This Stack Works ──────────────────────────────────────── */}
        {whyItWorks.length > 0 && (
          <section>
            <SectionHeading icon={<Lightbulb size={16} />} title="Why This Stack Works" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {whyItWorks.map((point, i) => (
                <div key={i} className="flex gap-3 p-4 rounded-xl bg-surface-card border border-border-subtle">
                  <CheckCircle size={16} className="text-news-accent flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-news-text leading-relaxed">{point}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Visual Flow Diagram ──────────────────────────────────────────── */}
        {tools.length > 0 && (
          <section>
            <SectionHeading icon={<GitBranch size={16} />} title="Tool Flow" />
            <div className="overflow-x-auto pb-2 -mx-4 px-4">
              <div className="flex items-stretch gap-0 min-w-max">
                {tools.map((t, idx) => {
                  const role = getToolRole(t.slug);
                  const pricingClass = PRICING_COLORS[t.pricing_model] || 'bg-surface-alt text-news-muted border-border-subtle';
                  return (
                    <React.Fragment key={t.slug}>
                      <button
                        onClick={() => onToolClick(t.slug)}
                        className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-surface-card border border-border-subtle hover:border-news-accent/50 transition-all min-w-[120px] max-w-[140px] text-center"
                      >
                        <div className="relative w-10 h-10 rounded-xl bg-white border border-border-subtle flex items-center justify-center p-1.5 flex-shrink-0">
                          {t.logo
                            ? <Image src={t.logo} alt={t.name} fill style={{ objectFit: 'contain', padding: '6px' }} unoptimized={t.logo?.startsWith('https://res.cloudinary.com')} />
                            : <Layers size={18} className="text-news-muted" />
                          }
                        </div>
                        <span className="text-xs font-black text-white group-hover:text-news-accent transition-colors leading-tight">{t.name}</span>
                        {role && <span className="text-[9px] text-news-muted leading-tight">{role}</span>}
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wide ${pricingClass}`}>
                          {t.pricing_model}
                        </span>
                      </button>
                      {idx < tools.length - 1 && (
                        <div className="flex items-center px-1 flex-shrink-0">
                          <ArrowRight size={16} className="text-news-accent/50" />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── Workflow Steps ───────────────────────────────────────────────── */}
        {stack.workflow_steps && stack.workflow_steps.length > 0 && (
          <section>
            <SectionHeading icon={<Target size={16} />} title="Workflow Pipeline" />
            <div className="space-y-4 relative border-l-2 border-border-subtle ml-3">
              {stack.workflow_steps.map((step, idx) => {
                const stepTools = (step.tool_slugs || [])
                  .map(s => tools.find(t => t.slug === s))
                  .filter(Boolean) as Tool[];
                return (
                  <div key={idx} className="relative pl-8">
                    <span className="absolute left-[-9px] top-2 w-4 h-4 rounded-full bg-news-accent ring-4 ring-surface-base flex-shrink-0" />
                    <div className="bg-surface-card border border-border-subtle rounded-xl p-5 hover:border-news-accent/20 transition-colors">
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                        <h3 className="text-base font-black text-white">
                          <span className="text-news-accent mr-2">{idx + 1}.</span>{step.title}
                        </h3>
                        {stepTools.length > 0 && (
                          <div className="flex items-center gap-1.5">
                            {stepTools.map(t => (
                              <div key={t.slug} className="flex items-center gap-1 px-2 py-0.5 rounded bg-surface-alt border border-border-subtle">
                                {t.logo && <Image src={t.logo} alt="" width={12} height={12} className="object-contain" unoptimized={t.logo?.startsWith('https://res.cloudinary.com')} />}
                                <span className="text-[10px] font-bold text-news-text">{t.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-news-muted leading-relaxed mb-3">{step.description}</p>
                      {/* Action + Purpose */}
                      <div className="flex flex-wrap gap-4 text-xs text-news-muted border-t border-border-subtle pt-3">
                        <span className="flex items-center gap-1">
                          <Zap size={11} className="text-news-accent" />
                          <strong className="text-news-text">Action:</strong>&nbsp;{step.title}
                        </span>
                        {stepTools[0] && (
                          <span className="flex items-center gap-1">
                            <Target size={11} className="text-yellow-400" />
                            <strong className="text-news-text">Purpose:</strong>&nbsp;{stepTools[0].short_description?.split('.')[0] || 'Core tool for this step'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Cost Breakdown ───────────────────────────────────────────────── */}
        {costEstimate && (
          <section>
            <SectionHeading icon={<DollarSign size={16} />} title="Cost Breakdown" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="p-5 rounded-xl bg-surface-card border border-border-subtle text-center">
                <p className="text-2xl font-black text-white mb-1">
                  {costEstimate.paidCount === 0 ? '$0' : `$${costEstimate.low}–$${costEstimate.high}`}
                </p>
                <p className="text-xs text-news-muted uppercase tracking-widest">Est. / month</p>
              </div>
              <div className="p-5 rounded-xl bg-green-900/20 border border-green-700/30 text-center">
                <p className="text-2xl font-black text-green-400 mb-1">{costEstimate.freeCount}</p>
                <p className="text-xs text-green-400/70 uppercase tracking-widest">Free Tools</p>
              </div>
              <div className="p-5 rounded-xl bg-purple-900/20 border border-purple-700/30 text-center">
                <p className="text-2xl font-black text-purple-400 mb-1">{costEstimate.paidCount}</p>
                <p className="text-xs text-purple-400/70 uppercase tracking-widest">Paid Tools</p>
              </div>
            </div>
            <div className="space-y-2">
              {tools.map(t => {
                const pricingClass = PRICING_COLORS[t.pricing_model] || 'bg-surface-alt text-news-muted border-border-subtle';
                return (
                  <div key={t.slug} className="flex items-center justify-between px-4 py-3 rounded-xl bg-surface-card border border-border-subtle">
                    <div className="flex items-center gap-3">
                      {t.logo && <Image src={t.logo} alt="" width={20} height={20} className="object-contain" unoptimized={t.logo?.startsWith('https://res.cloudinary.com')} />}
                      <span className="text-sm font-bold text-white">{t.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {t.starting_price && (
                        <span className="text-xs text-news-muted">from {t.starting_price}</span>
                      )}
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${pricingClass}`}>
                        {t.pricing_model}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Who This Stack Is For ────────────────────────────────────────── */}
        <section>
          <SectionHeading icon={<Users size={16} />} title="Who This Stack Is For" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-green-400 mb-3">Ideal for</p>
              <div className="space-y-2">
                {whoItsFor.map((u, i) => (
                  <div key={i} className="flex gap-2.5 p-3 rounded-lg bg-green-900/10 border border-green-700/20">
                    <CheckCircle size={14} className="text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-news-text leading-snug">{u}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-red-400 mb-3">Not ideal for</p>
              <div className="space-y-2">
                {notFor.map((u, i) => (
                  <div key={i} className="flex gap-2.5 p-3 rounded-lg bg-red-900/10 border border-red-700/20">
                    <XCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-news-text leading-snug">{u}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Core Toolset ─────────────────────────────────────────────────── */}
        <section id="toolset">
          <SectionHeading icon={<Package size={16} />} title={`Core Toolset · ${tools.length} Tools`} />
          <div className="space-y-4">
            {tools.map(t => {
              const pricingClass = PRICING_COLORS[t.pricing_model] || 'bg-surface-alt text-news-muted border-border-subtle';
              const role = getToolRole(t.slug);
              const alts = alternativeTools[t.slug] || [];
              return (
                <div key={t.slug} className="bg-surface-card border border-border-subtle rounded-2xl p-5 md:p-6 hover:border-news-accent/30 transition-all group">
                  <div className="flex flex-col sm:flex-row gap-5">
                    {/* Logo */}
                    <div className="relative w-14 h-14 rounded-xl bg-white border border-border-subtle flex-shrink-0 flex items-center justify-center p-2">
                      {t.logo
                        ? <Image src={t.logo} alt={t.name} fill style={{ objectFit: 'contain', padding: '8px' }} unoptimized={t.logo?.startsWith('https://res.cloudinary.com')} />
                        : <Layers size={20} className="text-news-muted" />
                      }
                    </div>

                    <div className="flex-grow min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-lg font-black text-white group-hover:text-news-accent transition-colors">{t.name}</h3>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${pricingClass}`}>
                          {t.pricing_model}
                        </span>
                        {role && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-news-accent/10 border-news-accent/20 text-news-accent uppercase tracking-widest">
                            {role}
                          </span>
                        )}
                      </div>
                      {t.starting_price && (
                        <p className="text-xs text-news-muted mb-1">from {t.starting_price}</p>
                      )}
                      <p className="text-sm text-news-muted leading-relaxed line-clamp-2 mb-4">{t.short_description}</p>

                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          onClick={() => onToolClick(t.slug)}
                          className="text-xs font-bold text-news-accent bg-news-accent/10 hover:bg-news-accent hover:text-black px-3 py-1.5 rounded transition-colors"
                        >
                          View Profile
                        </button>
                        {t.affiliate_url && (
                          <a
                            href={t.affiliate_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-bold text-white bg-surface-alt hover:bg-surface-hover border border-border-subtle px-3 py-1.5 rounded transition-colors flex items-center gap-1"
                          >
                            Try {t.name} <ExternalLink size={10} />
                          </a>
                        )}
                        {t.rating_score > 0 && (
                          <div className="flex items-center gap-1 text-xs font-bold text-news-accent ml-auto">
                            <Star size={12} fill="currentColor" /> {t.rating_score}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Alternatives for this tool */}
                  {alts.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border-subtle">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-news-muted mb-2">Alternatives</p>
                      <div className="flex flex-wrap gap-2">
                        {alts.map(alt => (
                          <button
                            key={alt.slug}
                            onClick={() => onToolClick(alt.slug)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-alt border border-border-subtle hover:border-news-accent/40 text-xs font-bold text-news-muted hover:text-white transition-colors"
                          >
                            {alt.logo && <Image src={alt.logo} alt="" width={14} height={14} className="object-contain" unoptimized={alt.logo?.startsWith('https://res.cloudinary.com')} />}
                            {alt.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────────────── */}
        <section className="rounded-2xl border border-news-accent/20 bg-news-accent/5 p-8 md:p-10 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-news-accent/10 border border-news-accent/20 mb-5">
            <Zap size={22} className="text-news-accent" />
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white mb-3">Ready to Deploy This Stack?</h2>
          <p className="text-news-muted max-w-lg mx-auto mb-8 leading-relaxed">
            Start with the first tool in the workflow and build from there. Each tool links directly to its setup guide.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="#toolset"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-news-accent text-black text-sm font-black hover:opacity-90 transition-opacity"
            >
              <Zap size={15} /> Start Building This Stack
            </a>
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-surface-card border border-border-subtle text-white text-sm font-bold hover:border-news-accent/40 transition-colors"
            >
              <Layers size={15} /> Explore More Stacks
            </button>
          </div>
        </section>

        {/* ── Related Stacks ───────────────────────────────────────────────── */}
        {relatedStacks.length > 0 && (
          <section>
            <SectionHeading icon={<Layers size={16} />} title="Related Stacks" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedStacks.map(s => (
                <button
                  key={s.id}
                  onClick={() => onStackClick ? onStackClick(s.slug) : undefined}
                  className="group text-left bg-surface-card border border-border-subtle hover:border-news-accent/50 rounded-xl overflow-hidden transition-all hover:-translate-y-0.5"
                >
                  {s.hero_image && (
                    <div className="relative w-full h-28 overflow-hidden">
                      <Image src={s.hero_image} alt={s.name} fill style={{ objectFit: 'cover' }} unoptimized={s.hero_image?.startsWith('https://res.cloudinary.com')} />
                    </div>
                  )}
                  <div className="p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-news-accent mb-1">{s.workflow_category}</p>
                    <p className="text-sm font-black text-white group-hover:text-news-accent transition-colors line-clamp-2 leading-snug mb-2">{s.name}</p>
                    <p className="text-[11px] text-news-muted">{s.tools?.length || 0} Tools</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ── Comparisons ──────────────────────────────────────────────────── */}
        {comparisons.length > 0 && (
          <section>
            <SectionHeading icon={<BarChart2 size={16} />} title="Tool Comparisons" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {comparisons.map((c: any) => (
                <button
                  key={c.slug}
                  onClick={() => onComparisonClick(c.slug)}
                  className="group text-left p-4 rounded-xl bg-surface-card border border-border-subtle hover:border-news-accent/40 transition-all"
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-news-muted">VS</span>
                    <div className="flex items-center gap-1">
                      {[c.tool_a_slug, c.tool_b_slug, c.tool_c_slug].filter(Boolean).map((s: string) => (
                        <span key={s} className="text-[10px] font-bold text-news-text bg-surface-alt border border-border-subtle px-1.5 py-0.5 rounded">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm font-bold text-white group-hover:text-news-accent transition-colors line-clamp-2 leading-snug">
                    {c.title}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-black text-news-accent mt-2">
                    View Matchup <ArrowRight size={10} />
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ── Rankings ─────────────────────────────────────────────────────── */}
        {rankings.length > 0 && (
          <section>
            <SectionHeading icon={<BarChart2 size={16} />} title="Related Rankings" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {rankings.map(a => (
                <button
                  key={a.id}
                  onClick={() => onArticleClick(a)}
                  className="group text-left bg-surface-card border border-border-subtle hover:border-news-accent/40 rounded-xl overflow-hidden transition-all hover:-translate-y-0.5"
                >
                  {a.imageUrl && <div className="relative w-full h-28 overflow-hidden"><Image src={a.imageUrl} alt={a.title} fill style={{ objectFit: 'cover' }} unoptimized={a.imageUrl?.startsWith('https://res.cloudinary.com')} /></div>}
                  <div className="p-4">
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[9px] font-bold uppercase tracking-widest mb-2">
                      <BarChart2 size={9} /> Ranking
                    </div>
                    <p className="text-sm font-bold text-white group-hover:text-news-accent transition-colors line-clamp-2 leading-snug">{a.title}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ── Guides ───────────────────────────────────────────────────────── */}
        {guides.length > 0 && (
          <section>
            <SectionHeading icon={<BookOpen size={16} />} title="Related Guides" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {guides.map(a => (
                <button
                  key={a.id}
                  onClick={() => onArticleClick(a)}
                  className="group text-left bg-surface-card border border-border-subtle hover:border-purple-400/40 rounded-xl overflow-hidden transition-all hover:-translate-y-0.5"
                >
                  {a.imageUrl && <div className="relative w-full h-28 overflow-hidden"><Image src={a.imageUrl} alt={a.title} fill style={{ objectFit: 'cover' }} unoptimized={a.imageUrl?.startsWith('https://res.cloudinary.com')} /></div>}
                  <div className="p-4">
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[9px] font-bold uppercase tracking-widest mb-2">
                      <BookOpen size={9} /> Guide
                    </div>
                    <p className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors line-clamp-2 leading-snug">{a.title}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
};

export default StackPage;
