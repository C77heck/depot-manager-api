import Mongoose from 'mongoose';
import mongoose, { Document, Schema } from 'mongoose';

export interface WarehouseDocument extends Document {
    name: string;
    status: 'open' | 'temporary-closed' | 'permanently-closed';
    maximumCapacity: number;
}

export type WarehouseModel = Mongoose.Model<WarehouseDocument, {}, {}>;

const warehouseSchema = new Schema<WarehouseDocument, WarehouseModel>({
    name: { type: String, required: true, unique: true },
    status: { type: String, required: true },
    maximumCapacity: { type: Number, required: true },
});

warehouseSchema.set('timestamps', true);

export default mongoose.model<WarehouseDocument, WarehouseModel>('Warehouse', warehouseSchema);
