export abstract class Builder<T> {
    protected buildObject: T;

    constructor(buildObject: T) {
        this.buildObject = buildObject;
    }

    abstract build(): T;
}