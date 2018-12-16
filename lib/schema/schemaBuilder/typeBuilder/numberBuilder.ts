import {ArgumentSchemaTypeBuilder} from "./schemaTypeBuilder";
import {NumberType} from "./type/number";
import {ArgumentSchema} from "../../ArgumentSchema";

export class NumberSchemaBuilder extends ArgumentSchemaTypeBuilder {
    constructor(schema: ArgumentSchema) {
        super(schema, new NumberType());
    }

    min(min: number): NumberSchemaBuilder {
        const greaterThanMinimum = (value: number) => value > min;
        return this.satisfy(greaterThanMinimum, (value: any) => `${value} is not greater than ${min}`)
    }

    max(max: number): NumberSchemaBuilder {
        const lessThanMaximum = (value: number) => value < max;
        return this.satisfy(lessThanMaximum, (value: any) => `${value} is not greater than ${max}` );
    }

    condition(fn: (value: number) => boolean, errFormatter?: (value: any) => string): NumberSchemaBuilder {
        return this.satisfy(fn, errFormatter);
    }
}