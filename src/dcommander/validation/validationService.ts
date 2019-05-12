import {ParsedArgument} from "../service/parser/argumentParser";
import {Errors} from "../error/errors";
import {Matcher} from "./matchers/matchers";
import {ArgumentSchema} from "../argument/argumentSchema";

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

    export function validateParsedArguments(parsedArguments: ParsedArgument[], validationOptions?: ValidationOptions): ValidationResult {
        return new ArgumentValidationService(validationOptions).validateParsedArguments(parsedArguments);
    }

    export function validate(schema: ArgumentSchema, values: any) {
        return new ArgumentValidationService().validate(schema, values);
    }

    class ArgumentValidationService {
        private validationOptions: ValidationOptions;

        constructor(validationOptions?: ValidationOptions) {
            if(validationOptions) {
                validationOptions.errorFormatSeparator = validationOptions.errorFormatSeparator ? validationOptions.errorFormatSeparator : defaultValidationOptions.errorFormatSeparator;
                this.validationOptions = validationOptions;
            } else {
                this.validationOptions = defaultValidationOptions;
            }
        }

        validate(schema: ArgumentSchema, values: any) {
            return this.validateArgument(schema, values);
        }

        validateParsedArguments(parsedArguments: ParsedArgument[]): ValidationResult {
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
                this.validateArgument(parsedArgument.schema, parsedArgument.values, validationError => validationResult.addError(validationError));
            }

            return validationResult;
        }

        private validateArguments(parsedArguments: ParsedArgument[]): ValidationResult {
            let validationResult = new ValidationResult(this.validationOptions.errorFormatSeparator);

            for (let parsedArgument of parsedArguments) {
                try {
                    this.validateArgument(parsedArgument.schema, parsedArgument.values);
                } catch (validationError) {
                    return validationResult.addError(validationError)
                }
            }
            return validationResult;
        }

        private validateArgument(schema: ArgumentSchema, values: any, failHandler?: (error: Errors.ValidationError) => void): void | never {
            const matchers = schema.validationMatchers;

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

