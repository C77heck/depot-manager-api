import "reflect-metadata";

export function Inject(): any {
    return function (target: Object, key: string) {
        const type = Reflect.getMetadata('design:type', target, key);
        if (!type || !type?.name) {
            return;
        }
        const classSymbol = Symbol.for(type.name);
        Reflect.defineMetadata('design:type', classSymbol, target, key);
    };
}
