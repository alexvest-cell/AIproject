import mongoose from 'mongoose';

const toolSchema = new mongoose.Schema({
    // Core Identity
    id: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    slug: { type: String, unique: true, required: true },
    logo: String,
    // Media
    screenshots: [{
        url: String,
        caption: String
    }],
    featured_image: String,
    short_description: { type: String, maxlength: 180 },
    full_description: String,

    // Categorisation
    category_tags: [String],      // legacy — kept for backward compat
    secondary_tags: [String],     // SEO-only free tags (replaces category_tags in CMS)
    use_case_tags: [String],      // predefined use-case list (1–5 items)
    category_primary: {           // single canonical category (enum-controlled)
        type: String,
        enum: ['AI Writing', 'AI Chatbots', 'Productivity', 'Automation', 'Design',
               'Development', 'Marketing', 'Data Analysis', 'Customer Support', 'Other']
    },

    // Pricing
    pricing_model: {
        type: String,
        enum: ['Free', 'Freemium', 'Paid', 'Enterprise', 'Trial'],
        default: 'Freemium'
    },
    starting_price: String,  // e.g. "$12/mo" or "Free"

    // Links
    website_url: String,
    affiliate_url: String,

    // Status
    status: { type: String, enum: ['Active', 'Discontinued'], default: 'Active' },
    last_updated: { type: Date, default: Date.now },

    // Structured content
    key_features: [String],
    pros: [String],
    cons: [String],
    integrations: [String],
    supported_platforms: [String], // e.g. ['Web', 'iOS', 'Android', 'API']

    // Intelligence fields
    ai_enabled: { type: Boolean, default: false },
    rating_score: { type: Number, min: 0, max: 10, default: 0 },
    rating_breakdown: { type: mongoose.Schema.Types.Mixed },   // e.g. { Value: 8.5, Features: 7.5 }
    review_count: { type: Number, default: 0 },
    model_version: String,   // e.g. "Grok 4 (Grok 4.1 Fast for API)" — legacy, retained for backward compat
    free_tier: String,                // one sentence: what's available at no cost
    rate_limits: String,              // multi-line: one line per plan tier showing message caps/time windows
    model_version_by_plan: String,    // multi-line: one line per plan tier showing current model(s)

    // Editorial content
    best_for: [String],              // ideal user profiles
    not_ideal_for: [String],         // who should avoid it
    use_case_breakdown: { type: mongoose.Schema.Types.Mixed },  // { Research: "detailed text..." }
    // Capabilities
    context_window: String,          // e.g. "128K", "1M", "N/A"
    max_integrations: String,        // e.g. "500+", "50–100", "N/A"
    api_pricing: String,             // e.g. "$3.00 input / $15.00 output per MTok"
    image_generation:  { type: String, enum: ['yes', 'no', 'partial'] },
    memory_persistence: { type: String, enum: ['yes', 'no', 'partial'] },
    computer_use:       { type: String, enum: ['yes', 'no', 'partial'] },
    api_available:      { type: String, enum: ['yes', 'no'] },

    use_case_scores: [{                        // structured array — one entry per use case
        use_case: String,                      // must match a use_case_tags value
        score: { type: Number, min: 0, max: 10 },
        description: String
    }],

    // Workflow / audience targeting
    workflow_tags: {
        type: [String],
        validate: {
            validator: function(arr) {
                const VALID = ['Students', 'Developers', 'Marketers', 'Content Creators', 'Startups',
                               'Small Business', 'Enterprise', 'Researchers', 'Designers', 'Sales Teams'];
                return arr.every(v => VALID.includes(v));
            },
            message: 'workflow_tags contains invalid value(s). Allowed: Students, Developers, Marketers, Content Creators, Startups, Small Business, Enterprise, Researchers, Designers, Sales Teams'
        }
    },
    workflow_breakdown: String,               // multi-line: "[TAG]: [score]/10 — [sentence]" per line

    alternative_selection: String,   // when to choose this vs alternatives
    limitations: [String],           // taxonomy tags: bias_risk, reliability_risk, etc.

    // Data quality
    data_confidence: {
        type: String,
        enum: ['verified', 'inferred', 'ai_generated'],
        default: 'ai_generated',
        required: true
    },

    // Internal linking hooks
    related_tools: [String],   // tool IDs
    competitors: [String],     // tool IDs
    competitor_differentiator: { type: mongoose.Schema.Types.Mixed },  // { [toolId]: 'one-line differentiator' }
    related_tool_note: { type: mongoose.Schema.Types.Mixed },          // { [toolId]: 'complementary role note' }
    _unresolved_competitors: [String],  // names not yet in DB — restored on CMS edit open
    _unresolved_related: [String],      // names not yet in DB — restored on CMS edit open

    // Cross-linking
    review_slug: String,   // slug of the /articles/[slug] review page for this tool

    // SEO
    meta_title: String,
    meta_description: String,
    primary_keyword: String,
    alternative_keywords: [String],

    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Tool', toolSchema);
