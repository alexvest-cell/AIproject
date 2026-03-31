import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: Request) {
    if (!process.env.GEMINI_API_KEY) return NextResponse.json({ error: 'Server AI Key missing' }, { status: 500 });
    const { prompt } = await request.json();

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
            config: {
                systemInstruction: `You are ToolCurrent AI, an intelligent assistant. Answer questions about technology stacks, AI, and future trends. Tone: Helpful, authoritative, scientific. Format: Under 200 words unless asked for deep dive. Use markdown.`,
            },
        });
        return NextResponse.json({ text: response.text || 'Analysis incomplete.' });
    } catch (error) {
        return NextResponse.json({ error: 'AI Error' }, { status: 500 });
    }
}
