export type ValidationErrorMessageFormatter = (value: any) => string  | string;

export namespace Errors {
    function formatValidationErrorMessage(format: ValidationErrorMessageFormatter, failedValue: any): string {
        if(format instanceof Function) {
            return format(failedValue);
        }
        return format;
    }

    class DCommanderError extends Error {
        constructor(message: string) {
            super(message);
            Object.setPrototypeOf(this, new.target.prototype)
        }
    }

    class FailedFromValueError extends DCommanderError {
        readonly failedValue: any;

        constructor(message: string, failedValue: any) {
            super(message);
            this.failedValue = failedValue;
        }
    }

    export class ParseError extends DCommanderError {}

    export class ValidationError extends FailedFromValueError {
        constructor(format: ValidationErrorMessageFormatter | string, failedValue: any) {
            super(typeof format === "function" ? formatValidationErrorMessage(format, failedValue) : format, failedValue);
        }
    }

    export class ConversionError extends FailedFromValueError {
        readonly additionalError: Error | undefined;

        constructor(message: string, failedValue: any, additionalError?: Error) {
            super(message, failedValue);
            this.additionalError = additionalError;
        }
    }
}