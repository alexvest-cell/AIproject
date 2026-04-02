'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { Comparison, Tool } from '../types';
import { ArrowRight, Trophy, Check, X, TrendingUp, Target, Star, Zap, Medal, ChevronDown } from 'lucide-react';
import { ArticleFAQ } from './article-layouts/SharedModules';
import { RelatedContent } from './RelatedContent';
import type { GeneratedComparison } from '../utils/compareEngine';
import { generateComparison } from '../utils/compareEngine';

const ALL_USE_CASES = ['Content Creation', 'Research', 'Coding', 'Automation', 'Lead Generation', 'Customer Support', 'Data Analysis', 'Design', 'Education', 'Personal Productivity', 'Marketing'];

interface ComparisonPageProps {
    slug: string;
    useCase?: string;
    onBack: () => void;
    onToolClick: (slug: string) => void;
    onUseCaseChange?: (uc: string) => void;
    // Server-prefetched data — skips client-side fetch when provided
    initialData?: Comparison;
}

// ── Shared primitives ──────────────────────────────────────────────────────────

// Teal pricing badges matching site design system
const PRICING_COLORS: Record<string, string> = {
    Free:       'bg-news-accent/15 text-news-accent border-news-accent/30',
    Freemium:   'bg-news-accent/10 text-news-accent border-news-accent/20',
    Paid:       'bg-surface-alt text-news-muted border-border-subtle',
    Enterprise: 'bg-orange-900/30 text-orange-400 border-orange-700/40',
    Trial:      'bg-yellow-900/30 text-yellow-400 border-yellow-700/40',
};

// Teal fill, dark track — no number at end (number shown separately with star icon)
const ScoreBar: React.FC<{ score: number }> = ({ score }) => {
    const pct = Math.min(100, Math.round((score / 10) * 100));
    return (
        <div className="flex-1 h-1.5 bg-surface-alt rounded-full overflow-hidden">
            <div className="h-full bg-news-accent rounded-full" style={{ width: `${pct}%` }} />
        </div>
    );
};

function renderCell(value: string, isWinner: boolean): React.ReactNode {
    const v = (value || '').trim().toLowerCase();
    if (v === 'yes' || v === '✓' || v === 'true')
        return <Check size={14} className={isWinner ? 'text-news-accent' : 'text-news-accent/50'} />;
    if (v === 'no' || v === '✗' || v === 'false')
        return <X size={14} className="text-red-500/60" />;
    return <span className={isWinner ? 'text-white font-medium' : 'text-news-text'}>{value || '—'}</span>;
}

const CapabilityIcon: React.FC<{ value?: string | null; bold?: boolean }> = ({ value, bold }) => {
    if (value === 'yes') return <span className="flex items-center gap-1"><Check size={13} className="text-news-accent flex-shrink-0" /><span className={bold ? 'text-white font-bold' : 'text-white'}>Yes</span></span>;
    if (value === 'no')  return <span className="flex items-center gap-1"><X size={13} className="text-news-muted flex-shrink-0" /><span className="text-news-muted">No</span></span>;
    if (value === 'partial') return <span className="flex items-center gap-1"><span className="text-yellow-500 text-sm leading-none flex-shrink-0">◑</span><span className="text-news-muted">Partial</span></span>;
    return <span className="text-news-muted">—</span>;
};

function buildTableRows(
    toolsArr: Tool[],
    winnerSlug: string,
    ratingTipOpen: boolean,
    setRatingTipOpen: React.Dispatch<React.SetStateAction<boolean>>,
    activeUseCase: string,
    colPad = 'px-5 py-3'
): React.ReactNode {
    const tipText = activeUseCase
        ? `Overall tool rating across all use cases — see ${activeUseCase} score above for context-specific scoring`
        : 'Overall tool rating across all use cases — see comparison scores above for context-specific scoring';
    const tr = 'border-b border-border-subtle bg-surface-base';
    const th = `${colPad} text-news-muted font-medium text-xs uppercase tracking-wide`;
    const enumRows = [
        { key: 'image_generation',   label: 'Image Generation' },
        { key: 'memory_persistence', label: 'Memory Persistence' },
        { key: 'computer_use',       label: 'Computer Use' },
    ] as const;
    return (
        <>
            <tr className={tr}>
                <td className={th}>
                    <div className="flex items-center gap-1.5">
                        <span>General Score</span>
                        <div className="relative">
                            <button onMouseEnter={() => setRatingTipOpen(true)} onMouseLeave={() => setRatingTipOpen(false)}
                                onClick={() => setRatingTipOpen(v => !v)}
                                className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-border-subtle text-news-muted/60 hover:text-news-muted text-[9px] font-bold leading-none flex-shrink-0"
                                aria-label="About this score">i</button>
                            {ratingTipOpen && <div className="absolute left-0 top-5 z-20 w-64 bg-surface-card border border-border-subtle rounded-xl px-3 py-2 text-[11px] text-news-muted leading-relaxed shadow-elevation normal-case tracking-normal font-normal">{tipText}</div>}
                        </div>
                    </div>
                </td>
                {toolsArr.map(t => <td key={t.slug} className={colPad}>{renderCell(String((t as any).rating_score ?? '—'), t.slug === winnerSlug)}</td>)}
            </tr>
            <tr className={tr}><td className={th}>Pricing Model</td>{toolsArr.map(t => <td key={t.slug} className={colPad}>{renderCell(t.pricing_model || '—', t.slug === winnerSlug)}</td>)}</tr>
            <tr className={tr}>
                <td className={th}>Free Tier</td>
                {toolsArr.map(t => {
                    const val = (t as any).free_tier as string | null | undefined;
                    if (!val) return <td key={t.slug} className={colPad}><span className="text-news-muted">—</span></td>;
                    if (val.toLowerCase() === 'none') return <td key={t.slug} className={`${colPad} text-xs text-news-muted`}>Not available</td>;
                    return <td key={t.slug} className={`${colPad} text-xs text-news-text leading-snug max-w-[200px]`}>{val}</td>;
                })}
            </tr>
            <tr className={tr}><td className={th}>Context Window</td>{toolsArr.map(t => <td key={t.slug} className={colPad}>{renderCell((t as any).context_window || 'N/A', t.slug === winnerSlug)}</td>)}</tr>
            <tr className={tr}><td className={th}>API Pricing</td>{toolsArr.map(t => <td key={t.slug} className={`${colPad} text-xs text-news-text max-w-[180px]`}>{(t as any).api_pricing || 'N/A'}</td>)}</tr>
            {enumRows.map(({ key, label }) => (
                <tr key={key} className={tr}>
                    <td className={th}>{label}</td>
                    {toolsArr.map(t => {
                        const val = (t as any)[key] as string | undefined;
                        const bold = t.slug === winnerSlug && val === 'yes' && toolsArr.some(o => o.slug !== t.slug && (o as any)[key] !== 'yes');
                        return <td key={t.slug} className={colPad}><CapabilityIcon value={val} bold={bold} /></td>;
                    })}
                </tr>
            ))}
            <tr className={tr}><td className={th}>Native Integrations</td>{toolsArr.map(t => <td key={t.slug} className={colPad}>{renderCell((t as any).max_integrations || 'N/A', t.slug === winnerSlug)}</td>)}</tr>
            <tr className={tr}><td className={th}>Platforms</td>{toolsArr.map(t => <td key={t.slug} className={colPad}>{renderCell((t.supported_platforms || []).join(', ') || '—', t.slug === winnerSlug)}</td>)}</tr>
            <tr className={tr}>
                <td className={th}>API Available</td>
                {toolsArr.map(t => {
                    const val = (t as any).api_available as string | undefined;
                    const bold = t.slug === winnerSlug && val === 'yes' && toolsArr.some(o => o.slug !== t.slug && (o as any).api_available !== 'yes');
                    return <td key={t.slug} className={colPad}><CapabilityIcon value={val} bold={bold} /></td>;
                })}
            </tr>
        </>
    );
}

// Two-line section header: small teal label + large white title (homepage pattern)
const Sec: React.FC<{ label: string; title: string; children: React.ReactNode; className?: string }> = ({
    label, title, children, className = '',
}) => (
    <section className={`mb-12 ${className}`}>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-news-accent mb-1">{label}</p>
        <h2 className="text-xl md:text-2xl font-black tracking-tight text-white mb-5">{title}</h2>
        {children}
    </section>
);

const ToolLogo: React.FC<{ tool: Tool; size?: number }> = ({ tool, size = 8 }) => (
    tool.logo
        ? <div className={`w-${size} h-${size} rounded-xl bg-white border border-border-subtle overflow-hidden flex-shrink-0`}>
              <img src={tool.logo} alt={tool.name} className="w-full h-full object-contain p-1.5" loading="lazy" />
          </div>
        : null
);

