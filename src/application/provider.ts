import { toLowerCase } from './libs/helpers';
import { RegisteredProvider } from './provider.registry';

export interface IProvider extends Function {
    instance?: any;
}

export class Provider extends Function implements IProvider {
    public static get instance() {
        return new this();
    }

    public boot(options?: any) {
        //
    }

    public static resolve<T>(registeredProvider: RegisteredProvider): { instance: T; key: string } {
        const instance = registeredProvider.implementation.instance;
        instance.uniqueId = registeredProvider.id;
        const key = toLowerCase(Object.getPrototypeOf(instance).constructor.name);

        return { key, instance };
    };
}
