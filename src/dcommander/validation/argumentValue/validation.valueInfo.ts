import {ValueRule} from "./valueRule/validation.value.rules";
import {ValueType} from "./valueType/validation.value.type";

export interface ValueValidationInfo {
    valueType: ValueType,
    valueRules: ValueRule[]
}
