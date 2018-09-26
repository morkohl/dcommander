import {Argument} from "../argument";
import {TypeBuilder} from "./baseBuilder";
import {NumberType} from "./type/number";

export class NumberArgumentBuilder extends TypeBuilder {
    constructor(argument: Argument) {
        super(argument, new NumberType());
    }

    min(min: number): NumberArgumentBuilder {
        const greaterThanMinimum = (value: any) => value > min;
        this.addValidator({ isAcceptable: greaterThanMinimum, errFormatter: (value: any) => `${value} is not greater than ${min}`});
        return this;
    }

    max(max: number): NumberArgumentBuilder {
        const lessThanMaximum = (value: any) => value < max;
        this.addValidator({ isAcceptable: lessThanMaximum, errFormatter: (value: any) => `${value} is not greater than ${max}`});
        return this;
    }

    condition(fn: (value: any) => boolean, errFormatter?: (value: any) => string | string): NumberArgumentBuilder {
        this.addValidator({ isAcceptable: fn, errFormatter: errFormatter });
        return this;
    }
}