import crypto from 'crypto';
import { NextResponse } from 'next/server';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme123';

export function getAdminToken(): string {
    return crypto.createHash('sha256').update(ADMIN_PASSWORD + ':toolcurrent-admin').digest('hex');
}

export function requireAuth(request: Request): NextResponse | null {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token || token !== getAdminToken()) {
        return NextResponse.json({ error: 'Unauthorized - Invalid or missing token' }, { status: 401 });
    }
    return null;
}
