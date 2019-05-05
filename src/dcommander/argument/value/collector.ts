import {AMBIGUITIES, ArgumentSchema, ArgumentsLength, OptionalArgumentSchema} from "../argumentSchema";
import {ParsedArgument} from "../../service/parser/argumentParser";


interface Collector {
    collect(value: string): void | never;

    isFull(): boolean;

    isEmpty(): boolean;

    getResult(): any;
}

export class ValueCollector implements Collector {
    protected readonly _schema: ArgumentSchema | OptionalArgumentSchema;
    private filled: boolean = false;
    private _values: any[] = [];

    constructor(schema: ArgumentSchema | OptionalArgumentSchema) {
        this._schema = schema;
    }

    getResult(): ParsedArgument {
        let excludeValidation: boolean = false;
        let values: any = this.values;

        if (this.isEmpty() && this.isSpecificAmbiguous(AMBIGUITIES.ALL_OR_DEFAULT)) {
            values = this.schema.valueInfo.defaultValue;
            excludeValidation = true;
        }

        return {
            schema: this.schema,
            values: values,
            excludeFromValidationAndSanitization: excludeValidation
        }
    }

    collect(value: string): void | never {
        if (this.isFull()) {
            throw new Error("Collector is full")
        }
        this._values = this._values.concat([this.schema.valueInfo.valueType.convertValue(value)]);
    }

    get schema() {
        return this._schema
    }

    get values() {
        return this._values;
    }

    get valuesLength(): number {
        return this.values.length;
    }

    get argumentsLength(): ArgumentsLength {
        return this.schema.valueInfo.argumentsLength;
    }

    setFilled(): void {
        this.filled = true;
    }

    isFull(): boolean {
        return this.filled || (!this.isAmbiguous() && this.valuesLength === this.argumentsLength);
    }

    isEmpty(): boolean {
        return !this.valuesLength;
    }

    isAmbiguous() {
        return typeof this.argumentsLength === "string";
    }

    isSpecificAmbiguous(ambiguities: AMBIGUITIES) {
        return this.isAmbiguous() && this.argumentsLength === ambiguities;
    }
}

export class FlagValueCollector extends ValueCollector {
    get schema(): OptionalArgumentSchema {
        return <OptionalArgumentSchema>this._schema;
    }

    getResult(): ParsedArgument {
        if (this.schema.flag !== undefined) {
            return {
                schema: this.schema,
                values: this.schema.flag,
                excludeFromValidationAndSanitization: true
            }
        }

        return super.getResult();
    }
}