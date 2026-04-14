import type { Metadata } from 'next';
import { Check, X } from 'lucide-react';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import LegalNav from '@/components/LegalNav';

export const metadata: Metadata = {
    title: 'Editorial Policy — ToolCurrent',
    description: 'How ToolCurrent evaluates tools, handles affiliate relationships, and maintains editorial independence. No pay-to-rank, ever.',
    alternates: { canonical: 'https://toolcurrent.com/editorial-policy' },
};

const COVERAGE_CRITERIA = [
    'Relevant to professional workflows',
    'Sufficient public data to score accurately',
    'Live, maintained, and stable',
];

const AFFILIATE_AFFECTS = [
    'Whether we include a direct signup link',
    'Which link is used for the primary CTA button',
];

const AFFILIATE_NEVER = [
    "A tool's score or ranking position",
    'Whether a tool is included at all',
    'The content of pros, cons, or limitations',
    'Which tool wins in a comparison',
];

const VENDOR_MAY = [
    'Submit factual corrections (pricing errors, outdated model info)',
    'Provide documentation to support a correction request',
];

const VENDOR_MAY_NOT = [
    'Request score changes',
    'Request removal of limitations or cons',
    'Request preferential placement',
    'Pay for featured placement or ranking boosts',
];

const CONFIDENCE = [
    { dot: 'bg-green-400',  label: 'Verified' },
    { dot: 'bg-yellow-400', label: 'Inferred' },
    { dot: 'bg-gray-500',   label: 'AI Generated' },
];

