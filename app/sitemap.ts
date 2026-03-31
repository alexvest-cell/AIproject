import type { MetadataRoute } from 'next';
import { connectDB } from '@/lib/mongodb';
import Article from '@/lib/models/Article';
import Tool from '@/lib/models/Tool';
import Comparison from '@/lib/models/Comparison';
import Stack from '@/lib/models/Stack';

const BASE = 'https://toolcurrent.com';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const staticPages: MetadataRoute.Sitemap = [
        { url: BASE, changeFrequency: 'daily', priority: 1.0 },
        { url: `${BASE}/ai-tools`, changeFrequency: 'daily', priority: 0.8 },
        { url: `${BASE}/best-software`, changeFrequency: 'daily', priority: 0.8 },
        { url: `${BASE}/reviews`, changeFrequency: 'daily', priority: 0.8 },
        { url: `${BASE}/comparisons`, changeFrequency: 'daily', priority: 0.8 },
        { url: `${BASE}/stacks`, changeFrequency: 'daily', priority: 0.8 },
        { url: `${BASE}/use-cases`, changeFrequency: 'daily', priority: 0.8 },
        { url: `${BASE}/guides`, changeFrequency: 'daily', priority: 0.8 },
        { url: `${BASE}/news`, changeFrequency: 'daily', priority: 0.8 },
        { url: `${BASE}/about`, changeFrequency: 'monthly', priority: 0.5 },
    ];

    try {
        await connectDB();
    } catch {
        return staticPages;
    }

    const [articles, tools, comparisons, stacks] = await Promise.all([
        Article.find({ status: 'published' }).select('slug updatedAt createdAt date').lean() as Promise<{ slug?: string; id?: string; updatedAt?: Date; createdAt?: Date; date?: string }[]>,
        Tool.find({ status: 'Active' }).select('slug updatedAt').lean() as Promise<{ slug: string; updatedAt?: Date }[]>,
        Comparison.find({ status: 'published' }).select('slug updatedAt').lean() as Promise<{ slug: string; updatedAt?: Date }[]>,
        Stack.find({ status: 'Published' }).select('slug updatedAt').lean() as Promise<{ slug: string; updatedAt?: Date }[]>,
    ]);

    const articlePages: MetadataRoute.Sitemap = articles.map(a => ({
        url: `${BASE}/article/${a.slug || a.id}`,
        lastModified: a.updatedAt || a.createdAt || (a.date ? new Date(a.date) : new Date()),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
    }));

    const toolPages: MetadataRoute.Sitemap = tools.flatMap(t => [
        { url: `${BASE}/tools/${t.slug}`, lastModified: t.updatedAt, changeFrequency: 'weekly' as const, priority: 0.6 },
        { url: `${BASE}/tools/${t.slug}/alternatives`, changeFrequency: 'weekly' as const, priority: 0.5 },
    ]);

    const comparisonPages: MetadataRoute.Sitemap = comparisons.map(c => ({
        url: `${BASE}/compare/${c.slug}`,
        lastModified: c.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }));

    const stackPages: MetadataRoute.Sitemap = stacks.map(s => ({
        url: `${BASE}/stacks/${s.slug}`,
        lastModified: s.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    return [...staticPages, ...articlePages, ...toolPages, ...comparisonPages, ...stackPages];
}
