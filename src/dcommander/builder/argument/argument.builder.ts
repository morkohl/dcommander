import {Builder} from "../builder";
import {ArgumentSchema, ArgumentsLength, OptionalArgumentSchema} from "../../argument/argument.schema";
import {ValueValidationInfo} from "../../validation/argumentValue/validation.valueInfo";
import {
    BooleanValueValidationInfoBuilder,
    NumberValueValidationInfoBuilder,
    ObjectValueValidationInfoBuilder,
    StringValueValidationInfoBuilder,
    ValueInfoBuilder
} from "../validation/validation.valueInfo.builder";

export namespace ArgumentBuilder {
    export class ArgumentSchemaBuilder implements Builder {
        protected _name: string;
        protected _description: string;
        protected _usage: string;
        protected _valueValidation: ValueValidationInfo;
        protected _argumentsLength: ArgumentsLength;


        constructor(name: string) {
            this._name = name;
        }

        description(description: string): this {
            this._description = description;
            return this;
        }

        usage(usage: string): this {
            this._usage = usage;
            return this;
        }

        argumentsLength(argumentsLength: ArgumentsLength) {
            this._argumentsLength = argumentsLength;
            return this;
        }

        valueRules<VIB extends ValueInfoBuilder>(buildFunction: (typeBuilder: VIB) => VIB): this {
            this._valueValidation = buildFunction(new ValueInfoBuilder() as VIB).build();
            return this;
        }

        string(buildFunction: (stringBuilder: StringValueValidationInfoBuilder) => StringValueValidationInfoBuilder): this {
            this._valueValidation = buildFunction(new StringValueValidationInfoBuilder()).build();
            return this;
        }

        number(buildFunction: (numberBuilder: NumberValueValidationInfoBuilder) => NumberValueValidationInfoBuilder): this {
            this._valueValidation = buildFunction(new NumberValueValidationInfoBuilder()).build();
            return this;
        }

        boolean(buildFunction: (booleanBuilder: BooleanValueValidationInfoBuilder) => BooleanValueValidationInfoBuilder): this {
            this._valueValidation = buildFunction(new BooleanValueValidationInfoBuilder()).build();
            return this;
        }

        object(buildFunction: (objectBuilder: ObjectValueValidationInfoBuilder) => ObjectValueValidationInfoBuilder): this {
            this._valueValidation = buildFunction(new ObjectValueValidationInfoBuilder()).build();
            return this;
        }

        any(): this {
            return this.string(stringBuilder => stringBuilder);
        }

        build(): ArgumentSchema {
            return {
                info: {
                    name: this._name,
                    description: this._description,
                    usage: this._usage
                },
                valueValidationInfo: this._valueValidation || defaultValueValidationInfo,
                argumentsLength: this._argumentsLength || defaultArgumentsLength
            }
        }
    }

    const defaultValueValidationInfo = new StringValueValidationInfoBuilder().build();
    const defaultArgumentsLength = 0;

    const defaultOptions: OptionalArgumentOptions = {
        defaultIdentifierPrefix: '--',
        defaultIdentifierShortPrefix: '-'
    };

    class OptionalArgumentSchemaBuilder extends ArgumentSchemaBuilder {
        protected _identifiers: string[];
        protected _defaultValue: any;
        protected _flag: boolean;

        constructor(name: string, identifiers?: string[], options?: OptionalArgumentOptions) {
            super(name);
            options = options || defaultOptions;
            this._identifiers = identifiers || [(options.defaultIdentifierPrefix) + name, (options.defaultIdentifierShortPrefix) + name.charAt(0)];
        }

        default(defaultValue: any): this {
            this._defaultValue = defaultValue;
            return this;
        }

        flag(flagValue: boolean): this {
            this._flag = flagValue;
            return this;
        }

        build(): OptionalArgumentSchema {
            return {
                info: {
                    name: this._name,
                    description: this._description || undefined,
                    usage: this._usage || undefined
                },
                valueValidationInfo: this._valueValidation,
                argumentsLength: this._argumentsLength,
                identifiers: this._identifiers,
                defaultValue: this._defaultValue,
                flag: this._flag,
            }
        }
    }

    interface OptionalArgumentOptions {
        readonly defaultIdentifierPrefix?: string
        readonly defaultIdentifierShortPrefix?: string
    }

    export function optionalArgumentSchema(name: string, identifiers?: string[], options?: OptionalArgumentOptions) {
        return new OptionalArgumentSchemaBuilder(name, identifiers, options);
    }

    export function argument(name: string): ArgumentSchemaBuilder {
        return new ArgumentSchemaBuilder(name);
    }

}
