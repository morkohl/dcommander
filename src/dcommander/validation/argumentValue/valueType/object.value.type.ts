import {ValueTypeImpl} from "./validation.value.type";

export class ObjectValueType<S> extends ValueTypeImpl {
    convertValue(value: string): S | any {
        return JSON.parse(value) as S;
    }

    convertValues(values: string[]): S[] | any {
        return super.convertValues(values) as S[];
    }

    is(value: string): boolean {
        try {
            this.convertValue(value);
            return true;
        } catch (e) {
            return false;
        }
    }
}