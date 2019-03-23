import {ValueRule} from "./argumentValue/valueRule/validation.value.rules";
import {ParsedArgument} from "../service/parser/argument.parser";
import {ValidationError} from "../error/validation.error";

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
        const errors: ValidationError[] = [];

        for (let i = 0; i < parsedArguments.length; i++) {
            this.validateArgument(parsedArguments[i], error => errors.push(error));
        }

        if(errors.length !== 0) {
            const concatenatedErrorMessage: string = errors.map(error => error.message).join(this.validationOptions.errorFormatSeparator);
            throw new ValidationError(concatenatedErrorMessage);
        }

        return;
    }

    private validateArguments(parsedArguments: ParsedArgument[]): void | never {
        for (let i = 0; i < parsedArguments.length; i++) {
            this.validateArgument(parsedArguments[i]);
        }
    }

    private validateArgument(parsedArgument: ParsedArgument, failHandler?: (error: ValidationError) => void): void | never {
        const rules = parsedArgument.schema.valueValidationInfo.valueRules;
        const values = parsedArgument.values;

        let value;
        let rule: ValueRule;

        for (let i = 0; i < values.length; i++) {
            value = values[i];

            for (let j = 0; j < rules.length; j++) {
                rule = rules[j];

                try {
                    this.tryValidate(rule, value)
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

    private tryValidate(rule: ValueRule, value: any): void | never {
        if(!rule.ruleFunction(value)) {
            throw ValidationError.fromErrorFormatter(rule.errorFormatter, value);
        }
    }
}