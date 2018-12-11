import {Type} from "./type/baseType";
import {ArgumentSchema} from "../../schema";

export class ArgumentSchemaTypeBuilder {
    __schema: ArgumentSchema;
    protected type: Type;

    constructor(schema: ArgumentSchema, type: Type) {
        this.__schema = schema;
        this.type = type;
    }

    __build(): ArgumentSchema {
        if(!this.__schema.required) {
            this.__schema.required = false;
        }
        return this.__schema;
    }

    required(): this {
        return this.setRequired(true);
    }

    optional(): this {
        return this.setRequired(false);
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

    private setRequired(required: boolean): this {
        if(this.__schema.required) {
            throw new Error("ArgumentSchema is already set as required");
        } else if(this.__schema.required === false) {
            throw new Error("ArgumentSchema was already set as optional")
        }
        this.__schema.required = required;
        return this
    }
}