// Score display with star — single canonical display
const ScoreBadge: React.FC<{ score: number; accent?: boolean }> = ({ score, accent = false }) => (
    <div className="flex items-center gap-1.5">
        <Star size={11} className="text-news-accent flex-shrink-0" fill="currentColor" />
        <span className={`text-sm font-bold tabular-nums ${accent ? 'text-news-accent' : 'text-white'}`}>
            {score.toFixed(1)}/10
        </span>
    </div>
);

// ── Plan data helpers ──────────────────────────────────────────────────────────

type PriceBand = 'free' | 'entry' | 'mid' | 'premium' | 'enterprise';

const PRICE_BANDS: { id: PriceBand; label: string; range: string }[] = [
    { id: 'free',       label: 'Free',       range: '$0'            },
    { id: 'entry',      label: 'Entry',      range: '$1–$25/mo'     },
    { id: 'mid',        label: 'Mid',        range: '$26–$100/mo'   },
    { id: 'premium',    label: 'Premium',    range: '$101–$250/mo'  },
    { id: 'enterprise', label: 'Enterprise', range: 'Custom'        },
];

interface PlanData {
    name: string;
    price: string;
    priceMonthly: number | null;
    isEnterprise: boolean;
    models: string;
    limits: string;
}

function parsePlanMap(tool: Tool): Record<string, { models: string; limits: string }> {
    const mvbp = (tool as any).model_version_by_plan as string | null | undefined;
    if (!mvbp) return {};
    const map: Record<string, { models: string; limits: string }> = {};
    mvbp.split('\n').filter((l: string) => l.trim()).forEach((line: string) => {
        const ci = line.indexOf(':');
        const plan = ci > 0 ? line.slice(0, ci).trim() : line.trim();
        map[plan] = { models: ci > 0 ? line.slice(ci + 1).trim() : '', limits: '' };
    });
    const rl = (tool as any).rate_limits as string | null | undefined;
    if (rl) {
        rl.split('\n').filter((l: string) => l.trim()).forEach((line: string) => {
            const ci = line.indexOf(':');
            if (ci > 0) {
                // Strip embedded price suffix e.g. "Go ($8/mo)" → "Go"
                const planRaw = line.slice(0, ci).trim().replace(/\s*\([^)]+\)\s*$/, '').trim();
                const limit = line.slice(ci + 1).trim();
                const key = Object.keys(map).find(k => k.toLowerCase() === planRaw.toLowerCase());
                if (key) map[key].limits = limit.toLowerCase().includes('not publicly disclosed') ? '' : limit;
            }
        });
    }
    return map;
}

// Build { planNameLower → priceString }
// Priority: price_by_plan field → prices embedded in rate_limits plan names → legacy starting_price compact format
function parsePriceMap(tool: Tool): Record<string, string> {
    const pbp = (tool as any).price_by_plan as string | null | undefined;
    if (pbp) {
        const map: Record<string, string> = {};
        pbp.split('\n').filter((l: string) => l.trim()).forEach((line: string) => {
            const ci = line.indexOf(':');
            if (ci > 0) map[line.slice(0, ci).trim().toLowerCase()] = line.slice(ci + 1).trim();
        });
        return map;
    }
    const rl = (tool as any).rate_limits as string | null | undefined;
    if (rl) {
        const map: Record<string, string> = {};
        rl.split('\n').filter((l: string) => l.trim()).forEach((line: string) => {
            const ci = line.indexOf(':');
            if (ci < 0) return;
            const rawKey = line.slice(0, ci).trim();
            const priceMatch = rawKey.match(/\(([^)]+)\)\s*$/);
            if (priceMatch) map[rawKey.replace(/\s*\([^)]+\)\s*$/, '').trim().toLowerCase()] = priceMatch[1];
        });
        if (Object.keys(map).length) return map;
    }
    // Legacy fallback: "$0 (Go: $8/mo; Plus: $20/mo)" compact format in starting_price
    const sp = (tool as any).starting_price as string | null | undefined;
    if (!sp) return {};
    const match = sp.match(/^([^(]+)\(([^)]+)\)$/);
    if (!match) return {};
    const base = match[1].trim();
    const map: Record<string, string> = { free: base };
    match[2].split(';').forEach(s => {
        const ci = s.indexOf(':');
        if (ci < 0) return;
        map[s.slice(0, ci).trim().toLowerCase()] = s.slice(ci + 1).trim();
    });
    return map;
}

function extractMonthlyPrice(priceStr: string): number | null {
    if (!priceStr) return null;
    const lower = priceStr.toLowerCase();
    if (lower.includes('custom') || lower.includes('contact') || lower.includes('not publicly')) return null;
    if (lower === '$0' || lower === '$0/mo' || lower === 'free') return 0;
    const m = priceStr.match(/\$(\d+(?:\.\d+)?)/);
    return m ? parseFloat(m[1]) : null;
}

function priceToBand(price: number | null, name: string): PriceBand {
    const lower = name.toLowerCase();
    if (lower === 'enterprise' || lower.includes('enterprise')) return 'enterprise';
    if (price === null) return 'enterprise';
    if (price === 0) return 'free';
    if (price <= 25) return 'entry';
    if (price <= 100) return 'mid';
    if (price <= 250) return 'premium';
    return 'enterprise';
}

function buildBandData(tool: Tool): Record<PriceBand, PlanData[]> {
    const planMap = parsePlanMap(tool);
    const priceMap = parsePriceMap(tool);
    const result: Record<PriceBand, PlanData[]> = { free: [], entry: [], mid: [], premium: [], enterprise: [] };
    for (const [planName, { models, limits }] of Object.entries(planMap)) {
        const lower = planName.toLowerCase();
        const priceStr = priceMap[lower] || '';
        const isEnterprise =
            lower === 'enterprise' || lower.includes('enterprise') ||
            priceStr.toLowerCase().includes('custom') ||
            priceStr.toLowerCase().includes('not publicly');
        const priceNum = isEnterprise ? null : extractMonthlyPrice(priceStr);
        const band = priceToBand(priceNum, planName);
        result[band].push({ name: planName, price: priceStr, priceMonthly: priceNum, isEnterprise, models, limits });
    }
    // Sort each band highest price first so the primary (plans[0]) is the highest-featured
    for (const band of Object.keys(result) as PriceBand[]) {
        result[band].sort((a, b) => (b.priceMonthly ?? -1) - (a.priceMonthly ?? -1));
    }
    return result;
}

