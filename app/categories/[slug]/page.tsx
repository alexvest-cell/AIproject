import type { Metadata } from 'next';
import { connectDB } from '@/lib/mongodb';
import Category from '@/lib/models/Category';
import AppClient from '@/app/AppClient';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    try {
        await connectDB();
        const { slug } = await params;
        const category = await Category.findOne({ slug }).lean() as { name?: string; meta_title?: string; meta_description?: string; description?: string } | null;
        if (!category) return {};
        return {
            title: category.meta_title || `${category.name} Tools`,
            description: category.meta_description || category.description || '',
        };
    } catch { return {}; }
}

export const revalidate = 3600;

export default function CategoryPage() {
    return <AppClient />;
}
