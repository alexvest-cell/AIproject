import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Category from '@/lib/models/Category';
import { requireAuth } from '@/lib/auth';

export async function GET() {
    try {
        await connectDB();
        const categories = await Category.find({ status: 'active' }).sort({ name: 1 }).lean();
        return NextResponse.json(categories);
    } catch (err) {
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const authError = requireAuth(request);
    if (authError) return authError;

    try {
        await connectDB();
        const { name, slug, description, icon, parent_category, featured_tools, related_categories, meta_title, meta_description } = await request.json();
        if (!name || !slug) return NextResponse.json({ error: 'name and slug are required' }, { status: 400 });

        const existing = await Category.findOne({ slug });
        if (existing) return NextResponse.json({ error: `Category slug "${slug}" already exists` }, { status: 409 });

        const category = new Category({ name, slug, description, icon, parent_category, featured_tools: featured_tools || [], related_categories: related_categories || [], meta_title, meta_description });
        await category.save();
        return NextResponse.json(category, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
