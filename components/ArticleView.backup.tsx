import React, { useEffect } from 'react';
import { generateArticleSchema, generateFAQSchema, injectSchema } from '../utils/schema';
import { Article } from '../types';
import { useAudio } from '../contexts/AudioContext';
import { ArrowLeft, ExternalLink, FileText, Volume2, StopCircle, Loader2, BookOpen, Globe, BarChart3, Database, ArrowRight, Info, ZoomIn, ShieldCheck, Headphones, Pause, Play, Share2, Check, X } from 'lucide-react';
import AdUnit from './AdUnit';
import ToolCard from './ToolCard';
import { ADS_CONFIG } from '../data/adsConfig';
import * as toolsService from '../services/toolsService';
import { Tool } from '../types';

interface ArticleViewProps {
  article: Article;
  onBack: () => void;
  onArticleSelect: (article: Article) => void;
  allArticles: Article[];
  onShowAbout: () => void;
}

const InlineToolCard: React.FC<{ slug: string }> = ({ slug }) => {
  const [tool, setTool] = React.useState<Tool | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    toolsService.fetchToolBySlug(slug)
      .then(data => setTool(data.tool))
      .catch(() => setTool(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="my-8 w-full max-w-sm h-32 bg-surface-alt animate-pulse rounded-xl border border-border-subtle flex items-center justify-center">
      <Loader2 size={20} className="text-news-muted animate-spin" />
    </div>
  );
  if (!tool) return null;

  return (
    <div className="my-10 w-full max-w-2xl mx-auto shadow-elevation rounded-2xl overflow-hidden">
      <ToolCard tool={tool} />
    </div>
  );
};

const ArticleDataVisual = ({ article }: { article: Article }) => {
  if (!article.contextBox) return null;

  return (
    <div className="my-12 -mx-4 md:mx-0 bg-surface-card border-y md:border border-border-subtle shadow-elevation md:rounded-2xl overflow-hidden relative p-6 md:p-10">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
        backgroundSize: '24px 24px'
      }}>
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 text-news-accent font-bold uppercase tracking-widest text-[10px] mb-4">
          <BookOpen size={14} className="animate-pulse" />
          <span>Deep Dive Context</span>
        </div>

        <h3 className="text-xl md:text-2xl font-serif font-bold text-white leading-tight mb-4">
          {article.contextBox.title}
        </h3>
        <p className="text-news-text text-base leading-relaxed border-l-2 border-border-divider pl-4 md:pl-6">
          {article.contextBox.content}
        </p>

        {article.contextBox.source && (
          <div className="pt-4 border-t border-border-divider mt-6">
            <div className="text-[9px] text-news-muted uppercase tracking-widest font-bold">
              Verified Data: <span className="text-news-text">{article.contextBox.source}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


const ProsConsSection = ({ article }: { article: Article }) => {
  if (!article.pros?.length && !article.cons?.length) return null;

  return (
    <div className="my-12 grid grid-cols-1 md:grid-cols-2 gap-6">
      {article.pros && article.pros.length > 0 && (
        <div className="bg-surface-card border border-border-subtle shadow-sm rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-news-accent"></div>
          <h3 className="text-news-accent font-bold text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
            <Check size={16} /> Key Advantages
          </h3>
          <ul className="space-y-3">
            {article.pros.map((p, i) => (
              <li key={i} className="text-news-text text-sm flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-news-accent mt-1.5 flex-shrink-0" />
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}
      {article.cons && article.cons.length > 0 && (
        <div className="bg-surface-card border border-border-subtle shadow-sm rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
          <h3 className="text-red-400 font-bold text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
            <X size={16} /> Potential Drawbacks
          </h3>
          <ul className="space-y-3">
            {article.cons.map((c, i) => (
              <li key={i} className="text-news-text text-sm flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const QuickComparisonTable = ({ toolSlugs }: { toolSlugs: string[] }) => {
  const [tools, setTools] = React.useState<Tool[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!toolSlugs?.length) return;
    Promise.all(toolSlugs.map(slug => toolsService.fetchToolBySlug(slug)))
      .then(results => setTools(results.map(r => r.tool).filter(Boolean)))
      .finally(() => setLoading(false));
  }, [toolSlugs]);

  if (loading || tools.length < 2) return null;

  return (
    <div className="my-16 overflow-x-auto -mx-4 md:mx-0 shadow-elevation rounded-xl">
      <div className="min-w-[600px] border border-border-subtle rounded-xl overflow-hidden bg-surface-card">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border-divider bg-surface-base/50">
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-news-muted">Feature</th>
              {tools.map(t => (
                <th key={t.id} className="p-4 text-sm font-bold text-white text-center">
                  <div className="flex flex-col items-center gap-2">
                    {t.logo && <img src={t.logo} className="w-8 h-8 object-contain" alt="" />}
                    {t.name}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-xs text-news-text">
            <tr className="border-b border-border-divider hover:bg-surface-hover/50 transition-colors">
              <td className="p-4 font-bold text-news-muted">Pricing</td>
              {tools.map(t => <td key={t.id} className="p-4 text-center">{t.pricing_model}</td>)}
            </tr>
            <tr className="border-b border-border-divider hover:bg-surface-hover/50 transition-colors">
              <td className="p-4 font-bold text-news-muted">Score</td>
              {tools.map(t => <td key={t.id} className="p-4 text-center font-bold text-news-accent">{t.rating_score}/10</td>)}
            </tr>
            <tr className="hover:bg-surface-hover/50 transition-colors">
              <td className="p-4 font-bold text-news-muted">AI Enabled</td>
              {tools.map(t => <td key={t.id} className="p-4 text-center text-white">{t.ai_enabled ? '✓' : '×'}</td>)}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

const VerdictBox = ({ article }: { article: Article }) => {
  if (!article.verdict) return null;

  return (
    <div className="my-10 bg-surface-card border border-border-subtle shadow-elevation rounded-2xl p-6 md:p-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-news-accent"></div>
      <div className="flex items-center gap-2 text-news-accent font-bold uppercase tracking-widest text-[10px] mb-4">
        <ShieldCheck size={14} />
        <span>The StackBrief Verdict</span>
      </div>
      <p className="text-white text-lg md:text-xl font-serif italic leading-relaxed">
        "{article.verdict}"
      </p>
    </div>
  );
};

const JumpNav = ({ subheaders }: { subheaders: string[] }) => {
  if (subheaders.length === 0) return null;

  return (
    <div className="hidden lg:block fixed left-12 top-1/2 -translate-y-1/2 w-64 space-y-4 border-l border-white/5 pl-6 py-4">
      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4">Contents</div>
      <nav className="flex flex-col gap-3">
        {subheaders.map((h, i) => (
          <a
            key={i}
            href={`#section-${i}`}
            className="text-xs text-gray-400 hover:text-news-accent transition-colors truncate block"
          >
            {h}
          </a>
        ))}
      </nav>
    </div>
  );
};

const ArticleView: React.FC<ArticleViewProps> = ({ article, onBack, onArticleSelect, allArticles, onShowAbout }) => {
  const { playArticle, pauseAudio, resumeAudio, isPlaying, isLoading, currentArticle } = useAudio();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [article.id]);


  useEffect(() => {
    if (article) {
      document.title = `${article.title} | The Stack Brief`;

      // Update Meta Description
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', article.seoDescription || article.excerpt || article.title);

      // Update Keywords
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      if (article.keywords && article.keywords.length > 0) {
        metaKeywords.setAttribute('content', article.keywords.join(', '));
      } else {
        // Fallback to category/topic
        const cats = Array.isArray(article.category) ? article.category.join(', ') : article.category;
        metaKeywords.setAttribute('content', `${cats}, ${article.topic}, software, ai, stackbrief`);
      }

      // 1. Inject NewsArticle & Article Schema
      const articleSchema = generateArticleSchema(article);
      const cleanups = [
        injectSchema('article-schema', articleSchema)
      ];

      // 2. Inject BreadcrumbList Schema
      const catSlug = Array.isArray(article.category)
        ? article.category[0].toLowerCase().replace(/\s+/g, '-')
        : article.category.toLowerCase().replace(/\s+/g, '-');

      const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://stackbrief.com'
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: Array.isArray(article.category) ? article.category[0] : article.category,
            item: `https://stackbrief.com/category/${catSlug}`
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: article.title,
            item: `https://stackbrief.com/article/${article.slug || article.id}`
          }
        ]
      };
      cleanups.push(injectSchema('breadcrumb-schema', breadcrumbSchema));

      // 3. Inject FAQ Schema if present
      if (article.faq && article.faq.length > 0) {
        const faqSchema = generateFAQSchema(article.faq);
        cleanups.push(injectSchema('faq-schema', faqSchema));
      }

      return () => {
        cleanups.forEach(cleanup => cleanup());
      };
    }
  }, [article]);



  const isThisArticlePlaying = currentArticle?.id === article.id && isPlaying;
  const isThisArticleLoading = currentArticle?.id === article.id && isLoading;

  const handleToggleAudio = () => {
    if (isThisArticlePlaying) {
      pauseAudio();
    } else if (currentArticle?.id === article.id && !isPlaying) {
      resumeAudio();
    } else {
      playArticle(article);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: article.title,
      text: article.excerpt || article.seoDescription || article.title,
      url: window.location.href
    };

    // Try Web Share API first (mobile/modern browsers)
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or error - silent fail
        console.log('Share cancelled or failed:', err);
      }
    } else {
      // Fallback: Copy URL to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Article link copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy:', err);
        alert('Unable to share. Please copy the URL from your browser.');
      }
    }
  };

  // independent of the generated content length.
  const readTime = article.originalReadTime || "5 min read";

  // Increased slice to 4 to balance the 2-col grid on mobile (2x2) and 4-col on desktop
  const relatedArticles = allArticles
    .filter(a => {
      if (a.id === article.id) return false;

      const currentCats = Array.isArray(article.category) ? article.category : [article.category];
      const targetCats = Array.isArray(a.category) ? a.category : (typeof a.category === 'string' ? [a.category] : []);

      return currentCats.some(cat => targetCats.includes(cat));
    })
    .slice(0, 4);

  const subheaders = (Array.isArray(article.content) ? article.content : [])
    .filter(p => p.length < 80 && !p.endsWith('.') && !p.endsWith('"') && !p.startsWith('//') && !p.startsWith('[[tool:'));

  return (
    <div className="bg-surface-base min-h-screen animate-fade-in text-white selection:bg-news-accent/30 selection:text-white">
      <JumpNav subheaders={subheaders} />
      <div className="fixed top-0 left-0 w-full h-1 bg-border-divider z-50">
        <div className="h-full bg-news-accent w-full animate-[width_1s_ease-out]"></div>
      </div>

      <div className="container mx-auto px-4 md:px-12 pt-44 md:pt-32 pb-12 md:pb-24 max-w-4xl">


        <header className="mb-8 md:mb-10 text-left">
          <div className="text-news-accent font-bold uppercase tracking-widest text-xs mb-3">
            {(() => {
              const displayCategory = (cat: string) => cat === 'Action' || cat === 'Act' ? 'Guides' : cat;
              const categories = Array.isArray(article.category) ? article.category : [article.category];
              return categories.map(displayCategory).join(', ');
            })()}
          </div>


          <h1 className="text-3xl md:text-5xl lg:text-5xl font-serif font-bold text-white leading-[1.1] mb-6 md:mb-8">
            {article.title}
          </h1>

          {/* Compact Header Metadata */}
          <div className="flex items-center justify-between border-y border-border-divider py-4 my-6">
            <div className="flex items-center gap-4 text-xs uppercase tracking-wider font-bold text-news-muted">
              <span className="text-white">{article.date}</span>
              <span className="w-1 h-1 rounded-full bg-border-divider"></span>
              <span className="flex items-center gap-1 text-news-muted"><FileText size={12} /> {readTime}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleAudio}
                disabled={isThisArticleLoading}
                className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 group relative
                      ${isThisArticlePlaying
                    ? 'border-news-live text-news-live bg-news-live/10'
                    : 'border-white/10 hover:border-news-accent text-white hover:text-news-accent'
                  }`}
                title="Listen to Article"
              >
                {isThisArticleLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : isThisArticlePlaying ? (
                  <>
                    <Pause size={16} className="fill-current" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-news-live rounded-full animate-pulse"></span>
                  </>
                ) : (
                  <Play size={16} />
                )}
              </button>

              <button
                onClick={handleShare}
                className="w-10 h-10 rounded-full border border-white/10 hover:border-news-accent text-white hover:text-news-accent flex items-center justify-center transition-all duration-300 group"
                title="Share Article"
              >
                <Share2 size={16} className="group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        </header>

        <figure className="mb-12 md:mb-16 -mx-4 md:-mx-12 lg:mx-0">
          <div className="relative w-full aspect-video md:aspect-[21/9] max-h-[400px] md:rounded-xl overflow-hidden shadow-elevation border border-border-subtle bg-surface-card">
            <img
              src={article.originalImageUrl || article.imageUrl}
              alt={article.title}
              className="w-full h-full object-cover"
              loading="lazy"
              style={{
                imageRendering: 'high-quality',
                WebkitBackfaceVisibility: 'hidden',
                backfaceVisibility: 'hidden',
                transform: 'translateZ(0)',
                filter: 'saturate(1.05)'
              }}
            />
          </div>
          {article.imageAttribution && (
            <figcaption className="text-[10px] text-news-muted mt-3 text-right px-4 md:px-0">
              {article.imageAttribution}
            </figcaption>
          )}
        </figure>

        <div className="md:px-8 mb-10">
          <VerdictBox article={article} />
        </div>

        <div className="prose prose-lg md:prose-xl prose-invert max-w-none md:px-8 font-sans leading-relaxed text-news-text">
          <ProsConsSection article={article} />

          {article.comparison_tools && article.comparison_tools.length > 0 && (
            <QuickComparisonTable toolSlugs={article.comparison_tools} />
          )}

          {(() => {
            let excerptRendered = false;
            let firstParagraphRendered = false;

            // Handle both array and string content for backward compatibility
            const contentArray = Array.isArray(article.content)
              ? article.content
              : (typeof article.content === 'string' ? [article.content] : []);

            return contentArray.map((paragraph, index) => {
              const isSubheader = paragraph.length < 80 && !paragraph.endsWith('.') && !paragraph.endsWith('"') && !paragraph.startsWith('//') && !paragraph.startsWith('[[tool:');

              // Parse for // highlight // and [[tool:slug]] patterns
              const parseContent = (text: string) => {
                // Match text wrapped in // markers OR [[tool:slug]] markers
                const parts = text.split(/(\/\/[\s\S]*?\/\/|\[\[tool:[\s\S]*?\]\])/g);

                return parts.map((part, i) => {
                  // Check if this part is wrapped in // markers
                  if (part.startsWith('//') && part.endsWith('//')) {
                    const cleanText = part.slice(2, -2).trim();
                    if (cleanText) {
                      return (
                        <span key={i} className="block my-8 pl-4 md:pl-8 border-l-2 border-news-accent text-xl md:text-2xl font-serif font-bold text-news-muted italic leading-relaxed">
                          {cleanText}
                        </span>
                      );
                    }
                    return null;
                  }

                  // Check if this part is a tool reference [[tool:slug]]
                  if (part.startsWith('[[tool:') && part.endsWith(']]')) {
                    const slug = part.slice(7, -2).trim();
                    if (slug) {
                      return <InlineToolCard key={i} slug={slug} />;
                    }
                    return null;
                  }

                  // Regular text - return as is (but trim any empty strings)
                  return part || null;
                });
              };

              let emittedElement;
              if (isSubheader) {
                const subheaderIndex = subheaders.indexOf(paragraph);
                emittedElement = (
                  <h3
                    key={index}
                    id={`section-${subheaderIndex}`}
                    className="text-2xl md:text-3xl font-serif font-bold text-white mt-12 mb-6 border-l-4 border-news-accent pl-4 scroll-mt-32"
                  >
                    {paragraph}
                  </h3>
                );
              } else {
                if (paragraph === article.excerpt) {
                  // Optional: still skip if exactly matches excerpt to avoid duplication if old data persists
                  // But new logic relies on // // tags.
                  // return null; 
                }

                const isFirst = !firstParagraphRendered;
                if (isFirst) firstParagraphRendered = true;

                emittedElement = (
                  <p key={index} className={`mb-8 ${isFirst ? 'first-letter:text-6xl first-letter:font-serif first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-[-8px] first-letter:text-white' : ''}`}>
                    {parseContent(paragraph)}
                  </p>
                );
              }

              return (
                <React.Fragment key={index}>
                  {emittedElement}

                  {index === 1 && (
                    <ArticleDataVisual article={article} />
                  )}

                  {index === 4 && (
                    <AdUnit className="w-full h-64 my-12" format="rectangle" slotId={ADS_CONFIG.SLOTS.ARTICLE_IN_CONTENT} />
                  )}
                </React.Fragment>
              );
            });
          })()}
        </div>

        {article.secondaryImageUrl && (
          <div className="my-12 md:my-16">
            <figure className="-mx-4 md:-mx-12 lg:mx-0">
              <div className="relative aspect-video md:rounded-xl overflow-hidden shadow-2xl border border-white/5">
                <img
                  src={article.secondaryImageUrl}
                  alt={article.title + " illustrative visual"}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              {article.topic && (
                <figcaption className="mt-4 text-center text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                  Intelligence Insight: {article.topic}
                </figcaption>
              )}
            </figure>
          </div>
        )}

        <div className="mt-16 mb-8">
          <AdUnit className="w-full h-32 md:h-48" format="horizontal" slotId={ADS_CONFIG.SLOTS.ARTICLE_FOOTER} />
        </div>

        {article.faq && article.faq.length > 0 && (
          <div className="mt-16 pt-12 border-t border-white/10">
            <h3 className="text-2xl md:text-3xl font-serif font-bold text-white mb-8">Frequently Asked Questions</h3>
            <div className="space-y-6">
              {article.faq.map((item, i) => (
                <div key={i} className="bg-white/5 border border-white/5 rounded-xl p-6 hover:border-white/20 transition-colors">
                  <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-news-accent/20 text-news-accent flex items-center justify-center text-xs">?</span>
                    {item.question}
                  </h4>
                  <p className="text-gray-400 text-sm leading-relaxed pl-9">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}


        {relatedArticles.length > 0 && (
          <div className="mt-12 mb-12 pt-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl md:text-2xl font-serif font-bold text-white">Related Intelligence</h3>
              <div className="h-px flex-grow bg-white/10 ml-8 hidden md:block"></div>
            </div>

            {/* Responsive Grid: 2 Cols on Mobile, 4 Cols on Desktop */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedArticles.map((related) => (
                <div
                  key={related.id}
                  onClick={() => onArticleSelect(related)}
                  className="group cursor-pointer flex flex-col h-full bg-white/5 border border-white/5 rounded-lg overflow-hidden hover:border-white/20 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="aspect-video w-full overflow-hidden">
                    <img
                      src={related.originalImageUrl || related.imageUrl}
                      alt={related.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4 md:p-5 flex flex-col flex-grow">
                    <span className="text-[9px] md:text-[10px] text-news-accent font-bold uppercase tracking-widest mb-2 truncate">
                      {Array.isArray(related.category) ? related.category.join(', ') : related.category}
                    </span>
                    <h4 className="text-sm md:text-base font-serif font-bold text-white leading-tight mb-3 group-hover:text-news-accent transition-colors line-clamp-3">
                      {related.title}
                    </h4>
                    <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[9px] md:text-[10px] text-gray-500 uppercase font-bold">{related.date.split(',')[0]}</span>
                      <span className="hidden md:flex items-center gap-1 text-[10px] text-white font-bold uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                        Read <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}



      </div>
    </div>
  );
};

export default ArticleView;
