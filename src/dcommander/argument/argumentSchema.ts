import {Types} from "./value/types";
import ValueType = Types.ValueType;
import {Matcher} from "../validation/matchers/matchers";

export interface ArgumentSchema {
    readonly isRequired: boolean;
    readonly argumentInfo: ArgumentInfo;
    readonly valueInfo: ValueInfo;
    readonly validationMatchers: Matcher[];
}

export interface OptionalArgumentSchema extends ArgumentSchema {
    readonly identifiers: string[];
    readonly flag?: boolean;
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

export interface ValueInfo {
    readonly valueType: ValueType
    readonly argumentsLength: ArgumentsLength;
    readonly defaultValue?: any
}