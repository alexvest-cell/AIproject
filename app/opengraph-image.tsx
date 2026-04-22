import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'ToolCurrent — AI Tool Discovery & Intelligence';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #0a0a0f 0%, #111827 60%, #0f1f2e 100%)',
                    fontFamily: 'sans-serif',
                    position: 'relative',
                }}
            >
                {/* Teal glow */}
                <div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 600,
                        height: 300,
                        borderRadius: '50%',
                        background: 'radial-gradient(ellipse, rgba(20,184,166,0.18) 0%, transparent 70%)',
                    }}
                />

                {/* Logo wordmark */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        marginBottom: 32,
                    }}
                >
                    <div
                        style={{
                            width: 48,
                            height: 48,
                            borderRadius: 12,
                            background: 'linear-gradient(135deg, #14b8a6, #0891b2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <div style={{ color: '#fff', fontSize: 26, fontWeight: 900 }}>T</div>
                    </div>
                    <div style={{ color: '#ffffff', fontSize: 36, fontWeight: 800, letterSpacing: -1 }}>
                        ToolCurrent
                    </div>
                </div>

                {/* Headline */}
                <div
                    style={{
                        color: '#ffffff',
                        fontSize: 56,
                        fontWeight: 800,
                        textAlign: 'center',
                        lineHeight: 1.15,
                        maxWidth: 900,
                        letterSpacing: -1.5,
                    }}
                >
                    AI Tool Discovery
                    <br />
                    <span style={{ color: '#14b8a6' }}>&amp; Intelligence</span>
                </div>

                {/* Tagline */}
                <div
                    style={{
                        color: '#94a3b8',
                        fontSize: 22,
                        marginTop: 24,
                        textAlign: 'center',
                        maxWidth: 700,
                    }}
                >
                    Rankings, comparisons, and reviews to help you find the right tool.
                </div>

                {/* URL badge */}
                <div
                    style={{
                        marginTop: 44,
                        padding: '10px 24px',
                        borderRadius: 999,
                        border: '1px solid rgba(20,184,166,0.35)',
                        color: '#5eead4',
                        fontSize: 16,
                        letterSpacing: 0.5,
                    }}
                >
                    toolcurrent.com
                </div>
            </div>
        ),
        { ...size }
    );
}
