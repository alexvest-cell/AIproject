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

    // Data-driven comparison fields
    comparison_type: { type: String, enum: ['1v1', 'multi'], default: '1v1' },
    use_case: String,                // single use case for scoring context (new)
    primary_use_case: String,        // legacy single value — kept for migration
    primary_use_cases: [String],     // legacy multi-select — kept for migration
    needs_update: { type: Boolean, default: false },  // true when a linked tool is updated
    generation_mode: { type: String, enum: ['dynamic', 'cached'], default: 'dynamic' },
    last_generated: { type: Date, default: null },    // when compareEngine last ran
    generated_output: { type: mongoose.Schema.Types.Mixed, default: null }, // stored generateComparison() result

    // Override model: CMS can override individual sections on top of dynamic generation
    is_override: { type: Boolean, default: false },
    verdict_override: { type: mongoose.Schema.Types.Mixed, default: null },
    why_it_wins_override: { type: String, default: null },
    strengths_override: { type: mongoose.Schema.Types.Mixed, default: null },
    weaknesses_override: { type: mongoose.Schema.Types.Mixed, default: null },
    recommendation_override: { type: mongoose.Schema.Types.Mixed, default: null },
    feature_comparison_override: { type: mongoose.Schema.Types.Mixed, default: null },
    use_case_breakdown_override: { type: mongoose.Schema.Types.Mixed, default: null },

    // Status
    status: { type: String, enum: ['draft', 'published'], default: 'published' },
    publish_date: { type: Date, default: Date.now },

    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

comparisonSchema.pre('save', async function () {
    this.updatedAt = new Date();
});

export default mongoose.model('Comparison', comparisonSchema);
