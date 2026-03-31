import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Comparison from '@/lib/models/Comparison';
import { requireAuth } from '@/lib/auth';

export async function POST(request: Request) {
    const authError = requireAuth(request);
    if (authError) return authError;

    try {
        await connectDB();
        const { slug } = await request.json();
        if (!slug) return NextResponse.json({ error: 'slug is required' }, { status: 400 });

        const comparison = await Comparison.findOneAndUpdate(
            { slug },
            { $set: { needs_update: false, last_generated: new Date(), updatedAt: new Date() } },
            { new: true }
        );
        if (!comparison) return NextResponse.json({ error: 'Comparison not found' }, { status: 404 });
        return NextResponse.json({ success: true, comparison });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
