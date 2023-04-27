import { Inject } from '../../../application/libs/inject.decorator';
import { Forbidden, NotFound } from '../../../application/models/errors';
import { Provider } from '../../../application/provider';
import { ERROR_MESSAGES } from '../../../libs/constants';
import { DepotDocument } from '../models/documents/depot.document';
import Product, { ProductDocument, ProductModel } from '../models/documents/product.document';
import { ResourceDocument } from '../models/documents/resource.document';
import DepotService from './depot.service';
import HookService from './hook.service';

class ProductsService extends Provider {
    private collection: ProductModel = Product;

    @Inject()
    public depotService: DepotService;

    @Inject()
    public hookService: HookService;

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

    public async create(data: ResourceDocument, depot: DepotDocument): Promise<ProductDocument> {
        await this.checkCapacity(depot, 1);

        this.hookService.$productHistory.next({ type: 'arrived', details: {} });

        return this.collection.create({
            ...data,
            depot: depot
        });
    }

    public async update(id: string, depot: DepotDocument): Promise<ProductDocument> {
        await this.checkCapacity(depot, 1);

        const existingDoc = await this.get(id);

        this.hookService.$productHistory.next({ type: 'transferred', details: { from: existingDoc.depot, to: depot } });

        return existingDoc.update({
            ...existingDoc,
            depot: depot
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

    public async delete(id: string) {
        const existingDoc = await this.get(id);

        return existingDoc.delete();
    }

    public async checkCapacity(depot: DepotDocument, requestedCapacity: number) {
        const currentCapacity = await this.getCurrentCapacity(depot);
        const availableCapacity = depot.maximumCapacity - currentCapacity;

        if (availableCapacity < requestedCapacity) {
            throw new Forbidden(ERROR_MESSAGES.CAPACITY_REACHED);
        }
    }

    public async transfer(transferFromId: string, transferToId: string) {
        const fromDepot = await this.depotService.get(transferFromId);
        const toDepot = await this.depotService.get(transferToId);
        const productsToTransfer = await this.listByDepot(fromDepot);
        await this.checkCapacity(toDepot, productsToTransfer.length);

        return Promise.all(productsToTransfer.map(product => {
            this.hookService.$productHistory.next({ type: 'transferred', details: { from: product.depot, to: toDepot } });

            product.depot = toDepot;

            return product.save();
        }));
    }
}

export default ProductsService;
