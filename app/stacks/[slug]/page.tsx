import type { Metadata } from 'next';
import { connectDB } from '@/lib/mongodb';
import Stack from '@/lib/models/Stack';
import AppClient from '@/app/AppClient';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    try {
        await connectDB();
        const { slug } = await params;
        const stack = await Stack.findOne({ slug }).lean() as { name?: string; meta_title?: string; meta_description?: string; short_description?: string } | null;
        if (!stack) return {};
        return {
            title: stack.meta_title || `${stack.name} Stack`,
            description: stack.meta_description || stack.short_description || '',
        };
    } catch { return {}; }
}

export const revalidate = 3600;

export default function StackPage() {
    return <AppClient />;
}
