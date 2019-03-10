import {ArgumentSchema, OptionalArgumentSchema, RequiredArgumentSchema} from "../schema/argumentSchema";
import {NARGS} from "../schema/builder/argumentBuilder";

export abstract class ArgumentValueHolder<S extends ArgumentSchema> {
    schema: S;
    values: string[];
    constantValue?: any;
    filled: boolean = false;

    protected constructor(schema: S) {
        this.schema = schema;
        this.values = [];
        if (schema.defaultValue) {
            this.constantValue = schema.defaultValue;
        }
    }

    addValue(token: string): void {
        if (!this.numberOfArgumentsAreAmbiguous()) {
            if (this.isFull()) {
                throw new Error("Value Holder is full");
            }
        }
        this.values = this.values.concat([token]);
    }

    numberOfArgumentsAreAmbiguous(): boolean {
        return typeof this.schema.numArgs === "string";
    }

    numberOfArgumentsAreAmbiguousSpecific(ambiguousSymbol: NARGS) {
        return this.numberOfArgumentsAreAmbiguous() && this.schema.numArgs === ambiguousSymbol.toString();
    }

    isFull(): boolean {
        return this.hasAllArgsSupplied() || this.filled === true
    }

    hasAllArgsSupplied(): boolean {
        return this.values.length === <number>this.schema.numArgs
    }

    setFilled(): void {
        this.filled = true;
    }
}


export class RequiredArgumentValueHolder extends ArgumentValueHolder<RequiredArgumentSchema> {
    constructor(schema: RequiredArgumentSchema) {
        super(schema);
    }
}

export class OptionalArgumentValueHolder extends ArgumentValueHolder<OptionalArgumentSchema> {
    constructor(schema: OptionalArgumentSchema) {
        super(schema);
    }
}
