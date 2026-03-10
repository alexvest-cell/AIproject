import React, { useEffect, useState } from 'react';
import { StackPageData, Article, Tool } from '../types';
import { ChevronLeft, ArrowRight, Layers, Check, ExternalLink, Activity, BookOpen, Star, AlertCircle } from 'lucide-react';
import { RelatedContent } from './RelatedContent';

interface StackPageProps {
  slug: string;
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

const StackPage: React.FC<StackPageProps> = ({
  slug,
  onBack,
  onToolClick,
  onArticleClick,
  onComparisonClick
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
          document.title = `${d.stack.name} (2026) | ToolCurrent`;
          const metaDesc = document.querySelector('meta[name="description"]');
          if (metaDesc) metaDesc.setAttribute('content', d.stack.short_description);
          
          // Schema
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

  if (loading) return (
    <div className="min-h-screen bg-surface-base flex items-center justify-center pt-[112px]">
      <div className="flex flex-col items-center gap-4 text-news-muted">
        <div className="w-8 h-8 border-2 border-news-accent border-t-transparent rounded-full animate-spin" />
        <span className="text-sm uppercase tracking-widest">Loading Stack</span>
      </div>
    </div>
  );

  if (error || !data || !data.stack) return (
    <div className="min-h-screen bg-surface-base flex text-news-muted flex-col items-center justify-center pt-[112px]">
      <AlertCircle size={48} className="mb-4 text-news-accent" />
      <p className="mb-4">{error || 'Stack not found'}</p>
      <button onClick={onBack} className="text-white hover:text-news-accent bg-surface-card px-4 py-2 border border-border-subtle rounded transition-colors text-sm">
        Return to Stacks
      </button>
    </div>
  );

  const { stack, tools, comparisons, relatedArticles } = data;

  return (
    <div className="min-h-screen bg-surface-base text-news-text font-sans pt-[112px]">
      
      {/* Hero */}
      <div className="relative overflow-hidden bg-surface-card border-b border-border-divider">
        {stack.hero_image && (
          <div className="absolute inset-0 opacity-20 hidden md:block">
            <img src={stack.hero_image} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-surface-card via-surface-card to-transparent" />
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
          
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-[10px] px-2.5 py-1 rounded bg-news-accent/10 border border-news-accent/20 text-news-accent uppercase tracking-widest font-black">
              {stack.workflow_category}
            </span>
            <span className="text-[10px] px-2.5 py-1 rounded bg-surface-alt border border-border-subtle text-news-muted uppercase tracking-widest font-bold flex items-center gap-1.5">
              <Layers size={10} /> {tools.length} Tools
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-6">
            {stack.name}
          </h1>
          <p className="text-xl md:text-2xl text-news-muted font-light leading-relaxed max-w-3xl mb-8">
            {stack.short_description}
          </p>
          
          <div className="flex flex-wrap items-center gap-2">
            {tools.map((t, idx) => (
              <React.Fragment key={t.slug}>
                <button 
                  onClick={() => onToolClick(t.slug)}
                  className="flex items-center gap-2 bg-surface-base hover:bg-surface-hover border border-border-subtle px-3 py-1.5 rounded-lg transition-colors group"
                >
                  {t.logo && <img src={t.logo} alt="" className="w-4 h-4 object-contain" />}
                  <span className="text-xs font-bold text-white group-hover:text-news-accent">{t.name}</span>
                </button>
                {idx < tools.length - 1 && <span className="text-border-subtle">+</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-12 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-2 space-y-12">
            {/* Overview */}
            <section>
              <h2 className="text-lg font-black text-white uppercase tracking-wider mb-6 pb-2 border-b border-border-subtle">Stack Overview</h2>
              <div className="prose prose-invert prose-news max-w-none">
                <p className="text-lg text-news-text leading-relaxed">
                  {stack.full_description || stack.short_description}
                </p>
              </div>
            </section>

            {/* Workflow Steps */}
            {stack.workflow_steps && stack.workflow_steps.length > 0 && (
              <section>
                <h2 className="text-lg font-black text-white uppercase tracking-wider mb-8 pb-2 border-b border-border-subtle">Workflow Pipeline</h2>
                <div className="space-y-6 relative border-l-2 border-border-subtle ml-3">
                  {stack.workflow_steps.map((step, idx) => (
                    <div key={idx} className="relative pl-8">
                      {/* Step node dot */}
                      <span className="absolute left-[-9px] top-1 w-4 h-4 rounded-full bg-news-accent ring-4 ring-surface-base" />
                      
                      <h3 className="text-xl font-black text-white mb-2">{step.title}</h3>
                      <p className="text-news-muted mb-4 text-sm leading-relaxed">{step.description}</p>
                      
                      {step.tool_slugs && step.tool_slugs.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {step.tool_slugs.map(tslug => {
                            const relatedTool = tools.find(t => t.slug === tslug);
                            if (!relatedTool) return null;
                            return (
                              <button 
                                key={tslug}
                                onClick={() => onToolClick(tslug)}
                                className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bg-surface-card border border-border-subtle px-2 py-1 rounded text-news-text hover:text-white hover:border-news-accent/50 transition-colors"
                              >
                                {relatedTool.logo && <img src={relatedTool.logo} alt="" className="w-3 h-3 object-contain" />}
                                {relatedTool.name}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Tools Included */}
            <section>
              <h2 className="text-lg font-black text-white uppercase tracking-wider mb-6 pb-2 border-b border-border-subtle flex items-center justify-between">
                <span>Core Toolset</span>
                <span className="text-sm font-normal text-news-muted normal-case tracking-normal">{tools.length} Tools</span>
              </h2>
              
              <div className="space-y-4">
                {tools.map(t => {
                  const pricingClass = PRICING_COLORS[t.pricing_model] || 'bg-surface-alt text-news-muted border-border-subtle';
                  return (
                    <div key={t.slug} className="bg-surface-card border border-border-subtle rounded-2xl p-5 md:p-6 transition-all hover:border-news-accent/30 group flex flex-col sm:flex-row gap-5">
                      {/* Logo */}
                      {t.logo && (
                        <div className="w-16 h-16 rounded-xl bg-surface-alt border border-border-subtle flex-shrink-0 flex items-center justify-center p-2 mb-2 sm:mb-0">
                          <img src={t.logo} alt={t.name} className="max-w-full max-h-full object-contain" />
                        </div>
                      )}
                      
                      <div className="flex-grow min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="text-xl font-black text-white group-hover:text-news-accent transition-colors">{t.name}</h3>
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${pricingClass}`}>
                            {t.pricing_model}
                          </span>
                        </div>
                        <p className="text-sm text-news-muted leading-relaxed line-clamp-2 mb-4">
                          {t.short_description}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-3">
                          <button
                            onClick={() => onToolClick(t.slug)}
                            className="text-xs font-bold text-news-accent bg-news-accent/10 hover:bg-news-accent hover:text-white px-3 py-1.5 rounded transition-colors"
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
                  );
                })}
              </div>
            </section>
          </div>

        </div>

        {/* Dynamic Internal Linking Modules */}
        <div className="mt-16 space-y-8 bg-surface-alt/20 p-6 rounded-2xl border border-border-subtle">
           {comparisons.length > 0 && (
               <RelatedContent type="comparisons" title="Tool Comparisons" items={comparisons} className="mt-0 pt-0 border-none" />
           )}
           {relatedArticles.some(a => a.title.toLowerCase().includes('best') || a.title.toLowerCase().includes('top')) && (
               <RelatedContent type="rankings" title="Related Rankings" items={relatedArticles.filter(a => a.title.toLowerCase().includes('best') || a.title.toLowerCase().includes('top'))} className="mt-0 pt-0 border-none" />
           )}
           {relatedArticles.some(a => !a.title.toLowerCase().includes('best') && !a.title.toLowerCase().includes('top')) && (
               <RelatedContent type="guides" title="Related Guides" items={relatedArticles.filter(a => !a.title.toLowerCase().includes('best') && !a.title.toLowerCase().includes('top'))} className="mt-0 pt-0 border-none" />
           )}
        </div>
      </div>
    </div>
  );
};

export default StackPage;
