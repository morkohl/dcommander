import {ErrorFormatter} from "../validation/argumentValue/valueRule/validation.value.rules";

export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
    }

    static fromErrorFormatter(formatter: ErrorFormatter, failedValue: string): ValidationError {
        return new ValidationError(formatter instanceof Function ? formatter(failedValue) : formatter);
    }
}