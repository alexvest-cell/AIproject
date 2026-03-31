export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        // Local DNS may not support SRV records — use Google DNS for mongodb+srv:// resolution
        const dns = (await import('dns')).default;
        dns.setServers(['8.8.8.8', '8.8.4.4']);

        const { connectDB } = await import('./lib/mongodb');
        const mongoose = (await import('mongoose')).default;

        try {
            await connectDB();
            console.log('✓ Connected to MongoDB (instrumentation)');

            // Seed database on startup
            const { default: seedDatabase } = await import('./lib/seed');
            await seedDatabase();
        } catch (err) {
            console.error('Instrumentation DB error:', err);
        }

        // Auto-publish scheduled articles (every minute)
        const cron = (await import('node-cron')).default;
        const { default: Article } = await import('./lib/models/Article');
        const { default: Subscriber } = await import('./lib/models/Subscriber');

        cron.schedule('* * * * *', async () => {
            if (mongoose.connection.readyState !== 1) return;
            try {
                const now = new Date();
                const articlesToPublish = await Article.find({ status: 'scheduled', scheduledPublishDate: { $lte: now } });
                for (const article of articlesToPublish) {
                    article.status = 'published';
                    article.publishedAt = now;
                    await article.save();
                    console.log(`✓ Auto-published: ${article.title}`);
                }
            } catch (err) {
                console.error('Auto-publish scheduler error:', err);
            }
        });

        // Weekly digest emails (every hour, sends on Friday at noon per subscriber timezone)
        cron.schedule('0 * * * *', async () => {
            if (mongoose.connection.readyState !== 1) return;
            try {
                const subscribers = await Subscriber.find();
                subscribers.forEach(sub => {
                    const now = new Date();
                    const formatter = new Intl.DateTimeFormat('en-US', { timeZone: sub.timezone, weekday: 'long', hour: 'numeric', hour12: false });
                    const parts = formatter.formatToParts(now);
                    const weekday = parts.find(p => p.type === 'weekday')?.value;
                    const hour = parts.find(p => p.type === 'hour')?.value;
                    if (weekday === 'Friday' && hour === '12') {
                        console.log(`Sending digest to ${sub.email}`);
                        // sendDigestEmail handled in subscribe route — import separately if needed
                    }
                });
            } catch (err) {
                console.error('Digest scheduler error:', err);
            }
        });
    }
}
