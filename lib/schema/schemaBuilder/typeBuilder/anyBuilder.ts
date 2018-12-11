import {ArgumentSchemaTypeBuilder} from "./schemaTypeBuilder";
import {AnyType} from "./type/anyType";
import {ArgumentSchema} from "../../schema";

export class AnySchemaBuilder extends ArgumentSchemaTypeBuilder {
    constructor(schema: ArgumentSchema) {
        super(schema, new AnyType());
    }
}