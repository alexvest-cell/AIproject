'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronRight, Scale, List, GraduationCap, Rocket, Terminal, Megaphone, Palette, Building2, Building, Layers, Microscope } from 'lucide-react';
import { Stack } from '../types';

interface HeroProps {
    onReadFeatured?: () => void;
    onArticleClick?: (article: any) => void;
    featuredArticleOverride?: any;
    sidebarArticlesOverride?: any[];
    articles?: any[];
    onHubClick?: (hub: string, workflow?: string) => void;
    onStackClick?: (slug: string) => void;
}

const WORKFLOW_CARDS = [
    { label: 'Students',       icon: GraduationCap, href: '/ai-tools?workflow=students' },
    { label: 'Startups',       icon: Rocket,        href: '/ai-tools?workflow=startups' },
    { label: 'Developers',     icon: Terminal,      href: '/ai-tools?workflow=developers' },
    { label: 'Marketers',      icon: Megaphone,     href: '/ai-tools?workflow=marketers' },
    { label: 'Creators',       icon: Palette,       href: '/ai-tools?workflow=content-creators' },
    { label: 'Small Business', icon: Building2,     href: '/ai-tools?workflow=small-business' },
    { label: 'Researchers',    icon: Microscope,    href: '/ai-tools?workflow=researchers' },
    { label: 'Enterprise',     icon: Building,      href: '/ai-tools?pricing=enterprise' },
];

