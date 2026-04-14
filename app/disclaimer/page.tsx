import type { Metadata } from 'next';
import { Star, AlertTriangle, Clock, Link2, Shield, ExternalLink } from 'lucide-react';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import LegalNav from '@/components/LegalNav';

export const metadata: Metadata = {
    title: 'Disclaimer — ToolCurrent',
    description: 'Important disclaimers about ToolCurrent tool scores, rankings, affiliate relationships, and information accuracy.',
    alternates: { canonical: 'https://toolcurrent.com/disclaimer' },
};

const DISCLAIMER_CARDS = [
    {
        icon: Star,
        title: 'Editorial Opinion',
        body: 'Tool scores, rankings, and comparisons represent editorial opinions based on our published methodology. They are not objective facts, professional recommendations, or endorsements.',
    },
    {
        icon: AlertTriangle,
        title: 'Not Professional Advice',
        body: 'Nothing on ToolCurrent constitutes professional advice — technical, financial, legal, or procurement. Consult qualified professionals before making significant purchasing or technology decisions.',
    },
    {
        icon: Clock,
        title: 'Information May Be Outdated',
        body: 'AI tools change rapidly. Pricing, features, and capabilities reflect information available at the Last Updated date on each tool profile. Always verify current information directly with vendors.',
    },
    {
        icon: Link2,
        title: 'Affiliate Disclosure',
        body: 'ToolCurrent participates in affiliate programs. When you click certain links and make a qualifying purchase we may earn a commission. This does not affect the price you pay or our rankings.',
    },
    {
        icon: Shield,
        title: 'No Endorsement',
        body: 'The appearance of a tool on ToolCurrent does not constitute an endorsement of that tool, its vendor, or its suitability for your use case.',
    },
    {
        icon: ExternalLink,
        title: 'Third-Party Content',
        body: 'ToolCurrent may link to third-party sites. We are not responsible for the content, privacy practices, or availability of third-party websites.',
    },
];

export default function DisclaimerPage() {
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
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-[1.05] mb-6">Disclaimer</h1>
                        <p className="text-lg text-news-muted leading-relaxed mb-4">Important information about how to interpret content on ToolCurrent.</p>
                        <p className="text-xs text-news-muted">Effective date: April 2026 · Last updated: April 2026</p>
                    </div>
                </section>

                {/* Six disclaimer cards */}
                <section className="py-20 border-t border-border-subtle">
                    <div className="container mx-auto px-4 md:px-8 max-w-4xl">
                        <div className="grid sm:grid-cols-2 gap-5">
                            {DISCLAIMER_CARDS.map(card => {
                                const Icon = card.icon;
                                return (
                                    <div key={card.title} className="p-6 rounded-xl bg-surface-card border border-border-subtle flex flex-col gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-news-accent/10 border border-news-accent/20 flex items-center justify-center flex-shrink-0">
                                            <Icon size={18} className="text-news-accent" />
                                        </div>
                                        <h2 className="text-sm font-bold text-white">{card.title}</h2>
                                        <p className="text-sm text-news-text leading-relaxed">{card.body}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Limitation of liability callout */}
                <section className="py-8 border-t border-border-subtle">
                    <div className="container mx-auto px-4 md:px-8 max-w-4xl">
                        <div className="border-l-2 border-news-accent pl-6 bg-surface-card rounded-r-xl p-6">
                            <h2 className="text-lg font-black text-white mb-3">Limitation of Liability</h2>
                            <p className="text-sm text-news-text leading-relaxed mb-4">
                                To the maximum extent permitted by law ToolCurrent disclaims all liability for any loss or damage arising from use of this site or reliance on its content. See our Terms of Service for the full limitation of liability.
                            </p>
                            <a href="/terms-of-service" className="text-sm font-bold text-news-accent hover:underline">Read Terms of Service →</a>
                        </div>
                    </div>
                </section>

                {/* Contact */}
                <section className="py-16 border-t border-b border-border-subtle">
                    <div className="container mx-auto px-4 md:px-8 max-w-4xl">
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-news-accent mb-3">Contact</p>
                        <h2 className="text-2xl font-black text-white mb-4">Contact</h2>
                        <p className="text-sm text-news-text">
                            For questions about this disclaimer:{' '}
                            <a href="mailto:legal@toolcurrent.com" className="text-news-accent hover:underline">legal@toolcurrent.com</a>
                        </p>
                    </div>
                </section>

            </main>

            <LegalNav current="/disclaimer" />
            <SiteFooter />
        </>
    );
}
