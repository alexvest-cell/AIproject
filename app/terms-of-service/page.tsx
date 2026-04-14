import type { Metadata } from 'next';
import { Check, X } from 'lucide-react';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import LegalNav from '@/components/LegalNav';

export const metadata: Metadata = {
    title: 'Terms of Service — ToolCurrent',
    description: 'Terms governing your use of ToolCurrent. Includes affiliate disclosure, intellectual property, and limitation of liability.',
    alternates: { canonical: 'https://toolcurrent.com/terms-of-service' },
};

const IP_MAY = [
    'Read, share, and link to content for personal and non-commercial purposes',
    'Quote brief excerpts with attribution and link to source',
];

const IP_MAY_NOT = [
    'Reproduce substantial portions without permission',
    'Scrape or systematically extract data using automated means',
    'Use content to build competing products without permission',
    'Remove or obscure attribution when sharing content',
];

const PROHIBITED = [
    'Violate any applicable law or regulation',
    'Transmit spam, malware, or harmful code',
    'Attempt unauthorized access to our systems',
    'Interfere with normal site operation',
    'Impersonate ToolCurrent',
];

export default function TermsOfServicePage() {
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
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-[1.05] mb-6">Terms of Service</h1>
                        <p className="text-lg text-news-muted leading-relaxed mb-4">Terms governing your use of ToolCurrent.</p>
                        <p className="text-xs text-news-muted">Effective date: April 2026 · Last updated: April 2026</p>
                    </div>
                </section>

                {/* Agreement callout */}
                <section className="py-12 border-t border-border-subtle">
                    <div className="container mx-auto px-4 md:px-8 max-w-3xl">
                        <div className="border-l-2 border-news-accent pl-6 bg-surface-card rounded-r-xl p-6">
                            <p className="text-sm text-news-text leading-relaxed font-medium">
                                By accessing or using ToolCurrent you agree to these Terms. If you do not agree do not use the site.
                            </p>
                        </div>
                    </div>
                </section>

                {/* What ToolCurrent Provides */}
                <section className="py-16 border-t border-border-subtle">
                    <div className="container mx-auto px-4 md:px-8 max-w-3xl">
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-news-accent mb-3">Service</p>
                        <h2 className="text-2xl font-black text-white mb-4">What ToolCurrent Provides</h2>
                        <p className="text-sm text-news-text leading-relaxed">
                            ToolCurrent provides an independent platform for discovering, comparing, and evaluating AI tools and software. All content is provided for informational purposes only. Tool scores, rankings, and comparisons represent editorial opinions based on our published methodology — not professional advice.
                        </p>
                    </div>
                </section>

                {/* Accuracy */}
                <section className="py-16 bg-surface-alt border-y border-border-subtle">
                    <div className="container mx-auto px-4 md:px-8 max-w-3xl">
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-news-accent mb-3">Accuracy</p>
                        <h2 className="text-2xl font-black text-white mb-4">Accuracy and Completeness</h2>
                        <p className="text-sm text-news-text leading-relaxed mb-5">
                            We make reasonable efforts to ensure accuracy of tool information. However pricing and features change frequently. Always verify current information directly with the tool vendor before making a purchasing decision. ToolCurrent is not liable for decisions made based on information on this site.
                        </p>
                        <div className="border border-news-accent/30 bg-news-accent/5 rounded-xl px-5 py-4">
                            <p className="text-sm text-news-accent font-medium">
                                The Last Updated date on each tool profile reflects when information was last reviewed.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Affiliate Links */}
                <section className="py-16 border-b border-border-subtle">
                    <div className="container mx-auto px-4 md:px-8 max-w-3xl">
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-news-accent mb-3">Affiliates</p>
                        <h2 className="text-2xl font-black text-white mb-4">Affiliate Links</h2>
                        <p className="text-sm text-news-text leading-relaxed mb-4">
                            Some links on ToolCurrent are affiliate links. If you click through and make a qualifying purchase we may earn a commission from the vendor. This does not affect the price you pay and does not influence tool rankings or scores.
                        </p>
                        <a href="/editorial-policy" className="text-sm font-bold text-news-accent hover:underline">See our Editorial Policy →</a>
                    </div>
                </section>

                {/* Intellectual Property */}
                <section className="py-16 bg-surface-alt border-b border-border-subtle">
                    <div className="container mx-auto px-4 md:px-8 max-w-3xl">
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-news-accent mb-3">IP</p>
                        <h2 className="text-2xl font-black text-white mb-6">Intellectual Property</h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="p-5 rounded-xl bg-green-500/5 border border-green-500/20">
                                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Check size={14} className="text-green-400" /> You may:</h3>
                                <ul className="space-y-2">
                                    {IP_MAY.map(item => (
                                        <li key={item} className="text-sm text-news-text flex items-start gap-2">
                                            <span className="text-green-400 mt-0.5 flex-shrink-0">•</span>{item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="p-5 rounded-xl bg-red-500/5 border border-red-500/20">
                                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><X size={14} className="text-red-400" /> You may not:</h3>
                                <ul className="space-y-2">
                                    {IP_MAY_NOT.map(item => (
                                        <li key={item} className="text-sm text-news-text flex items-start gap-2">
                                            <span className="text-red-400 mt-0.5 flex-shrink-0">•</span>{item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Prohibited Use */}
                <section className="py-16 border-b border-border-subtle">
                    <div className="container mx-auto px-4 md:px-8 max-w-3xl">
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-news-accent mb-3">Prohibited</p>
                        <h2 className="text-2xl font-black text-white mb-6">Prohibited Use</h2>
                        <ul className="space-y-3">
                            {PROHIBITED.map(item => (
                                <li key={item} className="flex items-start gap-3">
                                    <div className="w-5 h-5 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <X size={10} className="text-red-400" />
                                    </div>
                                    <span className="text-sm text-news-text">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* Disclaimers + Liability */}
                <section className="py-16 bg-surface-alt border-b border-border-subtle">
                    <div className="container mx-auto px-4 md:px-8 max-w-3xl space-y-8">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-news-accent mb-3">Warranties</p>
                            <h2 className="text-2xl font-black text-white mb-4">Disclaimer of Warranties</h2>
                            <div className="p-5 rounded-xl bg-surface-card border border-border-subtle">
                                <p className="text-sm text-news-text leading-relaxed">
                                    ToolCurrent is provided as-is without warranty of any kind. We disclaim all warranties, express or implied, including warranties of merchantability and fitness for a particular purpose.
                                </p>
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-news-accent mb-3">Liability</p>
                            <h2 className="text-2xl font-black text-white mb-4">Limitation of Liability</h2>
                            <div className="p-5 rounded-xl bg-surface-card border border-border-subtle">
                                <p className="text-sm text-news-text leading-relaxed">
                                    To the maximum extent permitted by law ToolCurrent shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the site. Our total liability for any claim shall not exceed €100.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Governing Law */}
                <section className="py-16 border-b border-border-subtle">
                    <div className="container mx-auto px-4 md:px-8 max-w-3xl">
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-news-accent mb-3">Jurisdiction</p>
                        <h2 className="text-2xl font-black text-white mb-4">Governing Law</h2>
                        <p className="text-sm text-news-text leading-relaxed">
                            These Terms are governed by the laws of Sweden. Disputes are subject to the exclusive jurisdiction of Swedish courts.
                        </p>
                    </div>
                </section>

                {/* Contact */}
                <section className="py-16 border-b border-border-subtle">
                    <div className="container mx-auto px-4 md:px-8 max-w-3xl">
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-news-accent mb-3">Contact</p>
                        <h2 className="text-2xl font-black text-white mb-4">Contact</h2>
                        <p className="text-sm text-news-text">
                            For questions about these Terms:{' '}
                            <a href="mailto:legal@toolcurrent.com" className="text-news-accent hover:underline">legal@toolcurrent.com</a>
                        </p>
                    </div>
                </section>

            </main>

            <LegalNav current="/terms-of-service" />
            <SiteFooter />
        </>
    );
}
