class NumberArgumentBuilder extends TypeBuilder {
    constructor(argument: Argument) {
        super(argument, new NumberType());
    }

    min(min: number): NumberArgumentBuilder {
        const greaterThanMinimum = (value: any) => value > min;
        this.addCheck({ checkFunction: greaterThanMinimum, errFormatter: (value: any) => `${value} is not greater than ${min}`});
        return this;
    }

    max(max: number): NumberArgumentBuilder {
        const lessThanMaximum = (value: any) => value < max;
        this.addCheck({ checkFunction: lessThanMaximum, errFormatter: (value: any) => `${value} is not greater than ${max}`});
        return this;
    }

    condition(fn: (value: any) => boolean, errFormatter?: (value: any) => string | string): NumberArgumentBuilder {
        this.addCheck({ checkFunction: fn, errFormatter: errFormatter });
        return this;
    }
}