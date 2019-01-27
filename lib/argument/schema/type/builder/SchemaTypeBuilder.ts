import {Type} from "../BaseType";
import {ArgumentSchema, OptionalArgumentSchema} from "../../ArgumentSchema";
import {SchemaBuilder} from "../../builder/ArgumentSchemaBuilder";

export class SchemaTypeBuilder extends SchemaBuilder {
    constructor(schema: ArgumentSchema, type: Type) {
        super(schema);
        this.buildObject.type = type;
    }

    sanitize(fn: (value: any) => any): this {
        if (this.buildObject.sanitize) {
            throw new Error("Sanitization function already exists.");
        }
        this.buildObject.sanitize = fn;
        return this;
    }

    satisfy(fn: (value: any) => boolean, errFormatter?: (value: any) => string): this {
        this.buildObject.addValidator({
            isAcceptable: fn,
            errFormatter: errFormatter
        });
        return this;
    }

    build(): ArgumentSchema {
        if (this.buildObject instanceof OptionalArgumentSchema && this.buildObject.isFlag) {
            throw new Error("Flag arguments can't have a type")
        }
        return super.build();
    }
}

