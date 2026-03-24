import React from 'react';
import { Tool, Comparison, Article, Stack } from '../types';
import { ArrowRight, Star, ExternalLink, Zap, LayoutGrid, Layers, FileText } from 'lucide-react';

interface RelatedContentProps {
    type: 'tools' | 'comparisons' | 'rankings' | 'guides' | 'stacks';
    title: string;
    items: any[];
    className?: string;
}

export const RelatedContent: React.FC<RelatedContentProps> = ({ type, title, items, className = '' }) => {
    if (!items || items.length === 0) return null;

    const renderToolCard = (tool: Tool) => (
        <a key={tool.id} href={`/tools/${tool.slug}`} className="flex-shrink-0 w-64 snap-start p-4 bg-surface-card hover:bg-surface-hover border border-border-subtle rounded-xl transition-all group hover:-translate-y-0.5 flex flex-col justify-between">
            <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-lg bg-white border border-border-subtle flex-shrink-0 flex items-center justify-center p-1.5 overflow-hidden">
                    {tool.logo ? <img src={tool.logo} alt={tool.name} className="w-full h-full object-contain" /> : <Zap size={20} className="text-news-accent" />}
                </div>
                <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-news-accent truncate">{tool.name}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <Star size={10} className="text-news-accent" fill="currentColor" />
                        <span className="text-[10px] font-bold text-white">{tool.rating_score?.toFixed(1) || '0.0'}</span>
                        <span className="text-[9px] bg-surface-base px-1.5 py-0.5 rounded border border-border-subtle text-news-muted font-bold uppercase">{tool.pricing_model || 'Free'}</span>
                    </div>
                </div>
            </div>
            <p className="text-xs text-news-text line-clamp-2 leading-relaxed">{tool.short_description}</p>
        </a>
    );

    const renderComparisonCard = (comp: Comparison) => {
        // Find data if enriched, or fallback safely
        const toolA = comp.tool_a || { name: comp.tool_a_slug.replace('-', ' '), logo: '' };
        const toolB = comp.tool_b || { name: comp.tool_b_slug.replace('-', ' '), logo: '' };
        
        return (
            <a key={comp.id} href={`/compare/${comp.slug}`} className="flex-shrink-0 w-72 snap-start p-4 bg-surface-card hover:bg-surface-hover border border-border-subtle rounded-xl transition-all group hover:-translate-y-0.5 flex flex-col justify-between">
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                            <div className="w-10 h-10 rounded-lg bg-white border border-border-subtle p-1.5 z-10 flex items-center justify-center">
                                {toolA.logo ? <img src={toolA.logo} alt={toolA.name} className="w-full h-full object-contain" /> : <LayoutGrid size={16} className="text-news-muted" />}
                            </div>
                            <div className="w-8 h-8 rounded-full bg-surface-hover border border-border-subtle flex items-center justify-center z-20 -mx-2 text-[9px] font-black text-white italic">VS</div>
                            <div className="w-10 h-10 rounded-lg bg-white border border-border-subtle p-1.5 z-10 flex items-center justify-center">
                                {toolB.logo ? <img src={toolB.logo} alt={toolB.name} className="w-full h-full object-contain" /> : <LayoutGrid size={16} className="text-news-muted" />}
                            </div>
                        </div>
                    </div>
                    <h3 className="text-xs font-bold text-white group-hover:text-news-accent leading-snug mb-2">{comp.title}</h3>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-news-accent uppercase tracking-widest mt-2 border-t border-border-subtle pt-3">
                    View Matchup <ArrowRight size={10} />
                </div>
            </a>
        );
    };

    const renderArticleCard = (article: Article) => (
        <a key={article.id} href={`/article/${article.slug}`} className="flex-shrink-0 w-64 snap-start p-4 bg-surface-card hover:bg-surface-hover border border-border-subtle rounded-xl transition-all group hover:-translate-y-0.5 flex flex-col gap-2 relative overflow-hidden">
            {article.imageUrl && (
                <div className="absolute top-0 right-0 w-24 h-24 opacity-10 bg-gradient-to-tr from-transparent to-current group-hover:opacity-20 transition-opacity">
                    <img src={article.imageUrl} className="w-full h-full object-cover rounded-bl-full" alt="" />
                </div>
            )}
            <div className="w-8 h-8 rounded bg-surface-alt border border-border-subtle flex items-center justify-center mb-1 text-news-muted">
                <FileText size={16} />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-news-accent leading-snug z-10">{article.title}</h3>
            <p className="text-[11px] text-news-text line-clamp-2 z-10">{article.excerpt}</p>
        </a>
    );

    const renderStackCard = (stack: Stack) => (
        <a key={stack.id} href={`/stacks/${stack.slug}`} className="flex-shrink-0 w-64 snap-start p-4 bg-surface-card hover:bg-surface-hover border border-border-subtle rounded-xl transition-all group hover:-translate-y-0.5 flex items-start gap-4">
            <div className="w-12 h-12 rounded bg-surface-alt border border-border-subtle flex-shrink-0 flex items-center justify-center overflow-hidden">
                {stack.hero_image ? (
                    <img src={stack.hero_image} alt="" className="w-full h-full object-cover" />
                ) : <Layers size={20} className="text-news-muted" />}
            </div>
            <div>
                <h3 className="text-sm font-semibold text-white group-hover:text-news-accent transition-colors truncate">{stack.name}</h3>
                <p className="text-xs text-news-text mt-1 line-clamp-2">{stack.short_description}</p>
            </div>
        </a>
    );

    const getRenderer = () => {
        switch (type) {
            case 'tools': return renderToolCard;
            case 'comparisons': return renderComparisonCard;
            case 'rankings': return renderArticleCard;
            case 'guides': return renderArticleCard;
            case 'stacks': return renderStackCard;
            default: return null;
        }
    };

    const renderItem = getRenderer();
    if (!renderItem) return null;

    return (
        <section className={`mt-10 pt-8 border-t border-border-divider ${className}`}>
            <h2 className="text-sm font-bold uppercase tracking-widest text-news-muted mb-4">{title}</h2>
            
            {/* Horizontal Scroll on Mobile, Wrap on large screens if desired. Or strictly horizontal. */}
            {/* Enforcing horizontal scroll behavior to match requirement of "Scrollable horizontal rows" */}
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
                {items.map((item: any) => renderItem(item))}
            </div>
        </section>
    );
};
