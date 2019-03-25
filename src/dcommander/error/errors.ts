export namespace Errors {
    export type ValidationErrorMessageFormatter = (value: any) => string  | string;

    function formatValidationErrorMessage(format: ValidationErrorMessageFormatter, failedValue: string): string {
        if(format instanceof Function) {
            return format(failedValue);
        }
        return format;
    }

    export class ValidationError extends Error {
        constructor(format: ValidationErrorMessageFormatter, failedValue: any) {
            super(formatValidationErrorMessage(format, failedValue));
        }
    }

    export class ConversionError extends Error {
        readonly additionalError: Error | undefined;

        constructor(message: string, additionalError?: Error) {
            super(message);
            this.additionalError = additionalError;
        }
    }
}