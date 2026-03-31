import type { Metadata } from 'next';
import AppClient from '@/app/AppClient';

export const metadata: Metadata = {
    title: 'About ToolCurrent',
    description: 'Learn about ToolCurrent, your AI software discovery platform.',
};

export default function AboutPage() {
    return <AppClient />;
}
