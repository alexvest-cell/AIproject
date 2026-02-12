import React from 'react';
import { Article } from '../types';
import { newsArticles } from '../data/content';
import { CATEGORIES, mapTopicToCategory } from '../data/categories';
import { Filter, ArrowRight, Headphones } from 'lucide-react';
import AdUnit from './AdUnit';
import { ADS_CONFIG } from '../data/adsConfig';
import { useAudio } from '../contexts/AudioContext';

interface CategoryFeedProps {
    category: string;
    articles: Article[];
    onArticleClick: (article: Article) => void;
    onBack: () => void;
}

const CategoryFeed: React.FC<CategoryFeedProps> = ({ category, articles, onArticleClick }) => {
    const { playArticle, isLoading, currentArticle } = useAudio();

    // Ensure we have articles, fallback to empty array if undefined
    const sourceArticles = articles || [];

    // SEO Optimization
    React.useEffect(() => {
        document.title = `${category} | Planetary Brief Intelligence`;

        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.setAttribute('name', 'description');
            document.head.appendChild(metaDesc);
        }
        const catData = CATEGORIES.find(c => c.id === category);
        metaDesc.setAttribute('content', catData?.description || `Latest environmental intelligence on ${category}.`);

    }, [category]);

    const filteredArticles = sourceArticles.filter(article => {
        const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
        const target = normalize(category);

        if (Array.isArray(article.category)) {
            return article.category.some(cat => normalize(cat) === target);
        } else if (typeof article.category === 'string') {
            return normalize(article.category) === target;
        }

        // Legacy/Topic fallback
        if (article.topic === category) return true;
        return false;
    });

    const catData = CATEGORIES.find(c => c.id === category);
    const description = catData?.description || "Latest intelligence, verified data, and policy updates.";
    // Featured Logic:
    // When multiple articles are marked as featured, show the one with the newest display date.
    // 1. Get all articles marked 'isFeaturedCategory'
    const featuredCandidates = filteredArticles.filter(a => a.isFeaturedCategory);

    // 2. Sort them by display 'date' (newest display date first) or fallback to 'createdAt'
    featuredCandidates.sort((a, b) => {
        return new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime();
    });

    // 3. Pick the winner, or fallback to the first article in the date-sorted feed
    const heroArticle = featuredCandidates[0] || filteredArticles[0];

    // Priority: Hero Image > Category Image > Default Placeholder
    const headerImage = heroArticle?.imageUrl || catData?.imageUrl || "https://placehold.co/1200x800?text=Default+Category";

    // Remove hero from grid
    let gridArticles = filteredArticles.filter(a => a.id !== heroArticle?.id);

    return (
        <div className="min-h-screen bg-black pt-36 md:pt-28 pb-20">
            <div className="container mx-auto px-4 md:px-8">

                {/* Unified Hero Section: Shared Background for Explainer and Hero Article */}
                <div className="relative w-full rounded-2xl overflow-hidden mb-8 min-h-[400px] flex items-center group/hero">

                    {/* Shared Background Image */}
                    <div className="absolute inset-0 z-0">
                        <img
                            src={headerImage}
                            alt={category}
                            className="w-full h-full object-cover opacity-50 blur-[2px] scale-105 transition-transform duration-[20s] ease-in-out group-hover/hero:scale-110"
                        />
                        {/* Gradient Overlay for text readability */}
                        <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-black via-black/70 to-black/40"></div>
                        <div className="absolute inset-0 bg-black/20"></div>
                    </div>

                    {/* Content Container (Grid) */}
                    <div className="relative z-10 w-full p-6 md:p-8 lg:p-12 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">

                        {/* Left: Explainer Text */}
                        <div className="flex flex-col justify-center">
                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-4 leading-[0.9] tracking-tight drop-shadow-2xl">
                                {category}
                            </h1>
                            <div className="h-1 w-16 bg-news-accent mb-4 shadow-[0_0_15px_#10b981]"></div>
                            <p className="text-gray-200 text-base md:text-lg font-light leading-relaxed max-w-xl drop-shadow-lg">
                                {description}
                            </p>
                        </div>

                        {/* Right: Hero Article Card */}
                        {heroArticle ? (
                            <div
                                onClick={() => onArticleClick(heroArticle)}
                                className="group relative aspect-[4/5] md:aspect-video lg:aspect-[2/1] w-full rounded-xl overflow-hidden cursor-pointer transition-all duration-300"
                            >
                                <img
                                    src={heroArticle.imageUrl}
                                    alt={heroArticle.title}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90"></div>

                                <div className="absolute bottom-0 left-0 w-full p-6 z-10">
                                    <span className="text-news-accent text-[8px] font-bold uppercase tracking-widest mb-2 block bg-black/50 backdrop-blur w-fit px-1.5 py-0.5 rounded">
                                        Featured
                                    </span>
                                    <h2 className="text-lg md:text-2xl font-serif font-bold text-white leading-tight mb-2 group-hover:underline decoration-2 decoration-news-accent underline-offset-4 shadow-black drop-shadow-lg">
                                        {heroArticle.title}
                                    </h2>
                                    <p className="text-gray-300 line-clamp-2 text-xs md:text-sm mb-4 drop-shadow-md font-medium">
                                        {heroArticle.excerpt}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white">
                                            <span>Read Full Story</span> <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                    {/* Listen Button - Top Right Overlay */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            playArticle(heroArticle);
                                        }}
                                        disabled={isLoading && currentArticle?.id === heroArticle.id}
                                        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 backdrop-blur border border-white/20 flex items-center justify-center hover:bg-emerald-500 hover:text-black hover:border-emerald-500 transition-all text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg z-20"
                                        title="Listen to story"
                                    >
                                        {isLoading && currentArticle?.id === heroArticle.id ? (
                                            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <Headphones size={16} />
                                        )}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // Fallback placeholder
                            <div className="flex flex-col items-center justify-center rounded-xl bg-white/5 p-8 text-center aspect-[4/3] backdrop-blur-sm">
                                <Filter size={32} className="text-gray-400 mb-4" />
                                <p className="text-gray-300 font-serif text-lg">Curating Intelligence...</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Remaining Articles Grid */}
                {gridArticles.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        {gridArticles.map((article, index) => {
                            // Index 0 in this list is the 2nd article overall. 

                            let gridClass = "col-span-1";
                            let titleSize = "text-sm md:text-base";
                            let imageHeight = "aspect-[3/2]";
                            let excerptClass = "line-clamp-2";

                            if (index === 0) {
                                // The first article of the remaining grid gets the "Featured" Bento treatment
                                gridClass = "col-span-2 md:col-span-2";
                                titleSize = "text-xl md:text-2xl";
                                imageHeight = "aspect-video md:aspect-[2/1]";
                                excerptClass = "line-clamp-3";
                            } else if (index === 1 || index === 2) {
                                // Medium cards
                                gridClass = "col-span-2 md:col-span-1";
                                titleSize = "text-lg md:text-xl";
                                imageHeight = "aspect-video md:aspect-[3/2]";
                                excerptClass = "line-clamp-3";
                            } else {
                                // Standard compact cards
                                gridClass = "col-span-1";
                                titleSize = "text-sm md:text-base";
                                imageHeight = "aspect-[3/2]";
                                excerptClass = "line-clamp-3";
                            }

                            return (
                                <React.Fragment key={article.id}>
                                    {/* Insert Ad after the 4th item (index 4) as a Grid Card */}
                                    {index === 4 && (
                                        <div className="col-span-1 bg-zinc-900/50 border border-white/5 rounded-sm overflow-hidden flex flex-col h-full min-h-[250px]">
                                            <div className="flex-grow">
                                                <AdUnit format="rectangle" className="w-full h-full" slotId={ADS_CONFIG.SLOTS.CATEGORY_FEED_1} />
                                            </div>
                                        </div>
                                    )}

                                    <div
                                        className={`group relative bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col ${gridClass}`}
                                        onClick={() => onArticleClick(article)}
                                    >
                                        <div className={`w-full overflow-hidden bg-zinc-900 ${imageHeight} ${index === 0 ? 'md:h-full' : ''} relative`}>
                                            <img
                                                src={article.imageUrl}
                                                alt={article.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                                            />
                                            {index === 0 && (
                                                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black via-black/50 to-transparent opacity-80"></div>
                                            )}

                                            {/* Listen Button - Top Right */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    playArticle(article);
                                                }}
                                                disabled={isLoading && currentArticle?.id === article.id}
                                                className={`absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 backdrop-blur border border-white/20 flex items-center justify-center hover:bg-emerald-500 hover:text-black hover:border-emerald-500 transition-all text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg z-20 ${index === 0 ? 'top-4 right-4 w-10 h-10' : ''}`}
                                                title="Listen to article"
                                            >
                                                {isLoading && currentArticle?.id === article.id ? (
                                                    <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                                ) : (
                                                    <Headphones size={index === 0 ? 16 : 14} />
                                                )}
                                            </button>
                                        </div>

                                        <div className={`p-4 flex flex-col flex-grow ${index === 0 ? 'absolute bottom-0 left-0 w-full z-10' : ''}`}>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`font-bold uppercase tracking-widest text-news-accent ${index === 0 ? 'text-xs' : 'text-[9px]'}`}>
                                                    {(() => {
                                                        const displayCategory = (cat: string) => cat === 'Action' || cat === 'Act' ? 'Guides' : cat;
                                                        const categories = Array.isArray(article.category) ? article.category : [article.category];
                                                        return categories.map(displayCategory).join(', ');
                                                    })()}
                                                </span>
                                            </div>

                                            <h3 className={`${titleSize} font-serif font-bold text-white leading-tight mb-2 group-hover:text-gray-200 transition-colors`}>
                                                {article.title}
                                            </h3>

                                            <p className={`text-sm text-gray-300 font-light mb-3 ${excerptClass}`}>
                                                {article.excerpt || (Array.isArray(article.content) ? article.content[0] : '') || ''}
                                            </p>

                                            {index !== 0 && (
                                                <div className="mt-auto pt-2 flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-gray-500">
                                                    <span>{article.date.split(',')[0]}</span>
                                                </div>
                                            )}
                                            {index === 0 && (
                                                <div className="mt-auto pt-2 flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-gray-500">
                                                    <div className="flex items-center gap-2">
                                                        <span>{article.date.split(',')[0]}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </React.Fragment>
                            );
                        })}
                    </div>
                )}

                {/* Ad Unit at bottom */}
                <div className="mt-16">
                    <div className="flex items-center gap-2 mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-600">
                        <span>Sponsored</span>
                        <div className="h-px bg-gray-800 flex-grow"></div>
                    </div>
                    <AdUnit format="horizontal" className="h-32" slotId={ADS_CONFIG.SLOTS.CATEGORY_FOOTER} />
                </div>

            </div>
        </div>
    );
};

export default CategoryFeed;