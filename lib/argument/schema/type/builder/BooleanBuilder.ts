import {BooleanType} from "../BooleanType";
import {ArgumentSchema} from "../../ArgumentSchema";
import {SchemaTypeBuilder} from "./SchemaTypeBuilder";

export class BooleanSchemaBuilder extends SchemaTypeBuilder {
    constructor(argument: ArgumentSchema) {
        super(argument, new BooleanType());
    }

    condition(fn: (value: boolean) => boolean, errFormatter?: (value: any) => string): BooleanSchemaBuilder {
        return this.satisfy(fn, errFormatter);
    }
}