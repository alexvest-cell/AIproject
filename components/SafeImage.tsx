'use client';
import Image from 'next/image';
import { useState } from 'react';

interface SafeImageProps {
    src: string | null | undefined;
    alt: string;
    width: number;
    height: number;
    className?: string;
    priority?: boolean;
    style?: React.CSSProperties;
}

export function SafeImage({
    src,
    alt,
    width,
    height,
    className,
    priority = false,
    style,
}: SafeImageProps) {
    const [error, setError] = useState(false);

    if (!src || error) {
        return (
            <div
                className={className}
                style={{
                    width,
                    height,
                    backgroundColor: '#1a2332',
                    borderRadius: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    ...style,
                }}
            >
                <span style={{ color: '#4a5568', fontSize: 10 }}>
                    {alt?.charAt(0)?.toUpperCase() || '?'}
                </span>
            </div>
        );
    }

    return (
        <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            className={className}
            priority={priority}
            style={style}
            onError={() => setError(true)}
            unoptimized={src.startsWith('https://res.cloudinary.com')}
        />
    );
}
