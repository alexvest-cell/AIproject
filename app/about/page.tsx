import type { Metadata } from 'next';
import {
    Code2, Megaphone, Rocket, Search, Building,
    Shield, Link2, RefreshCw, Check,
} from 'lucide-react';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';

export const metadata: Metadata = {
    title: 'About ToolCurrent — Independent AI Tool Intelligence',
    description: 'How ToolCurrent evaluates and scores AI tools. Our methodology, editorial independence policy, and data confidence standards.',
    alternates: { canonical: 'https://toolcurrent.com/about' },
};

const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'ToolCurrent',
    'url': 'https://toolcurrent.com',
    'logo': 'https://toolcurrent.com/logo.png',
    'description': 'Independent AI tool intelligence platform providing structured ratings, head-to-head comparisons, and evidence-based recommendations for AI tools and software.',
    'foundingDate': '2025',
    'areaServed': 'Worldwide',
    'knowsAbout': [
        'AI Tools',
        'Software Comparison',
        'AI Chatbots',
        'Developer Tools',
        'Marketing Software',
        'Productivity Software',
    ],
};

const DIMENSIONS = [
    { name: 'Core Functionality',       weight: '30%', desc: 'How well the tool does its primary job. The highest-weighted dimension.' },
    { name: 'Features & Capabilities',  weight: '20%', desc: 'Breadth and depth beyond core function including integrations, API access, and platform availability.' },
    { name: 'Usability & UX',           weight: '15%', desc: 'How quickly a new user can get value. Includes onboarding, interface clarity, and learning curve.' },
    { name: 'Value for Money',          weight: '15%', desc: 'What you get relative to what you pay, evaluated against direct competitors at the same price point.' },
    { name: 'Integrations & Ecosystem', weight: '10%', desc: 'How well the tool connects with professional software stacks. Native integrations and API quality.' },
    { name: 'Reliability & Limitations',weight: '10%', desc: 'Consistency of output quality and known limitations that affect real-world use.' },
];

const EDITORIAL_COLS = [
    { icon: Shield,    title: 'Independent Rankings',    body: 'ToolCurrent does not accept payment to feature, rank, or promote any tool. Rankings are determined entirely by score. The score is determined entirely by methodology.' },
    { icon: Link2,     title: 'Affiliate Disclosure',    body: 'ToolCurrent may participate in affiliate programs in the future. Any affiliate relationships will be clearly disclosed and will never influence ranking position, score, or editorial content.' },
    { icon: RefreshCw, title: 'Regular Re-evaluation',   body: 'Tools are re-evaluated when major updates ship — new models, pricing changes, feature launches. Every entry shows a Last Updated date and data confidence level.' },
];

const AUDIENCES = [
    { icon: Code2,     label: 'Developers',       desc: 'Evaluating coding assistants, API tools, and development platforms — who need rate limits, API pricing, and model capabilities before committing.' },
    { icon: Megaphone, label: 'Marketers',         desc: 'Comparing AI writing, automation, and CRM tools — who need to understand what\'s actually different between tools at the same price point.' },
    { icon: Rocket,    label: 'Founders',          desc: 'Building their first AI stack — who need to know which tools grow with them and which hit walls at scale.' },
    { icon: Search,    label: 'Researchers',       desc: 'Evaluating tools for analysis and knowledge management — who need to understand memory, context windows, and data handling.' },
    { icon: Building,  label: 'Enterprise Buyers', desc: 'Evaluating tools for team deployment — who need SSO, compliance, audit logs, and seat-based pricing details before involving procurement.' },
];

const CONFIDENCE = [
    { dot: 'bg-green-400',  label: 'Verified',      body: 'Pricing, features, and capabilities confirmed against official documentation and live testing.' },
    { dot: 'bg-yellow-400', label: 'Inferred',       body: 'Data derived from publicly available information, official announcements, and cross-referenced sources. High confidence but not independently tested.' },
    { dot: 'bg-gray-500',   label: 'AI Generated',   body: 'Initial data generated from training knowledge and public sources. Reviewed for accuracy but not independently verified.' },
];

const CHECKLIST = [
    'All six scoring dimensions calculated and documented',
    'At least two use case scores with evidence sentences',
    'At least one workflow score with specific pricing or feature evidence',
    'Pricing data current within 90 days',
    'Known limitations documented honestly — not softened',
    'No superlatives, no hype language, no vendor-provided copy',
    'Data confidence level labeled on every entry',
];

