export type DescriptorValue = (...args: any[]) => any;

function readonly(target: any, name: string, descriptor: any) {
    descriptor.writable = false;
    return descriptor;
}

export function log() {
    return function (target: Object, key: string, descriptor: PropertyDescriptor) {
        const original: DescriptorValue = descriptor.value;

        descriptor.value = function (...args: any[]) {
            console.time(key);
            const value: unknown = original.apply(this, args);
            console.timeEnd(key);

            return value;
        };
    };
}
