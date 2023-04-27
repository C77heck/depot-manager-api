import { Inject } from '../../../application/libs/inject.decorator';
import { NotFound } from '../../../application/models/errors';
import { Provider } from '../../../application/provider';
import { ERROR_MESSAGES } from '../../../libs/constants';
import Depot, { DepotDocument, DepotModel } from '../models/documents/depot.document';
import ProductsService from './products.service';

class DepotService extends Provider {
    @Inject()
    private productsService: ProductsService;

    private collection: DepotModel = Depot;

    public async list() {
        return this.collection.find();
    }

    public async get(id: string): Promise<DepotDocument> {
        const doc = await this.collection.findById(id);

        if (!doc) {
            throw new NotFound(ERROR_MESSAGES.NOT_FOUND.DOCUMENT);
        }

        return doc;
    }

    public async create(data: DepotDocument) {
        return this.collection.create({
            name: data.name,
            status: 'open',
            maximumCapacity: data.maximumCapacity
        });
    }

    public async update(id: string, data: DepotDocument) {
        const existingDoc = await this.get(id);

        return existingDoc.update({
            name: data.name ?? existingDoc.name,
            status: data.status ?? existingDoc.status,
            maximumCapacity: data.maximumCapacity ?? existingDoc.maximumCapacity,
        });
    }

    public async delete(id: string, transferDepotId: string, deleteType: DepotDocument['status']) {
        const existingDoc = await this.get(id);

        switch (deleteType) {
            case 'temporary-closed':
                existingDoc.status = 'temporary-closed';

               await this.productsService.transfer(id, transferDepotId);

                return existingDoc.save();
            case 'closed':
                existingDoc.status = 'closed';

                await this.productsService.transfer(id, transferDepotId);

                return existingDoc.delete();
            default:
                return null;
        }
    }
}

export default DepotService;
