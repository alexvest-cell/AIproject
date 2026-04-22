import type { Metadata } from 'next';
import AppClient from '@/app/AppClient';

export const metadata: Metadata = {
    title: 'AI Tool Stacks | ToolCurrent',
    description: 'Explore curated AI tool stacks for every workflow.',
    robots: { index: false, follow: false },
};

export const revalidate = 3600;

export default function StacksPage() {
    return <AppClient />;
}
