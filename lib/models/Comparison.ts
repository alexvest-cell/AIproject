import mongoose from 'mongoose';

const comparisonTableRowSchema = new mongoose.Schema({
    feature: String,
    tool_a_value: String,
    tool_b_value: String,
    tool_c_value: String,
}, { _id: false });

const comparisonSchema = new mongoose.Schema({
    id: { type: String, unique: true, required: true },
    title: { type: String, required: true },
    slug: { type: String, unique: true, required: true },

    tool_a_slug: { type: String, required: true },
    tool_b_slug: { type: String, required: true },
    tool_c_slug: String,

    comparison_table: [comparisonTableRowSchema],

    verdict: String,
    body: String,
    choose_tool_a: [String],
    choose_tool_b: [String],
    faq: [{ question: String, answer: String, _id: false }],

    meta_title: String,
    meta_description: String,

    comparison_type: { type: String, enum: ['1v1', 'multi'], default: '1v1' },
    use_case: String,
    primary_use_case: String,
    primary_use_cases: [String],
    needs_update: { type: Boolean, default: false },
    generation_mode: { type: String, enum: ['dynamic', 'cached'], default: 'dynamic' },
    last_generated: { type: Date, default: null },
    generated_output: { type: mongoose.Schema.Types.Mixed, default: null },

    is_override: { type: Boolean, default: false },
    verdict_override: { type: mongoose.Schema.Types.Mixed, default: null },
    why_it_wins_override: { type: String, default: null },
    strengths_override: { type: mongoose.Schema.Types.Mixed, default: null },
    weaknesses_override: { type: mongoose.Schema.Types.Mixed, default: null },
    recommendation_override: { type: mongoose.Schema.Types.Mixed, default: null },
    feature_comparison_override: { type: mongoose.Schema.Types.Mixed, default: null },
    use_case_breakdown_override: { type: mongoose.Schema.Types.Mixed, default: null },

    status: { type: String, enum: ['draft', 'published'], default: 'published' },
    publish_date: { type: Date, default: Date.now },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

comparisonSchema.pre('save', async function() {
    this.updatedAt = new Date();
});

const Comparison = (mongoose.models.Comparison || mongoose.model('Comparison', comparisonSchema)) as import('mongoose').Model<any>;
export default Comparison;
