import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Tool from '@/lib/models/Tool';

// ── Code → human-label maps (UI sends codes; we map for tag matching) ──────────

const CHALLENGE_LABELS: Record<string, string> = {
    math_s: 'Maths & science', essays: 'Essays & writing', stu_notes: 'Notes & studying',
    research_s: 'Research & sources', code_s: 'Coding assignments',
    images: 'Images & art', video: 'Video', writing_c: 'Writing',
    audio_c: 'Audio & podcasts', presentations_c: 'Presentations',
    code_editor: 'AI code editor', vs_code: 'VS Code copilot', browser_build: 'Browser-based build',
    automation_d: 'Automation', frontend: 'Frontend & UI',
    seo: 'Blog & SEO content', social_m: 'Social media', ads: 'Ad creatives',
    keywords: 'Keyword research', email_m: 'Email outreach',
    meetings: 'Meetings & notes', docs_b: 'Docs & knowledge', sales_b: 'Sales & leads',
    automation_b: 'Workflow automation', data_b: 'Data & reporting',
    papers: 'Academic papers', data_r: 'Data analysis', web_r: 'Web research', docs_r: 'Document analysis',
};

const SPECIFIC_LABELS: Record<string, string> = {
    math_solve: 'Solve problems', math_learn: 'Learn concepts', math_practice: 'Practice & revision',
    ess_draft: 'Drafting help', ess_proof: 'Proofreading', ess_research: 'Research support',
    stu_flash: 'Flashcards & quizzes', stu_summarise: 'Summarise content', stu_tutor: 'AI tutoring',
    img_art: 'Artistic creative', img_photo: 'Photorealistic', img_design: 'Design assets',
    vid_short: 'Short-form clips', vid_gen: 'AI-generated video', vid_edit: 'Video editing',
    aud_voice: 'Voiceovers', aud_music: 'Music generation', aud_podcast: 'Podcast production',
    wri_long: 'Long-form articles', wri_scripts: 'Scripts & stories', wri_marketing: 'Marketing copy',
    pres_gen: 'Generate from scratch', pres_design: 'Design & polish', pres_team: 'Team collaboration',
};

// ── Domain hints: when a code's category alignment is stronger than its tag vocabulary ──
// Partial-credit scoring fallback when tag tokens don't pair with tool tags but the
// tool's category_primary is clearly relevant to the quiz challenge/specific.

const CHALLENGE_CATEGORY_HINTS: Record<string, string[]> = {
    math_s: ['Data Analysis', 'Education', 'Research'],
    essays: ['AI Writing', 'Education', 'Productivity'],
    stu_notes: ['Education', 'Productivity'],
    research_s: ['Research', 'Education'],
    code_s: ['Development'],
    images: ['AI Image Generation', 'Design'],
    video: ['AI Video'],
    writing_c: ['AI Writing', 'Productivity'],
    audio_c: ['AI Audio'],
    presentations_c: ['Presentations', 'Design'],
    code_editor: ['Development'],
    vs_code: ['Development'],
    browser_build: ['Development'],
    automation_d: ['Automation', 'Development'],
    frontend: ['Development', 'Design'],
    seo: ['SEO Tools', 'AI Writing', 'Marketing'],
    social_m: ['Social Media', 'Marketing'],
    ads: ['Marketing', 'Design'],
    keywords: ['SEO Tools'],
    email_m: ['Email', 'Marketing'],
    meetings: ['Productivity'],
    docs_b: ['Productivity', 'AI Writing'],
    sales_b: ['Sales & CRM'],
    automation_b: ['Automation', 'Productivity'],
    data_b: ['Data Analysis'],
    papers: ['Research', 'Education'],
    data_r: ['Data Analysis', 'Research'],
    web_r: ['Research'],
    docs_r: ['Research', 'AI Writing'],
};

const SPECIFIC_CATEGORY_HINTS: Record<string, string[]> = {
    math_solve: ['Data Analysis', 'Education', 'Research'],
    math_learn: ['Education', 'Research'],
    math_practice: ['Education'],
    ess_draft: ['AI Writing', 'Education'],
    ess_proof: ['AI Writing'],
    ess_research: ['Research', 'Education'],
    stu_flash: ['Education'],
    stu_summarise: ['Productivity', 'Education'],
    stu_tutor: ['Education'],
    img_art: ['AI Image Generation'],
    img_photo: ['AI Image Generation'],
    img_design: ['Design', 'AI Image Generation'],
    vid_short: ['AI Video'],
    vid_gen: ['AI Video'],
    vid_edit: ['AI Video'],
    aud_voice: ['AI Audio'],
    aud_music: ['AI Audio'],
    aud_podcast: ['AI Audio'],
    wri_long: ['AI Writing'],
    wri_scripts: ['AI Writing'],
    wri_marketing: ['Marketing', 'AI Writing'],
    pres_gen: ['Presentations'],
    pres_design: ['Presentations', 'Design'],
    pres_team: ['Presentations', 'Productivity'],
};

// ── Hard blocklists ────────────────────────────────────────────────────────────

