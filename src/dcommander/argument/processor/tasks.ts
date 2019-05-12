import {ArgumentParser} from "../../service/parser/argumentParser";
import {ArgumentSchema, OptionalArgumentSchema} from "../argumentSchema";
import {ArgumentValidation} from "../../validation/validationService";
import {ArgumentsNamespace} from "../argument";
import {Task} from "../../messageprocessor";
import {ArgumentsState} from "./processor";

export namespace ArgumentMessageProcessingTasks {

    export interface ArgumentsTask extends Task {
        execute(state: ArgumentsState): ArgumentsState
    }

    export class ParseArgumentsTask implements ArgumentsTask {
        parser: ArgumentParser;

        constructor(schemas: ArgumentSchema[], optionalArgumentSchema: OptionalArgumentSchema[]) {
            this.parser = new ArgumentParser(schemas, optionalArgumentSchema)
        }

        execute(state: ArgumentsState): ArgumentsState {
            let parsedArguments = this.parser.parse(state.inputArguments);

            return {
                inputArguments: state.inputArguments,
                parsedArguments: parsedArguments,
                argumentNamespace: {}
            }
        }
    }

    export class ValidateArgumentsTask implements ArgumentsTask {
        validationOptions: ArgumentValidation.ValidationOptions | undefined;

        constructor(validationOptions?: ArgumentValidation.ValidationOptions) {
            this.validationOptions = validationOptions
        }

        execute(state: ArgumentsState): ArgumentsState | never {
            let validationResult = ArgumentValidation.validateParsedArguments(state.parsedArguments, this.validationOptions);

            if(validationResult.hasErrors()) {
                validationResult.throw()
            }

            return state;
        }
    }

    export class SanitizeArgumentsTask implements ArgumentsTask {
        execute(state: ArgumentsState): ArgumentsState {
            state.parsedArguments = state.parsedArguments.map(parsedArgument => {
                if(!parsedArgument.excludeFromValidationAndSanitization && parsedArgument.schema.sanitization !== undefined) {
                    parsedArgument.values = parsedArgument.values.map(parsedArgument.schema.sanitization);
                }
                return parsedArgument
            });
            return state
        }
    }

    export class NameSpaceTransformerTask implements ArgumentsTask {
        execute(state: ArgumentsState): ArgumentsState {
            state.argumentNamespace = state.parsedArguments.reduceRight((namespace, parsedArgument) => {
                namespace[parsedArgument.schema.argumentInfo.name] = {
                    schema: parsedArgument.schema,
                    values: parsedArgument.values
                };
                return namespace;
            }, <ArgumentsNamespace>{});
            return state;
        }

    }
}