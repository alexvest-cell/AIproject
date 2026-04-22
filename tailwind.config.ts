import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './lib/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                surface: {
                    base: '#0B0F14',
                    alt: '#0F141A',
                    card: '#111826',
                    elevated: '#162033',
                    hover: '#1B2433',
                },
                border: {
                    subtle: 'rgba(255,255,255,0.06)',
                    divider: 'rgba(255,255,255,0.04)',
                },
                news: {
                    bg: '#0B0F14',
                    paper: '#111826',
                    text: '#AEB6C2',
                    muted: '#7E8794',
                    accent: '#2BD4C3',
                    accentHover: '#3FE7D6',
                    live: '#ef4444',
                    border: 'rgba(255,255,255,0.06)',
                },
            },
            boxShadow: {
                'elevation': '0 0 0 1px rgba(255,255,255,0.03), 0 8px 24px rgba(0,0,0,0.35)',
                'elevation-hover': '0 0 0 1px rgba(255,255,255,0.06), 0 12px 32px rgba(0,0,0,0.45)',
            },
            fontFamily: {
                sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
                serif: ['var(--font-playfair)', 'Georgia', 'serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.6s ease-out forwards',
                'slide-up': 'slideUp 0.8s ease-out forwards',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
        },
    },
    plugins: [],
};

export default config;
