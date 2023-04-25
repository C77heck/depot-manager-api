import { IProvider } from './provider';

export interface RegisteredProvider {
    id: symbol,
    implementation: IProvider;
}

export class ProviderRegistry {
    private serviceProviders: IProvider[] = [];

    private controllerProviders: IProvider[] = [];

    public registerServiceProviders(services: IProvider[]) {
        this.serviceProviders = [...this.serviceProviders, ...services];

        return this;
    }

    public registerControllerProviders(controllers: IProvider[]) {
        this.controllerProviders = [...this.controllerProviders, ...controllers];

        return this;
    }

    public services: RegisteredProvider[] = [];
    public controllers: RegisteredProvider[] = [];

    public boot() {
        this.registerServices();
        this.registerControllers();

        return this;
    }

    public static get instance() {
        return new this();
    }

    private registerServices() {
        this.services = this.serviceProviders.map(service => {
            return {
                id: Symbol.for(service.name),
                implementation: service
            };
        });
    }

    private registerControllers() {
        this.controllers = this.controllerProviders.map(service => {
            return {
                id: Symbol.for(service.name),
                implementation: service
            };
        });
    }
}
