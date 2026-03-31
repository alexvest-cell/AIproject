import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { connectDB } from '@/lib/mongodb';
import Tool from '@/lib/models/Tool';
import { requireAuth } from '@/lib/auth';
import { generateSlug } from '@/lib/slug';

function revalidateToolPages(tool: any) {
    revalidatePath(`/tools/${tool.slug}`);
    revalidatePath('/ai-tools');
    revalidatePath('/best-software');
    revalidatePath('/comparisons');
    revalidatePath('/');
    for (const competitor of tool.competitors || []) {
        const competitorSlug = (competitor as string).toLowerCase().replace(/\s+/g, '-');
        revalidatePath(`/compare/${tool.slug}-vs-${competitorSlug}`);
        for (const ucEntry of tool.use_case_scores || []) {
            const uc = (ucEntry.use_case as string)?.toLowerCase().replace(/\s+/g, '-');
            if (uc) revalidatePath(`/compare/${tool.slug}-vs-${competitorSlug}/${uc}`);
        }
    }
    for (const workflow of tool.workflow_tags || []) {
        const workflowSlug = (workflow as string).toLowerCase().replace(/\s+/g, '-');
        revalidatePath(`/best-software/for/${workflowSlug}`);
    }
    if (tool.category_primary) {
        const categorySlug = (tool.category_primary as string).toLowerCase().replace(/\s+/g, '-');
        revalidatePath(`/best-software/${categorySlug}`);
    }
}

export async function GET(request: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const pricing = searchParams.get('pricing');
        const use_case = searchParams.get('use_case');
        const status = searchParams.get('status');
        const search = searchParams.get('search');
        const sort = searchParams.get('sort');
        const limit = searchParams.get('limit');

        const query: Record<string, unknown> = {};
        if (status) query.status = status;
        if (category) query.category_tags = category;
        if (pricing) query.pricing_model = pricing;
        if (use_case) query.use_case_tags = use_case;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { short_description: { $regex: search, $options: 'i' } },
                { category_tags: { $regex: search, $options: 'i' } },
            ];
        }

        const sortOrder = sort === 'popular' ? { rating_score: -1, review_count: -1 } : { name: 1 };
        const limitNum = limit ? Math.min(parseInt(limit), 100) : 0;
        const toolsQuery = Tool.find(query).sort(sortOrder as Record<string, 1 | -1>);
        if (limitNum > 0) toolsQuery.limit(limitNum);
        const tools = await toolsQuery.lean();
        return NextResponse.json(tools);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch tools' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const authError = requireAuth(request);
    if (authError) return authError;

    try {
        await connectDB();
        const data = await request.json();
        if (!data.id) data.id = 'tool-' + Date.now();
        if (!data.slug && data.name) data.slug = generateSlug(data.name);
        data.createdAt = new Date();
        data.updatedAt = new Date();

        const tool = await Tool.create(data);
        revalidateToolPages(tool);
        return NextResponse.json(tool, { status: 201 });
    } catch (error: unknown) {
        if ((error as { code?: number }).code === 11000) {
            return NextResponse.json({ error: 'Tool with this slug already exists.' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to create tool: ' + (error as Error).message }, { status: 500 });
    }
}
