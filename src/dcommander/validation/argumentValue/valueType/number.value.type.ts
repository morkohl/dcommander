import {ValueTypeImpl} from "./validation.value.type";

export class NumberValueType extends ValueTypeImpl {
    convertValue(value: string): number {
        const castResult = Number(value);
        if(isNaN(castResult)) {
            throw new Error(`${value} is not a number.`)
        }
        return castResult;
    }

    convertValues(values: string[]): number[] {
        return super.convertValues(values) as number[];
    }

    is(value: string): boolean {
        return !isNaN(this.convertValue(value));

    }
}