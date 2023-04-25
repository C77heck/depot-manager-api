import express from 'express';
import { Inject } from '../../../application/libs/inject.decorator';
import { ProductsController } from '../controllers/products.controller';
import { UserController } from '../controllers/user.controller';

class ExpressApiRouter {
    @Inject()
    public userController: UserController;

    @Inject()
    public productsController: ProductsController;

    public router: express.Router;

    public constructor() {
        this.router = express.Router();
        this.initalizeRoutes();
    }

    public initalizeRoutes() {
        this.router.use('/user', this.userController.router);
        this.router.use('/products', this.productsController.router);
    }
}

export default ExpressApiRouter;
