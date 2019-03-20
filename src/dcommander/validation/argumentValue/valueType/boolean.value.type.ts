import {ValueTypeImpl} from "./validation.value.type";

export class BooleanValueType extends ValueTypeImpl {
    convertValue(value: string): boolean {
        if (BooleanValueType.equalsFalse(value)) {
            return false;
        }
        if (BooleanValueType.equalsTrue(value)) {
            return true;
        }
        throw new Error(`could not convert ${value} to boolean type`);
    }

    convertValues(values: string[]): boolean[] {
        return super.convertValues(values) as boolean[];
    }

    is(value: string): boolean {
        return BooleanValueType.equalsTrue(value) || BooleanValueType.equalsFalse(value);
    }

    static equalsFalse(value: string): boolean {
        return /(0|n|no|false)/ig.test(value);
    }

    static equalsTrue(value: string): boolean {
        return /(1|y|yes|true)/ig.test(value)
    }
}