import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema({
    id: { type: String, unique: true, required: true }, // Keeping the string ID for frontend compatibility
    slug: { type: String, unique: true, sparse: true }, // URL-friendly slug, sparse index allows nulls
    title: String,
    excerpt: String,
    content: [String], // Array of paragraphs
    category: [String], // Can be single string or array
    imageUrl: String,
    author: String,
    date: String,
    readTime: String,
    read_time: Number, // minutes (numeric, new field)
    tags: [String],
    keywords: [String],
    location: String,
    contextBox: {
        title: String,
        content: String,
        source: String
    },
    sources: [String],
    audioUrl: String,

    // Platform fields — article type determines hub placement
    article_type: {
        type: String,
        enum: ['news', 'review', 'guide', 'best-of', 'ranking', 'comparison', 'intelligence', 'use_case'],
        default: 'news'
    },

    // Relational links to Tool entities (stored as tool slugs)
    primary_tools: [String],    // Tool slugs featured/reviewed in this article
    comparison_tools: [String], // Tool slugs used in comparison tables

    // FAQ section (for FAQ schema markup)
    faq: [{
        question: String,
        answer: String,
        _id: false
    }],

    // Layout-specific fields
    verdict: String,
    implications: String, // High-impact final section for Intelligence layout
    pros: [String],
    cons: [String],
    rating_breakdown: {
        ease_of_use: Number,
        features: Number,
        pricing: Number,
        integrations: Number,
        performance: Number
    },
    who_its_for: [String],
    pricing_analysis: String,
    // Comparison-specific
    choose_tool_a: [String],
    choose_tool_b: [String],
    related_rankings: [String], // Related ranking article slugs
    comparison_rows: [{
        label: String,
        tool_a_value: String,
        tool_b_value: String,
        _id: false
    }],
    // Guide-specific
    steps: [{
        title: String,
        content: String,
        tool_slug: String,
        _id: false
    }],
    tools_used: [String], // Tool slugs for guide summary section
    // Use Case-specific
    workflow_stages: [{
        stage_title: String,
        description: String,
        tool_slugs: [String],
        _id: false
    }],



    // SEO
    meta_title: String,
    meta_description: String,

    // Publish control
    status: { type: String, enum: ['draft', 'published', 'scheduled'], default: 'published' },
    scheduledPublishDate: Date,
    publishedAt: Date,
    createdAt: { type: Date, default: Date.now }
}, { strict: false }); // strict: false allows for flexible fields if legacy data varies

export default mongoose.model('Article', articleSchema);

