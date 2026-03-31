import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Article from '@/lib/models/Article';
import cloudinary from '@/lib/cloudinary';
import streamifier from 'streamifier';
import { requireAuth } from '@/lib/auth';

export async function POST(request: Request) {
    const authError = requireAuth(request);
    if (authError) return authError;

    if (!process.env.GEMINI_API_KEY) return NextResponse.json({ error: 'Server AI Key missing' }, { status: 500 });

    const body = await request.json();
    const { articleId, voiceoverText } = body;
    if (!articleId) return NextResponse.json({ error: 'Article ID required' }, { status: 400 });

    try {
        await connectDB();
        const article = await Article.findOne({ id: articleId });
        if (!article) return NextResponse.json({ error: 'Article not found' }, { status: 404 });

        let textToRead: string;
        if (voiceoverText?.trim()) {
            textToRead = voiceoverText;
        } else if (article.voiceoverText?.trim()) {
            textToRead = article.voiceoverText;
        } else {
            const contentArray = Array.isArray(article.content) ? article.content : [article.content];
            textToRead = `${article.title}. ${article.excerpt}. ${contentArray.join(' ')}`;
        }

        const cleanText = textToRead.replace(/\s+/g, ' ').replace(/\.{2,}/g, '.').replace(/\s+([.,!?])/g, '$1').replace(/([.,!?])([^\s])/g, '$1 $2').trim();
        const sentences = cleanText.split(/([.!?]+\s+)/).filter(s => s.trim().length > 0).reduce<string[]>((acc, curr, idx, arr) => {
            if (idx % 2 === 0 && arr[idx + 1]) acc.push(curr + arr[idx + 1]);
            else if (idx % 2 === 0) acc.push(curr);
            return acc;
        }, []);
        const textWithPauses = sentences.join('... ... ... ');

        const ttsResponse = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': process.env.GEMINI_API_KEY },
            body: JSON.stringify({
                input: { text: textWithPauses },
                voice: { languageCode: 'en-US', name: 'en-US-Journey-D' },
                audioConfig: { audioEncoding: 'MP3', speakingRate: 0.95, pitch: 0.0, volumeGainDb: -4.0 },
            }),
        });

        if (!ttsResponse.ok) {
            const errorData = await ttsResponse.json().catch(() => ({})) as { error?: { message?: string; status?: string } };
            if (errorData.error?.status === 'PERMISSION_DENIED') throw new Error('Text-to-Speech API not enabled.');
            throw new Error(`Text-to-Speech API failed: ${errorData.error?.message || ttsResponse.statusText}`);
        }

        const ttsData = await ttsResponse.json() as { audioContent?: string };
        if (!ttsData.audioContent) throw new Error('Audio generation failed - no audio data returned');

        const buffer = Buffer.from(ttsData.audioContent, 'base64');
        const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { resource_type: 'video', format: 'mp3', folder: 'planetary_brief_audio', quality: 'auto:best', audio_codec: 'mp3' },
                (error, result) => { if (error) reject(error); else resolve(result as { secure_url: string }); }
            );
            streamifier.createReadStream(buffer).pipe(uploadStream);
        });

        await Article.findOneAndUpdate({ id: articleId }, { audioUrl: uploadResult.secure_url });
        return NextResponse.json({ success: true, audioUrl: uploadResult.secure_url, message: 'Audio generated successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Audio generation failed', details: (error as Error).message }, { status: 500 });
    }
}
