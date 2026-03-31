import type { Metadata } from 'next';
import AppClient from '@/app/AppClient';

export const revalidate = 3600;

export const metadata: Metadata = {
    title: 'Category | ToolCurrent',
};

export default function CategorySlugPage() {
    return <AppClient />;
}
