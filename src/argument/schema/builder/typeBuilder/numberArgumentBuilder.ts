import {ArgumentTypeBuilder} from "./argumentTypeBuilder";
import {ArgumentSchema} from "../../argumentSchema";
import {NumberType} from "../../type/numberType";

export class NumberArgumentBuilder extends ArgumentTypeBuilder {
    constructor(schema: ArgumentSchema) {
        super(schema, new NumberType());
    }

    min(min: number): NumberArgumentBuilder {
        const greaterThanMinimum = (value: number) => value > min;
        return this.satisfy(greaterThanMinimum, (value: any) => `${value} is not greater than ${min}`)
    }

    max(max: number): NumberArgumentBuilder {
        const lessThanMaximum = (value: number) => value < max;
        return this.satisfy(lessThanMaximum, (value: any) => `${value} is not greater than ${max}` );
    }

    condition(fn: (value: number) => boolean, errFormatter?: (value: any) => string): NumberArgumentBuilder {
        return this.satisfy(fn, errFormatter);
    }
}