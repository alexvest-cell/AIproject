import React, { useEffect } from 'react';
import { generateArticleSchema, generateFAQSchema, injectSchema } from '../utils/schema';
import { Article } from '../types';
import { useAudio } from '../contexts/AudioContext';
import { ArrowLeft, Loader2, BookOpen, Volume2, StopCircle } from 'lucide-react';

import { RankingLayout, ReviewLayout, ComparisonLayout, StandardLayout } from './article-layouts/Layouts';
import { ArticleSidebar, InlineToolCard } from './article-layouts/SharedModules';

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
    <div className="my-12 -mx-4 md:mx-0 bg-surface-card border-y md:border border-border-subtle shadow-elevation md:rounded-2xl overflow-hidden relative p-6 md:p-10">
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
        <h3 className="text-xl md:text-2xl font-serif font-bold text-white leading-tight mb-4">{article.contextBox.title}</h3>
        <p className="text-news-text text-base leading-relaxed border-l-2 border-border-divider pl-4 md:pl-6">{article.contextBox.content}</p>
        {article.contextBox.source && (
          <div className="pt-4 border-t border-border-divider mt-6">
            <div className="text-[9px] text-news-muted uppercase tracking-widest font-bold">Verified Data: <span className="text-news-text">{article.contextBox.source}</span></div>
          </div>
        )}
      </div>
    </div>
  );
};

const ArticleView: React.FC<ArticleViewProps> = ({ article, onBack, onArticleSelect, allArticles, onShowAbout }) => {
  const { playArticle, pauseAudio, resumeAudio, isPlaying, isLoading, currentArticle } = useAudio();

  useEffect(() => {
    // Scroll intentionally removed so browser can manage scroll state
  }, [article.id]);

  useEffect(() => {
    if (article) {
      document.title = `${article.title} | ToolCurrent`;

      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', article.seoDescription || article.excerpt || article.title);

      const articleSchema = generateArticleSchema(article);
      const cleanups = [injectSchema('article-schema', articleSchema)];

      if (article.faq && article.faq.length > 0) {
        const faqSchema = generateFAQSchema(article.faq);
        cleanups.push(injectSchema('faq-schema', faqSchema));
      }

      return () => cleanups.forEach(cleanup => cleanup());
    }
  }, [article]);

  const isThisArticlePlaying = currentArticle?.id === article.id && isPlaying;
  const isThisArticleLoading = currentArticle?.id === article.id && isLoading;

  const handleToggleAudio = () => {
    if (isThisArticlePlaying) pauseAudio();
    else if (currentArticle?.id === article.id && !isPlaying) resumeAudio();
    else playArticle(article);
  };

  const parsedContent = (() => {
    let firstParagraphRendered = false;
    const contentArray = Array.isArray(article.content) ? article.content : (typeof article.content === 'string' ? [article.content] : []);

    return contentArray.map((paragraph, index) => {
      const isSubheader = paragraph.length < 80 && !paragraph.endsWith('.') && !paragraph.endsWith('"') && !paragraph.startsWith('//') && !paragraph.startsWith('[[tool:');

      const parseInline = (text: string) => {
        const parts = text.split(/(\/\/[\s\S]*?\/\/|\[\[tool:[\s\S]*?\]\])/g);
        return parts.map((part, i) => {
          if (part.startsWith('//') && part.endsWith('//')) {
            const cleanText = part.slice(2, -2).trim();
            if (cleanText) return <span key={i} className="block my-8 pl-4 md:pl-8 border-l-2 border-news-accent text-xl md:text-2xl font-serif font-bold text-news-muted italic leading-relaxed">{cleanText}</span>;
            return null;
          }
          if (part.startsWith('[[tool:') && part.endsWith(']]')) {
            const slug = part.slice(7, -2).trim();
            if (slug) return <InlineToolCard key={i} slug={slug} />;
            return null;
          }
          return part || null;
        });
      };

      let emittedElement;
      if (isSubheader) {
        emittedElement = <h3 key={index} className="text-2xl md:text-3xl font-serif font-bold text-white mt-12 mb-6 border-l-4 border-news-accent pl-4">{paragraph}</h3>;
      } else {
        const isFirst = !firstParagraphRendered;
        if (isFirst) firstParagraphRendered = true;
        emittedElement = <p key={index} className="mb-8 font-sans text-news-text text-lg leading-relaxed">{parseInline(paragraph)}</p>;
      }

      return (
        <React.Fragment key={index}>
          {emittedElement}
          {index === 1 && <ArticleDataVisual article={article} />}
        </React.Fragment>
      );
    });
  })();

  const articleType = (article as any).article_type || 'news';

  const renderLayout = () => {
    const props = { article, parsedContent, onArticleSelect, allArticles };
    switch (articleType) {
      case 'ranking':
      case 'best-of': return <RankingLayout {...props} />;
      case 'review': return <ReviewLayout {...props} />;
      case 'comparison': return <ComparisonLayout {...props} />;
      case 'guide':
      case 'use-case':
      case 'news':
      default: return <StandardLayout {...props} />;
    }
  };

  return (
    <div className="bg-surface-base min-h-screen text-white pt-[144px] pb-12 animate-fade-in selection:bg-news-accent/30 selection:text-white">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl">

        {/* Global Structure: Content [max-w-820px] + Sidebar [w-280px] */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,820px)_280px] gap-12 lg:gap-16 items-start">
          {/* Main Content Area */}
          <main className="w-full">
            {renderLayout()}
          </main>

          {/* Global Sidebar System */}
          <aside className="w-full lg:sticky lg:top-32 mt-12 lg:mt-0 lg:block flex flex-col order-last">
            <ArticleSidebar article={article} allArticles={allArticles} type={articleType} />
          </aside>
        </div>
      </div>
    </div>
  );
}

export default ArticleView;
