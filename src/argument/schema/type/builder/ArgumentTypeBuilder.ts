import {Type} from "../BaseType";
import {ArgumentBuilder} from "../../builder/ArgumentBuilder";
import {ArgumentSchema} from "../../ArgumentSchema";

export class ArgumentTypeBuilder extends ArgumentBuilder {
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
}

