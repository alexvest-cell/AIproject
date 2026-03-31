import type { Metadata } from 'next';
import { connectDB } from '@/lib/mongodb';
import Tool from '@/lib/models/Tool';
import ArticleModel from '@/lib/models/Article';
import AppClient from './AppClient';

export const metadata: Metadata = {
    title: 'ToolCurrent | Software Discovery & Intelligence',
    description: 'Discover the best AI tools. Rankings, reviews, and comparisons for every workflow.',
};

export const revalidate = 1800;

export default async function HomePage() {
    let featuredTools: any[] = [];
    let recentArticles: any[] = [];

    try {
        await connectDB();
        [featuredTools, recentArticles] = await Promise.all([
            Tool.find({ status: 'Active' }).sort({ rating_score: -1 }).limit(6)
                .select('name slug short_description category_primary pricing_model').lean(),
            ArticleModel.find({ status: 'published' }).sort({ createdAt: -1 }).limit(6)
                .select('title slug excerpt category date').lean(),
        ]);
    } catch { /* DB unavailable — render client-only */ }

    return (
        <>
            {/* Visually hidden structured content for SEO crawlers */}
            {(featuredTools.length > 0 || recentArticles.length > 0) && (
                <div aria-hidden="true" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap' }}>
                    {featuredTools.length > 0 && (
                        <section>
                            <h2>Top AI Tools</h2>
                            {featuredTools.map((t: any) => (
                                <article key={t.slug}>
                                    <h3><a href={`/tools/${t.slug}`}>{t.name}</a></h3>
                                    <p>{t.short_description}</p>
                                </article>
                            ))}
                        </section>
                    )}
                    {recentArticles.length > 0 && (
                        <section>
                            <h2>Latest Articles</h2>
                            {recentArticles.map((a: any) => (
                                <article key={(a as any).slug || (a as any)._id}>
                                    <h3><a href={`/article/${(a as any).slug}`}>{(a as any).title}</a></h3>
                                    <p>{(a as any).excerpt}</p>
                                </article>
                            ))}
                        </section>
                    )}
                </div>
            )}
            <AppClient />
        </>
    );
}
