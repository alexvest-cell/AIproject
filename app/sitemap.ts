import type { MetadataRoute } from 'next';
import { connectDB } from '@/lib/mongodb';
import Article from '@/lib/models/Article';
import Tool from '@/lib/models/Tool';
import Comparison from '@/lib/models/Comparison';
import Stack from '@/lib/models/Stack';
import { categorySlugToName, categoryNameToSlug } from '@/lib/utils/slugs';

const BASE = 'https://toolcurrent.com';

export const revalidate = 3600;


export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const staticPages: MetadataRoute.Sitemap = [
        { url: BASE, changeFrequency: 'daily', priority: 1.0 },
        { url: `${BASE}/ai-tools`, changeFrequency: 'daily', priority: 0.8 },
        { url: `${BASE}/best-ai-tools`, changeFrequency: 'daily', priority: 0.8 },
        { url: `${BASE}/comparisons`, changeFrequency: 'daily', priority: 0.8 },
        { url: `${BASE}/about`, changeFrequency: 'monthly', priority: 0.5 },
    ];

    try {
        await connectDB();

        const [articles, tools, comparisons, stacks] = await Promise.all([
            Article.find({ status: 'published' }).select('slug updatedAt createdAt date').lean() as Promise<{ slug?: string; id?: string; updatedAt?: Date; createdAt?: Date; date?: string }[]>,
            Tool.find({ status: 'Active' }).select('slug updatedAt category_primary workflow_tags').lean() as Promise<{ slug: string; updatedAt?: Date; category_primary?: string; workflow_tags?: string[] }[]>,
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

        // Category ranking pages — only include slugs that map to a known category
        const categorySet = new Set<string>();
        for (const t of tools) {
            if (t.category_primary) {
                const slug = categoryNameToSlug(t.category_primary);
                if (categorySlugToName(slug) !== null) categorySet.add(slug);
            }
        }
        const categoryRankingPages: MetadataRoute.Sitemap = [...categorySet].map(slug => ({
            url: `${BASE}/best-ai-tools/${slug}`,
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }));

        // Workflow ranking pages — only include slugs where at least one tool exists
        const workflowSet = new Set<string>();
        for (const t of tools) {
            for (const tag of (t.workflow_tags || [])) {
                workflowSet.add(tag.toLowerCase().replace(/\s+/g, '-'));
            }
        }
        const workflowRankingPages: MetadataRoute.Sitemap = [...workflowSet].map(slug => ({
            url: `${BASE}/best-ai-tools/for/${slug}`,
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }));

        return [
            ...staticPages,
            ...articlePages,
            ...toolPages,
            ...comparisonPages,
            ...stackPages,
            ...categoryRankingPages,
            ...workflowRankingPages,
        ];
    } catch {
        return staticPages;
    }
}
