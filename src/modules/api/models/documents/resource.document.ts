import Mongoose from 'mongoose';
import mongoose, { Document, Schema } from 'mongoose';

export interface ResourceDocument extends Document {
    productId: number;
    title: string;
    price?: number;
    category?: string;
    description?: string;
    image?: string;
    rating?: {
        rate?: number;
        count?: number;
    };
}

export type ResourceModel = Mongoose.Model<ResourceDocument, {}, {}>;

const resourceSchema = new Schema<ResourceDocument, ResourceModel>({
    productId: { type: Number, required: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number },
    description: { type: String },
    image: { type: String },
    rating: {
        rate: { type: Number },
        count: { type: Number },
    }
});

resourceSchema.index({ title: 'text' });

resourceSchema.set('timestamps', true);

export default mongoose.model<ResourceDocument, ResourceModel>('Resource', resourceSchema);
