'use client';
import React, { useEffect, useState } from 'react';
import { Article, Tool, Comparison, Category, UseCase } from '../types';
import { ArrowRight, Star, Zap, Filter, BookOpen, LayoutGrid, ChevronLeft, TrendingUp, Layers } from 'lucide-react';

interface CategoryHubPageProps {
  slug: string;
  onBack: () => void;
  onToolClick: (slug: string) => void;
  onArticleClick: (article: Article) => void;
  onComparisonClick?: (slug: string) => void;
  onCategoryClick?: (slug: string) => void;
}

const PRICING_COLORS: Record<string, string> = {
  Free:       'bg-green-900/40 text-green-400 border-green-800/60',
  Freemium:   'bg-blue-900/40 text-blue-400 border-blue-800/60',
  Paid:       'bg-purple-900/40 text-purple-400 border-purple-800/60',
  Enterprise: 'bg-orange-900/40 text-orange-400 border-orange-800/60',
};

const ToolCard: React.FC<{ tool: Tool; onClick: () => void; featured?: boolean }> = ({ tool, onClick, featured }) => (
  <button
    onClick={onClick}
    className={`group text-left bg-surface-card border rounded-2xl p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all flex flex-col gap-3 ${
      featured ? 'border-news-accent/30 hover:border-news-accent/60' : 'border-border-subtle hover:border-border-divider'
    }`}
  >
    <div className="flex items-start gap-3">
      <div className="w-11 h-11 rounded-xl bg-surface-alt border border-border-subtle flex-shrink-0 flex items-center justify-center overflow-hidden">
        {tool.logo
          ? <img src={tool.logo} alt={tool.name} className="w-full h-full object-contain p-1.5" loading="lazy" />
          : <Zap size={18} className="text-news-accent" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-white group-hover:text-news-accent transition-colors truncate">{tool.name}</h3>
        <div className="flex items-center gap-2 mt-0.5">
          {tool.rating_score > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-news-muted">
              <Star size={9} className="text-news-accent" fill="currentColor" />
              {tool.rating_score.toFixed(1)}
            </span>
          )}
          <span className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border ${PRICING_COLORS[tool.pricing_model] || 'bg-surface-alt text-news-muted border-border-subtle'}`}>
            {tool.pricing_model}
          </span>
        </div>
      </div>
    </div>
    <p className="text-xs text-news-muted leading-relaxed line-clamp-2">{tool.short_description}</p>
    {tool.use_case_tags?.length > 0 && (
      <div className="flex flex-wrap gap-1">
        {tool.use_case_tags.slice(0, 2).map(tag => (
          <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-surface-base border border-border-subtle text-news-muted">{tag}</span>
        ))}
      </div>
    )}
  </button>
);

const ArticleCard: React.FC<{ article: Article; onClick: () => void; variant?: 'ranking' | 'guide' }> = ({ article, onClick, variant = 'ranking' }) => (
  <button onClick={onClick} className="group text-left bg-surface-card border border-border-subtle rounded-2xl overflow-hidden hover:-translate-y-0.5 hover:border-border-divider transition-all">
    {article.imageUrl && (
      <div className="h-28 overflow-hidden">
        <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
      </div>
    )}
    <div className="p-4">
      <p className={`text-[9px] font-bold uppercase tracking-widest mb-2 ${variant === 'guide' ? 'text-purple-400' : 'text-news-accent'}`}>
        {variant === 'guide' ? '📖 Guide' : '🏆 Best-of'}
      </p>
      <h4 className="text-sm font-bold text-white group-hover:text-news-accent transition-colors leading-snug line-clamp-2">{article.title}</h4>
      {article.excerpt && <p className="text-[11px] text-news-muted mt-2 line-clamp-2 leading-relaxed">{article.excerpt}</p>}
    </div>
  </button>
);

const CategoryHubPage: React.FC<CategoryHubPageProps> = ({ slug, onBack, onToolClick, onArticleClick, onComparisonClick, onCategoryClick }) => {
  const [category, setCategory]   = useState<Category | null>(null);
  const [tools, setTools]         = useState<Tool[]>([]);
  const [featuredTools, setFeaturedTools] = useState<Tool[]>([]);
  const [bestOf, setBestOf]       = useState<Article[]>([]);
  const [guides, setGuides]       = useState<Article[]>([]);
  const [related, setRelated]     = useState<Category[]>([]);
  const [useCases, setUseCases]   = useState<UseCase[]>([]);
  const [comparisons, setComparisons] = useState<Comparison[]>([]);
  const [loading, setLoading]     = useState(true);
  const [pricingFilter, setPricingFilter] = useState('All');
  const [ucFilter, setUcFilter]   = useState('All');
  const [page, setPage]           = useState(1);
  const PAGE_SIZE = 12;

  useEffect(() => {
    setLoading(true);
    fetch(`/api/categories/${slug}`)
      .then(r => r.ok ? r.json() : Promise.reject('Not found'))
      .then(data => {
        setCategory(data.category);
        setTools(data.tools || []);
        setFeaturedTools(data.featuredTools || []);
        setBestOf(data.bestSoftwareArticles || []);
        setGuides(data.guides || []);
        setRelated(data.relatedCategories || []);
        setUseCases(data.useCases || []);
        setComparisons(data.comparisons || []);
        document.title = `${data.category?.name || 'Category'} Tools & Resources | ToolCurrent`;
      })
      .catch(() => setCategory(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen bg-surface-base flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-news-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!category) return (
    <div className="min-h-screen bg-surface-base flex items-center justify-center text-news-muted">
      <div className="text-center">
        <p className="mb-4">Category not found.</p>
        <button onClick={onBack} className="text-news-accent hover:underline text-sm">← Back</button>
      </div>
    </div>
  );

  // Filters
  const PRICING_OPTIONS = ['All', 'Free', 'Freemium', 'Paid', 'Enterprise'];
  const ucOptions = ['All', ...Array.from(new Set(tools.flatMap(t => t.use_case_tags || []))).slice(0, 8)];

  const filtered = tools.filter(t => {
    const priceMatch = pricingFilter === 'All' || t.pricing_model === pricingFilter;
    const ucMatch    = ucFilter === 'All' || (t.use_case_tags || []).includes(ucFilter);
    return priceMatch && ucMatch;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="min-h-screen bg-surface-base text-news-text font-sans">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="bg-surface-alt border-b border-border-divider">
        <div className="container mx-auto px-4 md:px-8 pt-[140px] md:pt-[150px] pb-10">
          <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-news-muted hover:text-white transition-colors mb-6">
            <ChevronLeft size={14} /> All Categories
          </button>
          <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-8">
            {category.icon && (
              <div className="w-16 h-16 rounded-2xl bg-news-accent/10 border border-news-accent/20 flex items-center justify-center text-3xl flex-shrink-0">
                {category.icon}
              </div>
            )}
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-news-accent mb-2">Category</p>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-3">{category.name}</h1>
              {category.description && (
                <p className="text-news-muted text-base max-w-2xl leading-relaxed">{category.description}</p>
              )}
            </div>
            <div className="flex gap-6 text-center flex-shrink-0">
              <div>
                <p className="text-2xl font-black text-white">{tools.length}</p>
                <p className="text-[10px] text-news-muted uppercase tracking-wider">Tools</p>
              </div>
              {bestOf.length > 0 && (
                <div>
                  <p className="text-2xl font-black text-white">{bestOf.length}</p>
                  <p className="text-[10px] text-news-muted uppercase tracking-wider">Rankings</p>
                </div>
              )}
              {guides.length > 0 && (
                <div>
                  <p className="text-2xl font-black text-white">{guides.length}</p>
                  <p className="text-[10px] text-news-muted uppercase tracking-wider">Guides</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-10 max-w-7xl space-y-14">

        {/* ── Featured Tools ────────────────────────────────────────────── */}
        {featuredTools.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-news-accent flex items-center gap-2">
                <TrendingUp size={12} /> Featured {category.name} Tools
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredTools.slice(0, 4).map(t => (
                <ToolCard key={t.id} tool={t} onClick={() => onToolClick(t.slug)} featured />
              ))}
            </div>
          </section>
        )}

        {/* ── Use Case Pills + Filters ──────────────────────────────────── */}
        <section>
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-news-muted flex items-center gap-2 flex-shrink-0">
              <LayoutGrid size={12} /> All {category.name} Tools
              <span className="text-news-text normal-case font-normal tracking-normal">({filtered.length})</span>
            </p>
            <div className="flex flex-wrap gap-2 ml-auto">
              {PRICING_OPTIONS.map(p => (
                <button key={p} onClick={() => { setPricingFilter(p); setPage(1); }}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all ${pricingFilter === p ? 'bg-news-accent text-black border-news-accent' : 'bg-transparent text-news-muted border-border-subtle hover:border-border-divider hover:text-white'}`}>
                  {p}
                </button>
              ))}
              <span className="w-px h-5 bg-border-divider self-center" />
              <select
                value={ucFilter}
                onChange={e => { setUcFilter(e.target.value); setPage(1); }}
                className="bg-surface-card border border-border-subtle text-news-muted text-[10px] rounded-full px-3 py-1.5 outline-none hover:border-border-divider transition-colors"
              >
                {ucOptions.map(o => <option key={o} value={o}>{o === 'All' ? 'All Use Cases' : o}</option>)}
              </select>
            </div>
          </div>

          {paginated.length === 0 ? (
            <p className="text-news-muted text-sm text-center py-12">No tools match the current filters.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginated.map(t => (
                <ToolCard key={t.id} tool={t} onClick={() => onToolClick(t.slug)} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <button onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo(0, 0); }}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg bg-surface-card border border-border-subtle text-sm disabled:opacity-30 hover:bg-surface-hover transition-colors">
                ← Prev
              </button>
              <span className="text-sm text-news-muted">Page {page} of {totalPages}</span>
              <button onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo(0, 0); }}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-lg bg-surface-card border border-border-subtle text-sm disabled:opacity-30 hover:bg-surface-hover transition-colors">
                Next →
              </button>
            </div>
          )}
        </section>

        {/* ── Use Cases ─────────────────────────────────────────────────── */}
        {useCases.length > 0 && (
          <section>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-news-muted mb-5">Use Cases</p>
            <div className="flex flex-wrap gap-3">
              {useCases.map(uc => (
                <div key={uc.id} className="px-4 py-2 rounded-xl bg-surface-card border border-border-subtle text-sm text-white">
                  {uc.name}
                  {uc.description && <span className="text-news-muted ml-2 text-xs">— {uc.description}</span>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Best Software Rankings ────────────────────────────────────── */}
        {bestOf.length > 0 && (
          <section>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-news-accent mb-5 flex items-center gap-2">
              <Star size={12} fill="currentColor" /> Best {category.name} Software — Rankings
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {bestOf.slice(0, 8).map(a => (
                <ArticleCard key={a.id} article={a} onClick={() => onArticleClick(a)} variant="ranking" />
              ))}
            </div>
          </section>
        )}

        {/* ── Comparisons ───────────────────────────────────────────────── */}
        {comparisons.length > 0 && onComparisonClick && (
          <section>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-news-muted mb-5">Comparisons</p>
            <div className="flex flex-wrap gap-3">
              {comparisons.slice(0, 6).map(c => (
                <button key={c.id} onClick={() => onComparisonClick(c.slug)}
                  className="px-4 py-2 rounded-xl bg-surface-card border border-border-subtle text-xs font-medium text-white hover:border-border-divider hover:bg-surface-hover transition-all flex items-center gap-2">
                  {c.title} <ArrowRight size={11} />
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ── Guides ────────────────────────────────────────────────────── */}
        {guides.length > 0 && (
          <section>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-purple-400 mb-5 flex items-center gap-2">
              <BookOpen size={12} /> {category.name} Guides
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {guides.slice(0, 8).map(a => (
                <ArticleCard key={a.id} article={a} onClick={() => onArticleClick(a)} variant="guide" />
              ))}
            </div>
          </section>
        )}

        {/* ── Related Categories ────────────────────────────────────────── */}
        {related.length > 0 && (
          <section>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-news-muted mb-5">Related Categories</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {related.slice(0, 12).map(cat => (
                <button key={cat.id}
                  onClick={() => onCategoryClick ? onCategoryClick(cat.slug) : undefined}
                  className="group flex flex-col items-center gap-2 p-4 rounded-2xl bg-surface-card border border-border-subtle hover:border-border-divider hover:bg-surface-hover transition-all text-center">
                  {cat.icon && <span className="text-2xl">{cat.icon}</span>}
                  <span className="text-xs font-bold text-white group-hover:text-news-accent transition-colors">{cat.name}</span>
                </button>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
};

export default CategoryHubPage;
