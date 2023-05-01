import { Inject } from '../../../application/libs/inject.decorator';
import { NotFound } from '../../../application/models/errors';
import { Provider } from '../../../application/provider';
import { ERROR_MESSAGES } from '../../../libs/constants';
import Warehouse, { WarehouseDocument, WarehouseModel } from '../models/documents/warehouse.document';
import HookService from './hook.service';
import ProductsService from './products.service';

class WarehouseService extends Provider {
    @Inject()
    private productsService: ProductsService;

    @Inject()
    private hookService: HookService;

    private collection: WarehouseModel = Warehouse;

    public async list() {
        return this.collection.aggregate([
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: 'warehouse',
                    as: 'products',
                    pipeline: [
                        { $match: { status: 'in-store' } }
                    ]
                }
            },
            {
                $addFields: { capacityUtilization: { $size: '$products' } }
            },
            {
                $addFields: {
                    availableCapacity: { $subtract: ['$maximumCapacity', '$capacityUtilization'] }
                }
            }
        ]);
    }

    public async get(id: string): Promise<WarehouseDocument> {
        const doc = await this.collection.findById(id);

        if (!doc) {
            throw new NotFound(ERROR_MESSAGES.NOT_FOUND.DOCUMENT);
        }

        return doc;
    }

    public async create(data: WarehouseDocument) {
        return this.collection.create({
            name: data.name,
            status: 'open',
            maximumCapacity: data.maximumCapacity
        });
    }

    public async update(id: string, data: WarehouseDocument) {
        const existingDoc = await this.get(id);

        return existingDoc.update({
            name: data.name ?? existingDoc.name,
            status: data.status ?? existingDoc.status,
            maximumCapacity: data.maximumCapacity ?? existingDoc.maximumCapacity,
        });
    }

    public async changeStatus(id: string, transferWarehouseId: string, statusType: WarehouseDocument['status']) {
        const existingDoc = await this.get(id);
        const transferTo = await this.get(transferWarehouseId);
        existingDoc.status = statusType;

        if (statusType !== 'open') {
            const products = await this.productsService.listByWarehouse(existingDoc);
            await this.productsService.checkCapacity(transferTo, products?.length);
        }

        switch (statusType) {
            case 'temporary-closed':
                this.hookService.$batchTransfer.next({ from: id, to: transferWarehouseId });
                break;
            case 'permanently-closed':
                this.hookService.$batchTransfer.next({ from: id, to: transferWarehouseId });
                break;
            default:
                break;
        }

        return existingDoc.save();
    }
}

export default WarehouseService;