export default function AboutPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
            />
            <SiteNav />

            <main className="bg-surface-base text-news-text">

                {/* ── Section 1: Hero ──────────────────────────────────────── */}
                <section className="relative pt-36 pb-24 overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, white 1px, transparent 0)', backgroundSize: '36px 36px' }} />
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, rgba(43,212,195,0.08) 0%, transparent 60%)' }} />
                    <div className="container mx-auto px-4 md:px-8 relative z-10 text-center max-w-3xl">
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-news-accent mb-4">About ToolCurrent</p>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-[1.05] mb-6">
                            Independent AI Tool Intelligence
                        </h1>
                        <p className="text-lg text-news-muted leading-relaxed">
                            ToolCurrent helps professionals find, compare, and evaluate AI tools and software through structured ratings, head-to-head comparisons, and evidence-based recommendations — with no pay-to-rank.
                        </p>
                    </div>
                </section>

                {/* ── Section 2: Our Mission ───────────────────────────────── */}
                <section className="py-20 border-t border-border-subtle">
                    <div className="container mx-auto px-4 md:px-8 grid md:grid-cols-2 gap-12 md:gap-20 items-start max-w-5xl">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-news-accent mb-3">Our Mission</p>
                            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Why ToolCurrent Exists</h2>
                        </div>
                        <div className="space-y-4 text-news-text leading-relaxed">
                            <p>The AI tools landscape is moving faster than anyone can track. New tools launch daily, pricing changes weekly, and capabilities that didn't exist last quarter are now table stakes. Most comparison sites either lack structure, accept payment for rankings, or haven't been updated since 2023.</p>
                            <p>ToolCurrent exists to solve this. We evaluate every tool against a consistent methodology, score it across six dimensions, and surface the specific evidence that helps you decide — not generic summaries that apply to every tool equally.</p>
                        </div>
                    </div>
                </section>

                {/* ── Section 3: Methodology ───────────────────────────────── */}
                <section className="py-20 bg-surface-alt border-y border-border-subtle">
                    <div className="container mx-auto px-4 md:px-8 max-w-5xl">
                        <div className="mb-10">
                            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-news-accent mb-3">Methodology</p>
                            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-2">How We Score Every Tool</h2>
                            <p className="text-news-muted">Every tool is scored across six weighted dimensions. The final score is a weighted average — not an editorial opinion.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                            {DIMENSIONS.map(d => (
                                <div key={d.name} className="p-5 rounded-xl bg-surface-card border border-border-subtle">
                                    <div className="text-3xl font-black text-news-accent mb-2">{d.weight}</div>
                                    <div className="text-sm font-bold text-white mb-2">{d.name}</div>
                                    <div className="text-xs text-news-muted leading-relaxed">{d.desc}</div>
                                </div>
                            ))}
                        </div>

                        {/* Formula */}
                        <div className="bg-surface-base rounded-xl border border-border-subtle px-5 py-4 mb-8 overflow-x-auto">
                            <p className="text-[11px] font-mono text-news-accent whitespace-nowrap">
                                Final Score = (0.30 × Functionality) + (0.20 × Features) + (0.15 × Usability) + (0.15 × Value) + (0.10 × Integrations) + (0.10 × Reliability)
                            </p>
                        </div>

                        {/* Score scale */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                                { range: '8.5 – 9.2', label: 'Excellent',     color: 'text-news-accent' },
                                { range: '7.6 – 8.4', label: 'Good',          color: 'text-green-400' },
                                { range: '6.5 – 7.5', label: 'Average',       color: 'text-yellow-400' },
                                { range: 'Below 6.5', label: 'Below average', color: 'text-red-400' },
                            ].map(s => (
                                <div key={s.label} className="flex flex-col items-center p-3 rounded-lg bg-surface-card border border-border-subtle text-center">
                                    <span className={`text-sm font-black ${s.color}`}>{s.range}</span>
                                    <span className="text-[10px] text-news-muted mt-1 uppercase tracking-wider">{s.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Section 4: Use Case & Workflow Scoring ───────────────── */}
                <section className="py-20 border-b border-border-subtle">
                    <div className="container mx-auto px-4 md:px-8 max-w-5xl grid md:grid-cols-2 gap-12">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-news-accent mb-3">Use Case Scores</p>
                            <h3 className="text-xl font-black text-white mb-4">How well for a specific task?</h3>
                            <p className="text-news-text leading-relaxed text-sm">Beyond the overall score every tool is evaluated for specific tasks — Coding, Research, Content Creation, Data Analysis. A tool might score 9.1 overall but 6.8 for Data Analysis if that's not its strength. Use case scores power the comparison engine — when you compare two tools for a specific use case the scores reflect that context directly.</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-news-accent mb-3">Workflow Scores</p>
                            <h3 className="text-xl font-black text-white mb-4">How well for a specific audience?</h3>
                            <p className="text-news-text leading-relaxed text-sm">Every tool is also evaluated for specific audience types — Developers, Marketers, Small Business, Researchers. The workflow score is backed by a specific evidence sentence citing pricing, features, or limitations relevant to that audience. These scores power the Best Tools for Developers and Best Tools for Marketers ranking pages — so you see tools ranked for your situation, not just by overall score.</p>
                        </div>
                    </div>
                </section>

                {/* ── Section 5: Editorial Independence ───────────────────── */}
                <section className="py-20 bg-surface-alt border-b border-border-subtle">
                    <div className="container mx-auto px-4 md:px-8 max-w-5xl">
                        <div className="border-l-2 border-news-accent pl-6 mb-10">
                            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-news-accent mb-3">Editorial Policy</p>
                            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">No Pay-to-Rank. Ever.</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            {EDITORIAL_COLS.map(col => {
                                const Icon = col.icon;
                                return (
                                    <div key={col.title} className="p-6 rounded-xl bg-surface-card border border-border-subtle">
                                        <div className="w-9 h-9 rounded-lg bg-news-accent/10 border border-news-accent/20 flex items-center justify-center mb-4">
                                            <Icon size={18} className="text-news-accent" />
                                        </div>
                                        <h3 className="text-sm font-bold text-white mb-2">{col.title}</h3>
                                        <p className="text-xs text-news-text leading-relaxed">{col.body}</p>
                                    </div>
                                );
                            })}
                        </div>
                        <a href="/editorial-policy" className="text-sm font-bold text-news-accent hover:underline">
                            Read our full editorial policy →
                        </a>
                    </div>
                </section>

                {/* ── Section 6: Data Confidence ───────────────────────────── */}
                <section className="py-20 border-b border-border-subtle">
                    <div className="container mx-auto px-4 md:px-8 max-w-5xl">
                        <div className="mb-10">
                            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-news-accent mb-3">Data Standards</p>
                            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">How We Label Data Confidence</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {CONFIDENCE.map(c => (
                                <div key={c.label} className="p-6 rounded-xl bg-surface-card border border-border-subtle">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${c.dot}`} />
                                        <span className="text-sm font-bold text-white">{c.label}</span>
                                    </div>
                                    <p className="text-xs text-news-text leading-relaxed">{c.body}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Section 7: Who We Serve ──────────────────────────────── */}
                <section className="py-20 bg-surface-alt border-b border-border-subtle">
                    <div className="container mx-auto px-4 md:px-8 max-w-5xl">
                        <div className="mb-10">
                            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-news-accent mb-3">Our Audience</p>
                            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Built for Professionals Making Real Tool Decisions</h2>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                            {AUDIENCES.map(a => {
                                const Icon = a.icon;
                                return (
                                    <div key={a.label} className="p-5 rounded-xl bg-surface-card border border-border-subtle flex flex-col gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-news-accent/10 border border-news-accent/20 flex items-center justify-center flex-shrink-0">
                                            <Icon size={18} className="text-news-accent" />
                                        </div>
                                        <span className="text-sm font-bold text-white">{a.label}</span>
                                        <p className="text-[11px] text-news-muted leading-relaxed">{a.desc}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* ── Section 8: The ToolCurrent Standard ─────────────────── */}
                <section className="py-20 border-b border-border-subtle">
                    <div className="container mx-auto px-4 md:px-8 max-w-3xl">
                        <div className="mb-8">
                            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-news-accent mb-3">Our Standard</p>
                            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Every Tool Entry Must Meet These Requirements</h2>
                        </div>
                        <div className="bg-surface-card border border-border-subtle rounded-2xl p-8">
                            <ul className="space-y-4">
                                {CHECKLIST.map(item => (
                                    <li key={item} className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-news-accent/10 border border-news-accent/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <Check size={11} className="text-news-accent" />
                                        </div>
                                        <span className="text-sm text-news-text leading-relaxed">{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <p className="mt-8 text-sm text-news-muted italic">
                                If a tool doesn't meet these standards it isn't published.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ── Section 9: CTA Footer ────────────────────────────────── */}
                <section className="py-20 bg-surface-alt">
                    <div className="container mx-auto px-4 md:px-8 max-w-4xl grid sm:grid-cols-2 gap-6">
                        <a
                            href="/ai-tools"
                            className="group flex flex-col gap-3 p-6 rounded-2xl bg-surface-card border border-border-subtle hover:border-news-accent/50 hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(43,212,195,0.08)] transition-all no-underline"
                        >
                            <h3 className="text-lg font-black text-white">Explore AI Tools</h3>
                            <p className="text-sm text-news-muted leading-relaxed flex-grow">Browse and filter 200+ AI and software tools by category, use case, and pricing.</p>
                            <span className="text-sm font-bold text-news-accent group-hover:underline">Browse AI Tools →</span>
                        </a>
                        <a
                            href="/best-ai-tools"
                            className="group flex flex-col gap-3 p-6 rounded-2xl bg-surface-card border border-border-subtle hover:border-news-accent/50 hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(43,212,195,0.08)] transition-all no-underline"
                        >
                            <h3 className="text-lg font-black text-white">Best AI Tool Rankings</h3>
                            <p className="text-sm text-news-muted leading-relaxed flex-grow">Curated rankings scored by methodology — not by who paid to be featured.</p>
                            <span className="text-sm font-bold text-news-accent group-hover:underline">View Rankings →</span>
                        </a>
                    </div>
                </section>

            </main>

            <SiteFooter />
        </>
    );
}
