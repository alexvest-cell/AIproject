import React from 'react';
import { Article } from '../../types';
import { QuickComparisonTable, VerdictBox, ProsConsSection, ArticleFAQ, ToolSummaryCard, RatingBreakdown, ToolSectionBlock, SideBySideHeader, ComparisonDetailTable, ComparisonDecisionSection } from './SharedModules';
import { ShieldCheck, Info, Check, ArrowRight } from 'lucide-react';

interface LayoutProps {
    article: Article;
    parsedContent: React.ReactNode[];
    onArticleSelect: (article: Article) => void;
    allArticles: Article[];
}

export const RankingLayout: React.FC<LayoutProps> = ({ article, parsedContent }) => {
    const rankedTools = (article.comparison_tools && article.comparison_tools.length > 0)
        ? article.comparison_tools
        : article.primary_tools;

    return (
        <div className="flex flex-col gap-8 w-full">
            <header className="mb-4">
                <h1 className="text-3xl md:text-5xl lg:text-5xl font-serif font-bold text-white leading-[1.1] mb-6">
                    {article.title}
                </h1>
                <div className="flex items-center gap-4 text-xs uppercase tracking-wider font-bold text-news-muted border-b border-border-divider pb-6">
                    <span className="text-white">Updated: {article.date || 'Recently'}</span>
                    <span className="w-1 h-1 rounded-full bg-border-divider"></span>
                    <span className="flex items-center gap-1 text-news-muted italic text-[10px]">
                        <Info size={12} /> Disclosure: We may earn a commission from links
                    </span>
                </div>
            </header>

            <div className="prose prose-lg prose-invert max-w-none font-sans leading-relaxed text-news-text">
                <p className="text-xl font-bold italic mb-8">{article.excerpt}</p>
            </div>

            <VerdictBox article={article} type="ranking" />

            {rankedTools && rankedTools.length > 0 && (
                <div className="mb-12">
                    <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-widest text-news-accent">Quick Comparison</h3>
                    <QuickComparisonTable toolSlugs={rankedTools} />
                </div>
            )}

            {rankedTools && rankedTools.length > 0 && (
                <div className="my-16 flex flex-col gap-4">
                    {rankedTools.map((slug, idx) => (
                        <ToolSectionBlock key={slug} slug={slug} rank={idx + 1} />
                    ))}
                </div>
            )}

            <div className="my-12 border-t border-border-divider pt-12">
                <h3 className="text-2xl font-serif font-bold text-white mb-8">Buying Guide</h3>
                <div className="prose prose-lg md:prose-xl prose-invert max-w-none font-sans leading-relaxed text-news-text">
                    {parsedContent}
                </div>
            </div>

            {article.faq && <ArticleFAQ faq={article.faq} />}
        </div>
    );
};

