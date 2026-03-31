import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Tool from '@/lib/models/Tool';
import { buildStructuredPrompt, parseStructuredOutput, validateStructuredOutput, mapSectionsToFields } from '@/lib/contentTypes.js';

export async function POST(request: Request) {
    try {
        await connectDB();
        const { contentType, topic, category, toolSlugs = [], context = '', model: selectedModel } = await request.json();
        if (!contentType) return NextResponse.json({ error: 'contentType is required' }, { status: 400 });

        const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
        if (!apiKey) return NextResponse.json({ error: 'Missing GEMINI_API_KEY' }, { status: 500 });

        const toolDocs = toolSlugs.length > 0
            ? await Tool.find({ slug: { $in: toolSlugs }, status: 'Active' }, 'slug name').lean() as { slug: string; name: string }[]
            : [];
        const toolNames = toolDocs.map(t => t.name);
        const toolSlugMap = Object.fromEntries(toolDocs.map(t => [t.name.toLowerCase(), t.slug]));

        const { system, user } = buildStructuredPrompt(contentType, { topic, category, toolNames, context });

        const geminiModel = selectedModel || 'gemini-1.5-pro-latest';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`;

        const geminiRes = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: system }] },
                contents: [{ parts: [{ text: user }] }],
                generationConfig: { temperature: 0.4, maxOutputTokens: 4096 },
            }),
        });

        if (!geminiRes.ok) {
            const errBody = await geminiRes.json().catch(() => ({})) as { error?: { message?: string } };
            return NextResponse.json({ error: errBody.error?.message || 'Gemini API error' }, { status: geminiRes.status });
        }

        const geminiData = await geminiRes.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
        const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (!rawText) return NextResponse.json({ error: 'Empty response from Gemini' }, { status: 500 });

        const sections = parseStructuredOutput(rawText);
        const { valid, errors } = validateStructuredOutput(sections, contentType);
        if (!valid) return NextResponse.json({ valid: false, errors, raw: rawText, sections });

        const fields = mapSectionsToFields(sections, contentType, toolSlugMap);
        const wordCount = (fields.content || []).join(' ').split(/\s+/).length;
        fields.originalReadTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;
        fields.read_time = Math.max(1, Math.ceil(wordCount / 200));

        return NextResponse.json({ valid: true, fields, raw: rawText, sections });
    } catch (err) {
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
