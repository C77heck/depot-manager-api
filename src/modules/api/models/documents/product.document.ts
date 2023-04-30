import Mongoose from 'mongoose';
import mongoose, { Schema } from 'mongoose';
import { ResourceDocument } from './resource.document';
import { WarehouseDocument } from './warehouse.document';

export interface ProductDocument extends ResourceDocument {
    warehouse: WarehouseDocument;
    status: 'in-store' | 'sent';
}

export type ProductModel = Mongoose.Model<ProductDocument, {}, {}>;

const productSchema = new Schema<ProductDocument, ProductModel>({
    productId: { type: Number, required: true },
    title: { type: String, required: true, index: 'text' },
    price: { type: Number },
    description: { type: String },
    image: { type: String },
    rating: {
        rate: { type: Number },
        count: { type: Number },
    },
    status: { type: String, default: 'in-store' },
    warehouse: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Warehouse'
    }
});

productSchema.index({ title: 'text' });

productSchema.set('timestamps', true);

export default mongoose.model<ProductDocument, ProductModel>('Product', productSchema);
