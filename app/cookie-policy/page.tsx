import type { Metadata } from 'next';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import LegalNav from '@/components/LegalNav';

export const metadata: Metadata = {
    title: 'Cookie Policy — ToolCurrent',
    description: 'What cookies ToolCurrent uses and how to control them.',
    alternates: { canonical: 'https://toolcurrent.com/cookie-policy' },
};

const BROWSER_CONTROLS = [
    { browser: 'Chrome',  path: 'Settings → Privacy and Security → Cookies' },
    { browser: 'Firefox', path: 'Settings → Privacy & Security → Cookies and Site Data' },
    { browser: 'Safari',  path: 'Preferences → Privacy → Manage Website Data' },
    { browser: 'Edge',    path: 'Settings → Cookies and Site Permissions' },
];

export default function CookiePolicyPage() {
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
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-[1.05] mb-6">Cookie Policy</h1>
                        <p className="text-lg text-news-muted leading-relaxed mb-4">What cookies ToolCurrent uses and how to control them.</p>
                        <p className="text-xs text-news-muted">Effective date: April 2026 · Last updated: April 2026</p>
                    </div>
                </section>

                {/* What Are Cookies */}
                <section className="py-16 border-t border-border-subtle">
                    <div className="container mx-auto px-4 md:px-8 max-w-3xl">
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-news-accent mb-3">Basics</p>
                        <h2 className="text-2xl font-black text-white mb-4">What Are Cookies</h2>
                        <p className="text-sm text-news-text leading-relaxed">
                            Cookies are small text files stored on your device when you visit a website. They allow the website to remember information about your visit.
                        </p>
                    </div>
                </section>

                {/* Cookies We Use */}
                <section className="py-16 bg-surface-alt border-y border-border-subtle">
                    <div className="container mx-auto px-4 md:px-8 max-w-3xl">
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-news-accent mb-3">Cookies</p>
                        <h2 className="text-2xl font-black text-white mb-8">Cookies We Use</h2>

                        {/* Analytics */}
                        <div className="mb-8">
                            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-news-accent mb-3">Analytics</p>
                            <p className="text-sm text-news-text leading-relaxed mb-5">
                                We use analytics cookies to understand how visitors use ToolCurrent in aggregate. These cookies collect anonymous data about pages visited and usage patterns. No personally identifiable information is collected.
                            </p>
                            <div className="rounded-xl border border-border-subtle overflow-hidden">
                                <div className="grid grid-cols-3 px-4 py-2 bg-surface-elevated text-[10px] font-bold uppercase tracking-widest text-news-muted border-b border-border-subtle">
                                    <span>Cookie</span><span>Purpose</span><span>Duration</span>
                                </div>
                                <div className="grid grid-cols-3 px-4 py-3 text-sm border-b border-border-subtle">
                                    <span className="text-white font-medium">Analytics session</span>
                                    <span className="text-news-text">Tracks aggregate page views</span>
                                    <span className="text-news-muted">Session</span>
                                </div>
                                <div className="grid grid-cols-3 px-4 py-3 text-sm">
                                    <span className="text-white font-medium">Analytics visitor</span>
                                    <span className="text-news-text">Distinguishes unique visitors in aggregate</span>
                                    <span className="text-news-muted">26 months</span>
                                </div>
                            </div>
                        </div>

                        {/* Affiliate Tracking */}
                        <div className="mb-8">
                            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-news-accent mb-3">Affiliate Tracking</p>
                            <p className="text-sm text-news-text leading-relaxed">
                                When you click an affiliate link the destination vendor may set a tracking cookie on their domain. This cookie allows the vendor to attribute a signup or purchase to ToolCurrent within their attribution window (typically 30–90 days). These cookies are set by the vendor, not ToolCurrent, and are governed by the vendor's own cookie policy.
                            </p>
                        </div>

                        {/* Functional */}
                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-news-accent mb-3">Functional</p>
                            <p className="text-sm text-news-text leading-relaxed">
                                ToolCurrent does not currently use cookies for login sessions, user preferences, or personalization. No account creation is required.
                            </p>
                        </div>
                    </div>
                </section>

                {/* How to Control */}
                <section className="py-16 border-b border-border-subtle">
                    <div className="container mx-auto px-4 md:px-8 max-w-3xl">
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-news-accent mb-3">Control</p>
                        <h2 className="text-2xl font-black text-white mb-4">How to Control Cookies</h2>
                        <p className="text-sm text-news-text leading-relaxed mb-6">
                            You can control cookies through your browser settings. Blocking analytics cookies does not affect the functionality of ToolCurrent — all content is accessible without cookies.
                        </p>
                        <div className="grid sm:grid-cols-2 gap-3">
                            {BROWSER_CONTROLS.map(b => (
                                <div key={b.browser} className="p-4 rounded-xl bg-surface-card border border-border-subtle">
                                    <h3 className="text-sm font-bold text-white mb-1">{b.browser}</h3>
                                    <p className="text-xs text-news-muted">{b.path}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Contact */}
                <section className="py-16 border-b border-border-subtle">
                    <div className="container mx-auto px-4 md:px-8 max-w-3xl">
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-news-accent mb-3">Contact</p>
                        <h2 className="text-2xl font-black text-white mb-4">Contact</h2>
                        <p className="text-sm text-news-text">
                            For cookie-related questions:{' '}
                            <a href="mailto:privacy@toolcurrent.com" className="text-news-accent hover:underline">privacy@toolcurrent.com</a>
                        </p>
                    </div>
                </section>

            </main>

            <LegalNav current="/cookie-policy" />
            <SiteFooter />
        </>
    );
}
