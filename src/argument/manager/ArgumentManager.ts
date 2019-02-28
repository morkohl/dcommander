import {CommandSchema} from "../../command/schema/CommandSchema";
import {ArgumentSchema, OptionalArgumentSchema, RequiredArgumentSchema} from "../schema/ArgumentSchema";
import {Argument} from "../Argument";
import {NARGS} from "../schema/builder/ArgumentBuilder";

export class CommandParser {
    private argumentParser: ArgumentParser;

    parse(schemas: CommandSchema[], inputArguments: string[]): any {
        const proposedCommandName = inputArguments[0];

        for (let i = 0; i < schemas.length; i++) {

            if (proposedCommandName === schemas[i].prefix + schemas[i].name) {
                //command detected. subloops/recursive subcommand detection here
                const detectedCommandSchema = schemas[i];
                const remainingMessageContents = inputArguments.splice(1);

                this.argumentParser = new ArgumentParser(detectedCommandSchema.argumentSchema, detectedCommandSchema.optionalArgumentSchema);
                this.argumentParser.parse(remainingMessageContents);
            }
        }
        return null
    }
}

export class ArgumentParser {
    private requiredSchemas: RequiredArgumentSchema[];
    private optionalSchemas: OptionalArgumentSchema[];
    private inputArguments: string[];


    constructor(schemas: RequiredArgumentSchema[], optionalSchemas: OptionalArgumentSchema[]) {
        this.requiredSchemas = schemas;
        this.optionalSchemas = optionalSchemas;
    }

    _inputArguments(inputArguments: string[]): void {
        this.inputArguments = inputArguments
    }

    parse(inputArguments: string[]): Argument[] {
        this.inputArguments = inputArguments;

        const parsedArguments: Argument[] = [];

        const optionalArgumentIndexResults = this.getOptionalSchemaIdentifierIndexResults(this.optionalSchemas);

        let currentIndexResult;
        let currentValue;

        for (let i = 0; i < optionalArgumentIndexResults.length; i++) {
            currentIndexResult = optionalArgumentIndexResults[i];
            currentValue = this.getOptionalValueIndexResult(currentIndexResult, optionalArgumentIndexResults);
            console.log(this.getOptionalValueForIndexResult(currentValue));
        }

        return parsedArguments
    }

    getOptionalValueForIndexResult(valueIndexResult: OptionalSchemaValueIndexResult): string[] | boolean {
        if(valueIndexResult.defaultValue) {
            return valueIndexResult.defaultValue
        } else if(valueIndexResult.flagValue) {
            return valueIndexResult.flagValue
        } else {
            if (valueIndexResult.from === valueIndexResult.to) {
                return [this.inputArguments[valueIndexResult.from]]
            }
            return this.inputArguments.slice(valueIndexResult.from, valueIndexResult.to);
        }
    }

    getOptionalValueIndexResults(indexResults: OptionalSchemaIdentifierIndexResult[]): OptionalSchemaValueIndexResult[] {
        return indexResults.map(indexResult => this.getOptionalValueIndexResult(indexResult, indexResults))
    }

    private getOptionalValueIndexResult(indexResult: OptionalSchemaIdentifierIndexResult, otherIndexResults: OptionalSchemaIdentifierIndexResult[]): OptionalSchemaValueIndexResult {
        if (indexResult.schema.isFlag) {
            return {
                from: indexResult.identifierIndex,
                to: indexResult.identifierIndex,
                identifierIndexResult: indexResult,
                flagValue: true
            }
        }

        if (typeof indexResult.schema.numArgs === "number") {
            return this.getValueResultForExplicitNumberOfArgs(indexResult, otherIndexResults);
        } else {
            return this.getValueResultForAmbigousNumberOfArgs(indexResult, otherIndexResults);
        }
    }

    private getValueResultForExplicitNumberOfArgs(indexResult: OptionalSchemaIdentifierIndexResult, indexResults: OptionalSchemaIdentifierIndexResult[]): OptionalSchemaValueIndexResult {
        const numArgs = <number>indexResult.schema.numArgs;
        const nextIndexResult = indexResults[indexResults.indexOf(indexResult) + 1];

        let firstValueIndex = indexResult.identifierIndex + 1;
        let distance;

        if (nextIndexResult) {
            distance = nextIndexResult.identifierIndex - firstValueIndex;
        } else {
            distance = this.inputArguments.length - firstValueIndex;
        }

        if (distance < numArgs) {
            throw new Error(`Expected ${numArgs} arguments but got ${distance}.`);
        }

        return {
            identifierIndexResult: indexResult,
            from: firstValueIndex,
            to: firstValueIndex + numArgs,
        }

    }

