import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Stack from '@/lib/models/Stack';
import Tool from '@/lib/models/Tool';
import { requireAuth } from '@/lib/auth';

export async function GET() {
    try {
        await connectDB();
        const stacks = await Stack.find({ status: 'Published' }).sort({ createdAt: -1 }).lean() as Record<string, unknown>[];

        const previewSlugs = [...new Set(stacks.flatMap(s => ((s.tools as string[]) || []).slice(0, 3)))];
        const toolDocs = previewSlugs.length
            ? await Tool.find({ slug: { $in: previewSlugs } }, 'slug name logo').lean() as { slug: string; name: string; logo: string }[]
            : [];
        const toolMap = Object.fromEntries(toolDocs.map(t => [t.slug, { slug: t.slug, name: t.name, logo: t.logo }]));

        const enriched = stacks.map(s => ({
            ...s,
            toolPreviews: ((s.tools as string[]) || []).slice(0, 3).map(slug => toolMap[slug] || { slug, name: slug, logo: null }),
        }));

        return NextResponse.json(enriched);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch stacks' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const authError = requireAuth(request);
    if (authError) return authError;

    try {
        await connectDB();
        const body = await request.json();
        const { name, slug, ...rest } = body;
        if (!name || !slug) return NextResponse.json({ error: 'name and slug are required' }, { status: 400 });

        const existing = await Stack.findOne({ $or: [{ slug }, { id: slug }] });
        if (existing) return NextResponse.json({ error: `Stack slug "${slug}" already exists` }, { status: 409 });

        const stack = new Stack({ ...rest, id: slug, name, slug });
        await stack.save();
        return NextResponse.json(stack, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: (err as Error).message }, { status: 400 });
    }
}
