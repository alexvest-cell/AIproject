import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    icon: String,
    parent_category: String,
    featured_tools: [String],
    related_categories: [String],
    meta_title: String,
    meta_description: String,
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

categorySchema.pre('save', async function() {
    this.updatedAt = new Date();
});

const Category = (mongoose.models.Category || mongoose.model('Category', categorySchema)) as import('mongoose').Model<any>;
export default Category;
