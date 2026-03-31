import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import UseCase from '@/lib/models/UseCase';
import { requireAuth } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const query: Record<string, unknown> = { status: 'active' };
        if (category) query.$or = [{ primary_category: category }, { primary_category: new RegExp(category, 'i') }];
        const useCases = await UseCase.find(query).sort({ name: 1 }).lean();
        return NextResponse.json(useCases);
    } catch (err) {
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const authError = requireAuth(request);
    if (authError) return authError;

    try {
        await connectDB();
        const body = await request.json();
        const { name, slug } = body;
        if (!name || !slug) return NextResponse.json({ error: 'name and slug are required' }, { status: 400 });

        const existing = await UseCase.findOne({ slug });
        if (existing) return NextResponse.json({ error: `UseCase slug "${slug}" already exists` }, { status: 409 });

        const useCase = new UseCase(body);
        await useCase.save();
        return NextResponse.json(useCase, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
