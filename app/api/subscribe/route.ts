import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Subscriber from '@/lib/models/Subscriber';
import Article from '@/lib/models/Article';
import nodemailer from 'nodemailer';

async function sendDigestEmail(email: string, topics: string[], isWelcome = false) {
    await connectDB();
    const allArticles = await Article.find().sort({ createdAt: -1 });
    const relevantArticles = allArticles.filter(a => {
        const articleCats = Array.isArray(a.category) ? a.category : [a.category];
        return articleCats.some(cat => topics.includes(cat));
    }).slice(0, 6);

    const emailHtml = `<!DOCTYPE html><html><body style="background:#18181b;color:#fff;font-family:sans-serif;"><div style="max-width:640px;margin:0 auto;padding:40px 20px;">${isWelcome ? '<p>Welcome to ToolCurrent.</p>' : '<p>Your weekly articles.</p>'}${relevantArticles.map(a => `<div style="margin-bottom:24px;"><h3>${a.title}</h3><p style="color:#a1a1aa;">${a.excerpt || ''}</p></div>`).join('')}</div></body></html>`;

    let transporter;
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
    } else {
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({ host: 'smtp.ethereal.email', port: 587, secure: false, auth: { user: testAccount.user, pass: testAccount.pass } });
    }

    await transporter.sendMail({
        from: '"ToolCurrent" <briefing@toolcurrent.com>',
        to: email,
        subject: isWelcome ? 'Welcome to ToolCurrent' : 'Your Weekly Intelligence Report',
        html: emailHtml,
    });
}

export async function POST(request: Request) {
    try {
        await connectDB();
        const { email, topics, timezone } = await request.json();

        let subscriber = await Subscriber.findOne({ email });
        if (!subscriber) {
            subscriber = await Subscriber.create({ email, topics, timezone: timezone || 'UTC' });
        } else {
            subscriber.topics = topics;
            if (timezone) subscriber.timezone = timezone;
            await subscriber.save();
        }

        sendDigestEmail(email, topics, true).catch(console.error);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Subscription failed' }, { status: 500 });
    }
}
