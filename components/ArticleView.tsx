import React, { useEffect } from 'react';
import { Article } from '../types';
import { useAudio } from '../contexts/AudioContext';
import { ArrowLeft, ExternalLink, FileText, Volume2, StopCircle, Loader2, BookOpen, Globe, BarChart3, Database, ArrowRight, Info, ZoomIn, ShieldCheck, Headphones, Pause, Play, Share2 } from 'lucide-react';
import AdUnit from './AdUnit';
import { ADS_CONFIG } from '../data/adsConfig';

interface ArticleViewProps {
  article: Article;
  onBack: () => void;
  onArticleSelect: (article: Article) => void;
  allArticles: Article[];
  onShowAbout: () => void;
}

const ArticleDataVisual = ({ article }: { article: Article }) => {
  if (!article.contextBox) return null;

  return (
    <div className="my-12 -mx-4 md:mx-0 bg-zinc-900/40 border-y md:border border-white/10 md:rounded-xl overflow-hidden relative p-6 md:p-10">
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
        <p className="text-gray-300 text-base leading-relaxed border-l-2 border-white/10 pl-4 md:pl-6">
          {article.contextBox.content}
        </p>

        {article.contextBox.source && (
          <div className="pt-4 border-t border-white/5 mt-6">
            <div className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">
              Verified Data: <span className="text-gray-400">{article.contextBox.source}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Combined Footer Component
const ArticleFooter = ({ article, onShowAbout }: { article: Article; onShowAbout: () => void }) => (
  <div className="bg-zinc-900/60 border border-white/10 rounded-lg p-5 md:p-8 my-6 md:my-10 flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center">
    {/* Brand Block */}
    <div className="flex items-center gap-4 flex-shrink-0 w-full md:w-auto">
      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-emerald-500/10 flex items-center justify-center font-serif font-bold text-emerald-500 text-base md:text-lg ring-1 ring-emerald-500/20 flex-shrink-0">
        PB
      </div>
      <div className="flex flex-col">
        <span className="font-bold text-white text-xs md:text-sm uppercase tracking-wide">Planetary Brief</span>
        <button
          onClick={onShowAbout}
          className="text-[10px] uppercase tracking-wider text-emerald-500 hover:text-white transition-colors flex items-center gap-1 mt-0.5 group"
        >
          About Verification <Info size={12} className="group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </div>

    {/* Divider */}
    <div className="hidden md:block w-px h-10 bg-white/10"></div>

    {/* Integrity Text */}
    <div className="flex flex-col gap-1.5 flex-grow">
      <div className="flex items-center gap-2 text-gray-400 font-bold uppercase tracking-wider text-[9px] md:text-[10px]">
        <ShieldCheck size={12} className="text-emerald-500" />
        <span>Editorial Integrity</span>
      </div>
      <p className="text-[11px] md:text-xs text-gray-400 leading-relaxed max-w-2xl">
        {Array.isArray(article.sources) && article.sources.length > 0 ? (
          <>
            This article uses synthesized data from verified sources including{' '}
            {article.sources.map((source, i) => (
              <span key={i}>
                {source}{i < article.sources.length - 1 ? ', ' : ''}
              </span>
            ))}.
            <span className="hidden sm:inline"> Our mission is to translate complex scientific data into actionable intelligence.</span>
          </>
        ) : (
          <>
            This article uses synthesized data from verified sources including IPCC, NOAA, and legislative filings.
            <span className="hidden sm:inline"> Our mission is to translate complex scientific data into actionable intelligence.</span>
          </>
        )}
      </p>
    </div>
  </div>
);

const ArticleView: React.FC<ArticleViewProps> = ({ article, onBack, onArticleSelect, allArticles, onShowAbout }) => {
  const { playArticle, pauseAudio, resumeAudio, isPlaying, isLoading, currentArticle } = useAudio();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [article.id]);


  useEffect(() => {
    if (article) {
      document.title = `${article.title} | GreenShift`;

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
        metaKeywords.setAttribute('content', `${cats}, ${article.topic}, environment, greenshift`);
      }
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

  return (
    <div className="bg-zinc-950 min-h-screen animate-fade-in text-white">
      <div className="fixed top-0 left-0 w-full h-1 bg-white/10 z-50">
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


          <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-white leading-[1.05] mb-6 md:mb-8">
            {article.title}
          </h1>

          {/* Compact Header Metadata */}
          <div className="flex items-center justify-between border-y border-white/10 py-4 my-6">
            <div className="flex items-center gap-4 text-xs uppercase tracking-wider font-bold text-gray-400">
              <span className="text-white">{article.date}</span>
              <span className="w-1 h-1 rounded-full bg-gray-600"></span>
              <span className="flex items-center gap-1 text-gray-400"><FileText size={12} /> {readTime}</span>
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
          <div className="relative aspect-[4/3] md:rounded-sm overflow-hidden">
            <img
              src={article.originalImageUrl || article.imageUrl}
              alt={article.title}
              className="w-full h-full object-cover"
              style={{
                imageRendering: 'high-quality',
                WebkitBackfaceVisibility: 'hidden',
                backfaceVisibility: 'hidden',
                transform: 'translateZ(0)',
                filter: 'blur(0.4px) saturate(1.05)'
              }}
            />
          </div>
          {article.imageAttribution && (
            <figcaption className="text-[10px] text-gray-500 mt-2 text-right px-4 md:px-0">
              {article.imageAttribution}
            </figcaption>
          )}
        </figure>

        <div className="prose prose-lg md:prose-xl prose-invert max-w-none md:px-8 font-sans leading-relaxed text-gray-200">
          {(() => {
            let excerptRendered = false;
            let firstParagraphRendered = false;

            // Handle both array and string content for backward compatibility
            const contentArray = Array.isArray(article.content)
              ? article.content
              : (typeof article.content === 'string' ? [article.content] : []);

            return contentArray.map((paragraph, index) => {
              const isSubheader = paragraph.length < 80 && !paragraph.endsWith('.') && !paragraph.endsWith('"') && !paragraph.startsWith('//');

              // Parse for // highlight // pattern
              const parseContent = (text: string) => {
                // Match text wrapped in // markers
                const parts = text.split(/(\/\/[\s\S]*?\/\/)/g);

                return parts.map((part, i) => {
                  // Check if this part is wrapped in // markers
                  if (part.startsWith('//') && part.endsWith('//')) {
                    // Remove the // markers and create highlighted block
                    const cleanText = part.slice(2, -2).trim();
                    if (cleanText) {
                      return (
                        <span key={i} className="block my-8 pl-4 md:pl-8 border-l-2 border-news-accent text-2xl md:text-3xl font-serif font-bold text-white italic leading-tight">
                          {cleanText}
                        </span>
                      );
                    }
                    return null;
                  }
                  // Regular text - return as is (but trim any empty strings)
                  return part || null;
                });
              };

              let emittedElement;
              if (isSubheader) {
                emittedElement = <h3 key={index} className="text-2xl md:text-3xl font-serif font-bold text-white mt-12 mb-6 border-l-4 border-news-accent pl-4">{paragraph}</h3>
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

        <div className="mt-16 mb-8">
          <AdUnit className="w-full h-32 md:h-48" format="horizontal" slotId={ADS_CONFIG.SLOTS.ARTICLE_FOOTER} />
        </div>

        {/* Combined Footer Component */}
        <ArticleFooter article={article} onShowAbout={onShowAbout} />

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
