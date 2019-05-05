import {ParsedArgument} from "../service/parser/argumentParser";
import {Errors} from "../error/errors";
import {Matcher} from "./matchers/matchers";

export namespace ArgumentValidation {
    import ValidationError = Errors.ValidationError;

    export interface ValidationOptions {
        gatherAllValidationErrors: boolean,
        errorFormatSeparator: string
    }

    export const defaultValidationOptions: ValidationOptions = {
        gatherAllValidationErrors: false,
        errorFormatSeparator: '; '
    };

    export class ValidationResult {
        readonly errors: Errors.ValidationError[] = [];
        errorFormatSeparator: string;

        constructor(errorFormatSeparator: string) {
            this.errorFormatSeparator = errorFormatSeparator;
        }

        addError(error: Errors.ValidationError): ValidationResult {
            this.errors.push(error);
            return this;
        }

        hasErrors(): boolean {
            return !!this.errors.length;
        }

        throw(): never {
            if(this.hasErrors()) {
                throw new ValidationError(this.getMessage(), this.errors.map(error => error.failedValue))
            }
            throw new Error("No validation errors")
        }

        getMessage(): string {
            return this.errors.map(error => error.message).join(this.errorFormatSeparator);
        }
    }

    export function validate(parsedArguments: ParsedArgument[], validationOptions?: ValidationOptions): ValidationResult {
        if(validationOptions) {
            validationOptions.errorFormatSeparator = validationOptions.errorFormatSeparator ? validationOptions.errorFormatSeparator : defaultValidationOptions.errorFormatSeparator;
        } else {
            validationOptions = defaultValidationOptions;
        }

        return new ArgumentValidationService(validationOptions).validate(parsedArguments);
    }

    class ArgumentValidationService {
        private validationOptions: ValidationOptions;

        constructor(validationOptions: ValidationOptions) {
            this.validationOptions = validationOptions;
        }

        validate(parsedArguments: ParsedArgument[]): ValidationResult {
            parsedArguments = this.excludeSelectedFromValidation(parsedArguments);

            if (this.validationOptions.gatherAllValidationErrors) {
                return this.validateArgumentsCatchAllErrors(parsedArguments);
            } else {
                return this.validateArguments(parsedArguments);
            }
        }

        private excludeSelectedFromValidation(parsedArguments: ParsedArgument[]): ParsedArgument[] {
            return parsedArguments.filter(parsedArgument => !parsedArgument.excludeFromValidationAndSanitization);
        }

        private validateArgumentsCatchAllErrors(parsedArguments: ParsedArgument[]): ValidationResult {
            let validationResult = new ValidationResult(this.validationOptions.errorFormatSeparator);

            for (let parsedArgument of parsedArguments) {
                this.validateArgument(parsedArgument, validationError => validationResult.addError(validationError));
            }

            return validationResult;
        }

        private validateArguments(parsedArguments: ParsedArgument[]): ValidationResult {
            let validationResult = new ValidationResult(this.validationOptions.errorFormatSeparator);

            for (let parsedArgument of parsedArguments) {
                try {
                    this.validateArgument(parsedArgument);
                } catch (validationError) {
                    return validationResult.addError(validationError)
                }
            }
            return validationResult;
        }

        private validateArgument(parsedArgument: ParsedArgument, failHandler?: (error: Errors.ValidationError) => void): void | never {
            const matchers = parsedArgument.schema.validationMatchers;
            const values = parsedArgument.values;

            for (let value of values) {
                for (let matcher of matchers) {
                    try {
                        this.tryValidate(matcher, value)
                    } catch (validationError) {
                        if (failHandler) {
                            failHandler(validationError);
                        } else {
                            throw validationError;
                        }
                    }
                }
            }
        }

        private tryValidate(matcher: Matcher, value: any): void | never {
            if (!matcher.isMatching(value)) {
                throw new Errors.ValidationError(matcher.validationErrorMessage, value);
            }
        }
    }
}

