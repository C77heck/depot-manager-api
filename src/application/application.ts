import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { IocContainer } from './ioc-container';
import { ProviderRegistry } from './provider.registry';

dotenv.config({ path: `./config/.env` });

export class Application {
    private iocContainer: IocContainer;
    public services: Record<any, any>;
    public controllers: Record<any, any>;

    public static get instance() {
        return new this();
    }

    public async boot(registeredProviders: ProviderRegistry) {
        this.iocContainer = new IocContainer(registeredProviders);
        await this.iocContainer.boot();

        this.services = this.iocContainer.services;
        this.controllers = this.iocContainer.controllers;

        return this;
    }

    public async connectDB() {
        try {
            mongoose.set('strictQuery', true);

            await mongoose.connect(process.env.MONGO_URL || '');
        } catch (e) {
            console.log(e);
            throw e;
        } finally {
            return this;
        }
    }
}
