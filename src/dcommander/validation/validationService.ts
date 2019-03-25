import {ParsedArgument} from "../service/parser/argumentParser";
import {Errors} from "../error/errors";
import {Matcher} from "./matchers/matchers";

export interface ValidationOptions {
    gatherAllValidationErrors: boolean,
    errorFormatSeparator?: string
}

const defaultValidationOptions: ValidationOptions = {
    gatherAllValidationErrors: false,
    errorFormatSeparator: '; '
};


export class ArgumentValidationService {
    private validationOptions: ValidationOptions;

    constructor(validationOptions?: ValidationOptions) {
        this.validationOptions = validationOptions || defaultValidationOptions;
        this.validationOptions.errorFormatSeparator = this.validationOptions.errorFormatSeparator || defaultValidationOptions.errorFormatSeparator;
    }

    validate(parsedArguments: ParsedArgument[]): void | never {
        parsedArguments = this.excludeSelectedFromValidation(parsedArguments);

        if(this.validationOptions.gatherAllValidationErrors) {
            this.validateArgumentsCatchAllErrors(parsedArguments);
        } else {
            this.validateArguments(parsedArguments);
        }
    }

    private excludeSelectedFromValidation(parsedArguments: ParsedArgument[]): ParsedArgument[] {
        return parsedArguments.filter(parsedArgument => parsedArgument.excludeValidation);
    }

    private validateArgumentsCatchAllErrors(parsedArguments: ParsedArgument[]): void | never {
        const errors: Errors.ValidationError[] = [];

        for (let i = 0; i < parsedArguments.length; i++) {
            this.validateArgument(parsedArguments[i], error => errors.push(error));
        }

        if(errors.length !== 0) {
            const concatenatedErrorMessage: string = errors.map(error => error.message).join(this.validationOptions.errorFormatSeparator);
            throw new Errors.ValidationError(concatenatedErrorMessage);
        }

        return;
    }

    private validateArguments(parsedArguments: ParsedArgument[]): void | never {
        for (let i = 0; i < parsedArguments.length; i++) {
            this.validateArgument(parsedArguments[i]);
        }
    }

    private validateArgument(parsedArgument: ParsedArgument, failHandler?: (error: Errors.ValidationError) => void): void | never {
        const matchers = parsedArgument.schema.validationMatchers;
        const values = parsedArgument.values;

        let value;
        let matcher: Matcher;

        for (let i = 0; i < values.length; i++) {
            value = values[i];

            for (let j = 0; j < matchers.length; j++) {
                matcher = matchers[j];

                try {
                    this.tryValidate(matcher, value)
                } catch(e) {
                    if(failHandler) {
                        failHandler(e);
                    } else {
                        throw e;
                    }
                }
            }
        }
    }

    private tryValidate(matcher: Matcher, value: any): void | never {
        if(!matcher.isMatching(value)) {
            throw new Errors.ValidationError(Errors.formatValidationErrorMessage(matcher.validationErrorMessage, value));
        }
    }
}