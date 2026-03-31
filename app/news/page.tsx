import type { Metadata } from 'next';
import AppClient from '@/app/AppClient';

export const metadata: Metadata = {
    title: 'News | ToolCurrent',
    description: 'Explore news on ToolCurrent.',
};

export const revalidate = 3600;

export default function Page() {
    return <AppClient />;
}
