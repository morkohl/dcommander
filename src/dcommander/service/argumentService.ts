import {ArgumentSchema, OptionalArgumentSchema} from "../argument/argumentSchema";
import {ArgumentsNamespace} from "../argument/argument";
import {ParsedArgument} from "./parser/argumentParser";
import {ArgumentValidation} from "../validation/validationService";

export interface ArgumentService {
    validateArguments(parsedArguments: ParsedArgument[]): void
    mountSchemas(argumentSchemas: ArgumentSchema[], optionalArgumentSchemas: OptionalArgumentSchema[]): void
    getArgumentsFor(inputArguments: string[]): ArgumentsNamespace
}

class ArgumentServiceImpl implements ArgumentService {
    private argumentSchemas: ArgumentSchema[];
    private optionalArgumentSchemas: OptionalArgumentSchema[];

    constructor(argumentSchemas: ArgumentSchema[], optionalArgumentSchemas: OptionalArgumentSchema[]) {
        this.mountSchemas(argumentSchemas, optionalArgumentSchemas);
    }

    mountSchemas(argumentSchemas: ArgumentSchema[], optionalArgumentSchemas: OptionalArgumentSchema[]) {
        this.argumentSchemas = argumentSchemas;
        this.optionalArgumentSchemas = optionalArgumentSchemas
    }

    getArgumentsFor(inputArguments: string[]): ArgumentsNamespace {
        return { }
    }

    validateArguments(parsedArguments: ParsedArgument[]): void {
        ArgumentValidation.validateParsedArguments(parsedArguments);
    }
}