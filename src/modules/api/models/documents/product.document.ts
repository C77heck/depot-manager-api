import Mongoose from 'mongoose';
import mongoose, { Document, Schema } from 'mongoose';

export interface ProductDocument extends Document {
    name: string;
}

export type ProductModel = Mongoose.Model<ProductDocument, {}, {}>;

const productSchema = new Schema<ProductDocument, ProductModel>({
    name: { type: String, required: true },
});

productSchema.set('timestamps', true);

export default mongoose.model<ProductDocument, ProductModel>('Product', productSchema);
