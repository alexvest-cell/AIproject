import type { Metadata } from 'next';
import { Check, X } from 'lucide-react';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import LegalNav from '@/components/LegalNav';

export const metadata: Metadata = {
    title: 'Privacy Policy — ToolCurrent',
    description: 'How ToolCurrent collects, uses, and protects your data. GDPR compliance information for EU users.',
    alternates: { canonical: 'https://toolcurrent.com/privacy-policy' },
};

const DATA_CARDS = [
    {
        label: 'Data You Provide',
        body: 'We do not require account creation or user registration. If you contact us via email we collect your email address and message content.',
    },
    {
        label: 'Automatically Collected Data',
        body: 'When you visit ToolCurrent we automatically collect standard analytics data including pages visited, time on page, referring URL, browser type, device type, and approximate geographic location at country/region level. This data is aggregate and not linked to individual identities.',
    },
    {
        label: 'Affiliate Tracking',
        body: "When you click an affiliate link a tracking cookie may be set by the affiliate vendor's platform. We do not control data collected by affiliate vendors after you leave our site. Refer to each vendor's privacy policy for details.",
    },
];

const USE_YES = [
    'Understand which tools and comparisons users find most useful',
    'Identify technical issues',
    'Improve content and site structure',
];

const USE_NO = [
    'Sell personal data to third parties',
    'Use data for advertising targeting',
    'Build individual user profiles',
    'Share data with vendors for marketing',
];

const GDPR_RIGHTS = [
    { name: 'Right of Access',           desc: 'Request a copy of data we hold about you' },
    { name: 'Right to Rectification',    desc: 'Request correction of inaccurate data' },
    { name: 'Right to Erasure',          desc: 'Request deletion of your data' },
    { name: 'Right to Object',           desc: 'Object to processing based on legitimate interest' },
    { name: 'Right to Data Portability', desc: 'Receive your data in a portable format' },
    { name: 'Right to Complain',         desc: 'Lodge a complaint with your national data protection authority' },
];

const RETENTION = [
    { item: 'Aggregate analytics data', value: '26 months' },
    { item: 'Email correspondence',     value: '3 years' },
    { item: 'Individual session data',  value: 'Not retained beyond aggregation' },
];

const THIRD_PARTIES = [
    { name: 'Analytics provider', desc: 'Aggregate usage statistics' },
    { name: 'Cloudinary',         desc: 'Image hosting and delivery' },
    { name: 'MongoDB Atlas',      desc: 'Database hosting' },
    { name: 'Render.com',         desc: 'Website hosting' },
];

