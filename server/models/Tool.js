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
    short_description: { type: String, maxlength: 160 },
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

    // Intelligence fields (future-proofed)
    ai_enabled: { type: Boolean, default: false },
    rating_score: { type: Number, min: 0, max: 10, default: 0 },
    review_count: { type: Number, default: 0 },

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

    // SEO
    meta_title: String,
    meta_description: String,

    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Auto-update updatedAt
toolSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

export default mongoose.model('Tool', toolSchema);