    private getValueResultForAmbigousNumberOfArgs(indexResult: OptionalSchemaIdentifierIndexResult, indexResults: OptionalSchemaIdentifierIndexResult[]): OptionalSchemaValueIndexResult {
        const numArgs = <string>indexResult.schema.numArgs;

        let to;

        const nextIndexResult = indexResults[indexResults.indexOf(indexResult) + 1];
        const firstValueIndex = indexResult.identifierIndex + 1;

        if (nextIndexResult) {
            to = nextIndexResult.identifierIndex;
        } else {
            to = this.inputArguments.length - firstValueIndex
        }

        if (numArgs === NARGS.ALL_OR_DEFAULT) {
            if (firstValueIndex - to === 0) {
                let defaultValue;

                if(indexResult.schema.default instanceof Array) {
                    defaultValue = indexResult.schema.default
                } else if(indexResult.schema.default) {
                    defaultValue = [indexResult.schema.default.toString()]
                } else {
                    throw new Error("Got 0 arguments and no default value.")
                }

                return {
                    identifierIndexResult: indexResult,
                    from: firstValueIndex,
                    to: to,
                    defaultValue: defaultValue
                }
            }
        } else if (numArgs === NARGS.ALL_OR_ONE) {
            if (firstValueIndex - to < 1) {
                throw new Error("Expected at least 1 argument but got 0.");
            }
        }

        return {
            from: firstValueIndex,
            to: to,
            identifierIndexResult: indexResult
        }
    }

    getOptionalSchemaIdentifierIndexResults(optionalArgumentSchemas: OptionalArgumentSchema[]): OptionalSchemaIdentifierIndexResult[] {
        return optionalArgumentSchemas
            .map(optionalArgumentSchema => this.getIndexResultFor(optionalArgumentSchema))
            .filter(isPresent)
            .map(getOptional)
            .sort((indexResult, anotherIndexResult) => indexResult.index > anotherIndexResult.index ? 1 : -1)
    }

    private getIndexResultFor(optionalArgumentSchema: OptionalArgumentSchema): Optional<OptionalSchemaIdentifierIndexResult> {
        const identifierIndexResults = this.getIndexResultsForIdentifiers(optionalArgumentSchema.identifiers);
        let firstDetectedIndexResult = identifierIndexResults[0];

        if (identifierIndexResults.length === 0) {
            return Optional.empty()
        } else if (identifierIndexResults.length > 1) {
            const allIndexes = identifierIndexResults.map(result => result.identifierIndex);
            const lowestIndex = Math.min(...allIndexes);
            firstDetectedIndexResult = identifierIndexResults[allIndexes.indexOf(lowestIndex)];
        }
        return Optional.of({
            schema: optionalArgumentSchema,
            identifierIndex: firstDetectedIndexResult.identifierIndex,
            usedIdentifier: firstDetectedIndexResult.usedIdentifier
        })
    }

    private getIndexResultsForIdentifiers(identifiers: string[]): IdentifierIndexResult[] {
        return identifiers
            .map(identifier => this.getIndexResultForIdentifier(identifier))
            .filter(isPresent)
            .map(getOptional)
    }

    private getIndexResultForIdentifier(identifier: string): Optional<IdentifierIndexResult> {
        let identifierIndex = this.inputArguments.indexOf(identifier);
        let lastIdentifierIndex = this.inputArguments.lastIndexOf(identifier);

        let result = null;

        if (identifierIndex >= 0 && lastIdentifierIndex === identifierIndex) {
            result = {
                identifierIndex: identifierIndex,
                usedIdentifier: identifier
            }
        }
        return Optional.of(result);
    }
}

function isPresent(optional: Optional<any>) {
    return optional.isPresent();
}

function getOptional(optional: Optional<any>) {
    return optional.getItem();
}

export interface RequiredSchemaValueIndexResult {
    readonly from: number,
    readonly to: number,
    readonly exceptions?: number[]
}

export interface OptionalSchemaValueIndexResult {
    readonly identifierIndexResult: OptionalSchemaIdentifierIndexResult
    readonly from: number,
    readonly to: number,
    readonly defaultValue?: any,
    readonly flagValue?: boolean
}

export interface OptionalSchemaIdentifierIndexResult {
    readonly schema: OptionalArgumentSchema,
    readonly identifierIndex: number,
    readonly usedIdentifier: string
}

export interface IdentifierIndexResult {
    readonly identifierIndex: number,
    readonly usedIdentifier: string
}

export class Optional<E> {
    private readonly item: E;

    static of<E>(value: E | null): Optional<E> {
        if (value === null) {
            return Optional.empty()
        }
        return new Optional<E>(value);
    }

    static empty(): Optional<any> {
        return new Optional(null);
    }

    constructor(item: E) {
        this.item = item;
    }

    isPresent(): boolean {
        return this.item !== null;
    }

    getItem(): E {
        return this.item;
    }
}