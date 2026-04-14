import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    output: 'standalone',
    async redirects() {
        return [
            {
                source: '/best-software',
                destination: '/best-ai-tools',
                permanent: true,
            },
            {
                source: '/best-software/:path*',
                destination: '/best-ai-tools/:path*',
                permanent: true,
            },
        ];
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
            },
        ],
    },
    experimental: {
        serverActions: {
            bodySizeLimit: '10mb',
        },
    },
};

export default nextConfig;
