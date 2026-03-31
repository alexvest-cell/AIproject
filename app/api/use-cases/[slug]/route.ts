import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import UseCase from '@/lib/models/UseCase';
import Tool from '@/lib/models/Tool';
import Article from '@/lib/models/Article';
import { requireAuth } from '@/lib/auth';

type Params = { params: Promise<{ slug: string }> };

export async function GET(request: Request, { params }: Params) {
    try {
        await connectDB();
        const { slug } = await params;
        const useCase = await UseCase.findOne({ slug }).lean() as Record<string, unknown> | null;
        if (!useCase) return NextResponse.json({ error: 'Use case not found' }, { status: 404 });

        const [tools, guides] = await Promise.all([
            Tool.find({
                $or: [
                    { use_case_tags: { $regex: new RegExp(useCase.name as string, 'i') } },
                    { slug: { $in: (useCase.related_tools as string[]) || [] } },
                ],
                status: 'Active',
            }).sort({ rating_score: -1 }).limit(20).lean(),
            Article.find({
                $or: [{ use_cases: { $in: [useCase.name, useCase.slug] } }, { topic: { $regex: new RegExp(useCase.name as string, 'i') } }],
                article_type: 'guide',
                status: 'published',
            }).limit(6).lean(),
        ]);

        return NextResponse.json({ useCase, tools, guides });
    } catch (err) {
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: Params) {
    const authError = requireAuth(request);
    if (authError) return authError;

    try {
        await connectDB();
        const { slug } = await params;
        const updated = await UseCase.findOneAndUpdate({ slug }, { ...await request.json(), updatedAt: new Date() }, { new: true });
        if (!updated) return NextResponse.json({ error: 'UseCase not found' }, { status: 404 });
        return NextResponse.json(updated);
    } catch (err) {
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: Params) {
    const authError = requireAuth(request);
    if (authError) return authError;

    try {
        await connectDB();
        const { slug } = await params;
        const deleted = await UseCase.findOneAndDelete({ slug });
        if (!deleted) return NextResponse.json({ error: 'UseCase not found' }, { status: 404 });
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