const Hero: React.FC<HeroProps> = ({ onHubClick, onStackClick }) => {
    const [stacks, setStacks] = useState<Stack[]>([]);
    const [stats, setStats] = useState({ tools: 0, comparisons: 0, articles: 0 });

    useEffect(() => {
        fetch('/api/stacks')
            .then(res => res.ok ? res.json() : [])
            .then(data => setStacks(data.slice(0, 6)))
            .catch(() => {});

        Promise.all([
            fetch('/api/tools').then(r => r.ok ? r.json() : []),
            fetch('/api/comparisons').then(r => r.ok ? r.json() : []),
            fetch('/api/articles').then(r => r.ok ? r.json() : []),
        ]).then(([tools, comparisons, articles]) => {
            setStats({
                tools: Array.isArray(tools) ? tools.length : 0,
                comparisons: Array.isArray(comparisons) ? comparisons.length : 0,
                articles: Array.isArray(articles) ? articles.length : 0,
            });
        }).catch(() => {});
    }, []);

    return (
        <section className="relative w-full bg-surface-base text-white pt-36 md:pt-40 pb-0 overflow-x-hidden">

            {/* Background grid pattern */}
            <div
                className="absolute inset-0 opacity-[0.04] pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, white 1px, transparent 0)',
                    backgroundSize: '36px 36px',
                }}
            />

            {/* Gradient fade from bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-surface-base to-transparent pointer-events-none z-10" />

            {/* Accent glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/4 w-full h-[1000px] pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(circle at center, rgba(43,212,195,0.1) 0%, transparent 60%)' }} />

            <div className="container mx-auto px-4 md:px-8 relative z-10">

                {/* ── Headline */}
                <div className="text-center max-w-4xl mx-auto mb-8">
                    <h1 className="text-4xl md:text-6xl xl:text-7xl font-black tracking-tighter leading-[0.95] mb-6 text-white">
                        Find the Right{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-news-accent to-news-accentHover animate-pulse">
                            Tool
                        </span>{' '}
                        for Your Workflow
                    </h1>
                    <p className="text-lg md:text-xl text-[#AEB6C2] leading-relaxed max-w-2xl mx-auto">
                        Navigate the fast-moving ecosystem of modern software tools. ToolCurrent helps you discover, compare, and evaluate platforms with structured rankings, deep reviews, and head-to-head comparisons.
                    </p>
                    <p className="text-sm text-news-accent font-bold mt-4 tracking-wide">
                        Independent research — never pay-to-rank.
                    </p>
                </div>

                {/* ── Primary CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                    <Link
                        href="/best-ai-tools"
                        className="flex items-center gap-2 bg-news-accent text-[#0B0F14] font-black px-8 py-4 rounded-xl text-sm uppercase tracking-widest hover:bg-news-accentHover transition-all transform hover:scale-[1.02] shadow-lg shadow-news-accent/20 w-full sm:w-auto justify-center"
                    >
                        <List size={18} /> Browse Best AI Tools
                    </Link>
                    <Link
                        href="/ai-tools"
                        className="flex items-center gap-2 bg-transparent border-2 border-news-accent text-news-accent font-black px-8 py-4 rounded-xl text-sm uppercase tracking-widest hover:bg-news-accent hover:text-[#0B0F14] transition-all transform hover:scale-[1.02] w-full sm:w-auto justify-center"
                    >
                        <Scale size={18} /> Explore AI Tools
                    </Link>
                </div>

                {/* ── Micro Platform Explanation */}
                <div className="text-center max-w-lg mx-auto mb-6">
                    <p className="text-[13px] md:text-sm font-medium text-news-muted leading-relaxed">
                        ToolCurrent tracks the evolving landscape of software tools — helping professionals stay ahead of the current and choose the right tools faster.
                    </p>
                </div>

                {/* ── Stats row */}
                <div className="hidden mb-16">
                    {[
                        { value: stats.tools,       label: 'Tools Analyzed'      },
                        { value: stats.comparisons, label: 'Direct Comparisons'  },
                        { value: stats.articles,    label: 'In-depth Reviews'    },
                    ].map((s, i) => (
                        <div key={i} className="text-center">
                            <div className="text-2xl md:text-3xl font-black text-white tracking-tight">
                                {s.value > 0 ? `${s.value}+` : '—'}
                            </div>
                            <div className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest font-bold mt-0.5">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* ── Explore by workflow */}
                <div className="mb-0 pb-16">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-news-accent mb-1">Discovery</p>
                            <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">Find Tools for Your Workflow</h2>
                        </div>
                        <Link
                            href="/ai-tools"
                            className="hidden sm:flex items-center gap-1 text-xs text-gray-500 hover:text-white transition-colors"
                        >
                            View all tools <ArrowRight size={12} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {WORKFLOW_CARDS.map((uc, i) => {
                            const IconComponent = uc.icon;
                            return (
                                <Link
                                    key={i}
                                    href={uc.href}
                                    className="group flex items-center justify-between p-4 rounded-xl border border-border-subtle bg-surface-card shadow-elevation hover:bg-surface-hover hover:shadow-elevation-hover hover:border-border-divider hover:-translate-y-0.5 transition-all text-left min-h-[56px]"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-surface-base border border-border-divider group-hover:border-news-accent/30 transition-colors flex-shrink-0">
                                            <IconComponent size={18} className="text-news-muted group-hover:text-news-accentHover transition-colors" />
                                        </div>
                                        <span className="text-sm font-bold text-news-text group-hover:text-white transition-colors">{uc.label}</span>
                                    </div>
                                    <ChevronRight size={14} className="text-news-muted group-hover:text-news-accentHover group-hover:translate-x-0.5 transition-all" />
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* ── Build a Complete Software Stack (hidden) */}
                {false && stacks.length > 0 && (
                    <div className="mb-0 pb-16">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-news-accent mb-1">Ecosystems</p>
                                <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">Build a Complete Software Stack</h2>
                                <p className="text-sm text-news-muted mt-2 max-w-2xl">Discover curated stacks of tools that work seamlessly together for specific workflows.</p>
                            </div>
                            <button
                                onClick={() => onHubClick?.('stacks')}
                                className="flex flex-shrink-0 items-center gap-1 text-xs text-news-accent hover:text-white transition-colors font-bold"
                            >
                                Explore All Stacks <ArrowRight size={12} />
                            </button>
                        </div>

                        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-x-auto pb-4 md:pb-0 scrollbar-hide snap-x -mx-4 px-4 md:mx-0 md:px-0">
                            {stacks.map(stack => (
                                <button
                                    key={stack.slug}
                                    onClick={() => onStackClick?.(stack.slug)}
                                    className="group text-left bg-surface-card border border-border-subtle hover:border-news-accent/50 rounded-2xl p-5 hover:bg-surface-hover hover:shadow-[0_0_20px_rgba(43,212,195,0.1)] transition-all min-w-[280px] md:min-w-0 snap-start flex flex-col h-full"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2.5 rounded-xl bg-news-accent/10 border border-news-accent/20 group-hover:border-news-accent/50 group-hover:bg-news-accent/20 transition-all flex-shrink-0">
                                            <Layers size={20} className="text-news-accent" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] uppercase font-bold tracking-widest text-news-muted block mb-0.5">{stack.workflow_category}</span>
                                            <h3 className="font-bold text-white group-hover:text-news-accent transition-colors leading-tight line-clamp-1">{stack.name}</h3>
                                        </div>
                                    </div>
                                    <p className="text-xs text-news-text mb-4 line-clamp-2 flex-grow">{stack.short_description}</p>
                                    <div className="mb-4">
                                        <p className="text-[9px] font-bold text-news-muted uppercase tracking-widest mb-2">Tools included:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {stack.tools?.slice(0, 4).map(toolSlug => (
                                                <div key={toolSlug} className="px-2 py-1 rounded bg-surface-base border border-border-subtle group-hover:border-white/10 text-[9px] font-bold text-news-text capitalize">
                                                    {toolSlug.replace(/-/g, ' ')}
                                                </div>
                                            ))}
                                            {stack.tools && stack.tools.length > 4 && (
                                                <div className="px-2 py-1 rounded bg-surface-base border border-border-subtle text-[9px] font-bold text-news-muted">
                                                    +{stack.tools.length - 4} more
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-border-divider/50 flex items-center justify-between mt-auto">
                                        <span className="text-[10px] text-news-accent font-bold uppercase tracking-tight">View Stack Details</span>
                                        <ArrowRight size={14} className="text-news-muted group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Hero;
