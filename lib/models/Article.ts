import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema({
    id: { type: String, unique: true, required: true },
    slug: { type: String, unique: true, sparse: true },
    title: String,
    excerpt: String,
    content: [String],
    category: [String],
    imageUrl: String,
    author: String,
    date: String,
    readTime: String,
    read_time: Number,
    tags: [String],
    keywords: [String],
    location: String,
    contextBox: {
        title: String,
        content: String,
        source: String,
    },
    sources: [String],
    audioUrl: String,

    article_type: {
        type: String,
        enum: ['news', 'review', 'guide', 'best-of', 'ranking', 'comparison', 'intelligence', 'use_case'],
        default: 'news',
    },

    primary_tools: [String],
    comparison_tools: [String],
    use_cases: [String],

    faq: [{ question: String, answer: String, _id: false }],

    verdict: String,
    implications: String,
    pros: [String],
    cons: [String],
    rating_breakdown: {
        ease_of_use: Number,
        features: Number,
        pricing: Number,
        integrations: Number,
        performance: Number,
    },
    who_its_for: [String],
    pricing_analysis: String,
    choose_tool_a: [String],
    choose_tool_b: [String],
    related_rankings: [String],
    comparison_rows: [{
        label: String,
        tool_a_value: String,
        tool_b_value: String,
        _id: false,
    }],
    steps: [{
        title: String,
        content: String,
        tool_slug: String,
        _id: false,
    }],
    tools_used: [String],
    difficulty_level: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
    tips: [String],
    common_mistakes: [String],
    workflow_stages: [{
        stage_title: String,
        description: String,
        tool_slugs: [String],
        _id: false,
    }],

    meta_title: String,
    meta_description: String,

    status: { type: String, enum: ['draft', 'published', 'scheduled'], default: 'published' },
    scheduledPublishDate: Date,
    publishedAt: Date,
    createdAt: { type: Date, default: Date.now },
}, { strict: false });

const Article = (mongoose.models.Article || mongoose.model('Article', articleSchema)) as import('mongoose').Model<any>;
export default Article;
