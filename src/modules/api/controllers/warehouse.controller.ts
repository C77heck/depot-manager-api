import express, { NextFunction } from 'express';
import { Inject } from '../../../application/libs/inject.decorator';
import { handleError } from '../../../libs/handle-error';
import { ExpressController } from '../controllers/libs/express.controller';
import HistoryService from '../services/history.service';
import ProductsService from '../services/products.service';
import WarehouseService from '../services/warehouse.service';
import { validate } from './libs/helpers/validator/input-validator';
import { required } from './libs/helpers/validator/validators';

export class WarehouseController extends ExpressController {
    @Inject()
    private productsService: ProductsService;

    @Inject()
    private warehouseService: WarehouseService;

    @Inject()
    private historyService: HistoryService;

    public routes() {
        this.router.get('/', [], this.index.bind(this));
        this.router.get('/available-warehouses', [], this.getAvailableWarehouses.bind(this));
        this.router.get('/:id', [], this.show.bind(this));
        this.router.post('/', [
            validate.bind(this, {
                name: { validators: [required] },
                maximumCapacity: { validators: [required] },
            })
        ], this.create.bind(this));
        this.router.put('/:id', [
            validate.bind(this, {
                name: { validators: [required] },
                maximumCapacity: { validators: [required] },
            })
        ], this.update.bind(this));
        this.router.put('/change-status/:id', [
            validate.bind(this, {
                statusType: { validators: [required] },
                transferWarehouseId: { validators: [required] },
            })
        ], this.changeStatus.bind(this));
    }

    private async index(req: express.Request, res: express.Response, next: NextFunction) {
        try {
            const data = await this.warehouseService.list();

            res.status(200).json({ payload: data });
        } catch (err) {
            return next(handleError(err));
        }
    }

    private async getAvailableWarehouses(req: express.Request, res: express.Response, next: NextFunction) {
        try {
            const data = await this.warehouseService.list();

            res.status(200).json({ payload: data.filter(d => d.status === 'open') });
        } catch (err) {
            return next(handleError(err));
        }
    }

    private async show(req: express.Request, res: express.Response, next: NextFunction) {
        try {
            const id = req.params?.id || '';
            const warehouse = await this.warehouseService.get(id);
            const capacityUtilization = await this.productsService.getCurrentCapacity(warehouse);
            const products = await this.productsService.listByWarehouse(warehouse);
            const allProducts = await this.productsService.listByWarehouseAll(warehouse);
            const histories = await this.historyService.getHistories(allProducts);

            res.status(200).json({ payload: { warehouse, capacityUtilization, histories, products } });
        } catch (err) {
            return next(handleError(err));
        }
    }

    private async create(req: express.Request, res: express.Response, next: NextFunction) {
        try {
            this.handleValidation(req);

            const data = await this.warehouseService.create(req.body);

            res.status(200).json({ payload: data });
        } catch (err) {
            return next(handleError(err));
        }
    }

    private async update(req: express.Request, res: express.Response, next: NextFunction) {
        try {
            this.handleValidation(req);

            const data = await this.warehouseService.update(req.params?.id, req.body);

            res.status(200).json({ payload: data });
        } catch (err) {
            return next(handleError(err));
        }
    }

    private async changeStatus(req: express.Request, res: express.Response, next: NextFunction) {
        try {
            this.handleValidation(req);
            const id = req.params?.id;
            const transferWarehouseId = req.body?.transferWarehouseId;
            const statusType = req.body?.statusType;

            const fromWarehouse = await this.warehouseService.get(id);
            const transferTo = await this.warehouseService.get(transferWarehouseId);

            if (statusType !== 'open') {
                const products = await this.productsService.listByWarehouse(fromWarehouse);
                await this.productsService.checkCapacity(transferTo, products?.length);
            }

            const data = await this.warehouseService.changeStatus(fromWarehouse, transferTo, statusType);

            res.status(200).json({ payload: data });
        } catch (err) {
            return next(handleError(err));
        }
    }
}
