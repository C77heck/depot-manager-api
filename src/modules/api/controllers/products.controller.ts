import express, { NextFunction } from 'express';
import { Inject } from '../../../application/libs/inject.decorator';
import { handleError } from '../../../libs/handle-error';
import { ExpressController } from '../controllers/libs/express.controller';
import { PropertyDbService } from '../services/property-db.service';

export class ProductsController extends ExpressController {
    @Inject()
    private databaseService: PropertyDbService;

    public routes() {
        this.router.get('/', [], this.index.bind(this));
    }

    private async index(req: express.Request, res: express.Response, next: NextFunction) {
        try {
            res.status(200).json({ payload: '' });
        } catch (err) {
            return next(handleError(err));
        }
    }
}
