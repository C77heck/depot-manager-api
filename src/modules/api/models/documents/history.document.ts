import Mongoose from 'mongoose';
import mongoose, { Document, Schema } from 'mongoose';

export interface HistoryDocument extends Document {
    type: 'arrived' | 'moved' | 'sent';
    details: mongoose.Schema.Types.Mixed;
}

export type HistoryModel = Mongoose.Model<HistoryDocument, {}, {}>;

const historySchema = new Schema<HistoryDocument, HistoryModel>({
    type: { type: String, required: true },
    details: { type: mongoose.Schema.Types.Mixed },
});

historySchema.set('timestamps', true);

export default mongoose.model<HistoryDocument, HistoryModel>('Depot', historySchema);
