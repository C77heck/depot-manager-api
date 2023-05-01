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

    public boot(options?: any) {
        this.hookService.$batchTransfer.subscribe(({ from, to }) => this.transferBatch(from, to));
    }

    public async listByWarehouse(warehouse: WarehouseDocument): Promise<ProductDocument[]> {
        return this.collection.find({ warehouse, status: 'in-store' });
    }

    public async listByWarehouseAll(warehouse: WarehouseDocument): Promise<ProductDocument[]> {
        return this.collection.find({ warehouse });
    }

    public async getSimilarProducts(product: ProductDocument, limit: number): Promise<ProductDocument[]> {
        return this.collection.find({
            productId: product.productId,
            warehouse: product.warehouse,
            status: 'in-store'
        }).limit(limit);
    }

    public async sendByWarehouse(product: ProductDocument, limit: number): Promise<any> {
        const products = await this.getSimilarProducts(product, limit);

        return Promise.all(products.map(pr => {
            this.hookService.$productHistory.next({ product: pr, type: 'sent', details: {} });
            pr.status = 'sent';

            return pr.save();
        }));
    }

    public async getCurrentCapacity(warehouse: WarehouseDocument): Promise<number> {
        return this.collection.count({ warehouse: warehouse, status: 'in-store' });
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

        const doc = await this.collection.create({
            warehouse,
            productId: data?.productId,
            title: data?.title,
            price: data?.price,
            description: data?.description,
            image: data?.image,
            rating: data?.rating,
            status: 'in-store',
            data,
        });

        this.hookService.$productHistory.next({ product: doc, type: 'arrived', details: {} });

        return doc;
    }

    public async transfer(products: ProductDocument[], warehouse: WarehouseDocument): Promise<void> {
        for (const product of products) {
            this.hookService.$productHistory.next({ product: product, type: 'transferred', details: { from: product.warehouse, to: warehouse } });

            await product.updateOne({ warehouse });
        }
    }

    public async send(id: string): Promise<ProductDocument> {
        const product = await this.get(id);

        this.hookService.$productHistory.next({ product, type: 'sent', details: {} });

        product.status = 'sent';

        return product.save();
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
        const productsToTransfer = await this.listByWarehouse(fromDepot);
        await this.checkCapacity(toDepot, productsToTransfer.length);

        return Promise.all(productsToTransfer.map(product => {
            this.hookService.$productHistory.next({
                product,
                type: 'transferred',
                details: { from: product.warehouse._id.toString(), to: toDepot._id.toString() }
            });

            product.warehouse = toDepot;

            return product.save();
        }));
    }
}

export default ProductsService;
