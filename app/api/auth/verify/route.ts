import { NextResponse } from 'next/server';
import { getAdminToken } from '@/lib/auth';

export async function GET(request: Request) {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (token && token === getAdminToken()) {
        return NextResponse.json({ valid: true });
    }
    return NextResponse.json({ valid: false }, { status: 401 });
}