const PlanComparisonTable: React.FC<{ tools: Tool[] }> = ({ tools }) => {
    const [expandedBands, setExpandedBands] = useState<Set<PriceBand>>(new Set(['free', 'entry']));
    const [expandedCells, setExpandedCells] = useState<Set<string>>(new Set());

    const bandDataPerTool = useMemo(() => tools.map(t => buildBandData(t)), [tools]);

    // Cross-category: different category_primary values
    const crossCategory = useMemo(() => {
        const cats = new Set(tools.map(t => (t as any).category_primary as string | undefined).filter(Boolean));
        return cats.size > 1;
    }, [tools]);

    // 60% empty-cell threshold — only trigger stacked layout for cross-category comparisons
    const useBandTable = useMemo(() => {
        if (!crossCategory) return true;
        const totalCells = PRICE_BANDS.length * tools.length;
        const emptyCells = PRICE_BANDS.reduce(
            (acc, band) => acc + tools.filter((_, ti) => bandDataPerTool[ti][band.id].length === 0).length,
            0
        );
        return emptyCells / totalCells <= 0.6;
    }, [crossCategory, tools, bandDataPerTool]);

    const toggleBand = (band: PriceBand) => setExpandedBands(prev => {
        const next = new Set(prev);
        next.has(band) ? next.delete(band) : next.add(band);
        return next;
    });

    const toggleCell = (key: string) => setExpandedCells(prev => {
        const next = new Set(prev);
        next.has(key) ? next.delete(key) : next.add(key);
        return next;
    });

    // Renders a single plan's content block
    const PlanBlock: React.FC<{ plan: PlanData; tool: Tool; dimmed?: boolean }> = ({ plan, tool, dimmed }) => (
        <div className={dimmed ? 'opacity-75' : ''}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-news-accent mb-0.5">{plan.name}</p>
            {plan.isEnterprise ? (
                <>
                    <p className="text-news-muted italic text-xs">Custom</p>
                    {tool.website_url && (
                        <a href={tool.website_url} target="_blank" rel="noopener noreferrer"
                            className="text-[10px] text-news-accent hover:underline">Contact sales →</a>
                    )}
                </>
            ) : plan.price ? (
                <p className="text-white font-medium text-xs">{plan.price}</p>
            ) : tool.website_url ? (
                <a href={tool.website_url} target="_blank" rel="noopener noreferrer"
                    className="text-[10px] text-news-accent hover:underline">See pricing →</a>
            ) : null}
            {plan.models && <p className="text-news-text text-xs leading-snug mt-1">{plan.models}</p>}
            {plan.limits && <p className="text-news-muted text-[11px] leading-snug mt-0.5">{plan.limits}</p>}
        </div>
    );

    // Renders a table cell for a given band + tool
    const BandCell: React.FC<{ plans: PlanData[]; tool: Tool; band: PriceBand; cellKey: string }> = ({ plans, tool, band, cellKey }) => {
        if (plans.length === 0) return <td className="px-4 py-4 text-news-muted align-top">—</td>;
        const primary = plans[0];
        const extras = plans.slice(1);
        const isExpanded = expandedCells.has(cellKey);
        return (
            <td className="px-4 py-4 align-top">
                <PlanBlock plan={primary} tool={tool} />
                {extras.length > 0 && (
                    <div className="mt-2">
                        <button onClick={() => toggleCell(cellKey)}
                            className="text-[10px] text-news-accent hover:underline flex items-center gap-0.5">
                            {isExpanded ? '− Hide' : `+ ${extras.length} more plan${extras.length > 1 ? 's' : ''}`}
                        </button>
                        {isExpanded && (
                            <div className="mt-2 space-y-3">
                                {extras.map((plan, i) => (
                                    <div key={i} className="pt-2 border-t border-border-subtle">
                                        <PlanBlock plan={plan} tool={tool} dimmed />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </td>
        );
    };

    // ── Cross-category stacked layout ─────────────────────────────────────────
    if (!useBandTable) {
        return (
            <div className="space-y-6">
                <p className="text-xs text-news-muted italic border border-border-subtle rounded-lg px-4 py-3">
                    These tools have different pricing structures — plans are shown individually.
                </p>
                {tools.map(tool => {
                    const planMap = parsePlanMap(tool);
                    const priceMap = parsePriceMap(tool);
                    const allPlans = Object.entries(planMap);
                    if (allPlans.length === 0) return (
                        <div key={tool.slug} className="rounded-xl border border-border-subtle p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <ToolLogo tool={tool} size={6} />
                                <span className="font-bold text-white text-sm">{tool.name}</span>
                            </div>
                            <p className="text-xs text-news-muted">Plan details not yet available.</p>
                        </div>
                    );
                    return (
                        <div key={tool.slug} className="rounded-xl border border-border-subtle overflow-hidden">
                            <div className="flex items-center gap-2 bg-surface-card px-4 py-3 border-b border-border-subtle">
                                <ToolLogo tool={tool} size={6} />
                                <span className="font-bold text-white text-sm">{tool.name}</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs min-w-[400px]">
                                    <thead>
                                        <tr className="bg-surface-card/60 border-b border-border-subtle">
                                            {['Plan', 'Price', 'Model', 'Usage Limits'].map(h => (
                                                <th key={h} className="text-left px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-news-accent">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allPlans.map(([planName, { models, limits }], i) => {
                                            const lower = planName.toLowerCase();
                                            const priceStr = priceMap[lower] || '';
                                            const isEnt = lower === 'enterprise' || lower.includes('enterprise') ||
                                                priceStr.toLowerCase().includes('custom') || priceStr.toLowerCase().includes('not publicly');
                                            const isFree = lower === 'free';
                                            return (
                                                <tr key={i} className={`border-b border-border-subtle last:border-0 ${i % 2 === 0 ? 'bg-surface-base' : 'bg-surface-card/40'} ${isFree ? 'border-l-2 border-news-accent' : ''}`}>
                                                    <td className="px-4 py-3 font-medium text-white whitespace-nowrap align-top">{planName}</td>
                                                    <td className="px-4 py-3 align-top">
                                                        {isEnt
                                                            ? <span className="text-news-muted italic">Custom</span>
                                                            : priceStr
                                                                ? <span className="text-white font-medium">{priceStr}</span>
                                                                : tool.website_url
                                                                    ? <a href={tool.website_url} target="_blank" rel="noopener noreferrer" className="text-news-accent hover:underline">See pricing →</a>
                                                                    : <span className="text-news-muted">—</span>
                                                        }
                                                    </td>
                                                    <td className="px-4 py-3 text-news-text leading-snug align-top">{models || '—'}</td>
                                                    <td className="px-4 py-3 text-news-muted leading-snug align-top">{limits || '—'}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    // ── Unified price-band table ───────────────────────────────────────────────
    return (
        <>
            {/* Desktop */}
            <div className="hidden md:block rounded-xl border border-border-subtle overflow-x-auto">
                <table className="w-full text-xs min-w-[500px]">
                    <thead>
                        <tr className="bg-surface-card border-b border-border-subtle">
                            <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-news-accent w-36">Plan</th>
                            {tools.map(tool => (
                                <th key={tool.slug} className="text-left px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <ToolLogo tool={tool} size={5} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-news-accent">{tool.name}</span>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {PRICE_BANDS.map((band, i) => (
                            <tr key={band.id} className={`border-b border-border-subtle last:border-0 ${i % 2 === 0 ? 'bg-surface-base' : 'bg-surface-card/40'} ${band.id === 'free' ? 'border-l-2 border-news-accent' : ''}`}>
                                <td className="px-4 py-4 align-top whitespace-nowrap">
                                    <p className="font-bold text-white text-xs">{band.label}</p>
                                    <p className="text-[10px] text-news-muted mt-0.5">{band.range}</p>
                                </td>
                                {tools.map((tool, ti) => (
                                    <BandCell
                                        key={tool.slug}
                                        plans={bandDataPerTool[ti][band.id]}
                                        tool={tool}
                                        band={band.id}
                                        cellKey={`${tool.slug}-${band.id}`}
                                    />
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile accordion */}
            <div className="md:hidden space-y-2">
                {PRICE_BANDS.map(band => {
                    const isExpanded = expandedBands.has(band.id);
                    return (
                        <div key={band.id} className={`rounded-xl border overflow-hidden ${band.id === 'free' ? 'border-news-accent/40' : 'border-border-subtle'}`}>
                            <button onClick={() => toggleBand(band.id)}
                                className="w-full flex items-center justify-between px-4 py-3 bg-surface-card text-left">
                                <div className="flex items-baseline gap-2">
                                    <span className="font-bold text-white text-sm">{band.label}</span>
                                    <span className="text-[10px] text-news-muted">{band.range}</span>
                                </div>
                                <ChevronDown size={14} className={`text-news-muted transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>
                            {isExpanded && (
                                <div className="divide-y divide-border-subtle bg-surface-base">
                                    {tools.map((tool, ti) => {
                                        const plans = bandDataPerTool[ti][band.id];
                                        const primary = plans[0];
                                        const extras = plans.slice(1);
                                        const cellKey = `mob-${tool.slug}-${band.id}`;
                                        const isCellExp = expandedCells.has(cellKey);
                                        return (
                                            <div key={tool.slug} className="px-4 py-3">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <ToolLogo tool={tool} size={5} />
                                                    <span className="text-xs font-bold text-white">{tool.name}</span>
                                                </div>
                                                {!primary ? (
                                                    <p className="text-news-muted text-xs pl-1">—</p>
                                                ) : (
                                                    <div className="pl-1">
                                                        <PlanBlock plan={primary} tool={tool} />
                                                        {extras.length > 0 && (
                                                            <div className="mt-2">
                                                                <button onClick={() => toggleCell(cellKey)}
                                                                    className="text-[10px] text-news-accent hover:underline">
                                                                    {isCellExp ? '− Hide' : `+ ${extras.length} more plan${extras.length > 1 ? 's' : ''}`}
                                                                </button>
                                                                {isCellExp && (
                                                                    <div className="mt-2 space-y-3">
                                                                        {extras.map((plan, ei) => (
                                                                            <div key={ei} className="pt-2 border-t border-border-subtle">
                                                                                <PlanBlock plan={plan} tool={tool} dimmed />
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </>
    );
};

// ── Use-case score helpers ─────────────────────────────────────────────────────
// Option A: numeric "X/10" in use_case_breakdown text → use it.
// Option B: no numeric score → fall back to rating_score.
// DATA GAP NOTE: add "X.X/10" to breakdown text entries per use case to enable
// genuine use-case-specific winner determination different from the overall ranking.

function getUCScoreResult(tool: Tool, useCase: string): { score: number; usedFallback: boolean } {
    if (!useCase) return { score: (tool as any).rating_score ?? 0, usedFallback: false };
    // Check structured use_case_scores array first
    const ucScores: Array<{ use_case: string; score: number | null }> = (tool as any).use_case_scores || [];
    const entry = ucScores.find(s => s.use_case.toLowerCase() === useCase.toLowerCase());
    if (entry && entry.score != null) return { score: Math.min(9.9, Math.max(1.0, entry.score)), usedFallback: false };
    // Fall back to use_case_breakdown text with embedded X/10
    const breakdown = (tool as any).use_case_breakdown as Record<string, string> | undefined;
    if (breakdown) {
        const key = Object.keys(breakdown).find(k => k.toLowerCase() === useCase.toLowerCase());
        if (key) {
            const m = (breakdown[key] || '').match(/(\d+(?:\.\d+)?)\s*\/\s*10/);
            if (m) return { score: Math.min(9.9, Math.max(1.0, parseFloat(m[1]))), usedFallback: false };
        }
    }
    return { score: (tool as any).rating_score ?? 0, usedFallback: true };
}

function toolDisplayScore(tool: Tool, useCase: string): number {
    if (!useCase) return (tool as any).rating_score ?? 0;
    return getUCScoreResult(tool, useCase).score;
}

function funcBreaker(tool: Tool): number {
    return (tool as any).rating_breakdown?.functionality ?? (tool as any).rating_breakdown?.Features ?? 0;
}

function determineWinner(candidates: Tool[], useCase: string): Tool {
    return candidates.reduce((best, t) => {
        const sB = toolDisplayScore(best, useCase);
        const sT = toolDisplayScore(t, useCase);
        if (sT > sB) return t;
        if (sT === sB && funcBreaker(t) > funcBreaker(best)) return t;
        return best;
    });
}

// ══════════════════════════════════════════════════════════════════════════════
// 1v1 LAYOUT — Decision engine
// ══════════════════════════════════════════════════════════════════════════════

const Comparison1v1: React.FC<{
    data: Comparison; tools: [Tool, Tool]; gen: GeneratedComparison;
    onToolClick: (s: string) => void; activeUseCase: string;
    availableUseCases?: string[]; onUseCaseChange?: (uc: string) => void;
}> = ({ data, tools, gen, onToolClick, activeUseCase, availableUseCases, onUseCaseChange }) => {
    const [tA, tB] = tools;
    // Winner determined client-side: UC breakdown score (Option A) or rating_score (Option B fallback)
    const winner = determineWinner(tools, activeUseCase);
    const other = winner.slug === tA.slug ? tB : tA;
    const verdictSummary = (() => {
        const s = gen.quick_verdict.summary || '';
        if (s.toLowerCase().startsWith(winner.name.toLowerCase())) return s;
        return activeUseCase
            ? `${winner.name} edges out ${other.name} in our analysis for ${activeUseCase}.`
            : `${winner.name} scores higher than ${other.name} overall.`;
    })();
    const [ratingTipOpen, setRatingTipOpen] = React.useState(false);

    // Returns the context-aware description text for a hero card.
    function getCardText(tool: Tool): string {
        const ucScores: Array<{ use_case: string; score: number | null; description: string }> = (tool as any).use_case_scores || [];
        const ucBreakdown = (tool as any).use_case_breakdown;
        const pros: string[] = (tool as any).pros || [];
        if (activeUseCase) {
            const ucEntry = ucScores.find(s => s.use_case.toLowerCase() === activeUseCase.toLowerCase());
            if (ucEntry?.description) return ucEntry.description;
            if (ucBreakdown && typeof ucBreakdown === 'object' && !Array.isArray(ucBreakdown)) {
                const key = Object.keys(ucBreakdown).find(k => k.toLowerCase() === activeUseCase.toLowerCase());
                if (key && ucBreakdown[key]) return (ucBreakdown[key] as string).replace(/^\d+(?:\.\d+)?\/10\s*[—–-]\s*/, '');
            }
            if (typeof ucBreakdown === 'string' && ucBreakdown) {
                for (const line of ucBreakdown.split(/[\n;]/)) {
                    if (line.toLowerCase().includes(activeUseCase.toLowerCase())) return line.trim();
                }
            }
            const words = activeUseCase.toLowerCase().split(/\s+/).filter(w => w.length > 2);
            const matched = pros.find(p => words.some(w => p.toLowerCase().includes(w)));
            return matched || pros[0] || '';
        }
        return pros.slice(0, 2).join(' · ');
    }

    return (
        <>
            {/* ── Quick Verdict ──────────────────────────────────── */}
            <Sec label="VERDICT" title="Quick Verdict">
                {/* Winner callout — teal left border, no background fill */}
                <div className="border-l-4 border-news-accent bg-surface-card rounded-r-2xl px-6 py-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <ToolLogo tool={winner} size={12} />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <Trophy size={13} className="text-news-accent" />
                            <span className="text-xs font-bold uppercase tracking-widest text-news-accent">Our Pick</span>
                        </div>
                        <p className="font-black text-xl mb-1">
                            <span className="text-news-accent">{winner.name}</span>
                        </p>
                        <p className="text-news-muted text-sm leading-relaxed">{verdictSummary}</p>
                    </div>
                    <button onClick={() => onToolClick(winner.slug)}
                        className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 bg-news-accent hover:bg-news-accentHover text-[#0B0F14] font-bold text-sm rounded-xl transition-colors">
                        View Tool <ArrowRight size={13} />
                    </button>
                </div>

                {/* Tool cards */}
                <div className="grid md:grid-cols-2 gap-4">
                    {tools.map(tool => {
                        const scoreResult = activeUseCase ? getUCScoreResult(tool, activeUseCase) : null;
                        const score = scoreResult ? scoreResult.score : ((tool as any).rating_score ?? 0);
                        const isWinner = tool.slug === winner.slug;
                        const cardText = getCardText(tool);
                        return (
                            <button key={tool.slug} onClick={() => onToolClick(tool.slug)}
                                className={`relative text-left rounded-2xl p-5 transition-all group ${
                                    isWinner
                                        ? 'bg-surface-card border border-news-accent/70 hover:border-news-accent'
                                        : 'bg-surface-card border border-border-subtle hover:border-news-accent/40'
                                }`}>
                                {isWinner && (
                                    <div className="absolute -top-3 left-4 flex items-center gap-1 bg-news-accent text-[#0B0F14] text-xs font-bold px-2.5 py-0.5 rounded-full">
                                        <Trophy size={10} /> Winner
                                    </div>
                                )}
                                <div className="flex items-center gap-3 mb-3">
                                    <ToolLogo tool={tool} size={10} />
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-white group-hover:text-news-accent transition-colors truncate">{tool.name}</h3>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${PRICING_COLORS[tool.pricing_model] || 'bg-surface-alt text-news-muted border-border-subtle'}`}>
                                            {tool.pricing_model}
                                        </span>
                                    </div>
                                </div>
                                {isWinner && (data as any).why_it_wins_override && (
                                    <div className="mb-4">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-news-accent mb-1">Why it wins:</p>
                                        <p className="text-news-muted text-sm leading-relaxed"
                                            style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {(data as any).why_it_wins_override}
                                        </p>
                                    </div>
                                )}
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] text-news-muted/70 font-medium">
                                        {activeUseCase
                                            ? (scoreResult?.usedFallback ? `Overall score (no ${activeUseCase} data)` : `${activeUseCase} score`)
                                            : 'Overall score'}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <ScoreBadge score={score} accent={isWinner} />
                                        <ScoreBar score={score} />
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </Sec>

            {/* ── Feature Comparison A vs B ──────────────────────── */}
            <Sec label="FEATURES" title="Feature Comparison">
                <div className="overflow-x-auto rounded-xl border border-border-subtle">
                    <table className="w-full text-sm min-w-[400px]">
                        <thead>
                            <tr className="bg-surface-card border-b border-border-subtle">
                                <th className="text-left px-5 py-3 text-news-muted font-bold uppercase tracking-widest text-xs w-1/3">Feature</th>
                                {tools.map(t => {
                                    const isWinner = winner.slug === t.slug;
                                    return (
                                        <th key={t.slug} className={`text-left px-5 py-3 font-bold ${isWinner ? 'text-news-accent border-t-2 border-news-accent/60' : 'text-white'}`}>
                                            <div className="flex items-center gap-1.5">
                                                {t.logo && <img src={t.logo} alt={t.name} className="w-4 h-4 rounded object-contain" />}
                                                {t.name}
                                                {isWinner && <Trophy size={11} className="text-news-accent" />}
                                            </div>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {buildTableRows(tools, winner.slug, ratingTipOpen, setRatingTipOpen, activeUseCase)}
                        </tbody>
                    </table>
                </div>
            </Sec>

            {/* ── Pricing Comparison A vs B ──────────────────────── */}
            {tools.some(t => t.model_version_by_plan) ? (
                <Sec label="PRICING" title="Plans">
                    <PlanComparisonTable tools={tools} />
                </Sec>
            ) : (
                <Sec label="PRICING" title="Pricing Breakdown">
                    <div className="grid md:grid-cols-2 gap-4">
                        {tools.map(tool => {
                            const p = gen.pricing[tool.slug];
                            const isWinner = tool.slug === gen.quick_verdict.winner_slug;
                            return (
                                <div key={tool.slug} className={`rounded-xl p-5 border ${isWinner ? 'bg-surface-card border-news-accent/50' : 'bg-surface-card border-border-subtle'}`}>
                                    <div className="flex items-center gap-2 mb-4">
                                        <ToolLogo tool={tool} size={8} />
                                        <span className="font-bold text-white">{tool.name}</span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-news-muted">Model</span>
                                            <span className={`font-bold px-2 py-0.5 rounded-full border text-xs ${PRICING_COLORS[p?.model] || 'bg-surface-alt text-news-muted border-border-subtle'}`}>{p?.model || '—'}</span>
                                        </div>
                                        <div className="text-sm pt-1">
                                            <span className="text-news-muted text-xs">Starting at</span>
                                            <p className="text-white font-bold mt-0.5 leading-snug">{p?.starting_price || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Sec>
            )}

            {/* ── Use Case Section ──────────────────────────────── */}
            {activeUseCase ? (
                <Sec label="USE CASE" title={`How Each Tool Performs for ${activeUseCase}`}>
                    <div className="grid md:grid-cols-2 gap-4">
                        {tools.map(tool => {
                            const ucScoresArr: Array<{ use_case: string; score: number | null; description: string }> = (tool as any).use_case_scores || [];
                            const ucEntry = ucScoresArr.find(s => s.use_case.toLowerCase() === activeUseCase.toLowerCase());
                            const ucBreakdown = (tool as any).use_case_breakdown as Record<string, string> | undefined;
                            const rawKey = ucBreakdown ? Object.keys(ucBreakdown).find(k => k.toLowerCase() === activeUseCase.toLowerCase()) : undefined;
                            const rawText = rawKey ? ucBreakdown![rawKey] : undefined;
                            const displayScore: number | null = ucEntry?.score ?? (() => { const m = rawText?.match(/(\d+(?:\.\d+)?)\s*\/\s*10/); return m ? parseFloat(m[1]) : null; })();
                            const displayText = ucEntry?.description || (rawText ? rawText.replace(/^\d+(?:\.\d+)?\/10\s*[—–-]\s*/, '') : null);
                            const isWinner = tool.slug === gen.quick_verdict.winner_slug;
                            return (
                                <div key={tool.slug} className={`rounded-xl p-5 border ${isWinner ? 'bg-surface-card border-news-accent/50' : 'bg-surface-card border-border-subtle'}`}>
                                    <div className="flex items-center justify-between gap-2 mb-3">
                                        <div className="flex items-center gap-2">
                                            <ToolLogo tool={tool} size={8} />
                                            <span className="font-bold text-white">{tool.name}</span>
                                        </div>
                                        <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                                            <span className="text-[10px] text-news-muted/70">{activeUseCase} score</span>
                                            <span className="text-sm font-bold text-news-accent">{displayScore != null ? `${displayScore}/10` : 'N/A'}</span>
                                        </div>
                                    </div>
                                    {displayText ? (
                                        <p className="text-sm text-news-text leading-relaxed">{displayText}</p>
                                    ) : (
                                        <p className="text-sm text-news-muted">
                                            Detailed breakdown for {activeUseCase} not yet available —{' '}
                                            <a href={`/tools/${tool.slug}`} className="text-news-accent hover:underline">view full tool profile →</a>
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </Sec>
            ) : (
                <Sec label="USE CASE" title="Filter by Use Case">
                    {availableUseCases && availableUseCases.length > 0 ? (
                        <>
                            <p className="text-sm text-news-muted mb-4">Select a use case to see focused scores, filtered strengths, and a targeted recommendation.</p>
                            <div className="flex flex-wrap gap-2">
                                {availableUseCases.map(uc => (
                                    <button key={uc} onClick={() => onUseCaseChange?.(uc)}
                                        className="text-sm px-4 py-2 rounded-full border border-border-subtle bg-surface-card text-news-muted hover:border-news-accent/50 hover:text-news-accent transition-colors">
                                        {uc}
                                    </button>
                                ))}
                            </div>
                        </>
                    ) : (
                        <p className="text-sm text-news-muted">These tools serve different primary use cases — here's how they differ overall.</p>
                    )}
                </Sec>
            )}

            {/* ── Strengths vs Weaknesses ────────────────────────── */}
            <Sec label="ANALYSIS" title="Strengths & Weaknesses">
                <div className="grid md:grid-cols-2 gap-4">
                    {tools.map(tool => {
                        const sw = gen.strengths_weaknesses[tool.slug];
                        return (
                            <div key={tool.slug} className="bg-surface-card border border-border-subtle rounded-xl p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <ToolLogo tool={tool} size={8} />
                                    <span className="font-bold text-white">{tool.name}</span>
                                    <div className="ml-auto">
                                        <ScoreBadge score={toolDisplayScore(tool, activeUseCase)} accent={tool.slug === winner.slug} />
                                    </div>
                                </div>
                                {sw?.strengths?.length > 0 && (
                                    <div className="mb-4">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-news-accent mb-2">Strengths</p>
                                        <ul className="space-y-1.5">
                                            {sw.strengths.map((s, i) => (
                                                <li key={i} className="py-1 pl-3 border-l-2 border-news-accent/60 text-sm text-news-text">
                                                    {s}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {sw?.weaknesses?.length > 0 && (
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-red-400 mb-2">Weaknesses</p>
                                        <ul className="space-y-1.5">
                                            {sw.weaknesses.map((w, i) => (
                                                <li key={i} className="py-1 pl-3 border-l-2 border-red-500/60 text-sm text-news-text">
                                                    {w}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </Sec>

            {/* ── Decision Block ─────────────────────────────────── */}
            <Sec label="RECOMMENDATION" title="Which Should You Choose?">
                <div className="grid md:grid-cols-2 gap-4">
                    {tools.map(tool => {
                        const reasons = gen.decision.choose[tool.slug] || [];
                        const isWinner = tool.slug === gen.quick_verdict.winner_slug;
                        return (
                            <div key={tool.slug} className={`rounded-xl p-5 border ${isWinner ? 'bg-surface-card border-news-accent' : 'bg-surface-card border-border-subtle'}`}>
                                {isWinner && (
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-news-accent mb-2">Best Overall</p>
                                )}
                                <div className="flex items-center gap-2 mb-3">
                                    <ToolLogo tool={tool} size={7} />
                                    <p className="text-sm font-bold text-white">Choose {tool.name} if…</p>
                                </div>
                                <ul className="space-y-2">
                                    {reasons.map((r, i) => (
                                        <li key={i} className="flex gap-2 text-sm text-news-text">
                                            <Check size={13} className="text-news-accent flex-shrink-0 mt-0.5" />{r}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>
            </Sec>
        </>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// MULTI LAYOUT — Market map
// ══════════════════════════════════════════════════════════════════════════════

const RANK_MEDALS = ['🥇', '🥈', '🥉'];

const ComparisonMulti: React.FC<{
    data: Comparison; tools: Tool[]; gen: GeneratedComparison;
    onToolClick: (s: string) => void; activeUseCase?: string;
}> = ({ data, tools, gen, onToolClick, activeUseCase = '' }) => {
    const [ratingTipOpen, setRatingTipOpen] = React.useState(false);
    const sorted = [...tools].sort((a, b) => {
        const diff = toolDisplayScore(b, activeUseCase) - toolDisplayScore(a, activeUseCase);
        if (Math.abs(diff) > 0.001) return diff;
        return funcBreaker(b) - funcBreaker(a);
    });
    const winner = sorted[0];

    function getCardText(tool: Tool): string {
        const ucScores: Array<{ use_case: string; score: number | null; description: string }> = (tool as any).use_case_scores || [];
        const ucBreakdown = (tool as any).use_case_breakdown;
        const pros: string[] = (tool as any).pros || [];
        if (activeUseCase) {
            const ucEntry = ucScores.find(s => s.use_case.toLowerCase() === activeUseCase.toLowerCase());
            if (ucEntry?.description) return ucEntry.description;
            if (ucBreakdown && typeof ucBreakdown === 'object' && !Array.isArray(ucBreakdown)) {
                const key = Object.keys(ucBreakdown).find(k => k.toLowerCase() === activeUseCase.toLowerCase());
                if (key && ucBreakdown[key]) return (ucBreakdown[key] as string).replace(/^\d+(?:\.\d+)?\/10\s*[—–-]\s*/, '');
            }
            if (typeof ucBreakdown === 'string' && ucBreakdown) {
                for (const line of ucBreakdown.split(/[\n;]/)) {
                    if (line.toLowerCase().includes(activeUseCase.toLowerCase())) return line.trim();
                }
            }
            const words = activeUseCase.toLowerCase().split(/\s+/).filter(w => w.length > 2);
            const matched = pros.find(p => words.some(w => p.toLowerCase().includes(w)));
            return matched || pros[0] || '';
        }
        return pros.slice(0, 2).join(' · ');
    }

    const allUCs = [...new Set(tools.flatMap(t => gen.use_cases[t.slug] || []))];

    const beginnerKws = ['beginner', 'simple', 'easy', 'basic', 'student', 'quick', 'no-code', 'personal'];
    const advancedKws = ['enterprise', 'advanced', 'team', 'agency', 'professional', 'complex', 'scale', 'api', 'developer'];

    const scoreFor = (tool: Tool, kws: string[]) => {
        const bf = ((tool as any).best_for || []).join(' ').toLowerCase();
        return kws.filter(k => bf.includes(k)).length;
    };

    const bestForBeginners = [...tools].sort((a, b) => scoreFor(b, beginnerKws) - scoreFor(a, beginnerKws))[0];
    const bestForAdvanced  = [...tools].sort((a, b) => scoreFor(b, advancedKws)  - scoreFor(a, advancedKws))[0];

    // Change 1: guard against stale stored verdict naming the wrong winner
    const verdictSummary = (() => {
        const s = gen.quick_verdict.summary || '';
        if (s.toLowerCase().startsWith(winner.name.toLowerCase())) return s;
        const others = sorted.slice(1).map(t => t.name).join(' and ');
        const uc = (data as any).use_case || (data as any).primary_use_cases?.[0] || data.primary_use_case;
        return `${winner.name} edges out ${others} in our analysis${uc ? ` for ${uc}` : ''}.`;
    })();

    return (
        <>
            {/* ── Quick Verdict ──────────────────────────────────── */}
            <Sec label="VERDICT" title="Quick Verdict">
                {/* Verdict callout */}
                <div className="border-l-4 border-news-accent bg-surface-card rounded-r-2xl px-6 py-5 mb-6">
                    <p className="text-news-text text-sm leading-relaxed">{verdictSummary}</p>
                </div>

                {/* Ranked tool cards */}
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                    {sorted.map((tool, rank) => {
                        const scoreResult = activeUseCase ? getUCScoreResult(tool, activeUseCase) : null;
                        const score = scoreResult ? scoreResult.score : ((tool as any).rating_score ?? 0);
                        const isWinner = rank === 0;
                        const cardText = getCardText(tool);
                        return (
                            <button key={tool.slug} onClick={() => onToolClick(tool.slug)}
                                className={`relative text-left rounded-2xl p-5 transition-all group ${
                                    isWinner
                                        ? 'bg-surface-card border border-news-accent/70 hover:border-news-accent'
                                        : 'bg-surface-card border border-border-subtle hover:border-news-accent/40'
                                }`}>
                                <div className="absolute -top-3 left-4 text-lg">{RANK_MEDALS[rank]}</div>
                                <div className="flex items-center gap-3 mb-3 mt-1">
                                    <ToolLogo tool={tool} size={10} />
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-white group-hover:text-news-accent transition-colors truncate">{tool.name}</h3>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${PRICING_COLORS[tool.pricing_model] || 'bg-surface-alt text-news-muted border-border-subtle'}`}>
                                            {tool.pricing_model}
                                        </span>
                                    </div>
                                </div>
                                {isWinner && (data as any).why_it_wins_override && (
                                    <div className="mb-3">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-news-accent mb-1">Why it wins:</p>
                                        <p className="text-news-muted text-xs leading-relaxed"
                                            style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {(data as any).why_it_wins_override}
                                        </p>
                                    </div>
                                )}
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] text-news-muted/70 font-medium">
                                        {activeUseCase
                                            ? (scoreResult?.usedFallback ? `Overall score (no ${activeUseCase} data)` : `${activeUseCase} score`)
                                            : 'Overall score'}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <ScoreBadge score={score} accent={isWinner} />
                                        <ScoreBar score={score} />
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Ranking summary */}
                <div className="bg-surface-card border border-border-subtle rounded-xl p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-news-muted mb-3">Rankings</p>
                    <div className="space-y-3">
                        {sorted.map((tool, rank) => (
                            <div key={tool.slug} className="flex items-center gap-3">
                                <span className="text-base w-6 flex-shrink-0">{RANK_MEDALS[rank]}</span>
                                <span className="text-sm font-bold text-white w-28 flex-shrink-0 truncate">{tool.name}</span>
                                <ScoreBar score={toolDisplayScore(tool, activeUseCase)} />
                                <div className="flex-shrink-0 w-20 flex justify-end">
                                    <ScoreBadge score={toolDisplayScore(tool, activeUseCase)} accent={rank === 0} />
                                </div>
                                <span className="text-xs text-news-muted w-16 text-right flex-shrink-0">
                                    {rank === 0 ? 'Winner' : rank === 1 ? 'Runner-up' : '3rd place'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </Sec>

            {/* ── Feature Comparison (multi-tool) ───────────────── */}
            <Sec label="FEATURES" title="Feature Comparison">
                <div className="overflow-x-auto rounded-xl border border-border-subtle">
                    <table className="w-full text-sm min-w-[500px]">
                        <thead>
                            <tr className="bg-surface-card border-b border-border-subtle">
                                <th className="text-left px-5 py-3 text-news-muted font-bold uppercase tracking-widest text-xs w-1/4">Feature</th>
                                {sorted.map(t => {
                                    const isWinner = winner.slug === t.slug;
                                    return (
                                        <th key={t.slug} className={`text-left px-4 py-3 font-bold ${isWinner ? 'text-news-accent border-t-2 border-news-accent/60' : 'text-white'}`}>
                                            <div className="flex items-center gap-1.5">
                                                {t.logo && <img src={t.logo} alt={t.name} className="w-4 h-4 rounded object-contain" />}
                                                {t.name}
                                                {isWinner && <Trophy size={11} className="text-news-accent" />}
                                            </div>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {buildTableRows(sorted, winner.slug, ratingTipOpen, setRatingTipOpen, activeUseCase, 'px-4 py-3')}
                        </tbody>
                    </table>
                </div>
            </Sec>

            {/* ── Pricing Comparison (multi-tool) ───────────────── */}
            {sorted.some(t => t.model_version_by_plan) ? (
                <Sec label="PRICING" title="Plans">
                    <PlanComparisonTable tools={sorted} />
                </Sec>
            ) : (
                <Sec label="PRICING" title="Pricing Breakdown">
                    <div className="grid md:grid-cols-3 gap-4">
                        {sorted.map(tool => {
                            const p = gen.pricing[tool.slug];
                            const isWinner = tool.slug === winner.slug;
                            return (
                                <div key={tool.slug} className={`rounded-xl p-4 border ${isWinner ? 'bg-surface-card border-news-accent/50' : 'bg-surface-card border-border-subtle'}`}>
                                    <div className="flex items-center gap-2 mb-3">
                                        <ToolLogo tool={tool} size={7} />
                                        <span className="font-bold text-sm text-white">{tool.name}</span>
                                    </div>
                                    <div className="space-y-1.5 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-news-muted text-xs">Model</span>
                                            <span className={`font-bold px-2 py-0.5 rounded-full border text-xs ${PRICING_COLORS[p?.model] || 'bg-surface-alt text-news-muted border-border-subtle'}`}>{p?.model || '—'}</span>
                                        </div>
                                        <div className="pt-0.5">
                                            <span className="text-news-muted text-xs">Starting at</span>
                                            <p className="text-white font-bold text-xs mt-0.5 leading-snug">{p?.starting_price || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Sec>
            )}

            {/* ── Use Case Breakdown ─────────────────────────────── */}
            {allUCs.length > 0 && (
                <Sec label="USE CASES" title="Use Case Breakdown">
                    <div className="overflow-x-auto rounded-xl border border-border-subtle mb-4">
                        <table className="w-full text-xs min-w-[500px]">
                            <thead>
                                <tr className="bg-surface-card border-b border-border-subtle">
                                    <th className="text-left px-5 py-3 text-news-muted font-bold uppercase tracking-widest">Use Case</th>
                                    {sorted.map(t => (
                                        <th key={t.slug} className="text-center px-4 py-3 font-bold text-white">
                                            <div className="flex flex-col items-center gap-1">
                                                {t.logo && <img src={t.logo} alt={t.name} className="w-5 h-5 rounded object-contain" />}
                                                <span>{t.name}</span>
                                            </div>
                                        </th>
                                    ))}
                                    <th className="text-left px-4 py-3 text-news-muted font-bold uppercase tracking-widest">Best Pick</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allUCs.map((uc, i) => {
                                    const toolsWithUC = tools.filter(t => (gen.use_cases[t.slug] || []).includes(uc));
                                    const bestForUC = [...toolsWithUC].sort((a, b) =>
                                        toolDisplayScore(b, String(uc)) - toolDisplayScore(a, String(uc))
                                    )[0];
                                    return (
                                        <tr key={i} className="border-b border-border-subtle bg-surface-base">
                                            <td className="px-5 py-3 text-news-text font-medium">
                                                <div className="flex items-center gap-1.5">
                                                    <Target size={11} className="text-news-accent flex-shrink-0" />{uc}
                                                </div>
                                            </td>
                                            {sorted.map(t => {
                                                const has = (gen.use_cases[t.slug] || []).includes(uc);
                                                return (
                                                    <td key={t.slug} className="px-4 py-3 text-center">
                                                        {has ? <Check size={14} className="text-news-accent mx-auto" /> : <span className="text-news-muted/40">—</span>}
                                                    </td>
                                                );
                                            })}
                                            <td className="px-4 py-3">
                                                {bestForUC ? (
                                                    <div className="flex items-center gap-1.5">
                                                        {bestForUC.logo && <img src={bestForUC.logo} alt={bestForUC.name} className="w-4 h-4 rounded object-contain" />}
                                                        <span className="text-news-accent font-bold">{bestForUC.name}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-news-muted/40" title="None of these tools are optimised for this use case">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Sec>
            )}

            {/* ── Strengths & Weaknesses (per tool) ─────────────── */}
            <Sec label="ANALYSIS" title="Strengths & Weaknesses">
                <div className="grid md:grid-cols-3 gap-4">
                    {sorted.map((tool, rank) => {
                        const sw = gen.strengths_weaknesses[tool.slug];
                        return (
                            <div key={tool.slug} className={`rounded-xl border p-4 bg-surface-card ${rank === 0 ? 'border-news-accent/50' : 'border-border-subtle'}`}>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-base">{RANK_MEDALS[rank]}</span>
                                    <span className="font-bold text-sm text-white">{tool.name}</span>
                                </div>
                                <div className="mb-3">
                                    <ScoreBadge score={toolDisplayScore(tool, activeUseCase)} accent={rank === 0} />
                                </div>
                                {sw?.strengths?.length > 0 && (
                                    <div className="mb-3">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-news-accent mb-1.5">Strengths</p>
                                        <ul className="space-y-1.5">
                                            {sw.strengths.slice(0, 3).map((s, i) => (
                                                <li key={i} className="py-0.5 pl-3 border-l-2 border-news-accent/60 text-xs text-news-text">
                                                    {s}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {sw?.weaknesses?.length > 0 && (
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-red-400 mb-1.5">Weaknesses</p>
                                        <ul className="space-y-1.5">
                                            {sw.weaknesses.slice(0, 2).map((w, i) => (
                                                <li key={i} className="py-0.5 pl-3 border-l-2 border-red-500/60 text-xs text-news-text">
                                                    {w}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </Sec>

            {/* ── Final Recommendation ───────────────────────────── */}
            <Sec label="RECOMMENDATION" title="Final Recommendation">
                {/* Choose X if cards */}
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                    {sorted.map((tool, rank) => {
                        const reasons = gen.decision.choose[tool.slug] || [];
                        const isWinner = rank === 0;
                        return (
                            <div key={tool.slug} className={`rounded-xl p-5 border ${isWinner ? 'bg-surface-card border-news-accent' : 'bg-surface-card border-border-subtle'}`}>
                                {isWinner && (
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-news-accent mb-2">Best Overall</p>
                                )}
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-sm">{RANK_MEDALS[rank]}</span>
                                    <p className="text-xs font-bold text-white">Choose {tool.name} if…</p>
                                </div>
                                <ul className="space-y-1.5">
                                    {reasons.slice(0, 3).map((r, i) => (
                                        <li key={i} className="flex gap-1.5 text-xs text-news-text">
                                            <Check size={11} className="text-news-accent flex-shrink-0 mt-0.5" />{r}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>

                {/* Best overall / beginners / advanced callouts */}
                <div className="grid md:grid-cols-3 gap-4">
                    {[
                        { label: 'Best Overall',        icon: Trophy, tool: winner,           accent: true  },
                        { label: 'Best for Beginners',  icon: Star,   tool: bestForBeginners, accent: false },
                        { label: 'Best for Advanced',   icon: Medal,  tool: bestForAdvanced,  accent: false },
                    ].map(({ label, icon: Icon, tool, accent }) => (
                        <button key={label} onClick={() => onToolClick(tool.slug)}
                            className={`text-left rounded-xl p-4 border transition-all hover:brightness-110 ${
                                accent
                                    ? 'bg-surface-card border-news-accent'
                                    : 'bg-surface-card border-border-subtle hover:border-news-accent/40'
                            }`}>
                            <div className="flex items-center gap-2 mb-3">
                                <Icon size={13} className={accent ? 'text-news-accent' : 'text-news-muted'} />
                                <span className={`text-xs font-bold uppercase tracking-widest ${accent ? 'text-news-accent' : 'text-news-muted'}`}>{label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <ToolLogo tool={tool} size={8} />
                                <span className="font-bold text-white">{tool.name}</span>
                                <ArrowRight size={12} className="text-news-muted ml-auto" />
                            </div>
                        </button>
                    ))}
                </div>
            </Sec>
        </>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE — Routes to 1v1 or Multi
// ══════════════════════════════════════════════════════════════════════════════

const ComparisonPage: React.FC<ComparisonPageProps> = ({ slug, useCase, onBack, onToolClick, onUseCaseChange, initialData }) => {
    const [data, setData] = useState<Comparison | null>(initialData ?? null);
    const [loading, setLoading] = useState(!initialData);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (initialData) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        const ucParam = useCase ? `?use_case=${useCase.toLowerCase().replace(/\s+/g, '-')}` : '';
        fetch(`/api/comparisons/${slug}${ucParam}`)
            .then(r => r.ok ? r.json() : Promise.reject('Comparison not found'))
            .then(d => {
                setData(d);
                setGenerated((d.generated_output as GeneratedComparison) || null);
                if (d) {
                    document.title = (d.meta_title || d.title) + ' | ToolCurrent';
                    const desc = d.meta_description || `Compare ${d.title} — full analysis on ToolCurrent.`;
                    let el = document.querySelector('meta[name="description"]');
                    if (!el) { el = document.createElement('meta'); el.setAttribute('name', 'description'); document.head.appendChild(el); }
                    el.setAttribute('content', desc);
                }
            })
            .catch(err => setError(typeof err === 'string' ? err : 'Failed to load comparison'))
            .finally(() => setLoading(false));
        return () => { document.title = 'ToolCurrent | Tech & AI Intelligence'; };
    }, [slug, useCase]); // re-fetch when slug or use case changes

    const tools = useMemo(() => {
        if (!data) return [];
        return [data.tool_a, data.tool_b, data.tool_c].filter(Boolean) as Tool[];
    }, [data]);

    const [generated, setGenerated] = useState<GeneratedComparison | null>(
        initialData ? (initialData.generated_output as GeneratedComparison) ?? null : null
    );

    // When no generated_output exists but we have both tools, derive comparison from tool data
    useEffect(() => {
        if (generated) return;
        const toolsArr = [data?.tool_a, data?.tool_b, data?.tool_c].filter(Boolean) as Tool[];
        if (toolsArr.length < 2) return;
        try {
            const derived = generateComparison(toolsArr as any[], { primary_use_case: useCase || undefined });
            setGenerated(derived);
        } catch { /* not enough data — leave fallback message */ }
    }, [data, useCase, generated]);

    // Canonical URL management
    useEffect(() => {
        const ucPath = useCase ? `/${useCase.toLowerCase().replace(/\s+/g, '-')}` : '';
        let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
        if (!canonical) {
            canonical = document.createElement('link') as HTMLLinkElement;
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }
        canonical.setAttribute('href', `https://toolcurrent.com/compare/${slug}${ucPath}`);
        return () => { document.querySelector('link[rel="canonical"]')?.remove(); };
    }, [slug, useCase]);

    if (loading) return (
        <div className="min-h-screen bg-surface-base flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-news-muted">
                <div className="w-8 h-8 border-2 border-news-accent border-t-transparent rounded-full animate-spin" />
                <span className="text-sm uppercase tracking-widest">Loading comparison</span>
            </div>
        </div>
    );

    if (error || !data) return (
        <div className="min-h-screen bg-surface-base flex items-center justify-center">
            <div className="text-center">
                <p className="text-news-muted mb-4">{error || 'Comparison not found'}</p>
                <button onClick={onBack} className="text-news-accent hover:underline text-sm">Return Home</button>
            </div>
        </div>
    );

    const isMulti = tools.length === 3 || data.comparison_type === 'multi';
    const activeUseCase = useCase || '';
    const invalidUseCase = !!(data as any).invalid_use_case;
    const availableUCsFromServer = (data as any).available_use_cases as string[] | undefined;

    return (
        <div className="min-h-screen bg-surface-base text-white font-sans pt-[112px]">
            <div className={`container mx-auto px-4 md:px-8 py-10 ${isMulti ? 'max-w-6xl' : 'max-w-4xl'}`}>

                {/* Invalid use case notice */}
                {invalidUseCase && (
                    <div className="mb-6 p-4 rounded-xl border border-yellow-700/40 bg-yellow-900/20 text-sm text-yellow-300">
                        The selected use case isn't applicable to both tools. Showing overall comparison instead.
                        {availableUCsFromServer && availableUCsFromServer.length > 0 && (
                            <span className="ml-1">Available:{' '}
                                {availableUCsFromServer.map((uc, i) => (
                                    <React.Fragment key={uc}>
                                        {i > 0 && ', '}
                                        <button onClick={() => onUseCaseChange?.(uc)} className="underline hover:no-underline">{uc}</button>
                                    </React.Fragment>
                                ))}
                            </span>
                        )}
                    </div>
                )}

                {/* Page header */}
                <div className="mb-10">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-bold uppercase tracking-widest text-news-accent">Comparison</span>
                        <span className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border text-news-muted bg-surface-card border-border-subtle">
                            {isMulti ? '3-Way' : '1v1'}
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3">
                        {generated?.header.title || data.title}
                    </h1>
                    {/* Inline use case switcher */}
                    {tools.length >= 2 && (() => {
                        const allTagSets = tools.map(t => ((t as any).use_case_tags || []) as string[]);
                        const intersection = allTagSets[0]
                            .filter(uc => allTagSets.slice(1).every(tags => tags.map(u => u.toLowerCase()).includes(uc.toLowerCase())))
                            .sort((a, b) => a.localeCompare(b));
                        const ucToSlug = (uc: string) => uc.toLowerCase().replace(/\s+/g, '-');
                        const activeCls = 'bg-news-accent text-[#0B0F14] border-news-accent font-bold';
                        const inactiveCls = 'border-border-subtle text-news-muted hover:border-news-accent hover:text-white';
                        const tagCls = (active: boolean) =>
                            `flex-shrink-0 text-xs font-medium px-2.5 py-0.5 rounded-full border transition-colors duration-150 ${active ? activeCls : inactiveCls}`;
                        if (intersection.length === 0) {
                            return (
                                <div className="flex items-center gap-2">
                                    <TrendingUp size={13} className="text-news-accent" />
                                    <span className="text-xs text-news-muted">Optimised for:</span>
                                    <span className="text-xs text-news-accent font-medium bg-news-accent/10 border border-news-accent/30 px-2 py-0.5 rounded-full">
                                        {activeUseCase || 'Overall'}
                                    </span>
                                </div>
                            );
                        }
                        return (
                            <div className="flex items-center gap-2 min-w-0">
                                <TrendingUp size={13} className="text-news-accent flex-shrink-0" />
                                <span className="text-xs text-news-muted flex-shrink-0 whitespace-nowrap">Optimised for:</span>
                                <div
                                    className="flex gap-1.5 overflow-x-auto md:flex-wrap md:overflow-visible pb-0.5 md:pb-0"
                                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
                                >
                                    <a href={`/compare/${slug}`} className={tagCls(!activeUseCase)}>Overall</a>
                                    {intersection.map(uc => (
                                        <a key={uc} href={`/compare/${slug}/${ucToSlug(uc)}`} className={tagCls(activeUseCase.toLowerCase() === uc.toLowerCase())}>
                                            {uc}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        );
                    })()}
                </div>

                {/* Route to correct layout */}
                {generated && !isMulti && tools.length === 2 && (
                    <Comparison1v1
                        data={data} tools={tools as [Tool, Tool]} gen={generated}
                        onToolClick={onToolClick} activeUseCase={activeUseCase}
                        availableUseCases={(generated as any).available_use_cases}
                        onUseCaseChange={onUseCaseChange}
                    />
                )}
                {generated && isMulti && tools.length === 3 && (
                    <ComparisonMulti data={data} tools={tools} gen={generated} onToolClick={onToolClick} activeUseCase={activeUseCase} />
                )}

                {/* Fallback: no generated data */}
                {!generated && (
                    <div className="bg-surface-card border border-border-subtle rounded-2xl p-8 text-center text-news-muted">
                        <p className="mb-2">Tool data incomplete — cannot generate comparison.</p>
                        <p className="text-xs">Ensure both tools exist in the database with full profiles.</p>
                    </div>
                )}

                {/* FAQ */}
                {data.faq && data.faq.length > 0 && (
                    <section className="mb-12 mt-4">
                        <ArticleFAQ faq={data.faq} />
                    </section>
                )}

                {/* Compared Tools — large cards (Change 5) */}
                {tools.length > 0 && (
                    <section className="mt-10 border-t border-border-divider pt-10 mb-12">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-news-accent mb-1">EXPLORE TOOLS</p>
                        <h2 className="text-xl md:text-2xl font-black tracking-tight text-white mb-5">Compared Tools</h2>
                        <div className="grid md:grid-cols-3 gap-5">
                            {tools.map(tool => (
                                <button key={tool.slug} onClick={() => onToolClick(tool.slug)}
                                    className="text-left bg-surface-card border border-border-subtle hover:border-news-accent/50 rounded-2xl p-5 transition-all group flex flex-col">
                                    <div className="flex items-center gap-3 mb-3">
                                        <ToolLogo tool={tool} size={10} />
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-white group-hover:text-news-accent transition-colors truncate">{tool.name}</h3>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${PRICING_COLORS[tool.pricing_model] || 'bg-surface-alt text-news-muted border-border-subtle'}`}>
                                                {tool.pricing_model}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-news-muted text-sm leading-relaxed mb-4 line-clamp-2 flex-1">{tool.short_description}</p>
                                    <div className="flex items-center justify-between mt-auto">
                                        {tool.rating_score != null
                                            ? <ScoreBadge score={tool.rating_score} />
                                            : <span className="text-xs text-news-muted/60 italic">Score pending</span>
                                        }
                                        <span className="text-xs text-news-accent font-bold flex items-center gap-1">
                                            View Tool <ArrowRight size={11} />
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </section>
                )}

                {/* Also Compare — same tools, different use case */}
                {onUseCaseChange && !isMulti && tools.length === 2 && (() => {
                    const tagsA = ((tools[0] as any).use_case_tags || []) as string[];
                    const tagsB = ((tools[1] as any).use_case_tags || []) as string[];
                    return tagsA.some(uc => tagsB.map(u => u.toLowerCase()).includes(uc.toLowerCase()) && uc.toLowerCase() !== activeUseCase.toLowerCase());
                })() && (
                    <section className="mt-10 border-t border-border-divider pt-10 mb-12">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-news-accent mb-1">ALSO COMPARE</p>
                        <h2 className="text-xl font-black tracking-tight text-white mb-4">
                            {tools.map(t => t.name).join(' vs ')} for Other Use Cases
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {(() => {
                                // Use intersection of both tools' use_case_tags (valid UCs for this pair)
                                const tagsA = ((tools[0] as any).use_case_tags || []) as string[];
                                const tagsB = ((tools[1] as any).use_case_tags || []) as string[];
                                const intersection = tagsA.filter(uc => tagsB.map(u => u.toLowerCase()).includes(uc.toLowerCase()));
                                return intersection.filter(uc => uc.toLowerCase() !== activeUseCase.toLowerCase());
                            })().map(uc => (
                                <button key={uc} onClick={() => onUseCaseChange(uc)}
                                    className="text-sm px-3 py-1.5 rounded-full border border-border-subtle bg-surface-card text-news-muted hover:border-news-accent/50 hover:text-news-accent transition-colors">
                                    {uc}
                                </button>
                            ))}
                        </div>
                    </section>
                )}

                {/* Related comparisons & rankings */}
                <div className="space-y-8 border-t border-border-divider pt-10">
                    {data.alternativeComparisons && data.alternativeComparisons.length > 0 && <RelatedContent type="comparisons" title="Alternative Comparisons" items={data.alternativeComparisons} className="mt-0 pt-0 border-none" />}
                    {data.relatedRankings && data.relatedRankings.length > 0 && <RelatedContent type="rankings" title="Related Rankings" items={data.relatedRankings} className="mt-0 pt-0 border-none" />}
                </div>
            </div>
        </div>
    );
};

export default ComparisonPage;
