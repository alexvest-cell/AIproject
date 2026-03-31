import mongoose from 'mongoose';

const useCaseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    primary_category: String,
    related_tools: [String],
    meta_title: String,
    meta_description: String,
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

useCaseSchema.pre('save', async function() {
    this.updatedAt = new Date();
});

const UseCase = (mongoose.models.UseCase || mongoose.model('UseCase', useCaseSchema)) as import('mongoose').Model<any>;
export default UseCase;
