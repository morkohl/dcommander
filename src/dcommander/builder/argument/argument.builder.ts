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
        protected _defaultValue: any;


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

        default(defaultValue: any): this {
            this._defaultValue = defaultValue;
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
                defaultValue: this._defaultValue,
                valueValidationInfo: this._valueValidation || defaultValueValidationInfo,
                argumentsLength: this._argumentsLength || defaultArgumentsLength
            }
        }
    }

    const defaultValueValidationInfo = new StringValueValidationInfoBuilder().build();
    const defaultArgumentsLength = 1;

    const defaultOptions: OptionalArgumentOptions = {
        defaultIdentifierPrefix: '--',
        defaultIdentifierShortPrefix: '-'
    };

    export class OptionalArgumentSchemaBuilder extends ArgumentSchemaBuilder {
        private buildOptions: OptionalArgumentOptions;

        protected _identifiers: string[];
        protected _defaultValue: any;
        protected _flag: boolean;

        constructor(name: string, options?: OptionalArgumentOptions) {
            super(name);
            this.buildOptions = options || defaultOptions;
        }

        identifiers(identifiers: string[]): this {
            this._identifiers = identifiers;
            return this;
        }

        default(defaultValue: any): this {
            this._defaultValue = defaultValue;
            return this;
        }

        flag(flagValue?: boolean): this {
            this._flag = flagValue !== undefined ? flagValue : true;
            return this;
        }

        build(): OptionalArgumentSchema {
            return {
                info: {
                    name: this._name,
                    description: this._description,
                    usage: this._usage
                },
                valueValidationInfo: this._valueValidation || defaultValueValidationInfo,
                argumentsLength: this._argumentsLength || defaultArgumentsLength,
                identifiers: this._identifiers || [(this.buildOptions.defaultIdentifierPrefix) + this._name, (this.buildOptions.defaultIdentifierShortPrefix) + this._name.charAt(0)],
                defaultValue: this._defaultValue,
                flag: this._flag,
            }
        }
    }

    interface OptionalArgumentOptions {
        readonly defaultIdentifierPrefix: string
        readonly defaultIdentifierShortPrefix: string
    }

    export function optionalArgumentSchema(name: string, options?: OptionalArgumentOptions) {
        return new OptionalArgumentSchemaBuilder(name, options);
    }

    export function argumentSchema(name: string): ArgumentSchemaBuilder {
        return new ArgumentSchemaBuilder(name);
    }

}
