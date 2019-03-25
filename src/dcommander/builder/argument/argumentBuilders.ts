import {Builder} from "../builder";
import {ArgumentSchema, ArgumentsLength, OptionalArgumentSchema} from "../../argument/argument.schema";
import {Matcher} from "../../validation/matchers/matchers";
import {Types} from "../../argument/valueType/types";
import {MatcherBuilders} from "../validation/matcherBuilder";

export namespace ArgumentBuilders {
    import StringMatchersBuilder = MatcherBuilders.StringMatchersBuilder;
    import NumberMatchersBuilder = MatcherBuilders.NumberMatchersBuilder;
    import BooleanMatchersBuilder = MatcherBuilders.BooleanMatchersBuilder;
    import ObjectMatchersBuilder = MatcherBuilders.ObjectMatchersBuilder;
    import DateMatchersBuilder = MatcherBuilders.DateMatchersBuilder;

    namespace DefaultValues {
        export const defaultArgumentsLength = 1;
        export const defaultValueType = new Types.StringValueType();
        export const defaultOptions: OptionalArgumentOptions = {
            defaultIdentifierPrefix: '--',
            defaultIdentifierShortPrefix: '-'
        };
    }

    class ArgumentSchemaBuilder implements Builder {
        protected _name: string;
        protected _description: string;
        protected _usage: string;
        protected _valueType: Types.ValueType;
        protected _argumentsLength: ArgumentsLength;
        protected _defaultValue: any;
        protected _matchers: Matcher[] = [];

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

        string(buildFunction: (stringBuilder: StringMatchersBuilder) => StringMatchersBuilder): this {
            this._matchers = buildFunction(new StringMatchersBuilder()).build();
            this._valueType = new Types.StringValueType();
            return this;
        }

        number(buildFunction: (numberBuilder: NumberMatchersBuilder) => NumberMatchersBuilder): this {
            this._matchers = buildFunction(new NumberMatchersBuilder()).build();
            this._valueType = new Types.NumberValueType();
            return this;
        }

        boolean(buildFunction: (booleanBuilder: BooleanMatchersBuilder) => BooleanMatchersBuilder): this {
            this._matchers = buildFunction(new BooleanMatchersBuilder()).build();
            this._valueType = new Types.BooleanValueType();
            return this;
        }

        object(buildFunction: (objectBuilder: ObjectMatchersBuilder) => ObjectMatchersBuilder): this {
            this._matchers = buildFunction(new ObjectMatchersBuilder()).build();
            this._valueType = new Types.ObjectValueType();
            return this;
        }

        date(buildFunction: (dateBuilder: DateMatchersBuilder) => DateMatchersBuilder): this {
            this._matchers = buildFunction(new DateMatchersBuilder()).build();
            this._valueType = new Types.DateValueType();
            return this;
        }

        any(): this {
            return this.string(stringBuilder => stringBuilder);
        }

        build(): ArgumentSchema {
            return {
                argumentInfo: {
                    name: this._name,
                    description: this._description,
                    usage: this._usage
                },
                valueInfo: {
                    argumentsLength: this._argumentsLength || DefaultValues.defaultArgumentsLength,
                    valueType: this._valueType || DefaultValues.defaultValueType,
                    defaultValue: this._defaultValue
                },
                validationMatchers: this._matchers,
            }
        }
    }

    export interface OptionalArgumentOptions {
        readonly defaultIdentifierPrefix: string
        readonly defaultIdentifierShortPrefix: string
    }


    class OptionalArgumentSchemaBuilder extends ArgumentSchemaBuilder {
        private buildOptions: OptionalArgumentOptions;

        protected _identifiers: string[];
        protected _defaultValue: any;
        protected _flag: boolean;

        constructor(name: string, options?: OptionalArgumentOptions) {
            super(name);
            this.buildOptions = options || DefaultValues.defaultOptions;
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
                argumentInfo: {
                    name: this._name,
                    description: this._description,
                    usage: this._usage
                },
                valueInfo: {
                    valueType: this._valueType || DefaultValues.defaultValueType,
                    argumentsLength: this._argumentsLength || DefaultValues.defaultArgumentsLength,
                    defaultValue: this._defaultValue
                },
                validationMatchers: this._matchers,
                identifiers: this._identifiers || [(this.buildOptions.defaultIdentifierPrefix) + this._name, (this.buildOptions.defaultIdentifierShortPrefix) + this._name.charAt(0)],
                flag: this._flag
            }
        }
    }

    export function argumentSchema(name: string): ArgumentBuilder {
        return new ArgumentSchemaBuilder(name);
    }

    export function optionalArgumentSchema(name: string, options?: OptionalArgumentOptions): OptionalArgumentBuilder {
        return new OptionalArgumentSchemaBuilder(name, options);
    }

    export type ArgumentBuilder = ArgumentSchemaBuilder;
    export type OptionalArgumentBuilder = OptionalArgumentSchemaBuilder;
}