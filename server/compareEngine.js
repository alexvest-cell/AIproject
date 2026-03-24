/**
 * compareEngine.js
 * Server-side JS port of utils/compareEngine.ts.
 * Pure function — no DB calls, no side effects.
 * Keep in sync with utils/compareEngine.ts.
 */

// ── Scoring ────────────────────────────────────────────────────────────────────

const LIMITATION_WEIGHTS = {
    bias_risk: 2,
    reliability_risk: 2,
    hallucination_risk: 2,
    privacy_risk: 2,
    limited_context: 1,
    no_free_tier: 1,
    slow_response: 1,
    limited_integrations: 0.5,
    limited_export: 0.5,
    steep_learning_curve: 0.5,
};

const ADVANCED_KWS = ['ai', 'automat', 'integrat', 'api', 'analytic', 'custom', 'advanced', 'machine learning', 'nlp'];

function scoreTool(tool, ctx) {
    const ratingNorm = Math.max(0, Math.min(10, tool.rating_score ?? 5)) / 10;

    let ucScore = 0.3;
    const tags = (tool.use_case_tags || []).map(t => t.toLowerCase());
    if (ctx.primary_use_case) {
        const puc = ctx.primary_use_case.toLowerCase();
        if (tags.some(t => t.includes(puc) || puc.includes(t))) {
            ucScore = 1.0;
        } else if (tags.length > 0) {
            ucScore = 0.5;
        }
    } else if (tags.length > 0) {
        ucScore = 0.5;
    }

    const features = tool.key_features || [];
    const advancedCount = features.filter(f =>
        ADVANCED_KWS.some(k => f.toLowerCase().includes(k))
    ).length;
    const featureDepth = Math.min(1, (features.length + advancedCount * 0.5) / 15);

    const lims = tool.limitations || [];
    const rawPenalty = lims.reduce((sum, l) => {
        const key = l.toLowerCase().replace(/[\s-]+/g, '_').replace(/[^a-z0-9_]/g, '');
        return sum + (LIMITATION_WEIGHTS[key] ?? 0.5);
    }, 0);
    const penalty = Math.min(1, rawPenalty / 10);

    return 0.35 * ratingNorm + 0.30 * ucScore + 0.20 * featureDepth - 0.15 * penalty;
}

function winnerByMax(tools, getter) {
    if (tools.length < 2) return null;
    const best = tools.reduce((a, b) => getter(a) >= getter(b) ? a : b);
    const vals = tools.map(getter);
    const allSame = vals.every(v => v === vals[0]);
    return allSame ? null : best.slug;
}

// ── Main function ──────────────────────────────────────────────────────────────

export function generateComparison(tools, ctx = {}) {
    if (!tools || tools.length < 2) {
        throw new Error('generateComparison requires at least 2 tools');
    }

    const rawScores = {};
    tools.forEach(t => {
        rawScores[t.slug] = Math.round(scoreTool(t, ctx) * 1000) / 1000;
    });

    const sorted = [...tools].sort((a, b) => rawScores[b.slug] - rawScores[a.slug]);
    const winner = sorted[0];
    const runners = sorted.slice(1);

    const scoresDisplay = {};
    const maxRaw = Math.max(...Object.values(rawScores));
    tools.forEach(t => {
        const compNorm  = maxRaw > 0 ? rawScores[t.slug] / maxRaw : 1;
        const compPart  = compNorm * 9.5;
        const ratingPart = Math.max(0, Math.min(10, t.rating_score ?? 6));
        const blended   = 0.6 * ratingPart + 0.4 * compPart;
        scoresDisplay[t.slug] = Math.round(Math.min(9.9, Math.max(1.0, blended)) * 10) / 10;
    });

    const title = tools.map(t => t.name).join(' vs ');

    const winnerRating = winner.rating_score ?? 0;
    const runnerRating = runners[0]?.rating_score ?? 0;
    const diff = Math.abs(winnerRating - runnerRating);
    const margin = diff > 2 ? 'comfortably' : diff > 0.5 ? 'narrowly' : 'very closely';
    const othersStr = runners.map(t => t.name).join(' and ');
    const ucStr = ctx.primary_use_case ? ` for ${ctx.primary_use_case}` : '';
    const quick_summary = `${winner.name} ${margin} edges out ${othersStr} in our analysis${ucStr}.`;

    const table = [
        {
            feature: 'Rating',
            values: Object.fromEntries(tools.map(t => [t.slug, t.rating_score != null ? `${t.rating_score}/10` : '—'])),
            winner_slug: winnerByMax(tools, t => t.rating_score ?? 0),
        },
        {
            feature: 'Pricing Model',
            values: Object.fromEntries(tools.map(t => [t.slug, t.pricing_model || '—'])),
            winner_slug: null,
        },
        {
            feature: 'Starting Price',
            values: Object.fromEntries(tools.map(t => [t.slug, t.starting_price || 'N/A'])),
            winner_slug: null,
        },
        {
            feature: 'Key Features',
            values: Object.fromEntries(tools.map(t => [t.slug, `${(t.key_features || []).length} listed`])),
            winner_slug: winnerByMax(tools, t => (t.key_features || []).length),
        },
        {
            feature: 'AI Enabled',
            values: Object.fromEntries(tools.map(t => [t.slug, t.ai_enabled ? 'Yes' : 'No'])),
            winner_slug: null,
        },
        {
            feature: 'Platforms',
            values: Object.fromEntries(tools.map(t => [t.slug, (t.supported_platforms || []).join(', ') || '—'])),
            winner_slug: winnerByMax(tools, t => (t.supported_platforms || []).length),
        },
    ].filter(row => {
        const vals = Object.values(row.values);
        return !vals.every(v => v === '—' || v === 'N/A' || v === '0 listed');
    });

    const features = {};
    tools.forEach(t => { features[t.slug] = t.key_features || []; });

    const pricing = {};
    tools.forEach(t => {
        pricing[t.slug] = {
            model: t.pricing_model || 'Unknown',
            starting_price: t.starting_price || 'N/A',
        };
    });

    const use_cases = {};
    tools.forEach(t => { use_cases[t.slug] = t.use_case_tags || []; });

    const strengths_weaknesses = {};
    tools.forEach(t => {
        strengths_weaknesses[t.slug] = {
            strengths: t.pros || [],
            weaknesses: t.cons || [],
        };
    });

    const choose = {};
    tools.forEach(t => {
        choose[t.slug] = t.best_for && t.best_for.length > 0
            ? t.best_for
            : [`${t.name} fits your workflow`];
    });

    const decisionSummary = sorted
        .map(t => `Choose ${t.name} if: ${choose[t.slug].slice(0, 2).join(', ')}.`)
        .join(' ');

    const tool_pages = {};
    tools.forEach(t => { tool_pages[t.slug] = `/tools/${t.slug}`; });

    return {
        header: { title, quick_summary },
        quick_verdict: {
            winner_slug: winner.slug,
            winner_name: winner.name,
            summary: quick_summary,
            scores: rawScores,
            scores_display: scoresDisplay,
        },
        table,
        features,
        pricing,
        use_cases,
        strengths_weaknesses,
        decision: { choose, summary: decisionSummary },
        links: { tool_pages },
    };
}
