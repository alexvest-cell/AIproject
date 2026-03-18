import React, { useEffect, useState } from 'react';
import { Tool, Comparison, Article, Stack } from '../types';
import { ExternalLink, Check, X, ChevronLeft, Star, Zap, Globe, Smartphone, Layers, Calendar, ArrowRight, Maximize2, Image as ImageIcon } from 'lucide-react';
import { RelatedContent } from './RelatedContent';

interface ToolPageProps {
    slug: string;
    onBack: () => void;
    onArticleClick: (article: Article) => void;
    onComparisonClick: (slug: string) => void;
    onAlternativesClick: (slug: string) => void;
    onStackClick?: (slug: string) => void;
}

const PRICING_COLORS: Record<string, string> = {
    Free: 'bg-green-900/50 text-green-400 border-green-700',
    Freemium: 'bg-blue-900/50 text-blue-400 border-blue-700',
    Paid: 'bg-purple-900/50 text-purple-400 border-purple-700',
    Enterprise: 'bg-orange-900/50 text-orange-400 border-orange-700',
};

const ToolPage: React.FC<ToolPageProps> = ({ slug, onBack, onArticleClick, onComparisonClick, onAlternativesClick, onStackClick }) => {
    const [tool, setTool] = useState<Tool | null>(null);
    const [comparisons, setComparisons] = useState<Comparison[]>([]);
    const [alternatives, setAlternatives] = useState<Tool[]>([]);
    const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
    const [stacks, setStacks] = useState<Stack[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        // Scroll restoration managed by browser

        const MAX_ALTERNATIVES = 8;

        Promise.all([
            fetch(`/api/tools/${slug}`).then(r => r.ok ? r.json() : Promise.reject('Tool not found')),
            fetch(`/api/tools/${slug}/alternatives`).then(r => r.ok ? r.json() : { alternatives: [] })
        ])
            .then(async ([data, altData]) => {
                setTool(data.tool);
                setComparisons(data.comparisons || []);
                setRelatedArticles(data.relatedArticles || []);
                setStacks(data.stacks || []);
                let alts: Tool[] = (altData.alternatives || []).slice(0, MAX_ALTERNATIVES);
                // Fallback: if no alternatives found, show popular tools (excluding this one)
                if (alts.length === 0) {
                    const popular = await fetch(`/api/tools?sort=popular&limit=9`)
                        .then(r => r.ok ? r.json() : [])
                        .catch(() => []);
                    alts = (popular as Tool[]).filter((t: Tool) => t.slug !== slug).slice(0, MAX_ALTERNATIVES);
                }
                setAlternatives(alts);

                if (data.tool) {
                    // Update Page Meta
                    document.title = `${data.tool.name} Review, Pricing & Alternatives | ToolCurrent`;
                    const description = data.tool.meta_description || data.tool.short_description || `Deep dive review of ${data.tool.name}. Pricing, features, and key comparison vs other AI tools.`;

                    let metaDesc = document.querySelector('meta[name="description"]');
                    if (!metaDesc) {
                        metaDesc = document.createElement('meta');
                        metaDesc.setAttribute('name', 'description');
                        document.head.appendChild(metaDesc);
                    }
                    metaDesc.setAttribute('content', description);

                    // Inject SoftwareApplication schema
                    const schema = {
                        '@context': 'https://schema.org',
                        '@type': 'SoftwareApplication',
                        name: data.tool.name,
                        description: data.tool.short_description,
                        applicationCategory: data.tool.category_tags?.[0] || 'WebApplication',
                        offers: {
                            '@type': 'Offer',
                            price: data.tool.starting_price || '0',
                            priceCurrency: 'USD'
                        },
                        url: data.tool.website_url
                    };
                    let el = document.getElementById('tool-schema');
                    if (!el) {
                        el = document.createElement('script');
                        el.id = 'tool-schema';
                        (el as HTMLScriptElement).type = 'application/ld+json';
                        document.head.appendChild(el);
                    }
                    el.textContent = JSON.stringify(schema);
                }
            })
            .catch(err => setError(typeof err === 'string' ? err : 'Failed to load tool'))
            .finally(() => setLoading(false));

        return () => {
            const el = document.getElementById('tool-schema');
            if (el) el.remove();
            // Reset title on unmount (App.tsx will set its own title usually, but good to be safe)
            document.title = 'ToolCurrent | Tech & AI Intelligence';
        };
    }, [slug]);

    if (loading) return (
        <div className="min-h-screen bg-surface-base flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-news-muted">
                <div className="w-8 h-8 border-2 border-news-accent border-t-transparent rounded-full animate-spin" />
                <span className="text-sm uppercase tracking-widest">Loading tool</span>
            </div>
        </div>
    );

    if (error || !tool) return (
        <div className="min-h-screen bg-surface-base flex items-center justify-center">
            <div className="text-center">
                <p className="text-news-muted mb-4">{error || 'Tool not found'}</p>
                <button onClick={onBack} className="text-news-accent hover:underline text-sm">← Back</button>
            </div>
        </div>
    );

    const sections = [];
    if (tool.full_description) sections.push({ id: 'overview', label: 'Overview' });
    if ((tool as any).screenshots?.length > 0) sections.push({ id: 'screenshots', label: 'Screenshots' });
    if (alternatives && alternatives.length > 0) sections.push({ id: 'alternatives', label: 'Alternatives' });
    if (tool.key_features?.length > 0) sections.push({ id: 'features', label: 'Features' });
    if (tool.pros?.length > 0 || tool.cons?.length > 0) sections.push({ id: 'proscons', label: 'Pros & Cons' });
    if (stacks.length > 0) sections.push({ id: 'stacks', label: 'Ecosystems' });
    if (comparisons.length > 0) sections.push({ id: 'comparisons', label: 'Comparisons' });
    if (relatedArticles.length > 0) sections.push({ id: 'related', label: 'Related' });

    const pricingClass = PRICING_COLORS[tool.pricing_model] || 'bg-surface-alt text-news-muted border-border-subtle';

    const JumpNav = ({ sections }: { sections: { id: string, label: string }[] }) => {
        if (sections.length === 0) return null;
        return (
            <div className="hidden lg:block fixed left-12 top-1/2 -translate-y-1/2 w-64 space-y-4 border-l border-border-divider pl-6 py-4">
                <div className="text-[10px] font-bold text-news-muted uppercase tracking-[0.2em] mb-4">Jump To</div>
                <nav className="flex flex-col gap-3">
                    {sections.map((s, i) => (
                        <a key={i} href={`#${s.id}`} className="text-xs text-news-muted hover:text-news-accent transition-colors truncate block">
                            {s.label}
                        </a>
                    ))}
                </nav>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-surface-base text-news-text font-sans relative pt-[112px]">
            <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
            <JumpNav sections={sections} />

            <div className="container mx-auto px-4 md:px-8 py-10 max-w-5xl">

                {/* Hero Header */}
                <div className="flex flex-col md:flex-row gap-6 items-start mb-10 pb-10 border-b border-border-divider">
                    {tool.logo && (
                        <div className="w-20 h-20 rounded-2xl bg-surface-card border border-border-subtle flex-shrink-0 overflow-hidden shadow-inner">
                            <img src={tool.logo} alt={`${tool.name} logo`} className="w-full h-full object-contain p-2" loading="lazy" />
                        </div>
                    )}
                    <div className="flex-grow">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">{tool.name}</h1>
                            <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${pricingClass}`}>
                                {tool.pricing_model}
                            </span>
                            {tool.ai_enabled && (
                                <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-blue-500/15 text-blue-400 border border-transparent">
                                    <Zap size={10} /> AI-Powered
                                </span>
                            )}
                            {(tool as any).last_updated && (
                                <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-news-muted">
                                    <Calendar size={12} /> Last updated: {new Date((tool as any).last_updated).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </span>
                            )}
                        </div>
                        <p className="text-news-text text-lg leading-relaxed mb-4 max-w-2xl">{tool.short_description}</p>
                        <div className="flex flex-wrap gap-2 mb-5">
                            {tool.category_tags.map(tag => (
                                <a key={tag}
                                   href={`/ai-tools?category=${encodeURIComponent(tag)}`}
                                   className="text-xs px-2 py-1 rounded-full bg-surface-alt shadow-sm text-news-muted border border-border-subtle hover:border-news-accent/40 hover:text-news-accent transition-colors">
                                    {tag}
                                </a>
                            ))}
                            {tool.category_tags.length > 0 && (
                                <a href={`/best-software?category=${encodeURIComponent(tool.category_tags[0])}`}
                                   className="text-xs px-2 py-1 rounded-full bg-news-accent/10 text-news-accent border border-news-accent/30 hover:bg-news-accent/20 transition-colors font-medium">
                                    Best {tool.category_tags[0]} Software →
                                </a>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {tool.affiliate_url && (
                                <a href={tool.affiliate_url} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-2 bg-news-accent hover:opacity-90 text-white font-bold text-sm px-5 py-2.5 rounded-lg transition-opacity shadow-md">
                                    Try {tool.name} <ExternalLink size={14} />
                                </a>
                            )}
                            {tool.website_url && (
                                <a href={tool.website_url} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-2 bg-surface-card hover:bg-surface-hover text-white font-bold text-sm px-5 py-2.5 rounded-lg transition-colors border border-border-subtle shadow-sm">
                                    <Globe size={14} /> Website
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {/* Main Content Column */}
                    <div className="md:col-span-2 space-y-10">

                        {/* Full Description */}
                        {tool.full_description && (
                            <section id="overview" className="scroll-mt-24">
                                <h2 className="text-base font-bold uppercase tracking-widest text-news-muted mb-4 border-b border-border-divider pb-2">Overview</h2>
                                <p className="text-news-text leading-relaxed text-lg">{tool.full_description}</p>
                            </section>
                        )}

                        {/* Top Alternatives moved to bottom RelatedContent section */}

                        {/* Product Screenshots */}
                        {(tool as any).screenshots?.length > 0 && (
                            <section id="screenshots" className="scroll-mt-24">
                                <h2 className="text-base font-bold uppercase tracking-widest text-news-muted mb-6 border-b border-border-divider pb-2 flex items-center gap-2">
                                    <ImageIcon size={16} /> Product Screenshots
                                </h2>
                                <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
                                    {(tool as any).screenshots.map((s: any, i: number) => (
                                        <div key={i} className="flex-shrink-0 w-4/5 sm:w-[400px] snap-start relative group cursor-pointer" onClick={() => window.open(s.url, '_blank')}>
                                            <div className="aspect-video rounded-xl overflow-hidden bg-surface-card border border-border-subtle shadow-lg">
                                                <img src={s.url} alt={s.caption || ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Maximize2 className="text-white" size={24} />
                                                </div>
                                            </div>
                                            {s.caption && <p className="text-[10px] text-news-muted mt-2 font-medium italic">{s.caption}</p>}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Key Features */}
                        {tool.key_features?.length > 0 && (
                            <section id="features" className="scroll-mt-24">
                                <h2 className="text-base font-bold uppercase tracking-widest text-news-muted mb-4 border-b border-border-divider pb-2">Key Features</h2>
                                <ul className="space-y-3">
                                    {tool.key_features.map((f, i) => (
                                        <li key={i} className="flex items-start gap-3 text-white">
                                            <Check size={18} className="text-news-accent mt-0.5 flex-shrink-0" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        {/* Pros & Cons */}
                        {(tool.pros?.length > 0 || tool.cons?.length > 0) && (
                            <section id="proscons" className="scroll-mt-24">
                                <h2 className="text-base font-bold uppercase tracking-widest text-news-muted mb-4 border-b border-border-divider pb-2">Pros & Cons</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="bg-surface-card border border-border-subtle shadow-sm rounded-xl p-5 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-news-accent"></div>
                                        <h3 className="text-news-accent font-bold text-sm uppercase tracking-widest mb-3">Pros</h3>
                                        <ul className="space-y-2">
                                            {tool.pros.map((p, i) => (
                                                <li key={i} className="flex items-start gap-2 text-news-text text-sm">
                                                    <Check size={14} className="text-news-accent mt-0.5 flex-shrink-0" /> {p}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="bg-surface-card border border-border-subtle shadow-sm rounded-xl p-5 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                                        <h3 className="text-red-400 font-bold text-sm uppercase tracking-widest mb-3">Cons</h3>
                                        <ul className="space-y-2">
                                            {tool.cons.map((c, i) => (
                                                <li key={i} className="flex items-start gap-2 text-news-text text-sm">
                                                    <X size={14} className="text-red-400 mt-0.5 flex-shrink-0" /> {c}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Integrations */}
                        {tool.integrations?.length > 0 && (
                            <section>
                                <h2 className="text-base font-bold uppercase tracking-widest text-news-muted mb-4 border-b border-border-divider pb-2">Integrations</h2>
                                <div className="flex flex-wrap gap-2">
                                    {tool.integrations.map(int => (
                                        <span key={int} className="text-xs px-3 py-1.5 rounded-full bg-surface-alt text-white border border-border-subtle shadow-sm">{int}</span>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Related Content Modules using internal linking system */}
                        <div className="space-y-8 mt-12 bg-surface-alt/20 p-6 rounded-2xl border border-border-subtle">
                            {alternatives.length > 0 && (
                                <RelatedContent type="tools" title="Top Alternatives" items={alternatives} className="mt-0 pt-0 border-none" />
                            )}
                            {comparisons.length > 0 && (
                                <RelatedContent type="comparisons" title="Compare With" items={comparisons.slice(0, 6)} className="mt-0 pt-0 border-none" />
                            )}
                            {stacks.length > 0 && (
                                <RelatedContent type="stacks" title="Used in Ecosystems" items={stacks.slice(0, 3)} className="mt-0 pt-0 border-none" />
                            )}
                            {relatedArticles.some(a => a.title.toLowerCase().includes('best') || a.title.toLowerCase().includes('top')) && (
                                <RelatedContent type="rankings" title="Featured in Rankings" items={relatedArticles.filter(a => a.title.toLowerCase().includes('best') || a.title.toLowerCase().includes('top')).slice(0, 4)} className="mt-0 pt-0 border-none" />
                            )}
                            {relatedArticles.some(a => !a.title.toLowerCase().includes('best') && !a.title.toLowerCase().includes('top')) && (
                                <RelatedContent type="guides" title="Implementation Guides" items={relatedArticles.filter(a => !a.title.toLowerCase().includes('best') && !a.title.toLowerCase().includes('top')).slice(0, 3)} className="mt-0 pt-0 border-none" />
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Pricing Card */}
                        <div className="bg-surface-card border border-border-subtle shadow-elevation rounded-2xl p-6 relative overflow-hidden">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-news-muted mb-4">Pricing</h3>
                            <div className={`inline-block text-sm font-bold px-3 py-1 rounded-full border mb-3 ${pricingClass}`}>
                                {tool.pricing_model}
                            </div>
                            {tool.starting_price && (
                                <p className="text-white font-semibold">{tool.starting_price}</p>
                            )}
                            {tool.affiliate_url && (
                                <a href={tool.affiliate_url} target="_blank" rel="noopener noreferrer"
                                    className="mt-4 block text-center bg-news-accent hover:opacity-90 text-white font-bold text-sm px-4 py-2.5 rounded-lg transition-opacity shadow-md">
                                    Get Started →
                                </a>
                            )}
                        </div>

                        {/* Platforms */}
                        {tool.supported_platforms?.length > 0 && (
                            <div className="bg-surface-card border border-border-subtle shadow-elevation rounded-2xl p-6">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-news-muted mb-4 flex items-center gap-2">
                                    <Smartphone size={12} /> Platforms
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {tool.supported_platforms.map(p => (
                                        <span key={p} className="text-xs px-2 py-1 rounded bg-surface-alt shadow-sm text-news-text border border-border-subtle">{p}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Use Cases (Simplified in sidebar if preferred, or remove if redundant) */}
                        {/* Removing redundant sidebar use cases as it is now a main section */}

                        {/* Rating */}
                        {tool.rating_score > 0 && (
                            <div className="bg-surface-card border border-border-subtle shadow-elevation rounded-2xl p-6 text-center">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-news-muted mb-3">Our Score</h3>
                                <div className="flex items-center justify-center gap-1 text-news-accent mb-1">
                                    <Star size={18} fill="currentColor" />
                                    <span className="text-2xl font-black text-white">{tool.rating_score.toFixed(1)}</span>
                                    <span className="text-news-muted text-sm">/10</span>
                                </div>
                                {tool.review_count > 0 && (
                                    <p className="text-[10px] text-news-muted font-bold uppercase tracking-widest mt-2">{tool.review_count} review{tool.review_count !== 1 ? 's' : ''}</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ToolPage;
