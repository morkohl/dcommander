import {SchemaTypeBuilder} from "./SchemaTypeBuilder";
import {AnyType} from "../AnyType";
import {ArgumentSchema} from '../../ArgumentSchema';

export class AnySchemaBuilder extends SchemaTypeBuilder {
    constructor(schema: ArgumentSchema) {
        super(schema, new AnyType());
    }
}