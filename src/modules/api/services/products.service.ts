import { NotFound } from '../../../application/models/errors';
import { Provider } from '../../../application/provider';
import { ERROR_MESSAGES } from '../../../libs/constants';
import { DepotDocument } from '../models/documents/depot.document';
import Product, { ProductDocument, ProductModel } from '../models/documents/product.document';

class ProductsService extends Provider {
    private collection: ProductModel = Product;

    public async listByDepot(depot: DepotDocument): Promise<ProductDocument[]> {
        return this.collection.find({ depot: depot });
    }

    public async getCurrentCapacity(depot: DepotDocument): Promise<number> {
        return this.collection.count({ depot: depot });
    }

    public async get(id: string): Promise<ProductDocument> {
        const doc = await this.collection.findById(id);

        if (!doc) {
            throw new NotFound(ERROR_MESSAGES.NOT_FOUND.DOCUMENT);
        }

        return doc;
    }

    public async create(data: ProductDocument, depotId: string): Promise<ProductDocument> {
        return this.collection.create({
            ...data,
            depot: depotId
        });
    }

    public async update(id: string, data: ProductDocument, depotId: string): Promise<ProductDocument> {
        const existingDoc = await this.get(id);

        return existingDoc.update({
            ...existingDoc,
            depot: depotId
        });
    }

    public async delete(id: string) {
        const existingDoc = await this.get(id);

        return existingDoc.delete();
    }
}

export default ProductsService;
