'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, RotateCcw, Star, Sparkles } from 'lucide-react';

// ── Quiz data ──────────────────────────────────────────────────────────────────

type Opt = { code: string; label: string };
type Role = 'student' | 'creator' | 'developer' | 'marketer' | 'business' | 'researcher';

const ROLES: { code: Role; label: string }[] = [
    { code: 'student', label: 'Student' },
    { code: 'creator', label: 'Creator' },
    { code: 'developer', label: 'Developer' },
    { code: 'marketer', label: 'Marketer' },
    { code: 'business', label: 'Business' },
    { code: 'researcher', label: 'Researcher' },
];

const CHALLENGES: Record<Role, Opt[]> = {
    student: [
        { code: 'math_s', label: 'Maths & science' },
        { code: 'essays', label: 'Essays & writing' },
        { code: 'stu_notes', label: 'Notes & studying' },
        { code: 'research_s', label: 'Research & sources' },
        { code: 'code_s', label: 'Coding assignments' },
    ],
    creator: [
        { code: 'images', label: 'Images & art' },
        { code: 'video', label: 'Video' },
        { code: 'writing_c', label: 'Writing' },
        { code: 'audio_c', label: 'Audio & podcasts' },
        { code: 'presentations_c', label: 'Presentations' },
    ],
    developer: [
        { code: 'code_editor', label: 'AI code editor' },
        { code: 'vs_code', label: 'VS Code copilot' },
        { code: 'browser_build', label: 'Browser-based build' },
        { code: 'automation_d', label: 'Automation' },
        { code: 'frontend', label: 'Frontend & UI' },
    ],
    marketer: [
        { code: 'seo', label: 'Blog & SEO content' },
        { code: 'social_m', label: 'Social media' },
        { code: 'ads', label: 'Ad creatives' },
        { code: 'keywords', label: 'Keyword research' },
        { code: 'email_m', label: 'Email outreach' },
    ],
    business: [
        { code: 'meetings', label: 'Meetings & notes' },
        { code: 'docs_b', label: 'Docs & knowledge' },
        { code: 'sales_b', label: 'Sales & leads' },
        { code: 'automation_b', label: 'Workflow automation' },
        { code: 'data_b', label: 'Data & reporting' },
    ],
    researcher: [
        { code: 'papers', label: 'Academic papers' },
        { code: 'data_r', label: 'Data analysis' },
        { code: 'web_r', label: 'Web research' },
        { code: 'docs_r', label: 'Document analysis' },
    ],
};

const SPECIFICS: Record<string, Opt[]> = {
    math_s: [
        { code: 'math_solve', label: 'Solve problems' },
        { code: 'math_learn', label: 'Learn concepts' },
        { code: 'math_practice', label: 'Practice & revision' },
    ],
    essays: [
        { code: 'ess_draft', label: 'Drafting help' },
        { code: 'ess_proof', label: 'Proofreading' },
        { code: 'ess_research', label: 'Research support' },
    ],
    stu_notes: [
        { code: 'stu_flash', label: 'Flashcards & quizzes' },
        { code: 'stu_summarise', label: 'Summarise content' },
        { code: 'stu_tutor', label: 'AI tutoring' },
    ],
    images: [
        { code: 'img_art', label: 'Artistic / creative' },
        { code: 'img_photo', label: 'Photorealistic' },
        { code: 'img_design', label: 'Design assets' },
    ],
    video: [
        { code: 'vid_short', label: 'Short-form clips' },
        { code: 'vid_gen', label: 'AI-generated video' },
        { code: 'vid_edit', label: 'Video editing' },
    ],
    audio_c: [
        { code: 'aud_voice', label: 'Voiceovers' },
        { code: 'aud_music', label: 'Music generation' },
        { code: 'aud_podcast', label: 'Podcast production' },
    ],
    writing_c: [
        { code: 'wri_long', label: 'Long-form articles' },
        { code: 'wri_scripts', label: 'Scripts & stories' },
        { code: 'wri_marketing', label: 'Marketing copy' },
    ],
    presentations_c: [
        { code: 'pres_gen', label: 'Generate from scratch' },
        { code: 'pres_design', label: 'Design & polish' },
        { code: 'pres_team', label: 'Team collaboration' },
    ],
};

