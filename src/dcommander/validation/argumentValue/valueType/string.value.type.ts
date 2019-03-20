import {ValueTypeImpl} from "./validation.value.type";

export class StringValueType extends ValueTypeImpl {
    convertValue(value: string): string {
        return value;
    }

    convertValues(values: string[]): string[] {
        return super.convertValues(values) as string[];
    }

    is(value: string): boolean {
        return true;
    }
}