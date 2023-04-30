import { Inject } from '../../../application/libs/inject.decorator';
import { Forbidden, NotFound } from '../../../application/models/errors';
import { Provider } from '../../../application/provider';
import { ERROR_MESSAGES } from '../../../libs/constants';
import Product, { ProductDocument, ProductModel } from '../models/documents/product.document';
import { ResourceDocument } from '../models/documents/resource.document';
import { WarehouseDocument } from '../models/documents/warehouse.document';
import HookService from './hook.service';
import WarehouseService from './warehouse.service';

class ProductsService extends Provider {
    private collection: ProductModel = Product;

    @Inject()
    public warehouseService: WarehouseService;

    @Inject()
    public hookService: HookService;

    public async listByDepot(warehouse: WarehouseDocument): Promise<ProductDocument[]> {
        return this.collection.find({ warehouse: warehouse });
    }

    public async getCurrentCapacity(warehouse: WarehouseDocument): Promise<number> {
        return this.collection.count({ warehouse: warehouse });
    }

    public async get(id: string): Promise<ProductDocument> {
        const doc = await this.collection.findById(id);

        if (!doc) {
            throw new NotFound(ERROR_MESSAGES.NOT_FOUND.DOCUMENT);
        }

        return doc;
    }

    public async create(data: ResourceDocument, warehouse: WarehouseDocument): Promise<ProductDocument> {
        await this.checkCapacity(warehouse, 1);

        this.hookService.$productHistory.next({ type: 'arrived', details: {} });

        return this.collection.create({
            ...data,
            warehouse: warehouse
        });
    }

    public async transfer(id: string, warehouse: WarehouseDocument): Promise<ProductDocument> {
        await this.checkCapacity(warehouse, 1);

        const existingDoc = await this.get(id);

        this.hookService.$productHistory.next({ type: 'transferred', details: { from: existingDoc.warehouse, to: warehouse } });

        return existingDoc.update({
            ...existingDoc,
            warehouse: warehouse
        });
    }

    public async send(id: string): Promise<ProductDocument> {
        const product = await this.get(id);

        this.hookService.$productHistory.next({ type: 'sent', details: {} });

        return product.update({
            ...product,
            status: 'sent'
        });
    }

    public async checkCapacity(warehouse: WarehouseDocument, requestedCapacity: number) {
        const capacityUtilization = await this.getCurrentCapacity(warehouse);
        const availableCapacity = warehouse.maximumCapacity - capacityUtilization;

        if (availableCapacity < requestedCapacity) {
            throw new Forbidden(ERROR_MESSAGES.CAPACITY_REACHED);
        }
    }

    public async transferBatch(transferFromId: string, transferToId: string) {
        const fromDepot = await this.warehouseService.get(transferFromId);
        const toDepot = await this.warehouseService.get(transferToId);
        const productsToTransfer = await this.listByDepot(fromDepot);
        await this.checkCapacity(toDepot, productsToTransfer.length);

        return Promise.all(productsToTransfer.map(product => {
            this.hookService.$productHistory.next({ type: 'transferred', details: { from: product.warehouse, to: toDepot } });

            product.warehouse = toDepot;

            return product.save();
        }));
    }
}

export default ProductsService;
