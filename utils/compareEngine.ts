/**
 * compareEngine.ts
 * Pure function: generateComparison(tools, context) → structured comparison.
 * No DB calls, no side effects. Safe to run in browser or Node.
 * Keep in sync with server/compareEngine.js.
 */

export interface CompareTool {
    id: string;
    name: string;
    slug: string;
    logo?: string;
    short_description?: string;
    rating_score?: number;
    rating_breakdown?: Record<string, number>;
    pricing_model?: string;
    starting_price?: string;
    key_features?: string[];
    pros?: string[];
    cons?: string[];
    limitations?: string[];
    use_case_tags?: string[];
    use_case_breakdown?: string | Record<string, string>;
    best_for?: string[];
    not_ideal_for?: string[];
    supported_platforms?: string[];
    ai_enabled?: boolean;
    category_primary?: string;
    website_url?: string;
}

export interface CompareContext {
    primary_use_case?: string;
    comparison_type?: '1v1' | 'multi';
}

export interface GeneratedTableRow {
    feature: string;
    values: Record<string, string>;
    winner_slug: string | null;
}

export interface GeneratedComparison {
    mode: 'overall' | 'use-case';
    available_use_cases?: string[];
    header: { title: string; quick_summary: string; };
    quick_verdict: {
        winner_slug: string;
        winner_name: string;
        summary: string;
        scores: Record<string, number>;
        scores_display: Record<string, number>;
    };
    table: GeneratedTableRow[];
    features: Record<string, string[]>;
    pricing: Record<string, { model: string; starting_price: string; }>;
    use_cases: Record<string, string[]>;
    strengths_weaknesses: Record<string, { strengths: string[]; weaknesses: string[]; }>;
    decision: { choose: Record<string, string[]>; summary: string; };
    links: { tool_pages: Record<string, string>; };
}

// ── Constants ─────────────────────────────────────────────────────────────────

const LIMITATION_WEIGHTS: Record<string, number> = {
    bias_risk: 2, reliability_risk: 2, hallucination_risk: 2, privacy_risk: 2,
    limited_context: 1, no_free_tier: 1, slow_response: 1,
    limited_integrations: 0.5, limited_export: 0.5, steep_learning_curve: 0.5,
};

const ADVANCED_KWS = ['ai', 'automat', 'integrat', 'api', 'analytic', 'custom', 'advanced', 'machine learning', 'nlp'];

const UC_SYNONYMS: Record<string, string[]> = {
    'coding':               ['code', 'coding', 'development', 'developer', 'programming', 'software', 'engineer', 'technical', 'api', 'github', 'debug', 'agentic', 'swe', 'script'],
    'research':             ['research', 'analysis', 'analys', 'study', 'knowledge', 'context', 'document', 'corpus', 'source', 'citation', 'review', 'information', 'synthesis'],
    'content creation':     ['content', 'writing', 'creation', 'creative', 'draft', 'article', 'blog', 'copy', 'text', 'generate'],
    'data analysis':        ['data', 'analysis', 'analys', 'chart', 'dataset', 'table', 'statistic', 'csv', 'python', 'excel', 'visuali'],
    'marketing':            ['marketing', 'campaign', 'brand', 'advertis', 'social', 'seo', 'conversion', 'audience'],
    'automation':           ['automat', 'workflow', 'integrat', 'process', 'agentic', 'agent', 'api', 'trigger', 'schedule'],
    'lead generation':      ['lead', 'sales', 'crm', 'prospect', 'conversion', 'customer', 'pipeline'],
    'customer support':     ['support', 'customer', 'service', 'ticket', 'help', 'respond', 'chat'],
    'personal productivity':['productivity', 'personal', 'task', 'workflow', 'organis', 'organiz', 'efficiency', 'daily'],
    'education':            ['education', 'learning', 'teach', 'student', 'course', 'tutor', 'academic'],
    'design':               ['design', 'visual', 'image', 'creative', 'ui', 'ux', 'graphic', 'dall-e', 'sora'],
};

// ── Scoring ──────────────────────────────────────────────────────────────────

function computePenalty(tool: CompareTool): number {
    const lims = tool.limitations || [];
    const raw = lims.reduce((sum, l) => {
        const key = l.toLowerCase().replace(/[\s-]+/g, '_').replace(/[^a-z0-9_]/g, '');
        return sum + (LIMITATION_WEIGHTS[key] ?? 0.5);
    }, 0);
    return Math.min(1, raw / 10);
}

function computeFeatureDepth(tool: CompareTool): number {
    const features = tool.key_features || [];
    const adv = features.filter(f => ADVANCED_KWS.some(k => f.toLowerCase().includes(k))).length;
    return Math.min(1, (features.length + adv * 0.5) / 15);
}

