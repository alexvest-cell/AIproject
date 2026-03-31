import { NextResponse } from 'next/server';
import { getAdminToken } from '@/lib/auth';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme123';

export async function POST(request: Request) {
    const { password } = await request.json();
    if (password === ADMIN_PASSWORD) {
        return NextResponse.json({ token: getAdminToken(), message: 'Login successful' });
    }
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
}
