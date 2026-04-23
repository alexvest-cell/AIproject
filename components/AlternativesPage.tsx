'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Tool, Comparison, Article } from '../types';
import { ChevronLeft, ExternalLink, ArrowRight, Star, Zap, Shuffle, BookOpen, BarChart2, Check } from 'lucide-react';

interface AlternativesPageProps {
  toolSlug: string;
  onBack: () => void;
  onToolClick: (slug: string) => void;
  onArticleClick: (article: Article) => void;
  onComparisonClick: (slug: string) => void;
  // Optional server-prefetched data — skips client-side fetch when provided
  initialTool?: Tool | null;
  initialAlternatives?: Tool[];
  initialComparisons?: Comparison[];
  initialRelatedArticles?: Article[];
}

const PRICING_COLORS: Record<string, string> = {
  Free: 'bg-green-900/40 text-green-400 border-green-700/50',
  Freemium: 'bg-blue-900/40 text-blue-400 border-blue-700/50',
  Paid: 'bg-purple-900/40 text-purple-400 border-purple-700/50',
  Enterprise: 'bg-orange-900/40 text-orange-400 border-orange-700/50',
};

function isDiscontinued(t: any): boolean {
  const d = ((t.short_description || '') + ' ' + (t.full_description || '')).toLowerCase();
  return d.includes('discontinued') || d.includes('shut down') || d.includes('no longer available');
}