const BLOCK_RULES: Array<{ role: string; codes: string[]; block: string[] }> = [
    { role: 'student', codes: ['math_s', 'math_solve', 'math_learn', 'math_practice'],
      block: ['AI Video', 'AI Audio', 'Development', 'Marketing', 'Sales & CRM', 'Automation', 'Design', 'AI Image Generation', 'Data Analysis'] },
    { role: 'student', codes: ['essays', 'ess_draft', 'ess_proof', 'ess_research'],
      block: ['AI Video', 'AI Audio', 'Development', 'Marketing', 'Sales & CRM', 'Automation', 'Data Analysis'] },
    { role: 'student', codes: ['stu_notes', 'stu_flash', 'stu_summarise', 'stu_tutor'],
      block: ['AI Video', 'AI Audio', 'Development', 'Marketing', 'Sales & CRM', 'Automation', 'Design', 'Data Analysis'] },
    { role: 'student', codes: ['research_s'],
      block: ['AI Video', 'AI Audio', 'Development', 'Marketing', 'Sales & CRM', 'Automation', 'Data Analysis'] },
    { role: 'student', codes: ['code_s'],
      block: ['AI Video', 'AI Audio', 'Marketing', 'Sales & CRM', 'Design', 'AI Image Generation', 'Data Analysis'] },
    { role: 'creator', codes: ['images', 'img_art', 'img_photo', 'img_design'],
      block: ['AI Audio', 'Development', 'Sales & CRM', 'Education', 'Data Analysis'] },
    { role: 'creator', codes: ['video', 'vid_short', 'vid_gen', 'vid_edit'],
      block: ['AI Audio', 'Development', 'Sales & CRM', 'Education', 'Data Analysis', 'AI Image Generation'] },
    { role: 'creator', codes: ['audio_c', 'aud_voice', 'aud_music', 'aud_podcast'],
      block: ['AI Video', 'AI Image Generation', 'Development', 'Sales & CRM', 'Education', 'Data Analysis'] },
    { role: 'developer', codes: ['code_editor', 'vs_code', 'browser_build', 'automation_d', 'frontend', 'code_s'],
      block: ['AI Audio', 'AI Video', 'AI Image Generation', 'Marketing', 'Sales & CRM', 'Education', 'Data Analysis', 'Design', 'Research', 'Productivity', 'Customer Support', 'SEO Tools', 'Healthcare', 'Legal', 'Finance', 'HR & Recruiting', 'Social Media', 'Email', 'Presentations'] },
    { role: 'marketer', codes: ['seo', 'social_m', 'ads', 'keywords', 'email_m'],
      block: ['AI Audio', 'AI Video', 'Development', 'Sales & CRM', 'Education'] },
    { role: 'researcher', codes: ['papers', 'data_r', 'web_r', 'docs_r'],
      block: ['AI Audio', 'AI Video', 'AI Image Generation', 'Development', 'Sales & CRM', 'Marketing', 'Automation'] },
];

function getBlockedCategories(role: string, challenge: string, specific: string): Set<string> {
    const blocked = new Set<string>();
    const codes = [challenge, specific].filter(Boolean);
    for (const rule of BLOCK_RULES) {
        if (rule.role !== role) continue;
        if (rule.codes.some(c => codes.includes(c))) {
            for (const cat of rule.block) blocked.add(cat);
        }
    }
    return blocked;
}

// ── Matching helpers ───────────────────────────────────────────────────────────

function stem(s: string): string {
    if (s.length > 5 && s.endsWith('ing')) return s.slice(0, -3);
    if (s.length > 4 && s.endsWith('ies')) return s.slice(0, -3) + 'y';
    if (s.length > 4 && s.endsWith('es')) return s.slice(0, -2);
    if (s.length > 4 && s.endsWith('ed')) return s.slice(0, -2);
    if (s.length > 4 && s.endsWith('s')) return s.slice(0, -1);
    return s;
}

function tagMatches(label: string | undefined, tags: string[] | undefined): boolean {
    if (!label || !Array.isArray(tags) || tags.length === 0) return false;
    // Raw tokens must be ≥4 chars to filter out connectives ("ai", "the"). Stems can be shorter
    // ("coding"→"cod") and still pair correctly via the prefix check below.
    const labelTokens = label.toLowerCase().split(/[^a-z0-9]+/).filter(t => t.length >= 4).map(stem);
    if (labelTokens.length === 0) return false;
    // Stem-based pairing: tokens must share a stem or one must be a prefix of the other
    // (so "code" ↔ "coding" matches via stems "code" ↔ "cod", but "problem" ↔ "productivity" doesn't).
    return tags.some(tag => {
        const tagTokens = (tag || '').toLowerCase().split(/[^a-z0-9]+/).filter(t => t.length >= 4).map(stem);
        return labelTokens.some(lt => tagTokens.some(tt => {
            if (lt === tt) return true;
            if (lt.length > tt.length && lt.startsWith(tt)) return true;
            if (tt.length > lt.length && tt.startsWith(lt)) return true;
            return false;
        }));
    });
}

