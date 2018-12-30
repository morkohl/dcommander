import {Type} from "../BaseType";
import {ArgumentSchema} from "../../ArgumentSchema";
import {SchemaBuilder} from "../../builder/ArgumentSchemaBuilder";

export class SchemaTypeBuilder extends SchemaBuilder {
    __schema: ArgumentSchema;

    constructor(schema: ArgumentSchema, type: Type) {
        super(schema);
        this.__schema.type = type;
    }

    sanitize(fn: (value: any) => any): this {
        if(this.__schema.sanitize) {
            throw new Error("Sanitization function already exists.");
        }
        this.__schema.sanitize = fn;
        return this;
    }

    satisfy(fn: (value: any) => boolean, errFormatter?: (value: any) => string): this {
        this.__schema.addValidator({
            isAcceptable: fn,
            errFormatter: errFormatter
        });
        return this;
    }
}

