import Mongoose from 'mongoose';
import mongoose, { Document, Schema } from 'mongoose';
import { ProductDocument } from './product.document';

export interface HistoryDocument extends Document {
    type: 'arrived' | 'transferred' | 'sent';
    details: mongoose.Schema.Types.Mixed;
    product: ProductDocument;
}

export type HistoryModel = Mongoose.Model<HistoryDocument, {}, {}>;

const historySchema = new Schema<HistoryDocument, HistoryModel>({
    type: { type: String, required: true },
    details: { type: mongoose.Schema.Types.Mixed },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }
});

historySchema.set('timestamps', true);

export default mongoose.model<HistoryDocument, HistoryModel>('History', historySchema);