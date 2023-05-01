import Mongoose from 'mongoose';
import mongoose, { Document, Schema } from 'mongoose';
import { ProductDocument } from './product.document';

export interface HistoryDocument extends Document {
    type: 'arrived' | 'transferred' | 'sent';
    details: { from?: string; to?: string; };
    product: ProductDocument;
}

export type HistoryModel = Mongoose.Model<HistoryDocument, {}, {}>;

const historySchema = new Schema<HistoryDocument, HistoryModel>({
    type: { type: String, required: true },
    details: {
        from: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Warehouse'
        },
        to: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Warehouse'
        }
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }
});

historySchema.set('timestamps', true);

export default mongoose.model<HistoryDocument, HistoryModel>('History', historySchema);
