import express, { NextFunction } from 'express';
import { Inject } from '../../../application/libs/inject.decorator';
import { handleError } from '../../../libs/handle-error';
import { ExpressController } from '../controllers/libs/express.controller';
import DepotService from '../services/depot.service';
import ProductsService from '../services/products.service';
import ResourceService from '../services/resource.service';

export class ProductsController extends ExpressController {
    @Inject()
    private productsService: ProductsService;

    @Inject()
    private resourceService: ResourceService;

    @Inject()
    private depotService: DepotService;

    public routes() {
        this.router.get('/resources', [], this.initResources.bind(this));
        this.router.post('/', [], this.create.bind(this));
        this.router.put('/:id', [], this.update.bind(this));
        this.router.delete('/:id', [], this.delete.bind(this));
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
            const depotId = req.body?.depotId;

            const product = await this.resourceService.get(resourceId);
            const depot = await this.depotService.get(depotId);
            const data = await this.productsService.create(product, depot);

            res.status(200).json({ payload: data });
        } catch (err) {
            return next(handleError(err));
        }
    }

    private async update(req: express.Request, res: express.Response, next: NextFunction) {
        try {
            const id = req.params?.id;
            const depotId = req.body?.depotId;
            const depot = await this.depotService.get(depotId);

            const data = await this.productsService.update(id, depot);

            res.status(200).json({ payload: data });
        } catch (err) {
            return next(handleError(err));
        }
    }

    private async delete(req: express.Request, res: express.Response, next: NextFunction) {
        try {
            const id = req.params?.id;

            const data = await this.productsService.delete(id);

            res.status(200).json({ payload: data });
        } catch (err) {
            return next(handleError(err));
        }
    }
}
