import cors from 'cors';
import express, { Express, NextFunction, Request, Response } from 'express';
import 'express-async-errors';
import logger from 'jet-logger';
import { Application } from '../../application/application';
import { HttpError } from '../../application/models/errors';
import { ProviderRegistry } from '../../application/provider.registry';
import { ProductsController } from './controllers/products.controller';
import { UserController } from './controllers/user.controller';
import UserService from './services/user.service';

export class Server {
    private port = process.env.PORT || 3131;
    private app: Express;
    private application: Application;

    public static get instance() {
        return new this();
    }

    public async boot() {
        await this.initializeApplication();
        this.app = express();
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use('/api', this.application.controllers.propertyController.router);

        this.app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
            logger.err(err, true);

            return res.status(err?.code || 500).json({
                error: err.message,
                payload: err?.payload || {}
            });
        });

        return this;
    }

    private async initializeApplication() {
        const providerRegistry = ProviderRegistry.instance
            .registerServiceProviders([
                UserService,
            ])
            .registerControllerProviders([
                UserController,
                ProductsController
            ])
            .boot();

        this.application = await Application.instance.boot(providerRegistry);

        await this.application.connectDB();
    }

    public async start() {
        await this.app.listen(this.port, () => console.log(`app is listening on port: ${this.port}`));
    }
}
