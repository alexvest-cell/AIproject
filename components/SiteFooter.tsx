'use client';
import { useRouter } from 'next/navigation';
import Contact from './Contact';

export default function SiteFooter() {
    const router = useRouter();
    return (
        <Contact
            onShowAbout={() => router.push('/about')}
            onSubscribeClick={() => {}}
            onCategorySelect={(cat) => {
                if (cat === 'All') { router.push('/'); return; }
                router.push(`/ai-tools?category=${encodeURIComponent(cat)}`);
            }}
        />
    );
}
