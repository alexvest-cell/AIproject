import React, { useEffect, useState } from 'react';
import { Tool, Comparison, Article } from '../types';
import { ChevronLeft, ExternalLink, ArrowRight, Star, Zap, Shuffle, BookOpen, BarChart2, Check } from 'lucide-react';

interface AlternativesPageProps {
  toolSlug: string;
  onBack: () => void;
  onToolClick: (slug: string) => void;
  onArticleClick: (article: Article) => void;
  onComparisonClick: (slug: string) => void;
}

const PRICING_COLORS: Record<string, string> = {
  Free: 'bg-green-900/40 text-green-400 border-green-700/50',
  Freemium: 'bg-blue-900/40 text-blue-400 border-blue-700/50',
  Paid: 'bg-purple-900/40 text-purple-400 border-purple-700/50',
  Enterprise: 'bg-orange-900/40 text-orange-400 border-orange-700/50',
};

const PRICING_BADGE_ICONS: Record<string, string> = {
  Free: '🆓',
  Freemium: '⚡',
  Paid: '💎',
  Enterprise: '🏢',
};

const AlternativesPage: React.FC<AlternativesPageProps> = ({
  toolSlug,
  onBack,
  onToolClick,
  onArticleClick,
  onComparisonClick,
}) => {
  const [tool, setTool] = useState<Tool | null>(null);
  const [alternatives, setAlternatives] = useState<Tool[]>([]);
  const [comparisons, setComparisons] = useState<Comparison[]>([]);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
          const desc = `Looking for ${data.tool.name} alternatives? Compare the best ${(data.tool.category_tags || []).join(' and ')} tools and apps similar to ${data.tool.name}.`;
          let metaDesc = document.querySelector('meta[name="description"]');
          if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.setAttribute('name', 'description');
            document.head.appendChild(metaDesc);
          }
          metaDesc.setAttribute('content', desc);

          // ItemList schema for SEO
          const schema = {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: `Best ${data.tool.name} Alternatives`,
            description: desc,
            itemListElement: (data.alternatives || []).map((alt: Tool, idx: number) => ({
              '@type': 'ListItem',
              position: idx + 1,
              name: alt.name,
              url: `https://toolcurrent.com/tools/${alt.slug}`,
            })),
          };
          let el = document.getElementById('alt-schema');
          if (!el) {
            el = document.createElement('script');
            el.id = 'alt-schema';
            (el as HTMLScriptElement).type = 'application/ld+json';
            document.head.appendChild(el);
          }
          el.textContent = JSON.stringify(schema);
        }
      })
      .catch(err => setError(typeof err === 'string' ? err : 'Failed to load alternatives'))
      .finally(() => setLoading(false));

    return () => {
      const el = document.getElementById('alt-schema');
      if (el) el.remove();
      document.title = 'ToolCurrent | Software Discovery & Intelligence';
    };
  }, [toolSlug]);

  if (loading) return (
    <div className="min-h-screen bg-surface-base flex items-center justify-center pt-[112px]">
      <div className="flex flex-col items-center gap-4 text-news-muted">
        <div className="w-8 h-8 border-2 border-news-accent border-t-transparent rounded-full animate-spin" />
        <span className="text-sm uppercase tracking-widest">Loading alternatives</span>
      </div>
    </div>
  );

  if (error || !tool) return (
    <div className="min-h-screen bg-surface-base flex items-center justify-center pt-[112px]">
      <div className="text-center">
        <p className="text-news-muted mb-4">{error || 'Tool not found'}</p>
        <button onClick={onBack} className="text-news-accent hover:underline text-sm">← Back</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface-base text-news-text font-sans pt-[112px]">
      <div className="container mx-auto px-4 md:px-8 py-10 max-w-5xl">

        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-news-muted hover:text-white transition-colors text-xs font-bold uppercase tracking-widest mb-8"
        >
          <ChevronLeft size={14} /> Back
        </button>

        {/* Hero */}
        <div className="mb-10 pb-10 border-b border-border-divider">
          <div className="flex items-center gap-3 mb-4">
            {tool.logo && (
              <div className="w-12 h-12 rounded-xl bg-white border border-border-subtle flex-shrink-0 overflow-hidden">
                <img src={tool.logo} alt={tool.name} className="w-full h-full object-contain p-1.5" loading="lazy" />
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
            Looking for alternatives to <strong className="text-white">{tool.name}</strong>?
            We've curated the best {(tool.category_tags || []).join(' and ')} tools that offer
            similar features—whether you need a different pricing model, more integrations, or a fresh approach.
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {(tool.category_tags || []).map(tag => (
              <span key={tag} className="text-xs px-2 py-1 rounded-full bg-surface-alt text-news-muted border border-border-subtle">{tag}</span>
            ))}
          </div>
          <button
            onClick={() => onToolClick(toolSlug)}
            className="flex items-center gap-2 text-xs font-bold text-news-accent hover:text-white transition-colors"
          >
            View {tool.name} full profile <ArrowRight size={12} />
          </button>
        </div>

        {/* Top Alternatives Grid */}
        {alternatives.length > 0 && (
          <section className="mb-12">
            <h2 className="text-base font-bold uppercase tracking-widest text-news-muted mb-6 pb-2 border-b border-border-divider flex items-center gap-2">
              <Shuffle size={14} className="text-news-accent" />
              Top Alternatives to {tool.name}
            </h2>
            <div className="space-y-4">
              {alternatives.map((alt, idx) => {
                const pricingClass = PRICING_COLORS[alt.pricing_model] || 'bg-surface-alt text-news-muted border-border-subtle';
                return (
                  <div
                    key={alt.slug}
                    className="bg-surface-card border border-border-subtle rounded-2xl p-5 md:p-6 hover:border-news-accent/30 transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      {/* Rank badge */}
                      <div className="hidden sm:flex w-8 h-8 rounded-full bg-surface-alt border border-border-subtle text-xs font-black text-news-muted items-center justify-center flex-shrink-0 mt-1">
                        {idx + 1}
                      </div>

                      {/* Logo */}
                      {alt.logo && (
                        <div className="w-14 h-14 rounded-xl bg-white border border-border-subtle flex-shrink-0 overflow-hidden">
                          <img src={alt.logo} alt={alt.name} className="w-full h-full object-contain p-2" loading="lazy" />
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-grow min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="text-white font-black text-lg group-hover:text-news-accent transition-colors">{alt.name}</h3>
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${pricingClass}`}>
                            {PRICING_BADGE_ICONS[alt.pricing_model]} {alt.pricing_model}
                          </span>
                          {alt.ai_enabled && (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 flex items-center gap-1">
                              <Zap size={9} /> AI
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {(alt.category_tags || []).slice(0, 3).map(tag => (
                            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-surface-alt text-news-muted">{tag}</span>
                          ))}
                        </div>
                        <p className="text-news-text text-sm leading-relaxed line-clamp-2 mb-3">{alt.short_description}</p>

                        {/* Key features badge row */}
                        {alt.key_features && alt.key_features.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {alt.key_features.slice(0, 3).map((f, fi) => (
                              <span key={fi} className="flex items-center gap-1 text-[10px] text-news-accent/80">
                                <Check size={9} /> {f}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <button
                            onClick={() => onToolClick(alt.slug)}
                            className="text-xs font-bold bg-news-accent/10 hover:bg-news-accent text-news-accent hover:text-white px-3 py-1.5 rounded-lg transition-all"
                          >
                            View Tool
                          </button>
                          {alt.affiliate_url && (
                            <a
                              href={alt.affiliate_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-bold bg-surface-alt hover:bg-surface-hover text-white px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 border border-border-subtle"
                            >
                              Try Free <ExternalLink size={10} />
                            </a>
                          )}
                          {alt.rating_score > 0 && (
                            <span className="flex items-center gap-1 text-xs text-news-accent font-bold ml-auto">
                              <Star size={11} fill="currentColor" /> {alt.rating_score.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
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
                {comparisons.map(c => (
                  <button
                    key={c.id}
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

          {/* Related Articles (Rankings + Guides) */}
          {relatedArticles.length > 0 && (
            <section>
              <h2 className="text-base font-bold uppercase tracking-widest text-news-muted mb-4 pb-2 border-b border-border-divider flex items-center gap-2">
                <BookOpen size={14} className="text-news-accent" /> Related Rankings & Guides
              </h2>
              <div className="space-y-2">
                {relatedArticles.map(a => (
                  <button
                    key={a.id}
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
          <button
            onClick={() => onToolClick(toolSlug)}
            className="inline-flex items-center gap-2 bg-surface-card hover:bg-surface-hover border border-border-subtle text-white font-bold text-sm px-6 py-3 rounded-xl transition-all"
          >
            View full {tool.name} profile <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlternativesPage;
