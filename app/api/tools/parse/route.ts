import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { parseToolInput } from '@/lib/toolParser.js';

export async function POST(request: Request) {
    const authError = requireAuth(request);
    if (authError) return authError;

    try {
        const { rawText } = await request.json();
        if (!rawText || typeof rawText !== 'string') {
            return NextResponse.json({ status: 'error', errors: ['rawText is required'] }, { status: 400 });
        }
        const result = parseToolInput(rawText);
        return NextResponse.json(result);
    } catch (err) {
        return NextResponse.json({ status: 'error', errors: [`Server error: ${(err as Error).message}`] }, { status: 500 });
    }
}