const TEAMS: Opt[] = [
    { code: 'solo', label: 'Solo' },
    { code: 'freelance', label: 'Freelancer' },
    { code: 'team', label: 'Small team (2–10)' },
    { code: 'enterprise', label: 'Large org (10+)' },
];

const BUDGETS: Opt[] = [
    { code: 'free', label: 'Free only ($0)' },
    { code: 'low', label: 'Under $20/mo' },
    { code: 'mid', label: '$20–$100/mo' },
    { code: 'high', label: '$100+/mo' },
];

const PRIORITIES: Opt[] = [
    { code: 'easytouse', label: 'Easy to use' },
    { code: 'powerful', label: 'Most powerful' },
    { code: 'affordable', label: 'Best value' },
    { code: 'integrations', label: 'Integrations' },
];

const PRICING_COLORS: Record<string, string> = {
    Free: 'bg-green-900/40 text-green-400 border-green-700/50',
    Freemium: 'bg-blue-900/40 text-blue-400 border-blue-700/50',
    Paid: 'bg-purple-900/40 text-purple-400 border-purple-700/50',
    Enterprise: 'bg-orange-900/40 text-orange-400 border-orange-700/50',
    Trial: 'bg-pink-900/40 text-pink-400 border-pink-700/50',
    'Open Source': 'bg-teal-900/40 text-teal-400 border-teal-700/50',
};

// ── Types ──────────────────────────────────────────────────────────────────────

interface QuizState {
    role: Role | '';
    challenge: string;
    specific: string;
    team: string;
    budget: string;
    priority: string;
}

interface QuizResult {
    name: string;
    slug: string;
    logo?: string;
    category_primary?: string;
    pricing_model?: string;
    rating_score?: number;
    short_description?: string;
    score: number;
}

const INITIAL: QuizState = { role: '', challenge: '', specific: '', team: '', budget: '', priority: '' };

// ── Component ──────────────────────────────────────────────────────────────────

