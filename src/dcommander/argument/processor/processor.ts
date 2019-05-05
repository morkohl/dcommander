import {ParsedArgument} from "../../service/parser/argumentParser";
import {ArgumentsNamespace} from "../argument";
import {ArgumentValidation} from "../../validation/validationService";
import {ArgumentSchema, OptionalArgumentSchema} from "../argumentSchema";
import {ArgumentMessageProcessingTasks} from "./tasks";
import {MessageProcessor, ProcessingState} from "../../messageprocessor";

export interface ArgumentProcessingOptions {
    validationOptions?: ArgumentValidation.ValidationOptions,
    parseOptions?: Object,
    sanitizationOptions?: Object,
}

const defaultArgumentProcessingOptions: ArgumentProcessingOptions = {
    validationOptions: ArgumentValidation.defaultValidationOptions,
    parseOptions: {},
    sanitizationOptions: {}
};

export class ArgumentMessageProcessor extends MessageProcessor {
    constructor(schemas: ArgumentSchema[], optionalSchemas: OptionalArgumentSchema[], argumentProcessingOptions?: ArgumentProcessingOptions) {
        super();

        if(!argumentProcessingOptions) {
            argumentProcessingOptions = defaultArgumentProcessingOptions
        }

        this.setTasks([
            new ArgumentMessageProcessingTasks.ParseArgumentsTask(schemas, optionalSchemas),
            new ArgumentMessageProcessingTasks.ValidateArgumentsTask(argumentProcessingOptions.validationOptions),
            new ArgumentMessageProcessingTasks.SanitizeArgumentsTask(),
            new ArgumentMessageProcessingTasks.NameSpaceTransformerTask()
        ]);
    }

    process(message: any): ArgumentsNamespace {
        this.state = {
            inputArguments: message,
            parsedArguments: [],
            argumentNamespace: {}
        };
        return super.process(message).argumentNamespace;
    }
}

export interface ArgumentsState extends ProcessingState {
    inputArguments: string[],
    parsedArguments: ParsedArgument[],
    argumentNamespace: ArgumentsNamespace,
}