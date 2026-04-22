import type { Metadata } from 'next';
import './globals.css';
import { jsonLdScript } from '@/lib/jsonld';

export const metadata: Metadata = {
    title: 'ToolCurrent | Software Discovery & Intelligence',
    description: 'Discover and compare the best AI software tools. Rankings, reviews, and comparisons to help you find the right tool for your workflow.',
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://toolcurrent.com'),
    viewport: { width: 'device-width', initialScale: 1, maximumScale: 1 },
    openGraph: {
        type: 'website',
        siteName: 'ToolCurrent',
        title: 'ToolCurrent | Software Discovery & Intelligence',
        description: 'Discover and compare the best AI software tools. Rankings, reviews, and comparisons to help you find the right tool for your workflow.',
        images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'ToolCurrent' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'ToolCurrent | Software Discovery & Intelligence',
        description: 'Discover and compare the best AI software tools. Rankings, reviews, and comparisons to help you find the right tool for your workflow.',
        images: ['/opengraph-image'],
    },
};

const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ToolCurrent',
    url: 'https://toolcurrent.com',
    logo: 'https://toolcurrent.com/logo.png',
    description: 'Independent AI tools intelligence platform providing structured ratings, comparisons, and recommendations.',
    sameAs: [
        'https://x.com/toolcurrent',
    ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className="scroll-smooth" suppressHydrationWarning>
            <head>
                <link rel="icon" type="image/png" href="/favicon.png" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=Inter:wght@300;400;500;600&display=swap"
                    rel="stylesheet"
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: jsonLdScript(organizationSchema) }}
                />
            </head>
            <body>{children}</body>
        </html>
    );
}
