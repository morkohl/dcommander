export class Builder<T> {
    protected buildObject: T;

    constructor(buildObject: T) {
        this.buildObject = buildObject;
    }

    build(): T {
        return this.buildObject;
    };
}