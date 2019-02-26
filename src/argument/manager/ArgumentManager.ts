import {CommandSchema} from "../../command/schema/CommandSchema";
import {ArgumentSchema, OptionalArgumentSchema, RequiredArgumentSchema} from "../schema/ArgumentSchema";
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

                this.argumentParser.parse(detectedCommandSchema.argumentSchema, remainingMessageContents);
            }
        }
    }
}

export class ArgumentParser {
    schemas: ArgumentSchema[];

    parse(schemas: ArgumentSchema[], inputArguments: string[]): any {
        this.schemas = schemas;
        const parsedArguments: Argument[] = [];

        let indexResults = [];

        let currentParseResult;
        let currentArgSchema;
        for (let i = 0; i < this.schemas.length; i++) {
            currentArgSchema = this.schemas[i];

            if (!currentArgSchema.required) {
                let optionalArgumentSchema: OptionalArgumentSchema = <OptionalArgumentSchema>currentArgSchema;
                const identifiers = optionalArgumentSchema.identifiers;

                for (let j = 0; j < identifiers.length; j++) {
                    let identifierIndex = inputArguments.indexOf(identifiers[j]);
                    let lastIdentifierIndex = inputArguments.lastIndexOf(identifiers[j]);

                    if (identifierIndex >= 0 && lastIdentifierIndex === identifierIndex) {

                        indexResults.push({
                            schema: currentArgSchema,
                            index: identifierIndex
                        });

                        console.log(indexResults);

                        console.log("detected!", identifiers[j], currentArgSchema.name, currentArgSchema.numArgs);

                        //we want to get argument values here
                        //we get the number of arguments of values for a schema
                        let proposedArgumentValues;

                        if (typeof currentArgSchema.numArgs === 'number') {
                            identifierIndex = identifierIndex + 1;
                            proposedArgumentValues = inputArguments.slice(identifierIndex, identifierIndex + currentArgSchema.numArgs);
                            console.log("values", proposedArgumentValues)
                        } else if (typeof currentArgSchema.numArgs === 'string') {
                            //ambiguous. find a method to deal with enum values
                        } else if (optionalArgumentSchema.isFlag) {
                            proposedArgumentValues = null;
                            console.log("flag found");
                        }

                    }
                }
            } else {
            }

        }
        return parsedArguments
    }
}