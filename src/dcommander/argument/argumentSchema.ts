import {Types} from "./value/types";
import ValueType = Types.ValueType;
import {Matcher} from "../validation/matchers/matchers";

export interface ArgumentSchema {
    readonly isRequired: boolean;
    readonly argumentInfo: ArgumentInfo;
    readonly valueInfo: ValueInfo;
    readonly validationMatchers: Matcher[];
    readonly sanitization?: SanitizationFunction;
}

export interface OptionalArgumentSchema extends ArgumentSchema {
    readonly identifiers: string[];
    readonly allowDuplicates: boolean;
    readonly flag?: boolean;
}

interface ArgumentInfo {
    readonly name: string;
    readonly description?: string;
    readonly usage?: string;
}

export type SanitizationFunction = (value: any) => any;

export interface ValueInfo {
    readonly valueType: ValueType
    readonly argumentsLength: ArgumentsLength;
    readonly defaultValue?: any
}
export enum AMBIGUITIES {
    ALL_OR_DEFAULT = '?',
    AT_LEAST_ONE = '+'
}
export type ArgumentsLength = AMBIGUITIES | number;

