import express, { NextFunction } from 'express';
import { Inject } from '../../../application/libs/inject.decorator';
import { handleError } from '../../../libs/handle-error';
import { ExpressController } from '../controllers/libs/express.controller';
import ProductsService from '../services/products.service';
import ResourceService from '../services/resource.service';

export class ProductsController extends ExpressController {
    @Inject()
    private productsService: ProductsService;

    @Inject()
    private resourceService: ResourceService;

    public routes() {
        this.router.get('/resources', [], this.initResources.bind(this));
        this.router.post('/:id', [], this.initResources.bind(this));
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
}
