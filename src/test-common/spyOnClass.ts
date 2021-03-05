export type Spied<T> = {
    [meth in keyof T]: jasmine.Spy;
};

export function spyOnClass<T>(spiedClass: Function): Spied<T> {
    const prototype = spiedClass.prototype;

    const methods = Object.getOwnPropertyNames(prototype)
        // Object.getOwnPropertyDescriptor is required to filter functions
        .map((name) => [name, Object.getOwnPropertyDescriptor(prototype, name)])
        .filter(([name, descriptor]) => {
            // select only functions
            return (descriptor as PropertyDescriptor).value instanceof Function;
        })
        .map(([name]) => name);
    // return spy object
    return jasmine.createSpyObj('spy', [...methods]);
}