const AlternativesPage: React.FC<AlternativesPageProps> = ({
  toolSlug,
  onBack,
  onToolClick,
  onArticleClick,
  onComparisonClick,
  initialTool,
  initialAlternatives,
  initialComparisons,
  initialRelatedArticles,
}) => {
  const [tool, setTool] = useState<Tool | null>(initialTool ?? null);
  const [alternatives, setAlternatives] = useState<Tool[]>(initialAlternatives ?? []);
  const [comparisons, setComparisons] = useState<Comparison[]>(initialComparisons ?? []);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>(initialRelatedArticles ?? []);
  const [loading, setLoading] = useState(!initialTool);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialTool) return; // Server-prefetched — skip client fetch
    setLoading(true);
    setError(null);
    window.scrollTo(0, 0);

    fetch(`/api/tools/${toolSlug}/alternatives`)
      .then(r => r.ok ? r.json() : Promise.reject('Not found'))
      .then(data => {
        setTool(data.tool);
        setAlternatives(data.alternatives || []);
        setComparisons(data.comparisons || []);
        setRelatedArticles(data.relatedArticles || []);

        if (data.tool) {
          document.title = `Best ${data.tool.name} Alternatives (2026) | ToolCurrent`;
          const desc = `The best alternatives to ${data.tool.name} in 2026. Compare features, pricing, and scores to find the right tool for your workflow.`;
          let metaDesc = document.querySelector('meta[name="description"]');
          if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.setAttribute('name', 'description');
            document.head.appendChild(metaDesc);
          }
          metaDesc.setAttribute('content', desc);
        }
      })
      .catch(err => setError(typeof err === 'string' ? err : 'Failed to load alternatives'))
      .finally(() => setLoading(false));
  }, [toolSlug]);

  if (loading) return (
    <div className="min-h-screen bg-surface-base flex items-center justify-center pt-16 md:pt-[112px]">
      <div className="flex flex-col items-center gap-4 text-news-muted">
        <div className="w-8 h-8 border-2 border-news-accent border-t-transparent rounded-full animate-spin" />
        <span className="text-sm uppercase tracking-widest">Loading alternatives</span>
      </div>
    </div>
  );

  if (error || !tool) return (
    <div className="min-h-screen bg-surface-base flex items-center justify-center pt-16 md:pt-[112px]">
      <div className="text-center">
        <p className="text-news-muted mb-4">{error || 'Tool not found'}</p>
        <button onClick={onBack} className="text-news-accent hover:underline text-sm">← Back</button>
      </div>
    </div>
  );

  const t = tool as any;
  const topUseCases = (t.use_case_tags || []).slice(0, 2) as string[];
  const useCaseText = topUseCases.length > 0
    ? topUseCases.join(' and ').toLowerCase()
    : 'similar capabilities';
  const introText = `Looking for alternatives to ${tool.name}? These are the top ${alternatives.length} tools that offer similar ${useCaseText} — ranked by overall score and compared across features, pricing, and use cases.`;

  return (
    <div className="min-h-screen bg-surface-base text-news-text font-sans pt-16 md:pt-[112px]">
      <div className="container mx-auto px-4 md:px-8 py-10 max-w-5xl">

        {/* Back link */}
        <Link
          href={`/tools/${toolSlug}`}
          className="inline-flex items-center gap-1 text-news-muted hover:text-white transition-colors text-xs mb-8"
        >
          <ChevronLeft size={14} /> Back to {tool.name}
        </Link>

        {/* Hero */}
        <div className="mb-10 pb-10 border-b border-border-divider">
          <div className="flex items-center gap-3 mb-4">
            {tool.logo && (
              <div className="relative w-12 h-12 rounded-xl bg-white border border-border-subtle flex-shrink-0 overflow-hidden">
                <Image src={tool.logo} alt={tool.name} fill style={{ objectFit: 'contain', padding: '6px' }} unoptimized={tool.logo?.startsWith('https://res.cloudinary.com')} />
              </div>
            )}
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-news-accent mb-1">Alternatives</p>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
                {tool.name} Alternatives
              </h1>
            </div>
          </div>

          <p className="text-news-text text-lg leading-relaxed max-w-2xl mb-4">
            {introText}
          </p>

          {/* Category + use case badges — no keyword stuffing */}
          <div className="flex flex-wrap gap-2 mb-4">
            {t.category_primary && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-news-accent/10 text-news-accent border border-news-accent/30 font-medium">
                {t.category_primary}
              </span>
            )}
            {topUseCases.map((uc: string) => (
              <span key={uc} className="text-xs px-2.5 py-1 rounded-full bg-surface-alt text-news-text border border-border-subtle">
                {uc}
              </span>
            ))}
          </div>

          <Link
            href={`/tools/${toolSlug}`}
            className="inline-flex items-center gap-2 text-xs font-bold text-news-accent hover:text-white transition-colors"
          >
            View {tool.name} full profile <ArrowRight size={12} />
          </Link>
        </div>

        {/* Top Alternatives */}
        {alternatives.length > 0 && (
          <section className="mb-12">
            <h2 className="text-base font-bold uppercase tracking-widest text-news-muted mb-6 pb-2 border-b border-border-divider flex items-center gap-2">
              <Shuffle size={14} className="text-news-accent" />
              Top Alternatives to {tool.name}
            </h2>
            <div className="space-y-4">
              {alternatives.map((alt, idx) => {
                const pricingClass = PRICING_COLORS[(alt as any).pricing_model] || 'bg-surface-alt text-news-muted border-border-subtle';
                const discontinued = isDiscontinued(alt);
                return (
                  <div
                    key={alt.slug}
                    className={`bg-surface-card border rounded-2xl p-5 md:p-6 transition-all group ${discontinued ? 'border-border-subtle opacity-70' : 'border-border-subtle hover:border-news-accent/30'}`}
                  >
                    {/* Top row: rank + logo + name/badges */}
                    <div className="flex items-start gap-4 mb-3">
                      <div className="hidden sm:flex w-8 h-8 rounded-full bg-surface-alt border border-border-subtle text-xs font-black text-news-muted items-center justify-center flex-shrink-0 mt-1">
                        {idx + 1}
                      </div>
                      {alt.logo && (
                        <div className="relative w-14 h-14 rounded-xl bg-white border border-border-subtle flex-shrink-0 overflow-hidden">
                          <Image src={alt.logo} alt={alt.name} fill style={{ objectFit: 'contain', padding: '8px' }} unoptimized={alt.logo?.startsWith('https://res.cloudinary.com')} />
                        </div>
                      )}
                      <div className="flex-grow min-w-0 pt-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-white font-black text-lg group-hover:text-news-accent transition-colors">{alt.name}</h3>
                          {discontinued && (
                            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-surface-alt text-news-muted border border-border-subtle">
                              Discontinued
                            </span>
                          )}
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${pricingClass}`}>
                            {(alt as any).pricing_model}
                          </span>
                          {(alt as any).ai_enabled && (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 flex items-center gap-1">
                              <Zap size={9} /> AI
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Full-width: description, key features, actions */}
                    <p className="text-news-text text-sm leading-relaxed line-clamp-2 mb-3">{alt.short_description}</p>
                    {alt.key_features && alt.key_features.length > 0 && (
                      <div className="space-y-1 mb-3">
                        {alt.key_features.slice(0, 3).map((f: string, fi: number) => (
                          <span key={fi} className="flex items-start gap-1.5 text-xs text-news-accent/80">
                            <Check size={11} className="flex-shrink-0 mt-0.5" /> {f}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => onToolClick(alt.slug)}
                        className="text-xs font-bold bg-news-accent/10 hover:bg-news-accent text-news-accent hover:text-white px-3 py-1.5 rounded-lg transition-all"
                      >
                        View Tool
                      </button>
                      {(alt as any).affiliate_url && !discontinued && (
                        <a
                          href={(alt as any).affiliate_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold bg-surface-alt hover:bg-surface-hover text-white px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 border border-border-subtle"
                        >
                          Try Free <ExternalLink size={10} />
                        </a>
                      )}
                      {(alt as any).rating_score > 0 && (
                        <span className="flex items-center gap-1 text-xs text-news-accent font-bold ml-auto">
                          <Star size={11} fill="currentColor" /> {(alt as any).rating_score.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Comparison Links */}
          {comparisons.length > 0 && (
            <section>
              <h2 className="text-base font-bold uppercase tracking-widest text-news-muted mb-4 pb-2 border-b border-border-divider flex items-center gap-2">
                <BarChart2 size={14} className="text-news-accent" /> Head-to-Head Comparisons
              </h2>
              <div className="space-y-2">
                {comparisons.map((c: any) => (
                  <button
                    key={c._id || c.id}
                    onClick={() => onComparisonClick(c.slug)}
                    className="w-full text-left bg-surface-card hover:bg-surface-hover border border-border-subtle rounded-xl px-4 py-3 transition-all group flex items-center justify-between"
                  >
                    <span className="font-semibold text-white text-sm group-hover:text-news-accent transition-colors">{c.title}</span>
                    <ArrowRight size={12} className="text-news-muted group-hover:text-news-accent transition-colors flex-shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <section>
              <h2 className="text-base font-bold uppercase tracking-widest text-news-muted mb-4 pb-2 border-b border-border-divider flex items-center gap-2">
                <BookOpen size={14} className="text-news-accent" /> Related Rankings & Guides
              </h2>
              <div className="space-y-2">
                {relatedArticles.map((a: any) => (
                  <button
                    key={a._id || a.id}
                    onClick={() => onArticleClick(a)}
                    className="w-full text-left bg-surface-card hover:bg-surface-hover border border-border-subtle rounded-xl px-4 py-3 transition-all group flex items-center justify-between"
                  >
                    <div className="min-w-0">
                      <span className="font-semibold text-white text-sm group-hover:text-news-accent transition-colors line-clamp-1">{a.title}</span>
                      {a.excerpt && (
                        <p className="text-xs text-news-muted mt-0.5 line-clamp-1">{a.excerpt}</p>
                      )}
                    </div>
                    <ArrowRight size={12} className="text-news-muted group-hover:text-news-accent transition-colors flex-shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Back to tool CTA */}
        <div className="mt-12 pt-8 border-t border-border-divider text-center">
          <p className="text-news-muted text-sm mb-3">Still think {tool.name} is the right choice?</p>
          <Link
            href={`/tools/${toolSlug}`}
            className="inline-flex items-center gap-2 bg-surface-card hover:bg-surface-hover border border-border-subtle text-white font-bold text-sm px-6 py-3 rounded-xl transition-all"
          >
            View full {tool.name} profile <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AlternativesPage;
