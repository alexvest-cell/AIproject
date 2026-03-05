import mongoose from 'mongoose';

const comparisonTableRowSchema = new mongoose.Schema({
    feature: String,
    tool_a_value: String,
    tool_b_value: String,
    tool_c_value: String   // optional, for 3-way comparisons
}, { _id: false });

const comparisonSchema = new mongoose.Schema({
    id: { type: String, unique: true, required: true },
    title: { type: String, required: true }, // e.g. "ChatGPT vs Claude"
    slug: { type: String, unique: true, required: true }, // e.g. "chatgpt-vs-claude"

    // Tool relations (stored as slug strings for portability; resolved on fetch)
    tool_a_slug: { type: String, required: true },
    tool_b_slug: { type: String, required: true },
    tool_c_slug: String, // optional third tool

    // Structured comparison
    comparison_table: [comparisonTableRowSchema],

    // Written content
    verdict: String,     // Short verdict paragraph
    body: String,        // Full rich-text body
    choose_tool_a: [String],
    choose_tool_b: [String],
    faq: [{
        question: String,
        answer: String,
        _id: false
    }],

    // SEO
    meta_title: String,
    meta_description: String,

    // Status
    status: { type: String, enum: ['draft', 'published'], default: 'published' },
    publish_date: { type: Date, default: Date.now },

    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

comparisonSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

export default mongoose.model('Comparison', comparisonSchema);
