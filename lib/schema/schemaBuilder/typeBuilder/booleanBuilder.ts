import {BooleanType} from "./type/boolean";
import {ArgumentSchemaTypeBuilder} from "./schemaTypeBuilder";
import {ArgumentSchema} from "../../schema";

export class BooleanSchemaBuilder extends ArgumentSchemaTypeBuilder {
    constructor(argument: ArgumentSchema) {
        super(argument, new BooleanType());
    }

    condition(fn: (value: boolean) => boolean, errFormatter?: (value: any) => string): BooleanSchemaBuilder {
        return this.satisfy(fn, errFormatter);
    }
}