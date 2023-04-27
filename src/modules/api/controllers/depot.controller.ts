import express, { NextFunction } from 'express';
import { Inject } from '../../../application/libs/inject.decorator';
import { handleError } from '../../../libs/handle-error';
import { ExpressController } from '../controllers/libs/express.controller';
import DepotService from '../services/depot.service';
import ProductsService from '../services/products.service';

export class DepotController extends ExpressController {
    @Inject()
    private productsService: ProductsService;

    @Inject()
    private depotService: DepotService;

    public routes() {
        this.router.get('/', [], this.index.bind(this));
        this.router.get('/:id', [], this.show.bind(this));
        this.router.post('/', [], this.create.bind(this));
        this.router.put('/:id', [], this.update.bind(this));
        this.router.delete('/:id', [], this.delete.bind(this));
    }

    private async index(req: express.Request, res: express.Response, next: NextFunction) {
        try {
            const data = await this.depotService.list();

            res.status(200).json({ payload: data });
        } catch (err) {
            return next(handleError(err));
        }
    }

    private async show(req: express.Request, res: express.Response, next: NextFunction) {
        try {
            const id = req.params?.id || '';

            const data = await this.depotService.get(id);

            const currentCapacity = await this.productsService.getCurrentCapacity(data);

            res.status(200).json({ payload: { ...data, currentCapacity } });
        } catch (err) {
            return next(handleError(err));
        }
    }

    private async create(req: express.Request, res: express.Response, next: NextFunction) {
        try {
            const data = await this.depotService.create(req.body);

            res.status(200).json({ payload: data });
        } catch (err) {
            return next(handleError(err));
        }
    }

    private async update(req: express.Request, res: express.Response, next: NextFunction) {
        try {
            const data = await this.depotService.update(req.params?.id, req.body);

            res.status(200).json({ payload: data });
        } catch (err) {
            return next(handleError(err));
        }
    }

    private async delete(req: express.Request, res: express.Response, next: NextFunction) {
        try {
            const data = await this.depotService.delete(req.params?.id);

            res.status(200).json({ payload: data });
        } catch (err) {
            return next(handleError(err));
        }
    }
}
