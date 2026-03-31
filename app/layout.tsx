import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'ToolCurrent | Software Discovery & Intelligence',
    description: 'Discover and compare the best AI software tools. Rankings, reviews, and comparisons to help you find the right tool for your workflow.',
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://toolcurrent.com'),
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
            </head>
            <body>{children}</body>
        </html>
    );
}
