import {ArgumentSchema, OptionalArgumentSchema, RequiredArgumentSchema} from "../schema/ArgumentSchema";
import {NARGS} from "../schema/builder/ArgumentBuilder";
import {Argument} from "../Argument";
import {ArgumentValueHolder, OptionalArgumentValueHolder, RequiredArgumentValueHolder} from "./ArgumentValueHolder";
import {OptionalArgumentValueHolders, RequiredArgumentValueHolders} from "./ArgumentValueHolders";

export class ArgumentParser {
    protected requiredSchemas: RequiredArgumentSchema[];
    protected optionalSchemas: OptionalArgumentSchema[];
    protected inputArguments: string[];

    private currentRequired: RequiredArgumentValueHolder | null;
    private currentOptional: OptionalArgumentValueHolder | null;

    private outputArguments: Argument[];
    private requiredValueHolders: RequiredArgumentValueHolders;
    private optionalValueHolders: OptionalArgumentValueHolders;

    constructor(schemas: RequiredArgumentSchema[], optionalSchemas: OptionalArgumentSchema[]) {
        this.requiredSchemas = schemas;
        this.optionalSchemas = optionalSchemas;
    }

    parse(inputArguments: string[]) {
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

        console.log("required values", this.requiredValueHolders.argumentSchemaValueHolders.map(valueHolder => valueHolder.values));
        console.log("optional values", this.optionalValueHolders.argumentSchemaValueHolders.map(valueHolder => valueHolder.values));
    }

    private checkAllArgsSupplied(currentRequired: RequiredArgumentValueHolder | null, currentOptional: OptionalArgumentValueHolder | null): void {
        this.checkIfAllArgsWereSuppliedTo(currentRequired);
        this.checkIfAllArgsWereSuppliedTo(currentOptional);
    }

    private checkIfAllArgsWereSuppliedTo(valueHolder: RequiredArgumentValueHolder | OptionalArgumentValueHolder | null): void {
        if (valueHolder) {
            if (valueHolder.numberOfArgumentsAreAmbiguous()) {
                if (valueHolder.numberOfArgumentsAreAmbiguousSpecific(NARGS.AT_LEAST_ONE)) {
                    if (valueHolder.values.length < 2) {
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

        this.outputArguments = [];
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
                    if (this.currentOptional.values.length < 2) {
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

    private addToCurrentOptional(token: string): void {
        if (this.currentOptional) {
            this.currentOptional = this.optionalValueHolders.updateValueHolderValues(this.currentOptional, token)
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