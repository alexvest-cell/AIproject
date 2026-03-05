import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import dns from 'dns';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fix DNS resolution issues on Windows
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Load env from .env.local in the root
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in .env.local');
    process.exit(1);
}

async function wipeArticles() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✓ Connected');

        // Define a minimal schema to access the collection
        const Article = mongoose.model('Article', new mongoose.Schema({}, { strict: false }));

        const count = await Article.countDocuments();
        console.log(`Found ${count} articles. Deleting...`);

        const result = await Article.deleteMany({});
        console.log(`✓ Deleted ${result.deletedCount} articles.`);

        await mongoose.disconnect();
        console.log('✓ Disconnected');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error wiping articles:', err);
        process.exit(1);
    }
}

wipeArticles();
