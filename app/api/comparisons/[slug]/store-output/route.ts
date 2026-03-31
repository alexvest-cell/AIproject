import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Comparison from '@/lib/models/Comparison';
import { requireAuth } from '@/lib/auth';

type Params = { params: Promise<{ slug: string }> };

const REQUIRED_FIELDS = ['quick_verdict', 'table', 'decision', 'header', 'features', 'pricing'];

export async function POST(request: Request, { params }: Params) {
    const authError = requireAuth(request);
    if (authError) return authError;

    try {
        await connectDB();
        const { slug } = await params;
        const { generated_output } = await request.json();

        if (!generated_output || typeof generated_output !== 'object' || Array.isArray(generated_output)) {
            return NextResponse.json({ error: 'generated_output must be a non-null object' }, { status: 400 });
        }
        const missing = REQUIRED_FIELDS.filter(f => !(f in generated_output));
        if (missing.length > 0) {
            return NextResponse.json({ error: `generated_output missing required fields: ${missing.join(', ')}` }, { status: 400 });
        }

        const comparison = await Comparison.findOne({ slug });
        if (!comparison) return NextResponse.json({ error: 'Comparison not found' }, { status: 404 });

        await Comparison.findOneAndUpdate(
            { slug },
            { $set: { generated_output, needs_update: false, last_generated: new Date(), updatedAt: new Date() } }
        );
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