function scoreTool(tool: CompareTool, ctx: CompareContext): number {
    const ratingNorm = Math.max(0, Math.min(10, tool.rating_score ?? 5)) / 10;
    const featureDepth = computeFeatureDepth(tool);
    const penalty = computePenalty(tool);

    if (!ctx.primary_use_case) {
        return 0.60 * ratingNorm + 0.25 * featureDepth - 0.15 * penalty;
    }

    const puc = ctx.primary_use_case.toLowerCase();
    const tags = (tool.use_case_tags || []).map(t => t.toLowerCase());
    let ucScore = 0.3;
    let found = false;

    if (typeof tool.use_case_breakdown === 'object' && tool.use_case_breakdown !== null) {
        const ucKey = Object.keys(tool.use_case_breakdown).find(k => k.toLowerCase() === puc);
        if (ucKey) {
            const bdText = (tool.use_case_breakdown as Record<string, string>)[ucKey];
            const m = bdText.match(/(\d+(?:\.\d+)?)\s*\/\s*10/);
            ucScore = m ? Math.min(1, parseFloat(m[1]) / 10) : ratingNorm;
            found = true;
        }
    }

    if (!found) {
        const bdText = typeof tool.use_case_breakdown === 'string' ? tool.use_case_breakdown : '';
        if (bdText) {
            for (const line of bdText.split(/[\n;]/)) {
                if (line.toLowerCase().includes(puc)) {
                    const m = line.match(/(\d+(?:\.\d+)?)\s*\/\s*10/);
                    if (m) { ucScore = Math.min(1, parseFloat(m[1]) / 10); found = true; break; }
                    ucScore = ratingNorm;
                    found = true;
                    break;
                }
            }
        }
    }

    if (!found) {
        ucScore = tags.some(t => t.includes(puc) || puc.includes(t)) ? ratingNorm : tags.length > 0 ? 0.5 : 0.3;
    }

    return 0.35 * ratingNorm + 0.30 * ucScore + 0.20 * featureDepth - 0.15 * penalty;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function winnerByMax(tools: CompareTool[], getter: (t: CompareTool) => number): string | null {
    if (tools.length < 2) return null;
    const best = tools.reduce((a, b) => getter(a) >= getter(b) ? a : b);
    const vals = tools.map(getter);
    return vals.every(v => v === vals[0]) ? null : best.slug;
}

function filterByRelevance(items: string[], useCase: string): string[] {
    if (!useCase || !items || items.length === 0) return items || [];
    const ucl = useCase.toLowerCase();
    const synonyms = UC_SYNONYMS[ucl] || [];
    const baseWords = ucl.split(/\s+/).filter(w => w.length > 3);
    const words = [...new Set([...baseWords, ...synonyms])];
    if (words.length === 0) return items;
    const filtered = items.filter(item => words.some(w => item.toLowerCase().includes(w)));
    return filtered.length > 0 ? filtered : items;
}

function getDisplayScore(tool: CompareTool, puc: string): number | null {
    const ucBreakdown = tool.use_case_breakdown;
    if (typeof ucBreakdown === 'object' && ucBreakdown !== null) {
        const ucKey = Object.keys(ucBreakdown).find(k => k.toLowerCase() === puc);
        if (ucKey) {
            const m = ((ucBreakdown as Record<string, string>)[ucKey] || '').match(/(\d+(?:\.\d+)?)\s*\/\s*10/);
            if (m) return Math.min(9.9, Math.max(1.0, parseFloat(m[1])));
        }
    }
    return tool.rating_score != null ? Math.min(9.9, Math.max(1.0, tool.rating_score)) : null;
}

// ── Main function ─────────────────────────────────────────────────────────────

export function generateComparison(tools: CompareTool[], ctx: CompareContext = {}): GeneratedComparison {
    if (!tools || tools.length < 2) throw new Error('generateComparison requires at least 2 tools');

    const mode: 'overall' | 'use-case' = ctx.primary_use_case ? 'use-case' : 'overall';
    const puc = ctx.primary_use_case ? ctx.primary_use_case.toLowerCase() : null;

    const rawScores: Record<string, number> = {};
    tools.forEach(t => { rawScores[t.slug] = Math.round(scoreTool(t, ctx) * 1000) / 1000; });

    const sorted = [...tools].sort((a, b) => {
        const diff = rawScores[b.slug] - rawScores[a.slug];
        if (Math.abs(diff) < 0.001) {
            const fA = a.rating_breakdown?.functionality ?? a.rating_breakdown?.Features ?? 0;
            const fB = b.rating_breakdown?.functionality ?? b.rating_breakdown?.Features ?? 0;
            return fB - fA;
        }
        return diff;
    });
    const winner = sorted[0];
    const runners = sorted.slice(1);

    // scoresDisplay: use-case → breakdown numeric or rating_score; overall → blended
    const scoresDisplay: Record<string, number> = {};
    const maxRaw = Math.max(...Object.values(rawScores));
    tools.forEach(t => {
        if (puc) {
            const ds = getDisplayScore(t, puc);
            scoresDisplay[t.slug] = ds != null
                ? Math.round(ds * 10) / 10
                : Math.round(Math.min(9.9, Math.max(1.0, t.rating_score ?? 6.0)) * 10) / 10;
        } else {
            const compNorm = maxRaw > 0 ? rawScores[t.slug] / maxRaw : 1;
            const blended = 0.6 * Math.max(0, Math.min(10, t.rating_score ?? 6)) + 0.4 * (compNorm * 9.5);
            scoresDisplay[t.slug] = Math.round(Math.min(9.9, Math.max(1.0, blended)) * 10) / 10;
        }
    });

    const title = tools.map(t => t.name).join(' vs ');
    const othersStr = runners.map(t => t.name).join(' and ');
    const quick_summary = mode === 'use-case'
        ? `${winner.name} edges out ${othersStr} in our analysis for ${ctx.primary_use_case}.`
        : `${winner.name} scores higher than ${othersStr} overall.`;

    const table: GeneratedTableRow[] = [
        { feature: 'Rating', values: Object.fromEntries(tools.map(t => [t.slug, t.rating_score != null ? `${t.rating_score}/10` : '—'])), winner_slug: winnerByMax(tools, t => t.rating_score ?? 0) },
        { feature: 'Pricing Model', values: Object.fromEntries(tools.map(t => [t.slug, t.pricing_model || '—'])), winner_slug: null },
        { feature: 'Starting Price', values: Object.fromEntries(tools.map(t => [t.slug, t.starting_price || 'N/A'])), winner_slug: null },
        { feature: 'Key Features', values: Object.fromEntries(tools.map(t => [t.slug, `${(t.key_features || []).length} listed`])), winner_slug: winnerByMax(tools, t => (t.key_features || []).length) },
        { feature: 'AI Enabled', values: Object.fromEntries(tools.map(t => { const isAiCat = ['AI Chatbots', 'AI Writing'].includes(t.category_primary ?? ''); return [t.slug, (t.ai_enabled || isAiCat) ? 'Yes' : 'No']; })), winner_slug: null },
        { feature: 'Platforms', values: Object.fromEntries(tools.map(t => [t.slug, (t.supported_platforms || []).join(', ') || '—'])), winner_slug: winnerByMax(tools, t => (t.supported_platforms || []).length) },
    ].filter(row => !Object.values(row.values).every(v => v === '—' || v === 'N/A' || v === '0 listed'));

    const features: Record<string, string[]> = {};
    const pricing: Record<string, { model: string; starting_price: string }> = {};
    const use_cases: Record<string, string[]> = {};
    tools.forEach(t => {
        features[t.slug] = t.key_features || [];
        pricing[t.slug] = { model: t.pricing_model || 'Unknown', starting_price: t.starting_price || 'N/A' };
        use_cases[t.slug] = t.use_case_tags || [];
    });

    const strengths_weaknesses: Record<string, { strengths: string[]; weaknesses: string[] }> = {};
    tools.forEach(t => {
        const pros = t.pros || [], cons = t.cons || [];
        strengths_weaknesses[t.slug] = {
            strengths: mode === 'use-case' ? filterByRelevance(pros, ctx.primary_use_case!) : pros,
            weaknesses: mode === 'use-case' ? filterByRelevance(cons, ctx.primary_use_case!) : cons,
        };
    });

    const choose: Record<string, string[]> = {};
    tools.forEach(t => {
        const bf = t.best_for && t.best_for.length > 0 ? t.best_for : [`${t.name} fits your workflow`];
        choose[t.slug] = mode === 'use-case' ? filterByRelevance(bf, ctx.primary_use_case!) : bf;
    });
    const decisionSummary = sorted.map(t => `Choose ${t.name} if: ${choose[t.slug].slice(0, 2).join(', ')}.`).join(' ');

    const tool_pages: Record<string, string> = {};
    tools.forEach(t => { tool_pages[t.slug] = `/tools/${t.slug}`; });

    let available_use_cases: string[] | undefined;
    if (mode === 'overall') {
        const allTagSets = tools.map(t => (t.use_case_tags || []).map(u => u.toLowerCase()));
        if (allTagSets.length >= 2) {
            available_use_cases = (tools[0].use_case_tags || []).filter(uc =>
                allTagSets.every(s => s.includes(uc.toLowerCase()))
            );
        }
    }

    return {
        mode,
        ...(available_use_cases !== undefined && { available_use_cases }),
        header: { title, quick_summary },
        quick_verdict: { winner_slug: winner.slug, winner_name: winner.name, summary: quick_summary, scores: rawScores, scores_display: scoresDisplay },
        table, features, pricing, use_cases, strengths_weaknesses,
        decision: { choose, summary: decisionSummary },
        links: { tool_pages },
    };
}
