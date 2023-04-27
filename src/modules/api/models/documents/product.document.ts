import Mongoose from 'mongoose';
import mongoose, { Schema } from 'mongoose';
import { DepotDocument } from './depot.document';
import { ResourceDocument } from './resource.document';

export interface ProductDocument extends ResourceDocument {
    depot: DepotDocument;
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
    depot: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Depot'
    }
});

productSchema.index({ title: 'text' });

productSchema.set('timestamps', true);

export default mongoose.model<ProductDocument, ProductModel>('Product', productSchema);
