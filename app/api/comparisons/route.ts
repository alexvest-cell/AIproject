import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Comparison from '@/lib/models/Comparison';
import Tool from '@/lib/models/Tool';
import { requireAuth } from '@/lib/auth';
import { generateSlug } from '@/lib/slug';

export async function GET() {
    try {
        await connectDB();
        const comparisons = await Comparison.find({ status: 'published' }).sort({ createdAt: -1 });

        const enriched = await Promise.all(comparisons.map(async (c) => {
            const [tool_a, tool_b, tool_c] = await Promise.all([
                Tool.findOne({ slug: c.tool_a_slug }).select('name slug logo short_description pricing_model rating_score'),
                Tool.findOne({ slug: c.tool_b_slug }).select('name slug logo short_description pricing_model rating_score'),
                c.tool_c_slug ? Tool.findOne({ slug: c.tool_c_slug }).select('name slug logo short_description pricing_model rating_score') : null,
            ]);
            return { ...c.toObject(), tool_a, tool_b, tool_c };
        }));

        return NextResponse.json(enriched);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch comparisons' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const authError = requireAuth(request);
    if (authError) return authError;

    try {
        await connectDB();
        const data = await request.json();
        if (!data.id) data.id = 'cmp-' + Date.now();
        if (!data.slug && data.title) data.slug = generateSlug(data.title);
        data.createdAt = new Date();
        data.updatedAt = new Date();

        const comparison = await Comparison.create(data);
        return NextResponse.json(comparison, { status: 201 });
    } catch (error: unknown) {
        if ((error as { code?: number }).code === 11000) {
            return NextResponse.json({ error: 'Comparison with this slug already exists.' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to create comparison: ' + (error as Error).message }, { status: 500 });
    }
}
