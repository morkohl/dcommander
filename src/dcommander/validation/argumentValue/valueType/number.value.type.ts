import {ValueTypeImpl} from "./validation.value.type";

export class NumberValueType extends ValueTypeImpl {
    convertValue(value: string): number {
        return Number(value);
    }

    convertValues(values: string[]): number[] {
        return super.convertValues(values) as number[];
    }

    is(value: string): boolean {
        return !isNaN(this.convertValue(value));

    }
}