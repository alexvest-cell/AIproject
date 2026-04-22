import type { Metadata } from 'next';
import { connectDB } from '@/lib/mongodb';
import Article from '@/lib/models/Article';
import AppClient from '@/app/AppClient';
import { jsonLdScript } from '@/lib/jsonld';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    try {
        await connectDB();
        const { slug } = await params;
        const article = await Article.findOne({ slug }, 'title excerpt meta_description meta_title imageUrl').lean() as any;
        if (!article) return {};
        const rawTitle = article.meta_title || article.title || '';
        const title = rawTitle.includes('ToolCurrent') ? rawTitle : `${rawTitle} | ToolCurrent`;
        const description = article.meta_description || article.excerpt || '';
        return {
            title,
            description,
            alternates: { canonical: `https://toolcurrent.com/article/${slug}` },
            openGraph: {
                title,
                description,
                url: `https://toolcurrent.com/article/${slug}`,
                type: 'article',
                images: article.imageUrl ? [{ url: article.imageUrl }] : undefined,
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
                images: article.imageUrl ? [article.imageUrl] : undefined,
            },
        };
    } catch { return {}; }
}

export const revalidate = 3600;

export default async function ArticlePage({ params }: Props) {
    const { slug } = await params;

    let articleSchema: Record<string, any> | null = null;
    try {
        await connectDB();
        const article = await Article.findOne({ slug }, 'title excerpt meta_description imageUrl createdAt publishedAt author slug').lean() as any;
        if (article) {
            const datePublished = (article.publishedAt || article.createdAt)
                ? new Date(article.publishedAt || article.createdAt).toISOString()
                : undefined;
            articleSchema = {
                '@context': 'https://schema.org',
                '@type': 'Article',
                headline: article.title,
                description: article.meta_description || article.excerpt || article.title,
                url: `https://toolcurrent.com/article/${slug}`,
                ...(article.imageUrl ? { image: article.imageUrl } : {}),
                ...(datePublished ? { datePublished } : {}),
                publisher: {
                    '@type': 'Organization',
                    name: 'ToolCurrent',
                    url: 'https://toolcurrent.com',
                    logo: { '@type': 'ImageObject', url: 'https://toolcurrent.com/logo.png' },
                },
                ...(article.author ? { author: { '@type': 'Person', name: article.author } } : {
                    author: { '@type': 'Organization', name: 'ToolCurrent' },
                }),
            };
        }
    } catch { /* non-fatal */ }

    return (
        <>
            {articleSchema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: jsonLdScript(articleSchema) }}
                />
            )}
            <AppClient />
        </>
    );
}
