import {Type} from "./type";

export class NumberType implements Type {
    transform(value: any): number {
        return Number(value.toString());
    }

    is(value: any): boolean {
        return /^\d+$/.test(value.toString());
    }
}