export default function FindMyToolClient() {
    const [step, setStep] = useState(1);
    const [state, setState] = useState<QuizState>(INITIAL);
    const [results, setResults] = useState<QuizResult[] | null>(null);
    const [loading, setLoading] = useState(false);

    const hasSpecific = state.challenge && SPECIFICS[state.challenge];

    function reset() {
        setStep(1);
        setState(INITIAL);
        setResults(null);
    }

    function selectRole(code: Role) {
        setState({ ...INITIAL, role: code });
        setStep(2);
    }

    function selectChallenge(code: string) {
        setState(s => ({ ...s, challenge: code, specific: '' }));
        // If this challenge has sub-options, go to step 3. Otherwise skip to step 4.
        setStep(SPECIFICS[code] ? 3 : 4);
    }

    function selectSpecific(code: string) {
        setState(s => ({ ...s, specific: code }));
        setStep(4);
    }

    function selectTeam(code: string) {
        setState(s => ({ ...s, team: code }));
        setStep(5);
    }

    function selectBudget(code: string) {
        setState(s => ({ ...s, budget: code }));
        setStep(6);
    }

    async function selectPriority(code: string) {
        const finalState = { ...state, priority: code };
        setState(finalState);
        setLoading(true);
        try {
            const r = await fetch('/api/quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalState),
            });
            const data = await r.json();
            setResults(data.results || []);
        } catch {
            setResults([]);
        } finally {
            setLoading(false);
        }
    }

    function goBack() {
        if (step === 1) return;
        if (step === 4 && !hasSpecific) setStep(2);
        else setStep(step - 1);
    }

    // ── Render results ─────────────────────────────────────────────────────────

    if (results !== null) {
        const roleLabel = ROLES.find(r => r.code === state.role)?.label || '';
        const challengeLabel = CHALLENGES[state.role as Role]?.find(c => c.code === state.challenge)?.label || '';
        const budgetLabel = BUDGETS.find(b => b.code === state.budget)?.label || '';

        return (
            <main className="container mx-auto px-4 md:px-8 py-6 md:py-12 max-w-3xl pt-24 md:pt-32">
                {/* Summary bar */}
                <div className="mb-6 p-4 rounded-2xl bg-news-accent/10 border border-news-accent/30">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-news-accent mb-1">Your matches</p>
                    <p className="text-sm md:text-base font-bold text-white leading-snug">
                        Results for <span className="text-news-accent">{roleLabel}</span> — {challengeLabel} · {budgetLabel}
                    </p>
                </div>

                {loading && (
                    <div className="text-center py-12">
                        <div className="w-8 h-8 border-2 border-news-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-news-muted text-sm">Finding your matches…</p>
                    </div>
                )}

                {!loading && results.length === 0 && (
                    <div className="text-center py-12 text-news-muted">
                        <p className="text-base mb-2">No tools matched your filters.</p>
                        <p className="text-xs">Try relaxing your budget or starting over with different choices.</p>
                    </div>
                )}

                {!loading && results.length > 0 && (
                    <div className="space-y-3">
                        {results.map((tool, idx) => (
                            <a
                                key={tool.slug}
                                href={`/tools/${tool.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`group block rounded-2xl border p-4 md:p-5 transition-all relative ${
                                    idx === 0
                                        ? 'bg-news-accent/5 border-news-accent/40 hover:border-news-accent/70'
                                        : 'bg-surface-card border-border-subtle hover:border-news-accent/30 hover:bg-surface-hover'
                                }`}
                            >
                                {idx === 0 && (
                                    <span className="absolute -top-2 -right-2 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-news-accent text-[#0B0F14] flex items-center gap-1">
                                        <Sparkles size={9} /> Best match
                                    </span>
                                )}
                                <div className="flex items-start gap-3 md:gap-4">
                                    {/* Rank */}
                                    <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                                        idx === 0
                                            ? 'bg-news-accent text-[#0B0F14]'
                                            : 'bg-white/5 border border-white/10 text-news-muted'
                                    }`}>
                                        {idx + 1}
                                    </div>

                                    {/* Logo */}
                                    {tool.logo && (
                                        <div className="relative w-12 h-12 rounded-xl bg-white border border-border-subtle flex-shrink-0 overflow-hidden">
                                            <Image src={tool.logo} alt={tool.name} fill style={{ objectFit: 'contain', padding: '6px' }} unoptimized />
                                        </div>
                                    )}

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <h3 className="text-sm md:text-base font-black text-white group-hover:text-news-accent transition-colors leading-tight">
                                                {tool.name}
                                            </h3>
                                            {typeof tool.rating_score === 'number' && tool.rating_score > 0 && (
                                                <span className="flex items-center gap-1 text-xs font-bold text-news-accent flex-shrink-0">
                                                    <Star size={11} fill="currentColor" /> {tool.rating_score.toFixed(1)}/10
                                                </span>
                                            )}
                                        </div>
                                        {tool.short_description && (
                                            <p className="text-xs md:text-sm text-news-muted leading-relaxed line-clamp-2 mb-2">
                                                {tool.short_description}
                                            </p>
                                        )}
                                        <div className="flex flex-wrap items-center gap-2">
                                            {tool.category_primary && (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-news-muted uppercase tracking-widest">
                                                    {tool.category_primary}
                                                </span>
                                            )}
                                            {tool.pricing_model && (
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${PRICING_COLORS[tool.pricing_model] || 'bg-white/5 border-white/10 text-news-muted'}`}>
                                                    {tool.pricing_model}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                )}

                <div className="mt-10 pt-8 border-t border-border-divider text-center">
                    <p className="text-news-muted text-sm mb-4">Not what you&apos;re looking for?</p>
                    <button
                        onClick={reset}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-transparent border-2 border-news-accent text-news-accent font-black px-6 py-3 rounded-xl text-xs uppercase tracking-widest hover:bg-news-accent hover:text-[#0B0F14] transition-all"
                    >
                        <RotateCcw size={14} /> Start over
                    </button>
                </div>
            </main>
        );
    }

    // ── Render quiz ────────────────────────────────────────────────────────────

    function Card({ opt, onClick }: { opt: { code: string; label: string }; onClick: () => void }) {
        return (
            <button
                onClick={onClick}
                className="group w-full text-left bg-surface-card hover:bg-surface-hover border border-border-subtle hover:border-news-accent/50 rounded-2xl px-5 py-4 transition-all flex items-center justify-between gap-3"
            >
                <span className="font-bold text-white group-hover:text-news-accent transition-colors text-sm md:text-base">
                    {opt.label}
                </span>
                <ArrowRight size={16} className="text-news-muted group-hover:text-news-accent group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </button>
        );
    }

    const stepTitle = (() => {
        switch (step) {
            case 1: return 'What best describes you?';
            case 2: return 'What do you need help with?';
            case 3: return 'Anything more specific?';
            case 4: return 'How big is your team?';
            case 5: return 'What\'s your budget?';
            case 6: return 'What matters most?';
            default: return '';
        }
    })();

    const stepOptions: Opt[] = (() => {
        switch (step) {
            case 1: return ROLES;
            case 2: return state.role ? CHALLENGES[state.role as Role] : [];
            case 3: return state.challenge ? SPECIFICS[state.challenge] || [] : [];
            case 4: return TEAMS;
            case 5: return BUDGETS;
            case 6: return PRIORITIES;
            default: return [];
        }
    })();

    const onSelect = (code: string) => {
        switch (step) {
            case 1: selectRole(code as Role); break;
            case 2: selectChallenge(code); break;
            case 3: selectSpecific(code); break;
            case 4: selectTeam(code); break;
            case 5: selectBudget(code); break;
            case 6: selectPriority(code); break;
        }
    };

    // If the chosen challenge has no sub-options, this path skips step 3 → 5 total steps.
    // Before challenge is chosen we don't know yet, so assume full 6.
    const skipsSpecific = !!state.challenge && !SPECIFICS[state.challenge];
    const totalSteps = skipsSpecific ? 5 : 6;
    const displayedStep = skipsSpecific && step >= 4 ? step - 1 : step;
    const progress = Math.round((displayedStep / totalSteps) * 100);

    return (
        <main className="container mx-auto px-4 md:px-8 py-6 md:py-12 max-w-2xl pt-24 md:pt-32">
            {/* Header */}
            <div className="mb-8">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-news-accent mb-2">Find Your Tool</p>
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight mb-3">
                    Find Your Tool
                </h1>
                <p className="text-sm md:text-base text-news-muted leading-relaxed mb-6 max-w-xl">
                    Answer a few questions — get recommendations matched to your role, budget, and workflow.
                </p>

                {/* Progress bar */}
                <div className="flex items-center gap-3 mb-2">
                    <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                            className="h-full bg-news-accent transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <span className="text-[10px] font-bold text-news-muted uppercase tracking-widest">
                        {displayedStep}/{totalSteps}
                    </span>
                </div>
            </div>

            {/* Step title */}
            <h2 className="text-xl md:text-2xl font-black text-white mb-5">{stepTitle}</h2>

            {/* Options */}
            <div className="space-y-2.5">
                {stepOptions.map(opt => (
                    <Card key={opt.code} opt={opt} onClick={() => onSelect(opt.code)} />
                ))}
            </div>

            {/* Back */}
            {step > 1 && (
                <div className="mt-6 text-center">
                    <button
                        onClick={goBack}
                        className="text-xs text-news-muted hover:text-white transition-colors underline underline-offset-2"
                    >
                        ← Back
                    </button>
                </div>
            )}

            {/* Browse fallback */}
            <div className="mt-12 text-center">
                <Link
                    href="/ai-tools"
                    className="text-xs text-news-muted hover:text-white transition-colors underline underline-offset-2"
                >
                    Prefer to browse? → Explore all tools
                </Link>
            </div>
        </main>
    );
}
