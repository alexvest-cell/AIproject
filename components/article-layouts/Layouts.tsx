import React from 'react';
import { Article, Tool, Comparison } from '../../types';
import { QuickComparisonTable, VerdictBox, ProsConsSection, ArticleFAQ, ToolSummaryCard, RatingBreakdown, ToolSectionBlock, SideBySideHeader, ComparisonDetailTable, ComparisonDecisionSection, RelatedToolsModule, RelatedRankingsModule, ToolsUsedSummary, StepByStepModule, WorkflowBreakdownModule, ComparisonSummaryModule, RecommendedStackModule, TopAlternativesModule, CompareWithModule, ProductScreenshotModule, FeaturedInRankingsModule } from './SharedModules';
import { ShieldCheck, Info, Check, ArrowRight, TrendingUp, BookOpen, Layers } from 'lucide-react';

interface LayoutProps {
    article: Article;
    parsedContent: React.ReactNode[];
    onArticleSelect: (article: Article) => void;
    allArticles: Article[];
    onStackClick?: (slug: string) => void;
    tool?: Tool;
    alternatives?: Tool[];
    comparisons?: Comparison[];
    rankings?: Article[];
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

export const ReviewLayout: React.FC<LayoutProps> = ({ article, parsedContent, tool, alternatives, comparisons, rankings }) => {
    const mainToolSlug = (article.primary_tools?.[0] || article.comparison_tools?.[0] || '').toLowerCase().replace(/\s+/g, '-');

    const hasScore = !!(article.rating_breakdown && Object.keys(article.rating_breakdown).length > 0);
    const hasAlts = !!(tool && alternatives && alternatives.length > 0);
    const hasVerdict = !!article.verdict;
    const hasFaqs = !!(article.faq && article.faq.length > 0);

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

            {/* Quick-jump nav */}
            {(hasScore || hasAlts || hasVerdict || hasFaqs) && (
                <nav className="flex flex-wrap gap-2 mb-8 -mt-2">
                    {hasScore && <a href="#score" className="text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full bg-surface-alt border border-border-subtle text-news-muted hover:text-news-accent hover:border-news-accent/40 transition-colors">Score</a>}
                    {hasAlts && <a href="#alternatives" className="text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full bg-surface-alt border border-border-subtle text-news-muted hover:text-news-accent hover:border-news-accent/40 transition-colors">Alternatives</a>}
                    {hasVerdict && <a href="#verdict" className="text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full bg-surface-alt border border-border-subtle text-news-muted hover:text-news-accent hover:border-news-accent/40 transition-colors">Verdict</a>}
                    {hasFaqs && <a href="#faqs" className="text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full bg-surface-alt border border-border-subtle text-news-muted hover:text-news-accent hover:border-news-accent/40 transition-colors">FAQs</a>}
                </nav>
            )}

            {/* 3. Short intro */}
            {article.excerpt && (
                <div className="mb-8">
                    <p className="text-lg md:text-xl text-news-text leading-relaxed font-medium italic border-l-2 border-news-accent pl-4">
                        {article.excerpt}
                    </p>
                </div>
            )}

            {/* 4. Rating Breakdown */}
            <div id="score" className="scroll-mt-28">
                <RatingBreakdown breakdown={article.rating_breakdown} />
            </div>

            {/* Top Alternatives */}
            <div id="alternatives" className="scroll-mt-28">
                {tool && alternatives && <TopAlternativesModule tool={tool} alternatives={alternatives} />}
            </div>

            {/* Compare With */}
            {tool && comparisons && <CompareWithModule tool={tool} comparisons={comparisons} />}

            {/* 5. Feature deep dive (parsed CMS content) */}
            <div className="prose prose-lg md:prose-xl prose-invert max-w-none font-sans leading-relaxed text-news-text mt-4">
                {parsedContent}
            </div>

            {/* Product Screenshots */}
            {tool && <ProductScreenshotModule tool={tool} />}

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
            <div id="verdict" className="scroll-mt-28">
                <VerdictBox article={article} />
            </div>

            {/* Featured in Rankings */}
            {rankings && rankings.length > 0 && <FeaturedInRankingsModule rankings={rankings} />}

            {/* 10. FAQ */}
            <div id="faqs" className="scroll-mt-28">
                {article.faq && <ArticleFAQ faq={article.faq} />}
            </div>

            {/* Bottom linkback block */}
            {(mainToolSlug || (rankings && rankings.length > 0)) && (
                <div className="mt-12 pt-10 border-t border-border-divider space-y-4">
                    {mainToolSlug && (
                        <div className="flex items-center justify-between gap-4 bg-surface-card border border-border-subtle rounded-xl px-5 py-4 hover:border-news-accent/30 transition-colors">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-news-muted mb-0.5">About This Tool</p>
                                <p className="text-sm font-semibold text-white">{tool?.name || mainToolSlug} — Pricing, Features & Alternatives</p>
                            </div>
                            <a href={`/tools/${mainToolSlug}`} className="text-xs font-bold text-news-accent hover:underline whitespace-nowrap flex items-center gap-1">
                                View Tool Profile <ArrowRight size={12} />
                            </a>
                        </div>
                    )}
                    {rankings && rankings.length > 0 && (
                        <div className="flex items-center justify-between gap-4 bg-surface-card border border-border-subtle rounded-xl px-5 py-4 hover:border-news-accent/30 transition-colors">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-news-muted mb-0.5">Related Rankings</p>
                                <p className="text-sm font-semibold text-white">{rankings[0].title}</p>
                            </div>
                            <a href={`/articles/${rankings[0].slug}`} className="text-xs font-bold text-news-accent hover:underline whitespace-nowrap flex items-center gap-1">
                                Read Now <ArrowRight size={12} />
                            </a>
                        </div>
                    )}
                </div>
            )}
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

export const IntelligenceLayout: React.FC<LayoutProps> = ({ article, parsedContent, allArticles }) => {
    const intro = parsedContent.length > 0 ? parsedContent[0] : null;
    const analysis = parsedContent.length > 1 ? parsedContent.slice(1) : [];

    return (
        <div className="flex flex-col gap-0 w-full max-w-[820px]">
            <header className="mb-10">
                <div className="flex items-center gap-2 text-news-accent font-bold uppercase tracking-[0.2em] text-[10px] mb-6">
                    <TrendingUp size={14} />
                    <span>Intelligence Report</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-serif font-bold text-white leading-[1.1] mb-8">
                    {article.title}
                </h1>
                <div className="flex items-center gap-6 text-[10px] uppercase tracking-widest font-bold text-news-muted border-y border-border-divider/50 py-4 mb-2">
                    <span className="flex items-center gap-2"><span className="text-white">Updated:</span> {article.date || 'Recently'}</span>
                    <span className="w-1 h-1 rounded-full bg-border-divider" />
                    <span className="flex items-center gap-2"><span className="text-white">Status:</span> Live Intelligence</span>
                </div>
            </header>

            {/* Intro Segment */}
            {intro && (
                <div className="prose prose-lg md:prose-xl prose-invert max-w-none text-white font-serif italic border-l-2 border-news-accent pl-6 mb-12 leading-relaxed">
                    {intro}
                </div>
            )}

            {/* Sub-header for Analysis */}
            <h2 className="text-xl font-bold uppercase tracking-[0.2em] text-news-muted mb-8 pb-2 border-b border-border-divider/50">Market Analysis</h2>

            {/* Analysis Content */}
            <div className="prose prose-lg prose-invert max-w-none font-sans leading-relaxed text-news-text mb-12">
                {analysis}
            </div>

            {/* Implications Section */}
            {article.implications && (
                <div className="my-12 bg-surface-card border border-border-subtle rounded-3xl p-8 md:p-12 shadow-elevation relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-news-accent to-blue-500 opacity-50" />
                    <div className="flex items-center gap-3 text-news-accent font-bold uppercase tracking-[0.2em] text-xs mb-6">
                        <Info size={18} />
                        <span>Strategic Implications</span>
                    </div>
                    <div className="prose prose-lg prose-invert max-w-none text-white font-serif leading-relaxed italic">
                        {article.implications}
                    </div>
                </div>
            )}

            {/* Related Tools Module */}
            {(article.primary_tools && article.primary_tools.length > 0) && (
                <RelatedToolsModule toolSlugs={article.primary_tools} />
            )}

            {/* Related Rankings Module */}
            {(article.related_rankings && article.related_rankings.length > 0) && (
                <RelatedRankingsModule rankings={article.related_rankings} allArticles={allArticles} />
            )}

            {article.faq && <ArticleFAQ faq={article.faq} />}
        </div>
    );
};

export const GuideLayout: React.FC<LayoutProps> = ({ article, parsedContent, allArticles }) => {
    const intro = parsedContent.length > 0 ? parsedContent[0] : null;

    return (
        <div className="flex flex-col gap-0 w-full max-w-[820px]">
            <header className="mb-8">
                <div className="flex items-center gap-2 text-news-accent font-bold uppercase tracking-[0.2em] text-[10px] mb-6">
                    <BookOpen size={14} />
                    <span>Tutorial & Guide</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-serif font-bold text-white leading-[1.1] mb-6">
                    {article.title}
                </h1>
                <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest font-bold text-news-muted border-b border-border-divider/50 pb-6">
                    <span className="flex items-center gap-2"><span className="text-white">Updated:</span> {article.date || 'Recently'}</span>
                    <span className="w-1 h-1 rounded-full bg-border-divider" />
                    <span className="flex items-center gap-2"><span className="text-white">Difficulty:</span> Beginner Friendly</span>
                </div>
            </header>

            {/* Intro Segment */}
            {intro && (
                <div className="mb-10 first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:text-news-accent first-letter:mr-3 first-letter:float-left">
                    {intro}
                </div>
            )}

            {/* Tools Used Summary */}
            {article.tools_used && article.tools_used.length > 0 && (
                <ToolsUsedSummary toolSlugs={article.tools_used} />
            )}

            {/* Step-by-Step Sections */}
            {article.steps && article.steps.length > 0 && (
                <StepByStepModule steps={article.steps} />
            )}

            {/* Remainder of parsed content if any (e.g. conclusion) */}
            {parsedContent.length > 1 && (
                <div className="prose prose-lg prose-invert max-w-none font-sans leading-relaxed text-news-text mt-8 mb-12 border-t border-border-divider/30 pt-12">
                    {parsedContent.slice(1)}
                </div>
            )}

            {/* FAQ */}
            {article.faq && <ArticleFAQ faq={article.faq} />}

            {/* Related Tools */}
            {article.primary_tools && article.primary_tools.length > 0 && (
                <RelatedToolsModule toolSlugs={article.primary_tools} />
            )}
        </div>
    );
};

export const UseCaseLayout: React.FC<LayoutProps> = ({ article, parsedContent, onStackClick }) => {
    return (
        <div className="flex flex-col gap-0 w-full max-w-[820px]">
            <header className="mb-8">
                <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase tracking-[0.2em] text-[10px] mb-6">
                    <Layers size={14} />
                    <span>Use Case & Workflow</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-serif font-bold text-white leading-[1.1] mb-6">
                    {article.title}
                </h1>
                <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest font-bold text-news-muted border-b border-border-divider/50 pb-6">
                    <span className="flex items-center gap-2"><span className="text-white">Updated:</span> {article.date || 'Recently'}</span>
                    <span className="w-1 h-1 rounded-full bg-border-divider" />
                    <span className="flex items-center gap-2 text-cyan-400/80 italic font-serif leading-none">Scenario-Driven Analysis</span>
                </div>
            </header>

            {/* Кто это для */}
            {article.who_its_for && article.who_its_for.length > 0 && (
                <div className="my-10 bg-surface-card border border-border-subtle rounded-2xl p-6 md:p-8 shadow-elevation">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-news-accent mb-5">Primary Target</h3>
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

            {/* Workflow Breakdown */}
            {article.workflow_stages && article.workflow_stages.length > 0 && (
                <>
                    <div className="mt-12 mb-6">
                        <h2 className="text-2xl md:text-3xl font-serif font-bold text-white">Recommended Workflow</h2>
                        <div className="h-1 w-20 bg-news-accent mt-4" />
                    </div>
                    <WorkflowBreakdownModule stages={article.workflow_stages} />
                    <RecommendedStackModule article={article} onStackClick={onStackClick} />
                </>
            )}

            {/* Comparison Summary */}
            <ComparisonSummaryModule article={article} />

            {/* Parsed Content (Intro/Outro) */}
            <div className="prose prose-lg prose-invert max-w-none font-sans leading-relaxed text-news-text mt-8 mb-12">
                {parsedContent}
            </div>

            {/* FAQ */}
            {article.faq && <ArticleFAQ faq={article.faq} />}

            {/* Related Rankings */}
            {article.related_rankings && article.related_rankings.length > 0 && (
                <RelatedRankingsModule rankingSlugs={article.related_rankings} />
            )}
        </div>
    );
};