export default function PrivacyPolicyPage() {
    return (
        <>
            <SiteNav />
            <main className="bg-surface-base text-news-text">

                {/* Hero */}
                <section className="relative pt-36 pb-24 overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, white 1px, transparent 0)', backgroundSize: '36px 36px' }} />
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, rgba(43,212,195,0.08) 0%, transparent 60%)' }} />
                    <div className="container mx-auto px-4 md:px-8 relative z-10 text-center max-w-3xl">
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-news-accent mb-4">Legal</p>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-[1.05] mb-6">Privacy Policy</h1>
                        <p className="text-lg text-news-muted leading-relaxed mb-4">How we collect, use, and protect your data.</p>
                        <p className="text-xs text-news-muted">Effective date: April 2026 · Last updated: April 2026</p>
                    </div>
                </section>

                {/* Who We Are */}
                <section className="py-16 border-t border-border-subtle">
                    <div className="container mx-auto px-4 md:px-8 max-w-3xl">
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-news-accent mb-3">Controller</p>
                        <h2 className="text-2xl font-black text-white mb-4">Who We Are</h2>
                        <p className="text-news-text leading-relaxed text-sm">
                            ToolCurrent is an independent AI tool intelligence platform based in Sweden, accessible at toolcurrent.com. For privacy-related questions contact us at{' '}
                            <a href="mailto:privacy@toolcurrent.com" className="text-news-accent hover:underline">privacy@toolcurrent.com</a>.
                        </p>
                    </div>
                </section>

                {/* What Data We Collect */}
                <section className="py-16 bg-surface-alt border-y border-border-subtle">
                    <div className="container mx-auto px-4 md:px-8 max-w-3xl">
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-news-accent mb-3">Data Collection</p>
                        <h2 className="text-2xl font-black text-white mb-6">What Data We Collect</h2>
                        <div className="space-y-4">
                            {DATA_CARDS.map(c => (
                                <div key={c.label} className="p-5 rounded-xl bg-surface-card border border-border-subtle">
                                    <h3 className="text-sm font-bold text-white mb-2">{c.label}</h3>
                                    <p className="text-sm text-news-text leading-relaxed">{c.body}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How We Use Data */}
                <section className="py-16 border-b border-border-subtle">
                    <div className="container mx-auto px-4 md:px-8 max-w-3xl">
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-news-accent mb-3">Data Use</p>
                        <h2 className="text-2xl font-black text-white mb-6">How We Use Data</h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="p-5 rounded-xl bg-green-500/5 border border-green-500/20">
                                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Check size={14} className="text-green-400" /> We use data to:</h3>
                                <ul className="space-y-2">
                                    {USE_YES.map(item => (
                                        <li key={item} className="text-sm text-news-text flex items-start gap-2">
                                            <span className="text-green-400 mt-0.5 flex-shrink-0">•</span>{item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="p-5 rounded-xl bg-news-accent/5 border border-news-accent/20">
                                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><X size={14} className="text-news-accent" /> We never:</h3>
                                <ul className="space-y-2">
                                    {USE_NO.map(item => (
                                        <li key={item} className="text-sm text-news-text flex items-start gap-2">
                                            <span className="text-news-accent mt-0.5 flex-shrink-0">•</span>{item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Legal Basis (GDPR) */}
                <section className="py-16 bg-surface-alt border-b border-border-subtle">
                    <div className="container mx-auto px-4 md:px-8 max-w-3xl">
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-news-accent mb-3">GDPR</p>
                        <h2 className="text-2xl font-black text-white mb-4">Legal Basis for Processing (GDPR)</h2>
                        <p className="text-sm text-news-text leading-relaxed">
                            We are based in Sweden and subject to GDPR. Our legal basis for analytics data is legitimate interest — understanding aggregate site usage to improve it. For affiliate tracking cookies the legal basis is consent — these cookies are only set when you actively click an affiliate link.
                        </p>
                    </div>
                </section>

                {/* Your GDPR Rights */}
                <section className="py-16 border-b border-border-subtle">
                    <div className="container mx-auto px-4 md:px-8 max-w-3xl">
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-news-accent mb-3">Your Rights</p>
                        <h2 className="text-2xl font-black text-white mb-6">Your Rights Under GDPR</h2>
                        <div className="grid sm:grid-cols-2 gap-3 mb-6">
                            {GDPR_RIGHTS.map(r => (
                                <div key={r.name} className="p-4 rounded-xl bg-surface-card border border-border-subtle">
                                    <h3 className="text-sm font-bold text-white mb-1">{r.name}</h3>
                                    <p className="text-xs text-news-muted">{r.desc}</p>
                                </div>
                            ))}
                        </div>
                        <p className="text-sm text-news-muted">
                            To exercise any of these rights contact{' '}
                            <a href="mailto:privacy@toolcurrent.com" className="text-news-accent hover:underline">privacy@toolcurrent.com</a>.
                            {' '}We respond within 30 days.
                        </p>
                    </div>
                </section>

                {/* Data Retention */}
                <section className="py-16 bg-surface-alt border-b border-border-subtle">
                    <div className="container mx-auto px-4 md:px-8 max-w-3xl">
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-news-accent mb-3">Retention</p>
                        <h2 className="text-2xl font-black text-white mb-6">Data Retention</h2>
                        <div className="rounded-xl border border-border-subtle overflow-hidden">
                            {RETENTION.map((r, i) => (
                                <div key={r.item} className={`flex items-center justify-between px-5 py-4 text-sm ${i < RETENTION.length - 1 ? 'border-b border-border-subtle' : ''}`}>
                                    <span className="text-news-text">{r.item}</span>
                                    <span className="text-news-accent font-bold text-xs">{r.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Third-Party Services */}
                <section className="py-16 border-b border-border-subtle">
                    <div className="container mx-auto px-4 md:px-8 max-w-3xl">
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-news-accent mb-3">Third Parties</p>
                        <h2 className="text-2xl font-black text-white mb-6">Third-Party Services</h2>
                        <ul className="space-y-3">
                            {THIRD_PARTIES.map(t => (
                                <li key={t.name} className="flex items-start gap-3 text-sm">
                                    <span className="font-bold text-white w-36 flex-shrink-0">{t.name}</span>
                                    <span className="text-news-muted">{t.desc}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* Children */}
                <section className="py-16 bg-surface-alt border-b border-border-subtle">
                    <div className="container mx-auto px-4 md:px-8 max-w-3xl">
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-news-accent mb-3">Children</p>
                        <h2 className="text-2xl font-black text-white mb-4">Children's Privacy</h2>
                        <p className="text-sm text-news-text leading-relaxed">
                            ToolCurrent is not directed at children under 16. We do not knowingly collect data from children under 16. Contact us immediately if you believe we have inadvertently collected data from a child.
                        </p>
                    </div>
                </section>

                {/* Contact */}
                <section className="py-16 border-b border-border-subtle">
                    <div className="container mx-auto px-4 md:px-8 max-w-3xl">
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-news-accent mb-3">Contact</p>
                        <h2 className="text-2xl font-black text-white mb-4">Contact</h2>
                        <div className="p-5 rounded-xl bg-surface-card border border-border-subtle inline-block">
                            <a href="mailto:privacy@toolcurrent.com" className="text-sm font-bold text-news-accent hover:underline">privacy@toolcurrent.com</a>
                        </div>
                    </div>
                </section>

            </main>

            <LegalNav current="/privacy-policy" />
            <SiteFooter />
        </>
    );
}
