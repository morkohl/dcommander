import {ValueValidationInfo} from "../validation/argumentValue/validation.valueInfo";

export interface ArgumentSchema {
    readonly info: ArgumentInfo;
    readonly valueValidationInfo: ValueValidationInfo;
    readonly argumentsLength: ArgumentsLength;
    readonly defaultValue?: any;
}

export interface OptionalArgumentSchema extends ArgumentSchema {
    readonly identifiers: string[];
    readonly flag?: boolean
}

interface ArgumentInfo {
    readonly name: string;
    readonly description?: string;
    readonly usage?: string;
}

export enum ARGUMENTS_LENGTH {
    ALL_OR_DEFAULT = '?',
    AT_LEAST_ONE = '+'
}

export type ArgumentsLength = ARGUMENTS_LENGTH | number;