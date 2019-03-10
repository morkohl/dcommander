import {OptionalArgumentSchema, RequiredArgumentSchema} from "../schema/argumentSchema";
import {NARGS} from "../schema/builder/argumentBuilder";
import {OptionalArgumentValueHolder, RequiredArgumentValueHolder} from "./argumentValueHolder";
import {OptionalArgumentValueHolders, RequiredArgumentValueHolders} from "./argumentValueHolders";
import {ArgumentParseResult, ArgumentParseResultFactory} from "./argumentParseResult";

export class ArgumentParser {
    protected requiredSchemas: RequiredArgumentSchema[];
    protected optionalSchemas: OptionalArgumentSchema[];
    protected inputArguments: string[];

    private currentRequired: RequiredArgumentValueHolder | null;
    private currentOptional: OptionalArgumentValueHolder | null;

    private requiredValueHolders: RequiredArgumentValueHolders;
    private optionalValueHolders: OptionalArgumentValueHolders;

    constructor(schemas: RequiredArgumentSchema[], optionalSchemas: OptionalArgumentSchema[]) {
        this.requiredSchemas = schemas;
        this.optionalSchemas = optionalSchemas;
    }

    parse(inputArguments: string[]): any {
        this.initNewParse(inputArguments);

        let inputArgument: string;

        for (let i = 0; i < inputArguments.length; i++) {
            inputArgument = inputArguments[i];

            if (this.isIdentifier(inputArgument)) {
                this.handleIfIdentifierToken(inputArgument);
            } else if (this.currentOptional) {
                this.handleIfCurrentOptionalSet(inputArgument, this.currentOptional);
            } else if (this.currentRequired) {
                this.handleIfCurrentRequiredSet(inputArgument, this.currentRequired);
            } else {
                throw new Error("Too many arguments");
            }
        }

        this.checkAllArgsSupplied(this.currentRequired, this.currentOptional);

        return this.finalizeParseResults();
    }

    private finalizeParseResults(): ArgumentParseResult[] {
        return this.concatenateValueHolders().map(ArgumentParseResultFactory.fromValueHolder);
    }

    private concatenateValueHolders(): Array<RequiredArgumentValueHolder | OptionalArgumentValueHolder> {
        return this.requiredValueHolders.argumentSchemaValueHolders.concat(this.optionalValueHolders.argumentSchemaValueHolders);
    }

    private checkAllArgsSupplied(currentRequired: RequiredArgumentValueHolder | null, currentOptional: OptionalArgumentValueHolder | null): void {
        this.checkIfAllArgsWereSuppliedTo(currentRequired);
        this.checkIfAllArgsWereSuppliedTo(currentOptional);
    }

    private checkIfAllArgsWereSuppliedTo(valueHolder: RequiredArgumentValueHolder | OptionalArgumentValueHolder | null): void {
        if (valueHolder) {
            if (valueHolder.numberOfArgumentsAreAmbiguous()) {
                if (valueHolder.numberOfArgumentsAreAmbiguousSpecific(NARGS.AT_LEAST_ONE)) {
                    if (valueHolder.values.length === 0) {
                        throw new Error("Expected at least one argument");
                    }
                }
            } else {
                if (!valueHolder.hasAllArgsSupplied()) {
                    throw new Error(`Expected ${valueHolder.schema.numArgs} arguments but got ${valueHolder.values.length}`)
                }
            }
        }
    }

    isIdentifier(token: string): boolean {
        let currentSchema: OptionalArgumentSchema;
        let currentIdentifier: string;
        for (let i = 0; i < this.optionalSchemas.length; i++) {
            currentSchema = this.optionalSchemas[i];
            for (let j = 0; j < currentSchema.identifiers.length; j++) {
                currentIdentifier = currentSchema.identifiers[j];
                if (currentIdentifier === token) {
                    return true;
                }
            }
        }
        return false;
    }

