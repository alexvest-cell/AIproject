import type { Metadata } from 'next';
import AppClient from '@/app/AppClient';

export const metadata: Metadata = {
    title: 'Guides | ToolCurrent',
    description: 'Explore guides on ToolCurrent.',
    robots: { index: false, follow: false },
};

export const revalidate = 3600;

export default function Page() {
    return <AppClient />;
}