export const ReviewLayout: React.FC<LayoutProps> = ({ article, parsedContent }) => {
    const mainToolSlug = (article.primary_tools?.[0] || article.comparison_tools?.[0] || '').toLowerCase().replace(/\s+/g, '-');

    return (
        <div className="flex flex-col gap-0 w-full">

            {/* 1. Tool Summary Card — above the fold, replaces hero image */}
            {mainToolSlug && <ToolSummaryCard slug={mainToolSlug} />}

            {/* 2. Title */}
            <header className="mt-8 mb-2">
                <h1 className="text-3xl md:text-5xl font-serif font-bold text-white leading-[1.1] mb-4">
                    {article.title}
                </h1>
                <div className="flex items-center gap-4 text-xs uppercase tracking-wider font-bold text-news-muted border-b border-border-divider pb-5 mb-6">
                    <span className="text-white">Updated: {article.date || 'Recently'}</span>
                    <span className="w-1 h-1 rounded-full bg-border-divider" />
                    <span className="flex items-center gap-1 text-news-muted italic text-[10px]">
                        <Info size={12} /> Independent editorial review
                    </span>
                </div>
            </header>

            {/* 3. Short intro */}
            {article.excerpt && (
                <div className="mb-8">
                    <p className="text-lg md:text-xl text-news-text leading-relaxed font-medium italic border-l-2 border-news-accent pl-4">
                        {article.excerpt}
                    </p>
                </div>
            )}

            {/* 4. Rating Breakdown */}
            <RatingBreakdown breakdown={article.rating_breakdown} />

            {/* 5. Feature deep dive (parsed CMS content) */}
            <div className="prose prose-lg md:prose-xl prose-invert max-w-none font-sans leading-relaxed text-news-text mt-4">
                {parsedContent}
            </div>

            {/* 6. Pricing Analysis */}
            {article.pricing_analysis && (
                <div className="my-10 bg-surface-card border border-border-subtle rounded-2xl p-6 md:p-8 shadow-elevation relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                    <h3 className="text-sm font-bold uppercase tracking-widest text-blue-400 mb-3">Pricing Analysis</h3>
                    <p className="text-news-text leading-relaxed text-base">{article.pricing_analysis}</p>
                </div>
            )}

            {/* 7. Pros & Cons */}
            <ProsConsSection pros={article.pros} cons={article.cons} />

            {/* 8. Who It's For */}
            {article.who_its_for && article.who_its_for.length > 0 && (
                <div className="my-10 bg-surface-card border border-border-subtle rounded-2xl p-6 md:p-8 shadow-elevation">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-news-accent mb-5">Who It's For</h3>
                    <ul className="space-y-3">
                        {article.who_its_for.map((item, i) => (
                            <li key={i} className="flex items-start gap-3 text-news-text text-sm">
                                <span className="w-2 h-2 rounded-full bg-news-accent mt-1.5 flex-shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* 9. Verdict */}
            <VerdictBox article={article} />

            {/* 10. FAQ */}
            {article.faq && <ArticleFAQ faq={article.faq} />}
        </div>
    );
};


export const ComparisonLayout: React.FC<LayoutProps> = ({ article, parsedContent }) => {
    const slugA = article.comparison_tools?.[0] || article.primary_tools?.[0] || '';
    const slugB = article.comparison_tools?.[1] || article.primary_tools?.[1] || '';
    const nameA = slugA ? slugA.charAt(0).toUpperCase() + slugA.slice(1).replace(/-/g, ' ') : 'Tool A';
    const nameB = slugB ? slugB.charAt(0).toUpperCase() + slugB.slice(1).replace(/-/g, ' ') : 'Tool B';

    return (
        <div className="flex flex-col gap-0 w-full">

            {/* 1. Side-by-Side Header Block */}
            {slugA && slugB && <SideBySideHeader slugA={slugA} slugB={slugB} />}

            {/* 2. Title */}
            <header className="mt-6 mb-4">
                <div className="text-[10px] font-bold uppercase tracking-widest text-news-accent mb-3">Head-to-Head Comparison</div>
                <h1 className="text-3xl md:text-5xl font-serif font-bold text-white leading-[1.1] mb-4">
                    {article.title}
                </h1>
                <div className="flex items-center gap-4 text-xs uppercase tracking-wider font-bold text-news-muted border-b border-border-divider pb-5 mb-4">
                    <span className="text-white">{article.date || 'Recently'}</span>
                    <span className="w-1 h-1 rounded-full bg-border-divider" />
                    <span className="text-news-muted italic text-[10px] flex items-center gap-1">
                        <Info size={12} /> No long intros. Straight to the data.
                    </span>
                </div>
            </header>

            {/* 3. Quick Verdict Summary */}
            <VerdictBox article={article} />

            {/* 4. Comparison Table */}
            <ComparisonDetailTable
                rows={article.comparison_rows}
                toolAName={nameA}
                toolBName={nameB}
            />

            {/* 5. Category breakdown sections (parsed CMS body) */}
            <div className="prose prose-lg md:prose-xl prose-invert max-w-none font-sans leading-relaxed text-news-text">
                {parsedContent}
            </div>

            {/* 6. Choose X if… Decision Section */}
            <ComparisonDecisionSection
                toolAName={nameA}
                toolBName={nameB}
                chooseA={article.choose_tool_a}
                chooseB={article.choose_tool_b}
            />

            {/* 7. Final Recommendation */}
            {article.verdict && (
                <div className="my-8 bg-surface-card border border-border-subtle rounded-2xl p-6 md:p-8 shadow-elevation relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-news-accent" />
                    <div className="flex items-center gap-2 text-news-accent font-bold uppercase tracking-widest text-[10px] mb-4">
                        <ShieldCheck size={14} /> Final Recommendation
                    </div>
                    <p className="text-white text-lg font-serif italic leading-relaxed">"{article.verdict}"</p>
                </div>
            )}

            {/* 8. FAQ */}
            {article.faq && <ArticleFAQ faq={article.faq} />}
        </div>
    );
};


export const StandardLayout: React.FC<LayoutProps> = ({ article, parsedContent }) => {
    return (
        <div className="flex flex-col gap-8 w-full">
            <header className="mb-8">
                <div className="text-news-accent font-bold uppercase tracking-widest text-xs mb-4">
                    {Array.isArray(article.category) ? article.category.join(', ') : article.category}
                </div>
                <h1 className="text-3xl md:text-5xl lg:text-5xl font-serif font-bold text-white leading-[1.1] mb-6">
                    {article.title}
                </h1>
                <div className="flex items-center justify-between border-y border-border-divider py-4 my-6">
                    <div className="flex items-center gap-4 text-xs uppercase tracking-wider font-bold text-news-muted">
                        <span className="text-white">{article.date}</span>
                    </div>
                </div>
            </header>

            <div className="prose prose-lg md:prose-xl prose-invert max-w-none font-sans leading-relaxed text-news-text">
                <p className="first-letter:text-6xl first-letter:font-serif first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-[-8px] first-letter:text-white mb-8">
                    {article.excerpt}
                </p>
                {parsedContent}
            </div>

            {article.faq && <ArticleFAQ faq={article.faq} />}
        </div>
    );
};
