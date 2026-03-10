import mongoose from 'mongoose';

const stackSchema = new mongoose.Schema({
    // Core Identity
    id: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    slug: { type: String, unique: true, required: true },
    hero_image: String,
    short_description: { type: String, maxlength: 200, required: true },
    full_description: String,

    // Categorization
    workflow_category: { type: String, required: true }, // e.g., 'Marketing', 'Development', 'Startup Operations'

    // Tool Relationship (Array of Tool Slugs)
    tools: [String],

    // Workflow Steps
    workflow_steps: [{
        title: String,
        description: String,
        tool_slugs: [String] // Which tools are used in this step
    }],

    // Status
    status: { type: String, enum: ['Draft', 'Published'], default: 'Published' },

    // SEO
    meta_title: String,
    meta_description: String,

    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Auto-update updatedAt
stackSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

export default mongoose.model('Stack', stackSchema);
