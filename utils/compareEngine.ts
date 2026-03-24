/**
 * compareEngine.ts
 * Pure function: generateComparison(tools, context) → structured comparison.
 * No DB calls, no side effects. Safe to run in browser or Node.
 */

export interface CompareTool {
    id: string;
    name: string;
    slug: string;
    logo?: string;
    short_description?: string;
    rating_score?: number;
    pricing_model?: string;
    starting_price?: string;
    key_features?: string[];
    pros?: string[];
    cons?: string[];
    limitations?: string[];
    use_case_tags?: string[];
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
    values: Record<string, string>;  // { [slug]: display value }
    winner_slug: string | null;
}

export interface GeneratedComparison {
    header: {
        title: string;
        quick_summary: string;
    };
    quick_verdict: {
        winner_slug: string;
        winner_name: string;
        summary: string;
        scores: Record<string, number>;      // { [slug]: 0–1 score }
        scores_display: Record<string, number>; // { [slug]: 0–10 rounded }
    };
    table: GeneratedTableRow[];
    features: Record<string, string[]>;      // { [slug]: key_features[] }
    pricing: Record<string, {
        model: string;
        starting_price: string;
    }>;
    use_cases: Record<string, string[]>;     // { [slug]: use_case_tags[] }
    strengths_weaknesses: Record<string, {
        strengths: string[];
        weaknesses: string[];
    }>;
    decision: {
        choose: Record<string, string[]>;    // { [slug]: reasons[] }
        summary: string;
    };
    links: {
        tool_pages: Record<string, string>;  // { [slug]: '/tools/[slug]' }
    };
}

// ── Scoring ──────────────────────────────────────────────────────────────────

/** Severity weights for limitation tags */
const LIMITATION_WEIGHTS: Record<string, number> = {
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

function scoreTool(tool: CompareTool, ctx: CompareContext): number {
    // Component 1: rating_score (0–10 → 0–1, default 5/10 if missing)
    const ratingNorm = Math.max(0, Math.min(10, tool.rating_score ?? 5)) / 10;

    // Component 2: use_case_score
    let ucScore = 0.3; // baseline when no use_case info
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

    // Component 3: feature_depth (normalize: 15 features ≈ 1.0)
    const features = tool.key_features || [];
    const advancedCount = features.filter(f =>
        ADVANCED_KWS.some(k => f.toLowerCase().includes(k))
    ).length;
    const featureDepth = Math.min(1, (features.length + advancedCount * 0.5) / 15);

    // Component 4: limitation_penalty
    const lims = tool.limitations || [];
    const rawPenalty = lims.reduce((sum, l) => {
        const key = l.toLowerCase().replace(/[\s-]+/g, '_').replace(/[^a-z0-9_]/g, '');
        return sum + (LIMITATION_WEIGHTS[key] ?? 0.5);
    }, 0);
    const penalty = Math.min(1, rawPenalty / 10);

    // Final score: 0.35*rating + 0.30*use_case + 0.20*feature_depth − 0.15*penalty
    return 0.35 * ratingNorm + 0.30 * ucScore + 0.20 * featureDepth - 0.15 * penalty;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function winnerByMax(tools: CompareTool[], getter: (t: CompareTool) => number): string | null {
    if (tools.length < 2) return null;
    const best = tools.reduce((a, b) => getter(a) >= getter(b) ? a : b);
    // Only declare winner if value is different from at least one other tool
    const vals = tools.map(getter);
    const allSame = vals.every(v => v === vals[0]);
    return allSame ? null : best.slug;
}

// ── Main function ─────────────────────────────────────────────────────────────

export function generateComparison(tools: CompareTool[], ctx: CompareContext = {}): GeneratedComparison {
    if (!tools || tools.length < 2) {
        throw new Error('generateComparison requires at least 2 tools');
    }

    // Scores
    const rawScores: Record<string, number> = {};
    tools.forEach(t => {
        rawScores[t.slug] = Math.round(scoreTool(t, ctx) * 1000) / 1000;
    });

    // Sort by score descending
    const sorted = [...tools].sort((a, b) => rawScores[b.slug] - rawScores[a.slug]);
    const winner = sorted[0];
    const runners = sorted.slice(1);

    // Display scores (0–10)
    // Blend: 60% tool's own rating_score (already /10, reflects real-world quality)
    //        40% composite position normalised to 0–9.5 (winner = 9.5)
    // This keeps genuinely great tools scoring high while context still matters.
    const scoresDisplay: Record<string, number> = {};
    const maxRaw = Math.max(...Object.values(rawScores));
    tools.forEach(t => {
        const compNorm  = maxRaw > 0 ? rawScores[t.slug] / maxRaw : 1; // 0–1, winner = 1
        const compPart  = compNorm * 9.5;
        const ratingPart = Math.max(0, Math.min(10, t.rating_score ?? 6));
        const blended   = 0.6 * ratingPart + 0.4 * compPart;
        scoresDisplay[t.slug] = Math.round(Math.min(9.9, Math.max(1.0, blended)) * 10) / 10;
    });

    // Title
    const title = tools.map(t => t.name).join(' vs ');

    // Quick summary
    const winnerRating = winner.rating_score ?? 0;
    const runnerRating = runners[0]?.rating_score ?? 0;
    const diff = Math.abs(winnerRating - runnerRating);
    const margin = diff > 2 ? 'comfortably' : diff > 0.5 ? 'narrowly' : 'very closely';
    const othersStr = runners.map(t => t.name).join(' and ');
    const ucStr = ctx.primary_use_case ? ` for ${ctx.primary_use_case}` : '';
    const quick_summary = `${winner.name} ${margin} edges out ${othersStr} in our analysis${ucStr}.`;

    // Comparison table rows
    const table: GeneratedTableRow[] = [
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
        // Remove rows where all values are the default/unknown
        const vals = Object.values(row.values);
        if (vals.every(v => v === '—' || v === 'N/A' || v === '0 listed')) return false;
        return true;
    });

    // Features by tool
    const features: Record<string, string[]> = {};
    tools.forEach(t => { features[t.slug] = t.key_features || []; });

    // Pricing by tool
    const pricing: Record<string, { model: string; starting_price: string }> = {};
    tools.forEach(t => {
        pricing[t.slug] = {
            model: t.pricing_model || 'Unknown',
            starting_price: t.starting_price || 'N/A',
        };
    });

    // Use cases by tool
    const use_cases: Record<string, string[]> = {};
    tools.forEach(t => { use_cases[t.slug] = t.use_case_tags || []; });

    // Strengths / Weaknesses from pros/cons
    const strengths_weaknesses: Record<string, { strengths: string[]; weaknesses: string[] }> = {};
    tools.forEach(t => {
        strengths_weaknesses[t.slug] = {
            strengths: t.pros || [],
            weaknesses: t.cons || [],
        };
    });

    // Decision: choose based on best_for
    const choose: Record<string, string[]> = {};
    tools.forEach(t => {
        choose[t.slug] = t.best_for && t.best_for.length > 0
            ? t.best_for
            : [`${t.name} fits your workflow`];
    });

    const decisionParts = sorted.map(t => {
        const reasons = choose[t.slug];
        return `Choose ${t.name} if: ${reasons.slice(0, 2).join(', ')}.`;
    });
    const decisionSummary = decisionParts.join(' ');

    // Links
    const tool_pages: Record<string, string> = {};
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
