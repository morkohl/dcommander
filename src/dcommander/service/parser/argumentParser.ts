import {
    ARGUMENTS_LENGTH,
    ArgumentSchema,
    ArgumentsLength,
    OptionalArgumentSchema,
} from "../../argument/argumentSchema";

export class ArgumentParser {
    protected schemas: ArgumentSchema[];
    protected optionalSchemas: OptionalArgumentSchema[];

    private currentRequired: ValueCollector | null;
    private currentOptional: ValueCollector | null;

    private valueHolders: ValueCollector[];

    private identifierUtil: IdentifierUtil;

    constructor(schemas: ArgumentSchema[], optionalSchemas: OptionalArgumentSchema[]) {
        this.schemas = schemas;
        this.optionalSchemas = optionalSchemas;
    }

    parse(inputArguments: string[]): ParsedArgument[] {
        this.initNewParse();

        let inputArgument: string;

        for (let i = 0; i < inputArguments.length; i++) {
            inputArgument = inputArguments[i];

            if (this.identifierUtil.isIdentifier(inputArgument)) {
                this.handleIfIdentifierToken(inputArgument);
            } else if (this.currentOptional) {
                this.handleIfCurrentOptionalSet(inputArgument, this.currentOptional);
            } else if (this.currentRequired) {
                this.handleIfCurrentRequiredSet(inputArgument, this.currentRequired);
            } else {
                throw new Error("Too many arguments");
            }
        }

        this.checkAllArgsSuppliedToCurrentValueHolders();

        return this.valueHolders.map(valueHolder => valueHolder.getResult());
    }

    private initNewParse() {
        this.clearState();

        if (this.schemas.length !== 0) {
            this.currentRequired = new ValueCollector(this.schemas[0]);
            this.addToValueHolders(this.currentRequired);
        }
    }

    private clearState(): void {
        this.currentOptional = null;
        this.currentRequired = null;

        this.valueHolders = [];
        this.identifierUtil = new IdentifierUtil(this.optionalSchemas);
    }

    private handleIfIdentifierToken(token: string): void {
        if (this.currentOptional) {
            if (this.currentOptional.isAmbiguous()) {
                if (this.currentOptional.isSpecificAmbiguous(ARGUMENTS_LENGTH.AT_LEAST_ONE)) {
                    if (this.currentOptional.isEmpty()) {
                        throw new Error("Expected at least one argumentSchema");
                    }
                } else {
                    this.currentOptional.setFilled();
                }
            } else {
                this.handleNumericArgumentsLengthValueCollector(this.currentOptional)
            }
        }
        this.setCurrentOptionalForIdentifier(token);
    }

    private handleNumericArgumentsLengthValueCollector(valueHolder: ValueCollector) {
        if (!valueHolder.isFull()) {
            throw new Error(`Expected ${valueHolder.argumentsLength.toString()} arguments but got ${valueHolder.valuesLength}`)
        }
    }

    private setCurrentOptionalForIdentifier(token: string): void {
        const detectedSchema = this.identifierUtil.getForIdentifier(token);
        const valueHolder = new ValueCollector(detectedSchema);
        this.setCurrentOptional(valueHolder);
    }

    private setCurrentOptional(valueHolder: ValueCollector): void {
        this.currentOptional = valueHolder;
        this.addToValueHolders(valueHolder)
    }

    private addToValueHolders(valueHolder: ValueCollector) {
        this.valueHolders = this.valueHolders.concat([valueHolder]);
    }

    private handleIfCurrentOptionalSet(token: string, currentOptional: ValueCollector) {
        this.currentOptional = currentOptional;

        if (this.currentOptional.isFull()) {
            this.currentOptional = null;
        } else {
            this.addValueToCurrentOptional(token)
        }
    }

    private addValueToCurrentOptional(token: string): void {
        if (this.currentOptional) {
            this.currentOptional = this.addValueTo(token, this.currentOptional);
            if (this.currentOptional.isFull()) {
                this.currentOptional = null;
            }
        }
    }

    private addValueTo(token: string, valueHolder: ValueCollector): ValueCollector | never {
        const index = this.valueHolders.indexOf(valueHolder);
        if (index === -1) {
            throw new Error("Element does not exist");
        }

        valueHolder.collect(token);
        return this.valueHolders[index] = valueHolder
    }

