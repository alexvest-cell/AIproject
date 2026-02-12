import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://alexvest_db_user:CtjaDgKqTnC724ly@cluster1.7bvwja7.mongodb.net/green_shift_db?retryWrites=true&w=majority&appName=Cluster1';

// Article Schema (simplified)
const articleSchema = new mongoose.Schema({
    id: String,
    title: String,
    category: [String],
    topic: String,
    excerpt: String,
    content: [String],
    imageUrl: String,
    date: String,
    originalReadTime: String,
    contextBox: Object,
    keywords: [String],
    seoDescription: String,
    isFeaturedDiscover: Boolean,
    isFeaturedCategory: Boolean,
    createdAt: Date,
    updatedAt: Date
}, { strict: false });

const Article = mongoose.model('Article', articleSchema);

async function exportArticles() {
    try {
        // Fix DNS issues on Windows
        dns.setServers(['8.8.8.8', '8.8.4.4']);

        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 30000,
            family: 4, // Force IPv4
        });
        console.log('✓ Connected successfully!');

        console.log('Fetching articles...');
        const articles = await Article.find().lean();
        console.log(`✓ Found ${articles.length} articles`);

        if (articles.length === 0) {
            console.log('⚠️  No articles found in database');
            await mongoose.disconnect();
            process.exit(0);
        }

        const outputPath = path.join(__dirname, 'local_articles.json');
        fs.writeFileSync(outputPath, JSON.stringify(articles, null, 2), 'utf8');
        console.log(`✓ Exported ${articles.length} articles to ${outputPath}`);
        console.log('\n✅ Your articles have been recovered!');
        console.log('The server will now use this local file.');

        await mongoose.disconnect();
        console.log('✓ Disconnected from MongoDB');
        process.exit(0);
    } catch (error) {
        console.error('✗ Export failed:', error.message);
        process.exit(1);
    }
}

exportArticles();
