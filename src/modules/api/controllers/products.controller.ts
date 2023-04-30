import express, { NextFunction } from 'express';
import { Inject } from '../../../application/libs/inject.decorator';
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
        this.router.post('/', [], this.create.bind(this));
        this.router.put('/transfer/:id', [
            validate.bind(this, {
                warehouseId: { validators: [required] },
            })
        ], this.transfer.bind(this));
        this.router.put('/send/:id', [], this.send.bind(this));
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
            const resourceId = req.body?.resourceId;
            const warehouseId = req.body?.warehouseId;

            const product = await this.resourceService.get(resourceId);
            const warehouse = await this.warehouseService.get(warehouseId);
            const data = await this.productsService.create(product, warehouse);

            res.status(200).json({ payload: data });
        } catch (err) {
            return next(handleError(err));
        }
    }

    private async transfer(req: express.Request, res: express.Response, next: NextFunction) {
        try {
            const id = req.params?.id;
            const warehouseId = req.body?.warehouseId;
            const warehouse = await this.warehouseService.get(warehouseId);

            const data = await this.productsService.transfer(id, warehouse);

            res.status(200).json({ payload: data });
        } catch (err) {
            return next(handleError(err));
        }
    }

    private async send(req: express.Request, res: express.Response, next: NextFunction) {
        try {
            const id = req.params?.id;
            const data = await this.productsService.send(id);

            res.status(200).json({ payload: data });
        } catch (err) {
            return next(handleError(err));
        }
    }
}
