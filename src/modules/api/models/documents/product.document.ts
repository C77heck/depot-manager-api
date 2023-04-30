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
    price: { type: Number, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    rating: {
        rate: { type: Number, required: true },
        count: { type: Number, required: true },
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