    private initNewParse(inputArguments: string[]) {
        this.inputArguments = inputArguments;

        this.currentOptional = null;
        this.currentRequired = null;

        this.requiredValueHolders = new RequiredArgumentValueHolders();
        this.optionalValueHolders = new OptionalArgumentValueHolders();

        if (this.requiredSchemas.length !== 0) {
            this.currentRequired = new RequiredArgumentValueHolder(this.requiredSchemas[0]);
            this.requiredValueHolders.add(this.currentRequired);
        }
    }

    private handleIfIdentifierToken(token: string): void {
        if (this.currentOptional) {
            if (this.currentOptional.numberOfArgumentsAreAmbiguous()) {
                if (this.currentOptional.numberOfArgumentsAreAmbiguousSpecific(NARGS.AT_LEAST_ONE)) {
                    if (this.currentOptional.values.length === 0) {
                        throw new Error("Expected at least one argument");
                    }
                } else {
                    this.currentOptional.setFilled();
                }
            } else {
                if (!this.currentOptional.hasAllArgsSupplied()) {
                    throw new Error(`Expected ${this.currentOptional.schema.numArgs} arguments but got ${this.currentOptional.values.length}`)
                }
            }
        }
        this.setCurrentIdentifier(token);
    }

    private setCurrentIdentifier(token: string) {
        const detectedSchema = this.getOptionalForIdentifier(token);
        const optionalValueHolder = new OptionalArgumentValueHolder(detectedSchema);
        this.currentOptional = optionalValueHolder;
        this.optionalValueHolders.add(optionalValueHolder);
    }

    private handleIfCurrentOptionalSet(token: string, currentOptional: OptionalArgumentValueHolder) {
        this.currentOptional = currentOptional;

        if (this.currentOptional.isFull()) {
            this.currentOptional = null;
        } else {
            this.addToCurrentOptional(token)
        }
    }

    private addToCurrentOptional(token: string): void {
        if (this.currentOptional) {
            this.currentOptional = this.optionalValueHolders.updateValueHolderValues(this.currentOptional, token);

            if (this.currentOptional.isFull()) {
                this.currentOptional = null;
            }
        }
    }

    private handleIfCurrentRequiredSet(token: string, currentRequired: RequiredArgumentValueHolder) {
        this.currentRequired = currentRequired;

        if (this.currentRequired.isFull()) {
            this.handleIfCurrentRequiredSetAndFull(token, currentRequired);
        } else {
            this.addToCurrentRequired(token);
        }
    }

    private handleIfCurrentRequiredSetAndFull(token: string, currentRequired: RequiredArgumentValueHolder) {
        this.currentRequired = currentRequired;

        const indexOfCurrentRequiredSchema = this.requiredSchemas.indexOf(this.currentRequired.schema);
        if (indexOfCurrentRequiredSchema + 1 !== this.requiredSchemas.length) {
            const nextRequiredSchema = this.requiredSchemas[indexOfCurrentRequiredSchema + 1];
            const requiredValueHolder = new RequiredArgumentValueHolder(nextRequiredSchema);
            requiredValueHolder.addValue(token);
            this.currentRequired = requiredValueHolder;
            this.requiredValueHolders.add(requiredValueHolder);
        } else {
            throw new Error("Too many arguments");
        }
    }

    private addToCurrentRequired(token: string): void {
        if (this.currentRequired) {
            this.currentRequired = this.requiredValueHolders.updateValueHolderValues(this.currentRequired, token);
        }
    }

    getOptionalForIdentifier(identifier: string): OptionalArgumentSchema {
        let currentSchema: OptionalArgumentSchema;
        let currentIdentifier: string;
        for (let i = 0; i < this.optionalSchemas.length; i++) {
            currentSchema = this.optionalSchemas[i];
            for (let j = 0; j < currentSchema.identifiers.length; j++) {
                currentIdentifier = currentSchema.identifiers[j];
                if (currentIdentifier === identifier) {
                    return currentSchema;
                }
            }
        }
        throw new Error(`Invalid Argument supplied: ${identifier}`);
    }
}
