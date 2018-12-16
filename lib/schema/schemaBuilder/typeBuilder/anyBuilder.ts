import {ArgumentSchemaTypeBuilder} from "./schemaTypeBuilder";
import {AnyType} from "./type/anyType";
import {ArgumentSchema} from "../../ArgumentSchema";

export class AnySchemaBuilder extends ArgumentSchemaTypeBuilder {
    constructor(schema: ArgumentSchema) {
        super(schema, new AnyType());
    }
}