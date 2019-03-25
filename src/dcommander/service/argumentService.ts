import {ArgumentSchema, OptionalArgumentSchema} from "../argument/argumentSchema";
import {ArgumentsNamespace} from "../argument/argument";
import {ArgumentValidationService} from "../validation/validationService";
import {ParsedArgument} from "./parser/argumentParser";

export interface ArgumentService {
    validateArguments(parsedArguments: ParsedArgument[]): void
    mountSchemas(argumentSchemas: ArgumentSchema[], optionalArgumentSchemas: OptionalArgumentSchema[]): void
    getArgumentsFor(inputArguments: string[]): ArgumentsNamespace
}

class ArgumentServiceImpl implements ArgumentService {
    private argumentSchemas: ArgumentSchema[];
    private optionalArgumentSchemas: OptionalArgumentSchema[];

    private validationService: ArgumentValidationService;

    constructor(argumentSchemas: ArgumentSchema[], optionalArgumentSchemas: OptionalArgumentSchema[]) {
        this.mountSchemas(argumentSchemas, optionalArgumentSchemas);
        this.validationService = new ArgumentValidationService();
    }

    mountSchemas(argumentSchemas: ArgumentSchema[], optionalArgumentSchemas: OptionalArgumentSchema[]) {
        this.argumentSchemas = argumentSchemas;
        this.optionalArgumentSchemas = optionalArgumentSchemas
    }

    getArgumentsFor(inputArguments: string[]): ArgumentsNamespace {
        return { }
    }

    validateArguments(parsedArguments: ParsedArgument[]): void {
        this.validationService.validate(parsedArguments);
    }
}