import Mongoose from 'mongoose';
import mongoose, { Document, Schema } from 'mongoose';

export interface DepotDocument extends Document {
    name: string;
    status: 'open' | 'temporary-closed' | 'closed';
    maximumCapacity: number;
}

export type DepotModel = Mongoose.Model<DepotDocument, {}, {}>;

const depotSchema = new Schema<DepotDocument, DepotModel>({
    name: { type: String, required: true },
    status: { type: String, required: true },
    maximumCapacity: { type: Number, required: true },
});

depotSchema.set('timestamps', true);

export default mongoose.model<DepotDocument, DepotModel>('Depot', depotSchema);