    private handleIfCurrentRequiredSet(token: string, currentRequired: ValueCollector) {
        this.currentRequired = currentRequired;

        if (this.currentRequired.isFull()) {
            this.handleIfCurrentRequiredSetAndFull(token, currentRequired);
        } else {
            this.addToCurrentRequired(token);
        }
    }

    private handleIfCurrentRequiredSetAndFull(token: string, currentRequired: ValueCollector) {
        this.currentRequired = currentRequired;

        const indexOfCurrentRequiredSchema = this.schemas.indexOf((this.currentRequired.schema));

        if (indexOfCurrentRequiredSchema + 1 !== this.schemas.length) {
            const nextRequiredSchema = this.schemas[indexOfCurrentRequiredSchema + 1];
            const requiredValueHolder = new ValueCollector(nextRequiredSchema);

            requiredValueHolder.collect(token);
            this.setCurrentRequired(requiredValueHolder);
        } else {
            throw new Error("Too many arguments");
        }
    }

    private setCurrentRequired(valueHolder: ValueCollector): void {
        this.currentRequired = valueHolder;
        this.addToValueHolders(valueHolder);
    }


    private addToCurrentRequired(token: string): void {
        if (this.currentRequired) {
            this.currentRequired = this.addValueTo(token, this.currentRequired);
        }
    }

    private checkAllArgsSuppliedToCurrentValueHolders(): void {
        this.checkIfAllArgsWereSuppliedTo(this.currentRequired);
        this.checkIfAllArgsWereSuppliedTo(this.currentOptional);
    }

    private checkIfAllArgsWereSuppliedTo(valueHolder: ValueCollector | null): void {
        if (valueHolder) {
            if (valueHolder.isAmbiguous()) {
                if (valueHolder.isSpecificAmbiguous(ARGUMENTS_LENGTH.AT_LEAST_ONE) && valueHolder.isEmpty()) {
                    throw new Error("Expected at least one argument");
                }
            } else {
                this.handleNumericArgumentsLengthValueCollector(valueHolder);
            }
        }
    }
}

interface Collector {
    collect(value: string): void | never;

    isFull(): boolean;

    isEmpty(): boolean;

    getResult(): any;
}

export class ValueCollector implements Collector {
    private readonly _schema: ArgumentSchema | OptionalArgumentSchema;
    private filled: boolean = false;
    private _values: any[] = [];

    constructor(schema: ArgumentSchema | OptionalArgumentSchema) {
        this._schema = schema;
    }

    getResult(): ParsedArgument {

        let excludeValidation: boolean = false;
        let values: any = this.values;

        if ('flag' in this.schema && this.schema.flag !== undefined) {
            values = this.schema.flag;
            excludeValidation = true;
        } else if (this.isEmpty()
            && this.isSpecificAmbiguous(ARGUMENTS_LENGTH.ALL_OR_DEFAULT)
            && this.schema.valueInfo.defaultValue) {
            values = this.schema.valueInfo.defaultValue;
            excludeValidation = true;
        }

        return {
            schema: this.schema,
            values: values,
            excludeValidation: excludeValidation
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

    isSpecificAmbiguous(ambiguousSymbol: ARGUMENTS_LENGTH) {
        return this.isAmbiguous() && this.argumentsLength === ambiguousSymbol;
    }
}

export class IdentifierUtil {
    private readonly optionalSchemas: OptionalArgumentSchema[];
    private readonly mappedIdentifiers: string[][];

    constructor(optionalSchemas: OptionalArgumentSchema[]) {
        this.optionalSchemas = optionalSchemas;
        this.mappedIdentifiers = this.optionalSchemas.map(schema => schema.identifiers);
    }

    isIdentifier(token: string): boolean {
        return this.mappedIdentifiers.filter(identifiers => this.identifiersContain(identifiers, token)).length !== 0
    }

    getForIdentifier(identifier: string): OptionalArgumentSchema | never {
        for (let i = 0; i < this.optionalSchemas.length; i++) {
            if (this.identifiersContain(this.optionalSchemas[i].identifiers, identifier)) {
                return this.optionalSchemas[i];
            }
        }
        throw new Error(`No Schema found for ${identifier}`);
    }

    private identifiersContain(identifiers: string[], token: string): boolean {
        return identifiers.indexOf(token) >= 0;
    }
}

export interface ParsedArgument {
    excludeValidation: boolean,
    values: any,
    schema: ArgumentSchema
}