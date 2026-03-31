import { NextResponse } from 'next/server';

function processAIResponse(text: string, type: string): NextResponse {
    if (!text) return NextResponse.json({ error: 'Empty response from AI' }, { status: 500 });

    if (type === 'full' || type === 'social') {
        try {
            let cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const firstBrace = cleanedText.indexOf('{');
            const lastBrace = cleanedText.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1) cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);
            const result = JSON.parse(cleanedText);

            if (type === 'full') {
                const totalWords = result.content && Array.isArray(result.content) ? result.content.join(' ').split(/\s+/).length : 500;
                result.readTime = `${Math.ceil(totalWords / 200)} min read`;
            }

            if (type === 'social') {
                const normalized: Record<string, { text: string; headline: string }> = {};
                const normalizeEntry = (entry: unknown) => {
                    if (typeof entry === 'string') return { text: entry, headline: 'TOOLCURRENT' };
                    const e = entry as Record<string, string>;
                    return { text: e.text || e.content || '', headline: e.headline || e.title || 'TOOLCURRENT' };
                };
                for (const key in result) {
                    const lower = key.toLowerCase();
                    if (lower.includes('twitter') || lower === 'x') normalized.twitter = normalizeEntry(result[key]);
                    else if (lower.includes('facebook')) normalized.facebook = normalizeEntry(result[key]);
                    else if (lower.includes('instagram')) normalized.instagram = normalizeEntry(result[key]);
                    else if (lower.includes('tiktok')) normalized.tiktok = normalizeEntry(result[key]);
                }
                return NextResponse.json(normalized);
            }

            return NextResponse.json(result);
        } catch {
            return NextResponse.json({ error: 'AI output was not valid JSON', raw: text }, { status: 500 });
        }
    }

    return NextResponse.json({ text });
}

async function handleGemini(systemPrompt: string, prompt: string, model: string, apiKey: string, type: string): Promise<NextResponse> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const payload = {
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: `Generate ${type} content based on: ${prompt}` }] }],
    };
    const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({})) as Record<string, { message?: string; status?: string }>;
        if (response.status === 403) return NextResponse.json({ error: 'Gemini API Permission Denied', reason: errorBody.error?.status || 'API_KEY_SERVICE_BLOCKED' }, { status: 403 });
        throw new Error(`Gemini API Error: ${errorBody.error?.message || response.status}`);
    }
    const data = await response.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return processAIResponse(text, type);
}

async function handleOpenAI(systemPrompt: string, prompt: string, model: string, type: string): Promise<NextResponse> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'Missing OPENAI_API_KEY' }, { status: 500 });
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({ model, messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: prompt }], temperature: 0.7 }),
    });
    if (!response.ok) {
        const errData = await response.json().catch(() => ({})) as { error?: { message?: string } };
        throw new Error(errData.error?.message || `OpenAI Error: ${response.status}`);
    }
    const data = await response.json() as { choices?: { message?: { content?: string } }[] };
    const text = data.choices?.[0]?.message?.content || '';
    return processAIResponse(text, type);
}

export async function POST(request: Request) {
    try {
        const { prompt, type, model: selectedModel, category, topic, minMinutes, maxMinutes } = await request.json();
        const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
        const context = (category || topic) ? `Category: ${category || 'N/A'}, Topic: ${topic || 'N/A'}. ` : '';

        let systemPrompt = '';
        if (type === 'title') {
            systemPrompt = `You are a senior editor. ${context}Generate a serious 8-10 word investigative headline. No exclamation marks, no calls to action.`;
        } else if (type === 'body') {
            systemPrompt = `You are an expert tech journalist. ${context}Write a concise 4-5 paragraph article body. No exclamation marks, no calls to action.`;
        } else if (type === 'image_prompt') {
            systemPrompt = `You are an expert photo editor. Based on the title and content, write a detailed image generation prompt. 4:3 aspect ratio, ultra-realistic photography style. Output only the raw prompt text.`;
        } else if (type === 'social') {
            systemPrompt = `You are a social media expert for ToolCurrent. Generate social media posts for Twitter, Facebook, Instagram, TikTok. Each post must end with "Read on toolcurrent.com". No exclamation marks. Include 3-5 relevant hashtags. Return raw JSON: { "twitter": { "text": "...", "headline": "..." }, "facebook": {...}, "instagram": {...}, "tiktok": {...} }`;
        } else if (type === 'full') {
            const targetLength = minMinutes && maxMinutes ? `${minMinutes}-${maxMinutes}` : '5-7';
            const wordCount = Math.floor(((parseInt(minMinutes) || 5) + (parseInt(maxMinutes) || 7)) / 2 * 200);
            systemPrompt = `You are an expert tech journalist for ToolCurrent. ${context}Generate a comprehensive article. Target: ${targetLength} minutes (~${wordCount} words). Return raw JSON: { "title": "...", "excerpt": "...", "content": ["paragraph1", ...], "contextBox": { "title": "...", "content": "...", "source": "..." }, "publicationDate": "Mon YYYY", "keywords": ["keyword1", ...] }`;
        }

        const modelLower = (selectedModel || '').toLowerCase().trim();
        if (modelLower.startsWith('gpt-') || modelLower.includes('openai')) {
            return await handleOpenAI(systemPrompt, prompt, selectedModel || 'gpt-4o', type);
        } else {
            return await handleGemini(systemPrompt, prompt, selectedModel || 'gemini-1.5-flash-latest', apiKey, type);
        }
    } catch (err) {
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
