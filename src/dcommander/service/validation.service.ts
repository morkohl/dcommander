import {ValueRule} from "../validation/argumentValue/valueRule/validation.value.rules";
import {ValueType} from "../validation/argumentValue/valueType/validation.value.type";

interface ValidationInformationProvider {
    valueRules: ValueRule[],
    valueType: ValueType,
}

export class ValidationService {
    validateValues(values: string[], validationInformation: ValidationInformationProvider): void {
        const convertedValues: any[] = this.convertValues(values, validationInformation.valueType);

        let currentValue;

        for (let i = 0; i < convertedValues.length; i++) {
            currentValue = values[i];
            this.validateValue(currentValue, validationInformation.valueRules);
        }
    }

    validateValue(value: any, valueRules: ValueRule[]): void {
        for (let i = 0; i < valueRules.length; i++) {
            this.validateRule(valueRules[i], value)
        }
    }

    validateRule(valueRule: ValueRule, value: any): void {
        if(!valueRule.ruleFunction(value)) {
            this.throwValidationError(valueRule, value);
        }
    }

    private throwValidationError(currentRule: ValueRule, value: string): never {
        if (currentRule.errorFormatter instanceof Function) {
            throw new Error(currentRule.errorFormatter(value));
        } else {
            throw new Error(currentRule.errorFormatter);
        }
    }

    private convertValues(values: string[], type: ValueType): any[] {
        return type.convertValues(values);
    }
}