import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema({
    id: { type: String, unique: true, required: true }, // Keeping the string ID for frontend compatibility
    slug: { type: String, unique: true, sparse: true }, // URL-friendly slug, sparse index allows nulls
    title: String,
    excerpt: String,
    content: [String], // Array of paragraphs
    category: [String], // Can be single string or array, we'll store as array ideally, but Mixed works for migration
    imageUrl: String,
    author: String,
    date: String,
    readTime: String,
    tags: [String],
    keywords: [String],
    location: String,
    contextBox: {
        title: String,
        content: String,
        source: String
    },
    sources: [String], // List of specific sources
    audioUrl: String,  // Cloudinary URL
    status: { type: String, enum: ['draft', 'published', 'scheduled'], default: 'published' },
    scheduledPublishDate: Date,
    publishedAt: Date,
    createdAt: { type: Date, default: Date.now }
}, { strict: false }); // strict: false allows for flexible fields if legacy data varies

export default mongoose.model('Article', articleSchema);
