import mongoose from 'mongoose';

const subscriberSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    topics: [String],
    timezone: { type: String, default: 'UTC' },
    createdAt: { type: Date, default: Date.now },
});

const Subscriber = (mongoose.models.Subscriber || mongoose.model('Subscriber', subscriberSchema)) as import('mongoose').Model<any>;
export default Subscriber;
