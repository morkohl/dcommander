export type ValidationErrorMessageFormatter = (value: any) => string  | string;

export namespace Errors {
    function formatValidationErrorMessage(format: ValidationErrorMessageFormatter, failedValue: any): string {
        if(format instanceof Function) {
            return format(failedValue);
        }
        return format;
    }

    class FailedFromValueError extends Error {
        protected readonly failedValue: any;

        constructor(message: string, failedValue: any) {
            super(message);
            this.failedValue = failedValue;
        }
    }

    export class ValidationError extends FailedFromValueError {
        constructor(format: ValidationErrorMessageFormatter, failedValue: any) {
            super(formatValidationErrorMessage(format, failedValue), failedValue);
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