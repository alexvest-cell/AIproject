import React from 'react';
import { Section, Article } from '../types';
import { heroContent, newsArticles } from '../data/content';
import { FileText, ArrowRight, Clock, Headphones } from 'lucide-react';
import { useAudio } from '../contexts/AudioContext';

interface HeroProps {
    onReadFeatured: () => void;
    onArticleClick: (article: Article) => void;
    featuredArticleOverride?: Article;
    sidebarArticlesOverride?: Article[]; // New prop
    articles?: Article[]; // New prop
}

const getRelativeTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

    // Future dates or invalid
    if (isNaN(diffDays)) return dateString;

    // Check if it's actually today
    if (diffHours < 24 && now.getDate() === date.getDate()) {
        return "Today";
    }

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
};

const Hero: React.FC<HeroProps> = ({ onReadFeatured, onArticleClick, featuredArticleOverride, articles = [], ...props }) => {
    const { playArticle, isLoading, currentArticle } = useAudio();

    // Priority: Override (from DB) > Static heroContent
    const displayHeadline = featuredArticleOverride?.title || heroContent.headline;
    const displaySubheadline = featuredArticleOverride?.excerpt || heroContent.subheadline;
    const displayDate = featuredArticleOverride?.date || heroContent.date;
    const displayImageUrl = featuredArticleOverride?.imageUrl || heroContent.imageUrl;
    const displaySource = featuredArticleOverride?.source || heroContent.source;

    // Helper to robustly parse dates (handling "okt" etc)
    const getSortableDate = (item: Article) => {
        if (item.date) {
            // Normalize common non-English month text if encountered
            const normalized = item.date
                .replace(/okt/i, 'Oct')
                .replace(/mai/i, 'May')
                .replace(/maj/i, 'May')
                .replace(/des/i, 'Dec');

            const ts = new Date(normalized).getTime();
            if (!isNaN(ts)) return ts;
        }
        // Fallback to system creation time
        return new Date(item.createdAt || 0).getTime();
    };

    // Sort articles by newness (Upload Date preferred for "Latest Articles" feed)
    const sortedArticles = [...(articles.length > 0 ? articles : newsArticles)].sort((a, b) => {
        // Priority: CreatedAt (when it was added) > Date (editorial date)
        const timeA = new Date(a.createdAt || a.date).getTime();
        const timeB = new Date(b.createdAt || b.date).getTime();
        return timeB - timeA; // Descending (Newest Upload First)
    });

    // Get 4 recent stories for the sidebar (use override or fallback)
    const latestArticles = props.sidebarArticlesOverride || sortedArticles
        .filter(a => a.id !== featuredArticleOverride?.id)
        .slice(0, 4);

    return (
        <section id={Section.HERO} className="relative w-full bg-black text-white pt-36 md:pt-40 pb-12 md:pb-2">
            <div className="container mx-auto px-4 md:px-8">

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">

                    {/* Column 1: Main Story Text (4 cols) */}
                    <div className="lg:col-span-4 flex flex-col justify-center order-2 lg:order-1">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="w-2 h-2 rounded-full bg-news-live animate-pulse"></span>
                            <span className="text-xs font-bold uppercase tracking-widest text-news-accent">Featured</span>
                        </div>

                        <h1 className="text-3xl md:text-4xl xl:text-5xl font-serif font-bold leading-tight mb-6 text-white hover:text-gray-200 cursor-pointer transition-colors" onClick={onReadFeatured}>
                            {displayHeadline}
                        </h1>

                        <p className="text-base md:text-lg text-gray-400 leading-relaxed mb-6">
                            {displaySubheadline}
                        </p>

                        <div className="mt-auto flex flex-col gap-4">
                            <div className="flex items-center gap-4 text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-500">
                                <span>{displayDate}</span>
                                <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                                <span className="text-news-accent">
                                    {featuredArticleOverride ? (() => {
                                        const displayCategory = (cat: string) => cat === 'Action' || cat === 'Act' ? 'Guides' : cat;
                                        const categories = Array.isArray(featuredArticleOverride.category)
                                            ? featuredArticleOverride.category
                                            : [featuredArticleOverride.category];
                                        return categories.map(displayCategory).join(' • ');
                                    })() : displaySource}
                                </span>
                            </div>

                            {/* Play button for featured article (if it's a real article) */}
                            {/* Play button moved to image overlay */}
                        </div>
                    </div>

                    {/* Column 2: Main Story Image (5 cols) */}
                    <div className="lg:col-span-5 order-1 lg:order-2">
                        <div
                            className="relative w-full aspect-[4/3] md:aspect-[4/3] lg:aspect-[4/3] bg-zinc-900 overflow-hidden cursor-pointer group"
                            onClick={onReadFeatured}
                        >
                            <img
                                src={displayImageUrl}
                                alt={displayHeadline}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                            {/* Listen Button - Top Right Overlay */}
                            {featuredArticleOverride && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        playArticle(featuredArticleOverride);
                                    }}
                                    disabled={isLoading && currentArticle?.id === featuredArticleOverride.id}
                                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 backdrop-blur border border-white/20 flex items-center justify-center hover:bg-emerald-500 hover:text-black hover:border-emerald-500 transition-all text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg z-20 group/btn"
                                    title="Listen to story"
                                >
                                    {isLoading && currentArticle?.id === featuredArticleOverride.id ? (
                                        <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <Headphones size={16} />
                                    )}
                                </button>
                            )}
                        </div>

                    </div>

                    {/* Column 3: Latest Articles Sidebar (3 cols) */}
                    <div className="lg:col-span-3 flex flex-col order-3 border-t lg:border-t-0 lg:border-l border-white/10 pt-6 lg:pt-0 lg:pl-8">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-news-accent text-xs font-bold uppercase tracking-widest">Latest Articles</span>
                            <ArrowRight size={12} className="text-news-accent -rotate-45" />
                        </div>

                        <div className="flex flex-col gap-4 divide-y divide-white/10">
                            {latestArticles.map((news) => (
                                <div key={news.id} className="pt-4 first:pt-0 group cursor-pointer" onClick={() => onArticleClick(news)}>
                                    <h3 className="text-sm font-serif font-bold text-white leading-tight mb-3 group-hover:text-news-accent transition-colors">
                                        {news.title}
                                    </h3>
                                    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                        <span className="text-news-accent/80">{news.topic || news.category[0]}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1"><Clock size={10} /> {news.date || getRelativeTime(news.createdAt)}</span>
                                    </div>
                                    {/* Intentionally NO audio button here per user request */}
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default Hero;