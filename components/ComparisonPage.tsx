import React, { useEffect, useState } from 'react';
import { Comparison, Tool } from '../types';
import { ChevronLeft, ExternalLink, Check, X, ArrowRight } from 'lucide-react';
import { ComparisonDecisionSection, ArticleFAQ } from './article-layouts/SharedModules';

interface ComparisonPageProps {
    slug: string;
    onBack: () => void;
    onToolClick: (slug: string) => void;
}

const PRICING_COLORS: Record<string, string> = {
    Free: 'bg-green-900/50 text-green-400 border-green-700',
    Freemium: 'bg-blue-900/50 text-blue-400 border-blue-700',
    Paid: 'bg-purple-900/50 text-purple-400 border-purple-700',
    Enterprise: 'bg-orange-900/50 text-orange-400 border-orange-700',
};

const ToolCard: React.FC<{ tool: Tool; onClick: () => void }> = ({ tool, onClick }) => (
    <button
        onClick={onClick}
        className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded-2xl p-6 text-left transition-colors group"
    >
        <div className="flex items-center gap-3 mb-3">
            {tool.logo && (
                <div className="w-12 h-12 rounded-xl bg-black border border-white/10 overflow-hidden flex-shrink-0">
                    <img src={tool.logo} alt={tool.name} className="w-full h-full object-contain p-1.5" loading="lazy" />
                </div>
            )}
            <div>
                <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors flex items-center gap-1">
                    {tool.name} <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${PRICING_COLORS[tool.pricing_model] || 'bg-zinc-800 text-gray-400 border-zinc-700'}`}>
                    {tool.pricing_model}
                </span>
            </div>
        </div>
        <p className="text-gray-400 text-sm leading-relaxed">{tool.short_description}</p>
    </button>
);

const ComparisonPage: React.FC<ComparisonPageProps> = ({ slug, onBack, onToolClick }) => {
    const [data, setData] = useState<Comparison | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        // Browser handles scroll position

        fetch(`/api/comparisons/${slug}`)
            .then(r => r.ok ? r.json() : Promise.reject('Comparison not found'))
            .then(d => {
                setData(d);

                if (d) {
                    // Update Page Meta
                    document.title = (d.meta_title || d.title) + ' | ToolCurrent';
                    const description = d.meta_description || d.verdict || `Head-to-head comparison: ${d.title}. See the full verdict on ToolCurrent.`;

                    let metaDesc = document.querySelector('meta[name="description"]');
                    if (!metaDesc) {
                        metaDesc = document.createElement('meta');
                        metaDesc.setAttribute('name', 'description');
                        document.head.appendChild(metaDesc);
                    }
                    metaDesc.setAttribute('content', description);

                    // Inject Article schema
                    const schema = {
                        '@context': 'https://schema.org',
                        '@type': 'Article',
                        headline: d.title,
                        description: description,
                        datePublished: d.publish_date
                    };
                    let el = document.getElementById('comparison-schema');
                    if (!el) {
                        el = document.createElement('script');
                        el.id = 'comparison-schema';
                        (el as HTMLScriptElement).type = 'application/ld+json';
                        document.head.appendChild(el);
                    }
                    el.textContent = JSON.stringify(schema);
                }
            })
            .catch(err => setError(typeof err === 'string' ? err : 'Failed to load comparison'))
            .finally(() => setLoading(false));

        return () => {
            const el = document.getElementById('comparison-schema');
            if (el) el.remove();
            document.title = 'ToolCurrent | Tech & AI Intelligence';
        };
    }, [slug]);

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-gray-400">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm uppercase tracking-widest">Loading comparison</span>
            </div>
        </div>
    );

    if (error || !data) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="text-center">
                <p className="text-gray-400 mb-4">{error || 'Comparison not found'}</p>
                <a href="/" className="text-blue-400 hover:underline text-sm">Return Home</a>
            </div>
        </div>
    );

    const tools = [data.tool_a, data.tool_b, data.tool_c].filter(Boolean) as Tool[];

    return (
        <div className="min-h-screen bg-black text-white font-sans pt-[112px]">
            <div className="container mx-auto px-4 md:px-8 py-10 max-w-4xl">

                {/* Title */}
                <div className="mb-8">
                    <span className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-3 block">Comparison</span>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-4">{data.title}</h1>
                    {data.verdict && (
                        <p className="text-gray-300 text-lg leading-relaxed border-l-2 border-blue-500 pl-4">{data.verdict}</p>
                    )}
                </div>

                {/* Tool Cards */}
                <div className="flex flex-col md:flex-row gap-4 mb-10">
                    {tools.map(tool => (
                        <ToolCard key={tool.id} tool={tool} onClick={() => onToolClick(tool.slug)} />
                    ))}
                </div>

                {/* Comparison Table */}
                {data.comparison_table?.length > 0 && (
                    <section className="mb-10">
                        <h2 className="text-lg font-bold uppercase tracking-widest text-gray-400 mb-4 border-b border-white/10 pb-2">Feature Comparison</h2>
                        <div className="overflow-x-auto rounded-xl border border-white/10">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-zinc-900 border-b border-white/10">
                                        <th className="text-left px-5 py-3 text-gray-400 font-bold uppercase tracking-widest text-xs">Feature</th>
                                        {tools.map(t => (
                                            <th key={t.id} className="text-left px-5 py-3 text-white font-bold">{t.name}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.comparison_table.map((row, i) => (
                                        <tr key={i} className={`border-b border-white/5 ${i % 2 === 0 ? 'bg-black' : 'bg-zinc-950'}`}>
                                            <td className="px-5 py-3 text-gray-400 font-medium">{row.feature}</td>
                                            <td className="px-5 py-3 text-gray-200">{renderCellValue(row.tool_a_value)}</td>
                                            <td className="px-5 py-3 text-gray-200">{renderCellValue(row.tool_b_value)}</td>
                                            {data.tool_c && (
                                                <td className="px-5 py-3 text-gray-200">{renderCellValue(row.tool_c_value || '')}</td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {/* Body */}
                {data.body && (
                    <section className="mb-10">
                        <h2 className="text-lg font-bold uppercase tracking-widest text-gray-400 mb-4 border-b border-white/10 pb-2">In Depth</h2>
                        <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">{data.body}</div>
                    </section>
                )}

                {/* Choose Tool Sections */}
                {((data.choose_tool_a && data.choose_tool_a.length > 0) || (data.choose_tool_b && data.choose_tool_b.length > 0)) && (
                    <section className="mb-10">
                        <ComparisonDecisionSection
                            toolAName={data.tool_a?.name || 'Tool A'}
                            toolBName={data.tool_b?.name || 'Tool B'}
                            chooseA={data.choose_tool_a}
                            chooseB={data.choose_tool_b}
                        />
                    </section>
                )}

                {/* FAQ */}
                {data.faq && data.faq.length > 0 && (
                    <section className="mb-10">
                        <ArticleFAQ faq={data.faq} />
                    </section>
                )}

                {/* Tool CTAs */}
                <section className="border border-white/10 rounded-2xl p-6 bg-zinc-900">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Explore Each Tool</h2>
                    <div className="flex flex-wrap gap-3">
                        {tools.map(tool => (
                            <a key={tool.id}
                                href={tool.affiliate_url || tool.website_url || '#'}
                                target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-4 py-2 rounded-lg transition-colors">
                                Try {tool.name} <ExternalLink size={12} />
                            </a>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

function renderCellValue(value: string): React.ReactNode {
    const v = value?.trim().toLowerCase();
    if (v === 'yes' || v === '✓' || v === 'true') return <Check size={16} className="text-green-400" />;
    if (v === 'no' || v === '✗' || v === 'false') return <X size={16} className="text-red-400" />;
    return value || '—';
}

export default ComparisonPage;
