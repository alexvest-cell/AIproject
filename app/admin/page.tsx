import type { Metadata } from 'next';
import AppClient from '@/app/AppClient';

export const metadata: Metadata = {
    title: 'Admin | ToolCurrent',
};

export default function AdminPage() {
    return <AppClient />;
}
