import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'ToolCurrent — AI Tool Intelligence Platform',
        short_name: 'ToolCurrent',
        description: 'Find, compare, and evaluate AI tools with structured ratings, use-case scores, and head-to-head comparisons.',
        start_url: '/',
        display: 'standalone',
        background_color: '#0B0F14',
        theme_color: '#2BD4C3',
        orientation: 'portrait',
        icons: [
            {
                src: '/favicon.png',
                sizes: '48x48',
                type: 'image/png',
            },
            {
                src: '/logo.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/logo.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
        categories: ['productivity', 'utilities', 'business'],
        lang: 'en',
        dir: 'ltr',
    };
}
