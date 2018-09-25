class BooleanArgumentBuilder extends TypeBuilder {
    constructor(argument: Argument) {
        super(argument, new BooleanType());
    }

    condition(fn: (value: any) => boolean, errFormatter?: (value: any) => string | string): BooleanArgumentBuilder {
        this.addCheck({ checkFunction: fn, errFormatter: errFormatter });
        return this;
    }
}