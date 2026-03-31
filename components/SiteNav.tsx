'use client';
import { useRouter } from 'next/navigation';
import Navigation from './Navigation';
import { Section } from '../types';

export default function SiteNav() {
    const router = useRouter();
    return (
        <Navigation
            activeSection={Section.HERO}
            scrollToSection={() => {}}
            onSearch={(q) => router.push(`/ai-tools?search=${encodeURIComponent(q)}`)}
            searchQuery=""
            onArticleSelect={(a) => router.push(`/article/${(a as any).slug || a.id}`)}
            onSupportClick={() => {}}
            onSubscribeClick={() => {}}
            onShowAbout={() => router.push('/about')}
            activeCategory=""
            onCategorySelect={(cat) => router.push(`/ai-tools?category=${encodeURIComponent(cat)}`)}
            onHubClick={(hub, workflow, qs) => {
                let url = `/${hub}`;
                if (workflow) url += `?workflow=${encodeURIComponent(workflow)}`;
                else if (qs) url += `?${qs}`;
                router.push(url);
            }}
            newsArticles={[]}
            currentView="tool"
        />
    );
}
