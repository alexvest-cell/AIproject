
// reseed.js — Force wipe + reseed all collections
// Usage: node reseed.js (from the server/ directory)

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fix DNS resolution on Windows
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in .env.local');
    process.exit(1);
}

import { seedArticles, seedTools, seedComparisons } from './seed_data_toolcurrent.js';

const articleSchema = new mongoose.Schema({}, { strict: false });
const toolSchema = new mongoose.Schema({}, { strict: false });
const comparisonSchema = new mongoose.Schema({}, { strict: false });

function generateSlug(text) {
    return text.toLowerCase().trim().replace(/[\s_]+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
}

async function run() {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected');

    const Article = mongoose.model('Article', articleSchema);
    const Tool = mongoose.model('Tool', toolSchema);
    const Comparison = mongoose.model('Comparison', comparisonSchema);

    // Drop collections entirely to avoid any index conflicts
    try { await mongoose.connection.db.dropCollection('articles'); } catch (e) { console.log('articles collection did not exist'); }
    try { await mongoose.connection.db.dropCollection('tools'); } catch (e) { console.log('tools collection did not exist'); }
    try { await mongoose.connection.db.dropCollection('comparisons'); } catch (e) { console.log('comparisons collection did not exist'); }
    console.log('🗑  Collections dropped');

    // Seed articles
    const formattedArticles = seedArticles.map(a => ({
        ...a,
        content: Array.isArray(a.content) ? a.content : [a.content],
        slug: a.slug || generateSlug(a.title)
    }));
    await Article.insertMany(formattedArticles, { ordered: false });
    console.log(`✅ Inserted ${formattedArticles.length} articles`);

    // Seed tools
    await Tool.insertMany(seedTools, { ordered: false });
    console.log(`✅ Inserted ${seedTools.length} tools`);

    // Seed comparisons
    await Comparison.insertMany(seedComparisons, { ordered: false });
    console.log(`✅ Inserted ${seedComparisons.length} comparisons`);

    await mongoose.disconnect();
    console.log('✓ Disconnected. Done!');
    process.exit(0);
}

run().catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
});
