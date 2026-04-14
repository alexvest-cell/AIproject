import type { Metadata } from 'next';
import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import { CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
    title: 'AI Tool Reviews (Coming Soon) | ToolCurrent',
    description: 'In-depth AI tool reviews are coming to ToolCurrent. Explore rankings and comparisons while you wait.',
    alternates: { canonical: 'https://toolcurrent.com/reviews' },
};

const FEATURES = [
    'Hands-on testing across real workflows',
    'Standardised scoring methodology',
    'Transparent affiliate disclosure',
    'Regular re-reviews as tools evolve',
];

export default function ReviewsPage() {
    return (
        <div className="min-h-screen bg-surface-base text-news-text font-sans">
            <SiteNav />

            <main className="flex flex-col items-center justify-center px-6 py-32 text-center">
                <span className="inline-block text-xs font-bold tracking-widest uppercase text-teal-400 mb-6">
                    Coming Soon
                </span>

                <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 max-w-2xl leading-tight">
                    In-Depth AI Tool Reviews
                </h1>

                <p className="text-news-muted text-lg max-w-xl mb-12">
                    Comprehensive, hands-on evaluations of the AI tools that matter — scored with a clear methodology and zero fluff.
                </p>

                <ul className="flex flex-col gap-3 mb-14 text-left">
                    {FEATURES.map((f) => (
                        <li key={f} className="flex items-center gap-3 text-zinc-300 text-sm">
                            <CheckCircle2 size={18} className="text-teal-400 shrink-0" />
                            {f}
                        </li>
                    ))}
                </ul>

                <div className="flex flex-wrap justify-center gap-4">
                    <Link
                        href="/ai-tools"
                        className="px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-black font-bold text-sm transition-colors"
                    >
                        Browse AI Tools →
                    </Link>
                    <Link
                        href="/best-ai-tools"
                        className="px-6 py-3 rounded-xl border border-border-subtle hover:border-teal-500/50 text-news-text hover:text-white font-bold text-sm transition-colors"
                    >
                        View Rankings →
                    </Link>
                </div>
            </main>

            <SiteFooter />
        </div>
    );
}
