import {Errors} from "../error/errors";

export namespace Types {

    import ConversionError = Errors.ConversionError;

    export interface ValueType {
        is(value: string): boolean;

        convertValue(value: string): any;

        are(values: string[]): boolean;

        convertValues(values: string[]): any[];
    }

    abstract class ValueTypeImpl implements ValueType {
        abstract convertValue(value: string): any;

        convertValues(values: string[]): any {
            return values.map(this.convertValue)
        }

        is(value: string): boolean {
            try {
                this.convertValue(value);
                return true;
            } catch (error) {
                return false;
            }
        }

        are(values: string[]): boolean {
            return !!values.length ? true : this.is(values[0]) && this.are(values.splice(1, values.length));
        }
    }

    export class StringValueType extends ValueTypeImpl {
        is(value: string): boolean {
            return true;
        }

        convertValue(value: string): string {
            return value;
        }

        convertValues(values: string[]): string[] {
            return super.convertValues(values) as string[];
        }
    }

    export class NumberValueType extends ValueTypeImpl {
        is(value: string): boolean {
            return !isNaN(Number(value));
        }

        convertValue(value: string): number | never{
            const castResult = Number(value);
            if (isNaN(castResult)) {
                throw new Errors.ConversionError(`could not convert ${value} to a number`);
            }
            return castResult;
        }

        convertValues(values: string[]): number[] | never {
            return super.convertValues(values) as number[];
        }
    }

    export class BooleanValueType extends ValueTypeImpl {
        convertValue(value: string): boolean | never {
            if (BooleanValueType.equalsFalse(value)) {
                return false;
            }
            if (BooleanValueType.equalsTrue(value)) {
                return true;
            }
            throw new Errors.ConversionError(`could not convert ${value} to a boolean`);
        }

        convertValues(values: string[]): boolean[] | never {
            return super.convertValues(values) as boolean[];
        }

        static equalsFalse(value: string): boolean {
            return /(0|n|no|false)/ig.test(value);
        }

        static equalsTrue(value: string): boolean {
            return /(1|y|yes|true)/ig.test(value)
        }
    }

    export class ObjectValueType<S> extends ValueTypeImpl {
        readonly typeName: string;

        constructor(typeName?: string) {
            super();
            this.typeName = typeName ? typeName : "object";
        }

        convertValue(value: string): S | any | never {
            if(!value.startsWith("{") || !value.endsWith("}")) {
                this.throwError(value);
            }

            try {
                return JSON.parse(value) as S
            } catch(error) {
                this.throwError(value, error);
            }
        }

        private throwError(value: string, additionalError?: Error): ConversionError {
            throw new ConversionError(`could not convert ${value} to ${this.typeName}`, additionalError);
        }

        convertValues(values: string[]): S[] | any | never{
            return super.convertValues(values) as S[];
        }
    }

    export class DateValueType extends ValueTypeImpl {
        convertValue(value: string): Date | never {
            let date = new Date(value);
            let dateFromValueAsNumber = new Date(Number(value));
            if(!isNaN(date.getTime()) || !isNaN(dateFromValueAsNumber.getTime())) {
                return !isNaN(date.getTime()) ? date : dateFromValueAsNumber
            }
            throw new Errors.ConversionError(`${value} is an invalid date`);
        }
    }
}