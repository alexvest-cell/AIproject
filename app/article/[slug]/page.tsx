import type { Metadata } from 'next';
import { connectDB } from '@/lib/mongodb';
import Article from '@/lib/models/Article';
import AppClient from '@/app/AppClient';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    try {
        await connectDB();
        const { slug } = await params;
        const article = await Article.findOne({ slug }).lean() as { title?: string; excerpt?: string; meta_description?: string } | null;
        if (!article) return {};
        return {
            title: article.title,
            description: article.meta_description || article.excerpt || '',
        };
    } catch { return {}; }
}

export const revalidate = 3600;

export default function ArticlePage() {
    return <AppClient />;
}
