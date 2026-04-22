import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { jsonLdScript } from '@/lib/jsonld';

const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-inter',
    weight: ['400', '500', '600', '700'],
});

const playfair = Playfair_Display({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-playfair',
    weight: ['400', '600', '700', '800'],
});

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    themeColor: [
        { media: '(prefers-color-scheme: dark)', color: '#0B0F14' },
        { media: '(prefers-color-scheme: light)', color: '#0B0F14' },
    ],
};

export const metadata: Metadata = {
    title: 'ToolCurrent | Software Discovery & Intelligence',
    description: 'Discover and compare the best AI software tools. Rankings, reviews, and comparisons to help you find the right tool for your workflow.',
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://toolcurrent.com'),
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
        <html lang="en" className={`scroll-smooth ${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
            <head>
                <link rel="icon" type="image/png" href="/favicon.png" />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: jsonLdScript(organizationSchema) }}
                />
            </head>
            <body className={inter.className}>
                {children}
                <Script src="https://www.googletagmanager.com/gtag/js?id=G-HML3MP68WB" strategy="afterInteractive" />
                <Script id="gtag-init" strategy="afterInteractive">{`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', 'G-HML3MP68WB');
                `}</Script>
            </body>
        </html>
    );
}
