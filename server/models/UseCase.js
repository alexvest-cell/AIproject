import mongoose from 'mongoose';

const useCaseSchema = new mongoose.Schema({
  name:             { type: String, required: true },
  slug:             { type: String, required: true, unique: true },
  description:      String,
  primary_category: String,    // category slug
  related_tools:    [String],  // tool slugs (populated manually or via sync)
  meta_title:       String,
  meta_description: String,
  status:           { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt:        { type: Date, default: Date.now },
  updatedAt:        { type: Date, default: Date.now }
});

useCaseSchema.pre('save', async function () {
  this.updatedAt = new Date();
});

export default mongoose.model('UseCase', useCaseSchema);
