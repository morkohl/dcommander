import {
    ARGUMENTS_LENGTH,
    ArgumentSchema,
    OptionalArgumentSchema
} from "../../argument/argument.schema";


export class ArgumentParser {
    protected schemas: ArgumentSchema[];
    protected optionalSchemas: OptionalArgumentSchema[];

    private currentRequired: ArgumentValueHolder | null;
    private currentOptional: ArgumentValueHolder | null;

    private valueHolders: ArgumentValueHolder[];

    private identifierUtil: IdentifierUtil;

    constructor(schemas: ArgumentSchema[], optionalSchemas: OptionalArgumentSchema[]) {
        this.schemas = schemas;
        this.optionalSchemas = optionalSchemas;
    }

    parse(inputArguments: string[]): ArgumentValueHolder[] {
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

        return this.valueHolders;
    }

    private initNewParse() {
        this.clearState();

        if (this.schemas.length !== 0) {
            this.currentRequired = new ArgumentValueHolder(this.schemas[0]);
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
                this.handleNumericArgumentsLengthValueHolder(this.currentOptional)
            }
        }
        this.setCurrentOptionalForIdentifier(token);
    }

    private handleNumericArgumentsLengthValueHolder(valueHolder: ArgumentValueHolder) {
        if (!valueHolder.isFull()) {
            throw new Error(`Expected ${valueHolder.getExpectedArgumentsLengthAsString()} arguments but got ${valueHolder.valuesLength()}`)
        }
    }

    private setCurrentOptionalForIdentifier(token: string): void {
        const detectedSchema = this.identifierUtil.getForIdentifier(token);
        const valueHolder = new ArgumentValueHolder(detectedSchema);
        this.setCurrentOptional(valueHolder);
    }

    private setCurrentOptional(valueHolder: ArgumentValueHolder): void {
        this.currentOptional = valueHolder;
        this.addToValueHolders(valueHolder)
    }

    private addToValueHolders(valueHolder: ArgumentValueHolder) {
        this.valueHolders = this.valueHolders.concat([valueHolder]);
    }

    private handleIfCurrentOptionalSet(token: string, currentOptional: ArgumentValueHolder) {
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

    private addValueTo(token: string, valueHolder: ArgumentValueHolder): ArgumentValueHolder | never {
        const index = this.valueHolders.indexOf(valueHolder);
        if (index === -1) {
            throw new Error("Element does not exist");
        }

        valueHolder.addValue(token);
        return this.valueHolders[index] = valueHolder
    }

    private handleIfCurrentRequiredSet(token: string, currentRequired: ArgumentValueHolder) {
        this.currentRequired = currentRequired;

        if (this.currentRequired.isFull()) {
            this.handleIfCurrentRequiredSetAndFull(token, currentRequired);
        } else {
            this.addToCurrentRequired(token);
        }
    }

    private handleIfCurrentRequiredSetAndFull(token: string, currentRequired: ArgumentValueHolder) {
        this.currentRequired = currentRequired;

        const indexOfCurrentRequiredSchema = this.schemas.indexOf((this.currentRequired.schema));

        if (indexOfCurrentRequiredSchema + 1 !== this.schemas.length) {
            const nextRequiredSchema = this.schemas[indexOfCurrentRequiredSchema + 1];
            const requiredValueHolder = new ArgumentValueHolder(nextRequiredSchema);

            requiredValueHolder.addValue(token);
            this.setCurrentRequired(requiredValueHolder);
        } else {
            throw new Error("Too many arguments");
        }
    }

    private setCurrentRequired(valueHolder: ArgumentValueHolder): void {
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

    private checkIfAllArgsWereSuppliedTo(valueHolder: ArgumentValueHolder | null): void {
        if (valueHolder) {
            if (valueHolder.isAmbiguous()) {
                if (valueHolder.isSpecificAmbiguous(ARGUMENTS_LENGTH.AT_LEAST_ONE) && valueHolder.isEmpty()) {
                    throw new Error("Expected at least one argumentSchema");
                }
            } else {
                this.handleNumericArgumentsLengthValueHolder(valueHolder);
            }
        }
    }
}

export class ArgumentValueHolder {
    private readonly _schema: ArgumentSchema | OptionalArgumentSchema;
    private filled: boolean = false;
    private _values: string[] = [];

    constructor(schema: ArgumentSchema | OptionalArgumentSchema) {
        this._schema = schema;
    }

    get schema() {
        return this._schema
    }

    get values() {
        return this._values;
    }


    valuesLength(): number {
        return this.values.length;
    }

    getExpectedArgumentsLengthAsString(): string {
        return this._schema.argumentsLength.toString() || <string>this._schema.argumentsLength;
    }

    addValue(value: string): void {
        this._values = this._values.concat([value]);
    }

    isAmbiguous() {
        return typeof this._schema.argumentsLength === "string";
    }

    isSpecificAmbiguous(ambiguousSymbol: ARGUMENTS_LENGTH) {
        return this.isAmbiguous() && this._schema.argumentsLength.toString() === ambiguousSymbol.toString();
    }

    isFull(): boolean {
        return this.filled || (!this.isAmbiguous() && this._values.length === this._schema.argumentsLength);
    }

    isEmpty(): boolean {
        return this.values.length === 0;
    }

    setFilled(): void {
        this.filled = true;
    }
}

export class IdentifierUtil {
    private optionalSchemas: OptionalArgumentSchema[];
    private mappedIdentifiers: string[][];

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