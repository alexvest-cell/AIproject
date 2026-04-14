import mongoose from 'mongoose';

const toolSchema = new mongoose.Schema({
    id: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    slug: { type: String, unique: true, required: true },
    logo: String,
    screenshots: [{ url: String, caption: String }],
    featured_image: String,
    short_description: { type: String, maxlength: 180 },
    full_description: String,

    category_tags: [String],
    secondary_tags: [String],
    use_case_tags: [String],
    category_primary: {
        type: String,
        enum: ['AI Chatbots', 'AI Writing', 'AI Image Generation', 'AI Video', 'AI Audio',
               'Productivity', 'Automation', 'Design', 'Development', 'Marketing',
               'Sales & CRM', 'Customer Support', 'Data Analysis', 'SEO Tools', 'Other'],
    },

    pricing_model: {
        type: String,
        enum: ['Free', 'Freemium', 'Paid', 'Enterprise', 'Trial', 'Open Source'],
        default: 'Freemium',
    },
    starting_price: String,

    website_url: String,
    affiliate_url: String,

    status: { type: String, enum: ['Active', 'Discontinued'], default: 'Active' },
    last_updated: { type: Date, default: Date.now },

    key_features: [String],
    pros: [String],
    cons: [String],
    integrations: [String],
    supported_platforms: [String],

    ai_enabled: { type: Boolean, default: false },
    rating_score: { type: Number, min: 0, max: 10, default: 0 },
    rating_breakdown: { type: mongoose.Schema.Types.Mixed },
    review_count: { type: Number, default: 0 },
    model_version: String,
    free_tier: String,
    rate_limits: String,
    model_version_by_plan: String,
    price_by_plan: String,

    best_for: [String],
    not_ideal_for: [String],
    use_case_breakdown: { type: mongoose.Schema.Types.Mixed },

    context_window: String,
    max_integrations: String,
    api_pricing: String,
    image_generation: { type: String, enum: ['yes', 'no', 'partial'] },
    memory_persistence: { type: String, enum: ['yes', 'no', 'partial'] },
    computer_use: { type: String, enum: ['yes', 'no', 'partial'] },
    api_available: { type: String, enum: ['yes', 'no'] },
    multimodal: { type: String, enum: ['yes', 'no', 'partial'] },
    open_source: { type: String, enum: ['yes', 'no', 'partial'] },
    browser_extension: { type: String, enum: ['yes', 'no'] },

    use_case_scores: [{
        use_case: String,
        score: { type: Number, min: 0, max: 10 },
        description: String,
    }],

    workflow_tags: {
        type: [String],
        validate: {
            validator: function(arr: string[]) {
                const VALID = ['Students', 'Developers', 'Marketers', 'Content Creators', 'Startups',
                               'Small Business', 'Enterprise', 'Researchers', 'Designers', 'Sales Teams',
                               'Agencies', 'Educators', 'Freelancers', 'Product Managers', 'Data Scientists',
                               'Musicians'];
                return arr.every(v => VALID.includes(v));
            },
            message: 'workflow_tags contains invalid value(s).',
        },
    },
    workflow_breakdown: String,

    alternative_selection: String,
    limitations: [String],

    data_confidence: {
        type: String,
        enum: ['verified', 'inferred', 'ai_generated'],
        default: 'ai_generated',
        required: true,
    },

    related_tools: [String],
    competitors: [String],
    competitor_differentiator: { type: mongoose.Schema.Types.Mixed },
    related_tool_note: { type: mongoose.Schema.Types.Mixed },
    _unresolved_competitors: [String],
    _unresolved_related: [String],

    review_slug: String,

    meta_title: String,
    meta_description: String,
    primary_keyword: String,
    alternative_keywords: [String],

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const Tool = (mongoose.models.Tool || mongoose.model('Tool', toolSchema)) as import('mongoose').Model<any>;
export default Tool;
