import {CommandSchema} from "../../command/schema/CommandSchema";
import {ArgumentSchema, OptionalArgumentSchema} from "../schema/ArgumentSchema";
import {Argument} from "../Argument";

export class CommandParser {
    argumentParser: ArgumentParser;

    constructor() {
        this.argumentParser = new ArgumentParser();
    }

    parse(schemas: CommandSchema[], inputArguments: string[]): any {
        const proposedCommandName = inputArguments[0];

        for (let i = 0; i < schemas.length; i++) {

            if (proposedCommandName === schemas[i].prefix + schemas[i].name) {
                //command detected. subloops/recursive subcommand detection here
                const detectedCommandSchema = schemas[i];
                const remainingMessageContents = inputArguments.splice(1);

                this.argumentParser.parse(detectedCommandSchema, remainingMessageContents);
            }
        }
    }
}

export class ArgumentParser {
    schemas: ArgumentSchema[];
    optionalSchemas: OptionalArgumentSchema[];

    parse(commandSchema: CommandSchema, inputArguments: string[]): any {
        this.schemas = commandSchema.argumentSchema;
        this.optionalSchemas = commandSchema.optionalArgumentSchema;

        const parsedArguments: Argument[] = [];

        const optionalArgumentIndexResults = this.getOptionalArgumentsIndexResults(this.optionalSchemas, inputArguments);

        let currentArgSchema;

        for (let i = 0; i < this.schemas.length; i++) {
            currentArgSchema = this.schemas[i];


            // if (!currentArgSchema.required) {
            //     //we want to get argument values here
            //     //we get the number of arguments of values for a schema
            //     let proposedArgumentValues;
            //     if (typeof currentArgSchema.numArgs === 'number') {
            //         identifierIndex = identifierIndex + 1;
            //         proposedArgumentValues = inputArguments.slice(identifierIndex, identifierIndex + currentArgSchema.numArgs);
            //         console.log("values", proposedArgumentValues)
            //     } else if (typeof currentArgSchema.numArgs === 'string') {
            //         //ambiguous. find a method to deal with enum values
            //     } else if (optionalArgumentSchema.isFlag) {
            //         proposedArgumentValues = null;
            //         console.log("flag found");
            //     }
            //
            // }
        }
        return parsedArguments
    }

    parseOptionalArguments(optionalArgumentSchemas: OptionalArgumentSchema[], inputArguments: string[]): any {

    }

    getOptionalArgumentsIndexResults(optionalArgumentSchemas: OptionalArgumentSchema[], inputArguments: string[]): OptionalSchemaIdentifierIndexResult[] {
        return optionalArgumentSchemas
            .map(optionalArgumentSchema => this.getIndexResultFor(optionalArgumentSchema, inputArguments))
            .filter(optional => optional.isPresent())
            .map(optional => optional.getItem());
    }

    private getIndexResultFor(optionalArgumentSchema: OptionalArgumentSchema, inputArguments: string[]): Optional<OptionalSchemaIdentifierIndexResult> {
        const identifierIndexResults = this.getIndexResultsForIdentifiers(optionalArgumentSchema.identifiers, inputArguments);
        let firstDetectedIndexResult = identifierIndexResults[0];

        if (identifierIndexResults.length === 0) {
            return new Optional<OptionalSchemaIdentifierIndexResult>(null);
        } else if (identifierIndexResults.length > 1) {
            const allIndexes = identifierIndexResults.map(result => result.index);
            const lowestIndex = Math.min(...allIndexes);
            firstDetectedIndexResult = identifierIndexResults[allIndexes.indexOf(lowestIndex)];
        }
        return new Optional({
            schema: optionalArgumentSchema,
            index: firstDetectedIndexResult.index,
            usedIdentifier: firstDetectedIndexResult.usedIdentifier
        })
    }

    private getIndexResultsForIdentifiers(identifiers: string[], inputArguments: string[]): IdentifierIndexResult[] {
        return identifiers
            .map(identifier => this.getIndexResultForIdentifier(identifier, inputArguments))
            .filter(optional => optional.isPresent())
            .map(optional => optional.getItem())
    }

    private getIndexResultForIdentifier(identifier: string, inputArguments: string[]): Optional<IdentifierIndexResult> {
        let identifierIndex = inputArguments.indexOf(identifier);
        let lastIdentifierIndex = inputArguments.lastIndexOf(identifier);

        let result = null;

        if (identifierIndex >= 0 && lastIdentifierIndex === identifierIndex) {
            result = {
                index: identifierIndex,
                usedIdentifier: identifier
            }
        }
        return new Optional(result);
    }

    getEstimationOfNumberOfArguments(): number {
        return 1
    }
}

export interface OptionalSchemaIdentifierIndexResult {
    schema: OptionalArgumentSchema,
    index: number,
    usedIdentifier: string
}

export interface IdentifierIndexResult {
    index: number,
    usedIdentifier: string
}

export class Optional<E> {
    item: E | null;

    constructor(item: E | null) {
        this.item = item;
    }

    isPresent(): boolean {
        return this.item !== null;
    }

    getItem(): E {
        if (this.isPresent()) {
            return <E>this.item;
        }
        throw new TypeError("item is null.")
    }
}