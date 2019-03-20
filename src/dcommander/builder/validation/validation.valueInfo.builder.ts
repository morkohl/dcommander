import {ErrorFormatter, RuleFunction, ValueRule} from "../../validation/argumentValue/valueRule/validation.value.rules";
import {Builder} from "../builder";
import {ValueValidationInfo} from "../../validation/argumentValue/validation.valueInfo";
import {ValueType} from "../../validation/argumentValue/valueType/validation.value.type";
import {StringValueType} from "../../validation/argumentValue/valueType/string.value.type";
import {NumberValueType} from "../../validation/argumentValue/valueType/number.value.type";
import {ObjectValueType} from "../../validation/argumentValue/valueType/object.value.type";
import {BooleanValueType} from "../../validation/argumentValue/valueType/boolean.value.type";

export class ValueInfoBuilder implements Builder {
    protected _valueRules: ValueRule[] = [];
    protected _valueType: ValueType;

    protected fullfillRule(rule: ValueRule): this {
        this._valueRules.push(rule);
        return this;
    }

    protected fulfill(ruleFunction: RuleFunction, errorFormatter?: ErrorFormatter): this {
        return this.fullfillRule({
            ruleFunction: ruleFunction,
            errorFormatter: errorFormatter
        });
    }

    protected buildWithType(valueType: ValueType) {
        return {
            valueType: valueType,
            valueRules: this._valueRules
        }
    }

    build(): ValueValidationInfo {
        throw new Error("No type supplied.")
    }
}


export class StringValueValidationInfoBuilder extends ValueInfoBuilder {
    regex(regex: RegExp, errorString?: ErrorFormatter): this {
        return this.fulfill(
            regex.test,
            errorString ? errorString : (value: any) => `${value} does not pass regex test ${regex.toString()}`
        )
    }

    url(): this {
        return this.regex(urlRegex, (value: string) => `${value} is not a valid URL`)
    }

    ip(ipProtocolVersion: IPProtocolVersion | string): this {
        if (ipProtocolVersion === IPProtocolVersion.IPV4) {
            return this.regex(ipv4Regex, (value: string) => `${value} is not an ipv4 address.`);
        } else if (ipProtocolVersion === IPProtocolVersion.IPV6) {
            return this.regex(ipv6Regex, (value: string) => `${value} is not an ipv6 address.`);
        } else {
            throw new Error("Unknown ip version");
        }
    }

    email(): this {
        return this.regex(emailRegex, (value: string) => `${value} is not a valid URL`);
    }

    build(): ValueValidationInfo {
        return this.buildWithType(new StringValueType());
    }
}

export enum IPProtocolVersion {
    IPV6 = "ipv4",
    IPV4 = "ipv6",
}

const urlRegex: RegExp = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;
const ipv4Regex: RegExp = /^(?:[\d]{1,3}\.){3}\d{1,3}$/;
const ipv6Regex: RegExp = /^(?:[A-F0-9]{1,4}:){7}[A-F0-9]{1,4}$/;
const emailRegex: RegExp = /\S+@\S+\.\S+/;

export class NumberValueValidationInfoBuilder extends ValueInfoBuilder {
    min(min: number): this {
        const greaterThanMinimum = (value: number) => value > min;
        return this.fulfill(greaterThanMinimum, (value: any) => `${value} is not greater than ${min}`);
    }

    max(max: number): this {
        const lessThanMaximum = (value: number) => value < max;
        return this.fulfill(lessThanMaximum, (value: any) => `${value} is not greater than ${max}`);
    }

    range(min: number, max: number): this {
        const inRange = (value: number) => value > min && value < max;
        return this.fulfill(inRange, (value: any) => `${value} is not in range of ${min} and ${max}`);
    }

    condition(condition: (value: number) => boolean, errorFormatter?: ErrorFormatter): this {
        return this.fulfill(condition, errorFormatter);
    }

    build(): ValueValidationInfo {
        return this.buildWithType(new NumberValueType());
    }
}

export class BooleanValueValidationInfoBuilder extends ValueInfoBuilder {
    true(): this {
        return this.fulfill((value: boolean) => value, (value: any) => `${value} is not true`);
    }

    false(): this {
        return this.fulfill((value: boolean) => value, (value: any) => `${value} is not false`);
    }

    condition(condition: (value: number) => boolean, errorFormatter?: ErrorFormatter): this {
        return this.fulfill(condition, errorFormatter);
    }

    build(): ValueValidationInfo {
        return this.buildWithType(new BooleanValueType());
    }
}


export class ObjectValueValidationInfoBuilder extends ValueInfoBuilder {
    includeProperty(propertyName: string): this {
        const includeProperty = (value: Object) => value.hasOwnProperty(propertyName);
        return this.fulfill(includeProperty, (value: Object) => `${value} does not include property ${propertyName}`)
    }

    build(): ValueValidationInfo {
        return this.buildWithType(new ObjectValueType())
    }
}