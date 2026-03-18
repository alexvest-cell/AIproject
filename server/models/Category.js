import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name:                { type: String, required: true },
  slug:                { type: String, required: true, unique: true },
  description:         String,
  icon:                String,          // emoji or icon identifier
  parent_category:     String,          // slug of parent category (optional hierarchy)
  featured_tools:      [String],        // tool slugs pinned to this category
  related_categories:  [String],        // category slugs
  meta_title:          String,
  meta_description:    String,
  status:              { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt:           { type: Date, default: Date.now },
  updatedAt:           { type: Date, default: Date.now }
});

categorySchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('Category', categorySchema);
