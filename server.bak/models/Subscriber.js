import mongoose from 'mongoose';

const subscriberSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    topics: [String],
    timezone: { type: String, default: 'UTC' },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Subscriber', subscriberSchema);
