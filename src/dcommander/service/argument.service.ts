import {ArgumentSchema, OptionalArgumentSchema} from "../argument/argument.schema";
import {ArgumentsNamespace} from "../argument/argument";
import {ArgumentValidationService} from "../validation/validation.service";
import {ParsedArgument} from "./parser/argument.parser";

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