import mongoose from 'mongoose';

const stackSchema = new mongoose.Schema({
    id: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    slug: { type: String, unique: true, required: true },
    hero_image: String,
    short_description: { type: String, maxlength: 200, required: true },
    full_description: String,

    workflow_category: { type: String, required: true },
    tools: [String],

    workflow_steps: [{
        title: String,
        description: String,
        tool_slugs: [String],
    }],

    why_it_works: [String],
    who_its_for: [String],
    not_for: [String],
    setup_time_hours: Number,

    status: { type: String, enum: ['Draft', 'Published'], default: 'Published' },
    featured: { type: Boolean, default: false },

    meta_title: String,
    meta_description: String,

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

stackSchema.pre('save', async function() {
    this.updatedAt = new Date();
});

const Stack = (mongoose.models.Stack || mongoose.model('Stack', stackSchema)) as import('mongoose').Model<any>;
export default Stack;
