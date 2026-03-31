import type { Metadata } from 'next';
import { connectDB } from '@/lib/mongodb';
import Tool from '@/lib/models/Tool';
import AppClient from '@/app/AppClient';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    try {
        await connectDB();
        const { slug } = await params;
        const tool = await Tool.findOne({ slug }).lean() as { name?: string } | null;
        if (!tool) return {};
        return {
            title: `Best ${tool.name} Alternatives`,
            description: `Find the best alternatives to ${tool.name}. Compare features, pricing, and ratings.`,
        };
    } catch { return {}; }
}

export const revalidate = 3600;

export default function AlternativesPage() {
    return <AppClient />;
}