function teamMatchesWorkflow(team: string, tags: string[] | undefined): boolean {
    if (!Array.isArray(tags)) return false;
    if (team === 'solo' || team === 'freelance') {
        return tags.includes('Freelancers') || tags.includes('Students');
    }
    if (team === 'team') {
        return tags.includes('Startups') || tags.includes('Small Business') || tags.includes('Agencies');
    }
    if (team === 'enterprise') return tags.includes('Enterprise');
    return false;
}

function priorityBonus(priority: string, breakdown: Record<string, number> | undefined): boolean {
    if (!breakdown) return false;
    // case-insensitive key lookup
    const get = (k: string) => {
        const target = k.toLowerCase();
        for (const [key, val] of Object.entries(breakdown)) {
            if (key.toLowerCase() === target && typeof val === 'number') return val;
        }
        return null;
    };
    if (priority === 'easytouse') { const v = get('usability'); return v !== null && v >= 7.5; }
    if (priority === 'powerful') { const v = get('functionality'); return v !== null && v >= 8.5; }
    if (priority === 'affordable') { const v = get('value'); return v !== null && v >= 8.0; }
    if (priority === 'integrations') { const v = get('integrations'); return v !== null && v >= 7.5; }
    return false;
}

function budgetMatches(budget: string, pricingModel: string | undefined): boolean {
    if (!pricingModel) return false;
    if (budget === 'free') return ['Free', 'Freemium', 'Open Source'].includes(pricingModel);
    if (budget === 'low') return ['Freemium', 'Paid', 'Trial'].includes(pricingModel);
    return true; // mid / high match any
}

function isBudgetHardBlocked(budget: string, pricingModel: string | undefined): boolean {
    return budget === 'free' && (pricingModel === 'Paid' || pricingModel === 'Enterprise');
}

// ── Route handler ──────────────────────────────────────────────────────────────

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { role = '', challenge = '', specific = '', team = '', budget = '', priority = '' } = body || {};

        await connectDB();
        const allTools = await Tool.find({ status: 'Active' })
            .select('name slug logo category_primary pricing_model rating_score rating_breakdown short_description use_case_tags workflow_tags')
            .lean() as any[];

        const blocked = getBlockedCategories(role, challenge, specific);
        const challengeLabel = CHALLENGE_LABELS[challenge];
        const specificLabel = SPECIFIC_LABELS[specific];

        const scored: Array<{ tool: any; score: number; matched: { specific: boolean; challenge: boolean } }> = [];

        for (const tool of allTools) {
            if (blocked.has(tool.category_primary)) continue;
            if (isBudgetHardBlocked(budget, tool.pricing_model)) continue;

            let score = 0;
            const allTags = [...(tool.use_case_tags || []), ...(tool.workflow_tags || [])];
            const specificTagMatch = tagMatches(specificLabel, allTags);
            const challengeTagMatch = tagMatches(challengeLabel, allTags);
            // Position-weighted hint: first category in the hint list = strongest semantic fit.
            const specificHintIdx = !!specific ? (SPECIFIC_CATEGORY_HINTS[specific] || []).indexOf(tool.category_primary) : -1;
            const challengeHintIdx = !!challenge ? (CHALLENGE_CATEGORY_HINTS[challenge] || []).indexOf(tool.category_primary) : -1;
            const specificMatched = specificTagMatch || specificHintIdx >= 0;
            const challengeHintMatch = challengeHintIdx >= 0;

            // Full points for direct tag pairing, position-weighted for category alignment.
            // Closer weights so a 2nd/3rd-position hint match still ranks meaningfully.
            if (specificTagMatch) score += 60;
            else if (specificHintIdx === 0) score += 55;
            else if (specificHintIdx === 1) score += 45;
            else if (specificHintIdx >= 2) score += 40;

            if (challengeTagMatch) score += 35;
            else if (challengeHintIdx === 0) score += 28;
            else if (challengeHintIdx === 1) score += 22;
            else if (challengeHintIdx >= 2) score += 18;

            if (budgetMatches(budget, tool.pricing_model)) score += 20;
            if (priorityBonus(priority, tool.rating_breakdown)) score += 12;
            if (teamMatchesWorkflow(team, tool.workflow_tags)) score += 8;

            // General-purpose tools cap
            if (tool.category_primary === 'AI Chatbots' && !specificMatched) {
                score = Math.min(score, 25);
            }

            if (score > 0) {
                scored.push({ tool, score, matched: { specific: specificMatched, challenge: challengeTagMatch || challengeHintMatch } });
            }
        }

        scored.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return (b.tool.rating_score || 0) - (a.tool.rating_score || 0);
        });

        const top = scored.slice(0, 5).map(s => ({
            name: s.tool.name,
            slug: s.tool.slug,
            logo: s.tool.logo,
            category_primary: s.tool.category_primary,
            pricing_model: s.tool.pricing_model,
            rating_score: s.tool.rating_score,
            short_description: s.tool.short_description,
            score: s.score,
        }));

        return NextResponse.json({ results: top, blockedCategories: [...blocked] });
    } catch (err) {
        return NextResponse.json({ error: (err as Error).message || 'Quiz failed' }, { status: 500 });
    }
}
