import mongoose from 'mongoose';
import dns from 'dns';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://alexvest_db_user:CtjaDgKqTnC724ly@cluster1.7bvwja7.mongodb.net/green_shift_db?retryWrites=true&w=majority&appName=Cluster1';

// Fix DNS issues on Windows
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Article Schema
const articleSchema = new mongoose.Schema({}, { strict: false });
const Article = mongoose.model('Article', articleSchema);

async function clearAllArticles() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 30000,
            family: 4,
        });
        console.log('✓ Connected successfully!\n');

        const count = await Article.countDocuments();
        console.log(`Found ${count} articles in database`);

        if (count === 0) {
            console.log('Database is already empty.');
            await mongoose.disconnect();
            process.exit(0);
        }

        console.log('\n⚠️  This will DELETE ALL articles. Are you sure?');
        console.log('Proceeding in 3 seconds... (Press Ctrl+C to cancel)\n');

        await new Promise(resolve => setTimeout(resolve, 3000));

        const result = await Article.deleteMany({});
        console.log(`✅ Successfully deleted ${result.deletedCount} articles`);
        console.log('\nYour database is now empty and ready for real content!');

        await mongoose.disconnect();
        console.log('✓ Disconnected from MongoDB');
        process.exit(0);
    } catch (error) {
        console.error('✗ Clear failed:', error.message);
        process.exit(1);
    }
}

clearAllArticles();