export default function EditorialPolicyPage() {
    return (
        <>
            <SiteNav />

            <main className="bg-surface-base text-news-text">

                {/* ── Section 1: Hero ───────────────────────────────────────── */}
                <section className="relative pt-36 pb-24 overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, white 1px, transparent 0)', backgroundSize: '36px 36px' }} />
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, rgba(43,212,195,0.08) 0%, transparent 60%)' }} />
                    <div className="container mx-auto px-4 md:px-8 relative z-10 text-center max-w-3xl">
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-news-accent mb-4">ToolCurrent</p>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-[1.05] mb-6">
                            Editorial Policy
                        </h1>
                        <p className="text-lg text-news-muted leading-relaxed mb-4">
                            How ToolCurrent makes decisions about what to cover, how to score it, and what we will never do.
                        </p>
                        <p className="text-xs text-news-muted">Last updated: April 2026</p>
                    </div>
                </section>

                {/* ── Section 2: Short Version ──────────────────────────────── */}
                <section className="py-16 border-t border-border-subtle">
                    <div className="container mx-auto px-4 md:px-8 max-w-3xl">
                        <div className="border-l-2 border-news-accent pl-6 bg-surface-card rounded-r-xl p-6">
                            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-news-accent mb-3">Summary</p>
                            <h2 className="text-xl font-black text-white mb-4">The Short Version</h2>
                            <p className="text-news-text leading-relaxed">
                                We rank tools by score. We calculate scores by methodology. We do not accept payment to influence rankings, scores, or editorial content. Any future affiliate relationships will never affect rankings, scores, or editorial content.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ── Section 3: What We Cover ──────────────────────────────── */}
                <section className="py-20 border-t border-border-subtle">
                    <div className="container mx-auto px-4 md:px-8 max-w-5xl grid md:grid-cols-2 gap-12 md:gap-20 items-start">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-news-accent mb-3">Coverage</p>
                            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">What We Cover and Why</h2>
                        </div>
                        <div>
                            <div className="space-y-4 text-news-text leading-relaxed text-sm mb-6">
                                <p>ToolCurrent covers AI tools and software that professionals use to do their work. We add tools based on relevance to professional workflows, sufficient public data to score accurately, and stability — the tool must be live, maintained, and past early alpha.</p>
                                <p>We do not add tools because a vendor asked us to, paid us to, or sent a press release. We do not remove tools because a vendor complained about their score.</p>
                            </div>
                            <ul className="space-y-3">
                                {COVERAGE_CRITERIA.map(item => (
                                    <li key={item} className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-news-accent/10 border border-news-accent/30 flex items-center justify-center flex-shrink-0">
                                            <Check size={11} className="text-news-accent" />
                                        </div>
                                        <span className="text-sm text-news-text">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                {/* ── Section 4: How Scoring Works ─────────────────────────── */}
                <section className="py-20 bg-surface-alt border-y border-border-subtle">
                    <div className="container mx-auto px-4 md:px-8 max-w-3xl">
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-news-accent mb-3">Scoring</p>
                        <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-6">How Scores Are Calculated and When They Change</h2>
                        <p className="text-news-text leading-relaxed text-sm mb-6">
                            Every tool is scored across six dimensions using a fixed weighted formula. The weights never change based on the tool, the vendor, or any commercial relationship. Scores are recalculated when a tool releases a major new model or version, pricing changes significantly, new capabilities are added or removed, or we identify an error in the original scoring.
                        </p>
                        <div className="border border-news-accent/30 bg-news-accent/5 rounded-xl px-5 py-4 mb-6">
                            <p className="text-sm text-news-accent font-medium">
                                We do not change scores in response to vendor requests, complaints, or commercial pressure.
                            </p>
                        </div>
                        <a href="/about" className="text-sm font-bold text-news-accent hover:underline">
                            See the full scoring methodology →
                        </a>
                    </div>
                </section>

                {/* ── Section 5: Affiliate Relationships ───────────────────── */}
                <section className="py-20 border-b border-border-subtle">
                    <div className="container mx-auto px-4 md:px-8 max-w-5xl">
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-news-accent mb-3">Affiliates</p>
                        <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-8">How Affiliate Relationships Would Be Handled</h2>
                        <div className="grid sm:grid-cols-2 gap-6 mb-8">
                            {/* What IS affected */}
                            <div className="p-6 rounded-xl bg-green-500/5 border border-green-500/20">
                                <div className="flex items-center gap-2 mb-4">
                                    <Check size={16} className="text-green-400" />
                                    <span className="text-sm font-bold text-white">If affiliate relationships exist, they would only affect:</span>
                                </div>
                                <ul className="space-y-2">
                                    {AFFILIATE_AFFECTS.map(item => (
                                        <li key={item} className="text-sm text-news-text flex items-start gap-2">
                                            <span className="text-green-400 mt-0.5 flex-shrink-0">•</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            {/* What is NOT affected */}
                            <div className="p-6 rounded-xl bg-news-accent/5 border border-news-accent/20">
                                <div className="flex items-center gap-2 mb-4">
                                    <X size={16} className="text-news-accent" />
                                    <span className="text-sm font-bold text-white">Affiliate relationships will never affect:</span>
                                </div>
                                <ul className="space-y-2">
                                    {AFFILIATE_NEVER.map(item => (
                                        <li key={item} className="text-sm text-news-text flex items-start gap-2">
                                            <span className="text-news-accent mt-0.5 flex-shrink-0">•</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <p className="text-sm text-news-muted leading-relaxed">
                            All tools are scored identically regardless of affiliate status. A tool with no affiliate program would score the same as any tool we might earn commissions from — rankings are determined by methodology alone.
                        </p>
                    </div>
                </section>

                {/* ── Section 6: Vendor Relationships ──────────────────────── */}
                <section className="py-20 bg-surface-alt border-b border-border-subtle">
                    <div className="container mx-auto px-4 md:px-8 max-w-5xl">
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-news-accent mb-3">Vendors</p>
                        <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-8">What Vendors Can and Cannot Do</h2>
                        <div className="grid sm:grid-cols-2 gap-6 mb-8">
                            <div className="p-6 rounded-xl bg-surface-card border border-border-subtle">
                                <div className="flex items-center gap-2 mb-4">
                                    <Check size={16} className="text-green-400" />
                                    <span className="text-sm font-bold text-white">Vendors may</span>
                                </div>
                                <ul className="space-y-2">
                                    {VENDOR_MAY.map(item => (
                                        <li key={item} className="text-sm text-news-text flex items-start gap-2">
                                            <span className="text-green-400 mt-0.5 flex-shrink-0">•</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="p-6 rounded-xl bg-surface-card border border-border-subtle">
                                <div className="flex items-center gap-2 mb-4">
                                    <X size={16} className="text-red-400" />
                                    <span className="text-sm font-bold text-white">Vendors may not</span>
                                </div>
                                <ul className="space-y-2">
                                    {VENDOR_MAY_NOT.map(item => (
                                        <li key={item} className="text-sm text-news-text flex items-start gap-2">
                                            <span className="text-red-400 mt-0.5 flex-shrink-0">•</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <p className="text-sm text-news-muted leading-relaxed">
                            We review all vendor correction requests and update data when the correction is accurate and verifiable against official documentation.
                        </p>
                    </div>
                </section>

                {/* ── Section 7: Data Accuracy / Corrections ───────────────── */}
                <section className="py-20 border-b border-border-subtle">
                    <div className="container mx-auto px-4 md:px-8 max-w-3xl">
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-news-accent mb-3">Corrections</p>
                        <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-6">Errors and Corrections</h2>
                        <p className="text-news-text leading-relaxed text-sm mb-8">
                            We make mistakes. When we get something wrong we want to fix it. If you find an error — wrong pricing, outdated model information, incorrect capability — contact us. We review all corrections and update data when verifiable against official documentation.
                        </p>
                        <div className="rounded-xl border border-border-subtle overflow-hidden">
                            <div className="flex items-start gap-4 p-4 border-b border-border-subtle bg-green-500/5">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-green-400 w-24 flex-shrink-0 pt-0.5">Accepted</span>
                                <p className="text-sm text-news-text">Factual errors in pricing, model versions, feature availability, platform support</p>
                            </div>
                            <div className="flex items-start gap-4 p-4 bg-red-500/5">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-red-400 w-24 flex-shrink-0 pt-0.5">Not accepted</span>
                                <p className="text-sm text-news-text">Requests to change scores, remove limitations, or alter editorial content</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Section 8: AI-Generated Content ──────────────────────── */}
                <section className="py-20 bg-surface-alt border-b border-border-subtle">
                    <div className="container mx-auto px-4 md:px-8 max-w-3xl">
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-news-accent mb-3">Transparency</p>
                        <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-6">AI-Generated Content</h2>
                        <p className="text-news-text leading-relaxed text-sm mb-6">
                            Tool profiles are generated with AI assistance and reviewed editorially. Every entry is labeled with a data confidence level — Verified, Inferred, or AI Generated. AI-generated entries are reviewed for accuracy before publishing. We do not use vendor-provided copy or marketing materials as the basis for tool descriptions.
                        </p>
                        <div className="flex flex-wrap gap-3 mb-6">
                            {CONFIDENCE.map(c => (
                                <div key={c.label} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-card border border-border-subtle">
                                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${c.dot}`} />
                                    <span className="text-xs font-bold text-news-text">{c.label}</span>
                                </div>
                            ))}
                        </div>
                        <a href="/about" className="text-sm font-bold text-news-accent hover:underline">
                            Learn more about data confidence →
                        </a>
                    </div>
                </section>

                {/* ── Section 9: Contact ────────────────────────────────────── */}
                <section className="py-20 border-b border-border-subtle">
                    <div className="container mx-auto px-4 md:px-8 max-w-4xl">
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-news-accent mb-3">Contact</p>
                        <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-8">Get in Touch</h2>
                        <div className="grid sm:grid-cols-2 gap-6">
                            <div className="p-6 rounded-xl bg-surface-card border border-border-subtle flex flex-col gap-3">
                                <h3 className="text-sm font-bold text-white">Factual Corrections</h3>
                                <p className="text-sm text-news-muted leading-relaxed flex-grow">Found an error in a tool profile? Let us know and we'll review it.</p>
                                <a href="mailto:contact@toolcurrent.com" className="text-sm font-bold text-news-accent hover:underline">
                                    contact@toolcurrent.com
                                </a>
                            </div>
                            <div className="p-6 rounded-xl bg-surface-card border border-border-subtle flex flex-col gap-3">
                                <h3 className="text-sm font-bold text-white">General Inquiries</h3>
                                <p className="text-sm text-news-muted leading-relaxed flex-grow">Questions about our methodology, coverage, or editorial decisions.</p>
                                <a href="mailto:contact@toolcurrent.com" className="text-sm font-bold text-news-accent hover:underline">
                                    contact@toolcurrent.com
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

            </main>

            <LegalNav current="/editorial-policy" />
            <SiteFooter />
        </>
    );
}
