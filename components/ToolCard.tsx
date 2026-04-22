'use client';
import React from 'react';
import Image from 'next/image';
import { Check, ExternalLink, ArrowRight, Zap } from 'lucide-react';
import { Tool } from '../types';

interface ToolCardProps {
    tool: Tool;
    compact?: boolean;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, compact = false }) => {
    const isFree = tool.pricing_model === 'Free';
    const hasAffiliate = !!tool.affiliate_url;
    const targetUrl = tool.affiliate_url || tool.website_url;

    if (compact) {
        return (
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex items-center gap-4 hover:border-news-accent hover:shadow-[0_0_15px_rgba(43,212,195,0.15)] transition-all group">
                {tool.logo ? (
                    <Image src={tool.logo} alt={tool.name} width={48} height={48} className="w-12 h-12 rounded-lg object-contain bg-white p-1" unoptimized={tool.logo?.startsWith('https://res.cloudinary.com')} />
                ) : (
                    <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center">
                        <Zap size={20} className="text-news-accent" />
                    </div>
                )}
                <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white truncate">{tool.name}</h4>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border font-bold uppercase ${isFree ? 'bg-news-accent/20 text-news-accentHover border-news-accent/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                            }`}>
                            {tool.pricing_model}
                        </span>
                    </div>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{tool.short_description}</p>
                </div>
                <a
                    href={`/tools/${tool.slug}`}
                    className="p-2 text-gray-500 hover:text-news-accent transition-colors"
                    onClick={(e) => {
                        // In a real SPA, this would use a router push. 
                        // We assume the parent handles navigation or this is a standard link.
                    }}
                >
                    <ArrowRight size={18} />
                </a>
            </div>
        );
    }

    return (
        <div className="my-8 bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-2xl overflow-hidden shadow-2xl hover:border-news-accent hover:shadow-[0_0_25px_rgba(43,212,195,0.2)] transition-all">
            <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                    {/* Logo & Pricing */}
                    <div className="flex flex-col items-center gap-4 w-full md:w-auto">
                        {tool.logo ? (
                            <Image src={tool.logo} alt={tool.name} width={96} height={96} className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-contain bg-white p-3 shadow-inner" unoptimized={tool.logo?.startsWith('https://res.cloudinary.com')} />
                        ) : (
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-zinc-800 flex items-center justify-center">
                                <Zap size={40} className="text-news-accent" />
                            </div>
                        )}
                        <div className="text-center">
                            <span className={`text-[10px] md:text-xs px-2.5 py-1 rounded-full border font-black uppercase tracking-widest ${isFree ? 'bg-news-accent/20 text-news-accentHover border-news-accent/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                }`}>
                                {tool.pricing_model}
                            </span>
                            {tool.starting_price && (
                                <p className="text-[10px] text-gray-500 font-bold mt-2 uppercase tracking-tighter">Starts at {tool.starting_price}</p>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-grow space-y-4">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-2xl md:text-3xl font-black text-white tracking-tighter">{tool.name}</h3>
                                {tool.ai_enabled && (
                                    <span className="flex items-center gap-1 text-[10px] bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold uppercase">
                                        <SparklesIcon /> AI Powered
                                    </span>
                                )}
                            </div>
                            <p className="text-gray-300 leading-relaxed">{tool.short_description}</p>
                        </div>

                        {/* Features */}
                        {tool.key_features && tool.key_features.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                                {tool.key_features.slice(0, 4).map((feature, i) => (
                                    <div key={i} className="flex items-center gap-2 text-sm text-gray-400">
                                        <Check size={14} className="text-news-accent flex-shrink-0" />
                                        <span className="truncate">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            {targetUrl && (
                                <a
                                    href={targetUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 bg-news-accent hover:bg-news-accentHover text-[#0B0F14] font-black py-3 px-6 rounded-xl text-center text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-news-accent/10"
                                >
                                    Visit Website <ExternalLink size={16} />
                                </a>
                            )}
                            <a
                                href={`/tools/${tool.slug}`}
                                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 px-6 rounded-xl text-center text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-white/5"
                            >
                                View Full Review <ArrowRight size={16} />
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer stripe */}
            <div className="bg-white/5 border-t border-white/5 px-6 py-3 flex justify-between items-center">
                <div className="flex gap-2">
                    {tool.category_tags.slice(0, 2).map((tag, i) => (
                        <span key={i} className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">#{tag.replace(/\s+/g, '')}</span>
                    ))}
                </div>
                <div className="flex items-center gap-1">
                    <span className="text-[10px] font-black text-white">{tool.rating_score || 'N/A'}</span>
                    <div className="flex">
                        {[...Array(5)].map((_, i) => (
                            <svg key={i} className={`w-2.5 h-2.5 ${i < Math.floor(tool.rating_score || 0) ? 'text-yellow-500' : 'text-zinc-700'}`} fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const SparklesIcon = () => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /><path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" /></svg>
);

export default ToolCard;
