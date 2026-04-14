const LEGAL_LINKS = [
    { label: 'Privacy Policy',     href: '/privacy-policy' },
    { label: 'Cookie Policy',      href: '/cookie-policy' },
    { label: 'Terms of Service',   href: '/terms-of-service' },
    { label: 'Disclaimer',         href: '/disclaimer' },
    { label: 'Editorial Policy',   href: '/editorial-policy' },
];

export default function LegalNav({ current }: { current: string }) {
    return (
        <div className="border-t border-border-subtle py-8 bg-surface-base">
            <div className="container mx-auto px-4 md:px-8 max-w-5xl">
                <div className="flex flex-wrap gap-x-4 gap-y-2 items-center justify-center text-xs">
                    {LEGAL_LINKS.map((link, i) => (
                        <span key={link.href} className="flex items-center gap-4">
                            {i > 0 && <span className="text-border-subtle select-none">·</span>}
                            <a
                                href={link.href}
                                className={link.href === current
                                    ? 'font-bold text-news-accent'
                                    : 'text-news-muted hover:text-white transition-colors'}
                            >
                                {link.label}
                            </a>
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
