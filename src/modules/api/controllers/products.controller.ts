import express, { NextFunction } from 'express';
import { Inject } from '../../../application/libs/inject.decorator';
import { MESSAGE } from '../../../libs/constants';
import { handleError } from '../../../libs/handle-error';
import { ExpressController } from '../controllers/libs/express.controller';
import ProductsService from '../services/products.service';
import ResourceService from '../services/resource.service';
import WarehouseService from '../services/warehouse.service';
import { validate } from './libs/helpers/validator/input-validator';
import { required } from './libs/helpers/validator/validators';

export class ProductsController extends ExpressController {
    @Inject()
    private productsService: ProductsService;

    @Inject()
    private resourceService: ResourceService;

    @Inject()
    private warehouseService: WarehouseService;

    public routes() {
        this.router.get('/resources', [], this.initResources.bind(this));
        this.router.post('/', [
            validate.bind(this, {
                options: { validators: [required] },
                warehouseId: { validators: [required] },
            })
        ], this.create.bind(this));
        this.router.put('/transfer', [
            validate.bind(this, {
                toWarehouseId: { validators: [required] },
            })
        ], this.transfer.bind(this));
        this.router.put('/send', [
            validate.bind(this, {
                cart: { validators: [required] },
            })
        ], this.send.bind(this));
    }

    private async initResources(req: express.Request, res: express.Response, next: NextFunction) {
        try {
            await this.resourceService.init();

            const data = await this.resourceService.getResources();

            res.status(200).json({ payload: data });
        } catch (err) {
            return next(handleError(err));
        }
    }

    private async create(req: express.Request, res: express.Response, next: NextFunction) {
        try {
            const options = req.body?.options;
            const resourceIds = Object.keys(options).map(key => ({ id: key, amount: options[key] }));

            const warehouseId = req.body?.warehouseId;
            const warehouse = await this.warehouseService.get(warehouseId);

            for (const { id, amount } of resourceIds) {
                const product = await this.resourceService.get(id);

                for (const i of Array.from({ length: amount })) {
                    await this.productsService.create(product, warehouse);
                }
            }

            res.status(200).json({ payload: { messag: 'success' } });
        } catch (err) {
            return next(handleError(err));
        }
    }

    private async transfer(req: express.Request, res: express.Response, next: NextFunction) {
        try {
            const toWarehouseId = req.body?.toWarehouseId;
            const cart = req.body?.cart;
            for (const prodId of Object.keys(cart)) {
                const amount = cart[prodId];
                const product = await this.productsService.get(prodId);
                const products = await this.productsService.getSimilarProducts(product, amount);
                const toWarehouse = await this.warehouseService.get(toWarehouseId);
                await this.productsService.checkCapacity(toWarehouse, products.length);
                await this.productsService.transfer(products, toWarehouse);
            }

            res.status(200).json({ payload: { message: MESSAGE.SUCCESS } });
        } catch (err) {
            return next(handleError(err));
        }
    }

    private async send(req: express.Request, res: express.Response, next: NextFunction) {
        try {
            const cart = req.body?.cart;

            for (const prodId of Object.keys(cart)) {
                const amount = cart[prodId];
                const product = await this.productsService.get(prodId);
                await this.productsService.sendByWarehouse(product, amount);
            }

            res.status(200).json({ payload: { message: MESSAGE.SUCCESS } });
        } catch (err) {
            return next(handleError(err));
        }
    }
}
