import {Type} from "./type";

export class StringType implements Type {
    transform(value: any): string {
        return value.toString();
    }

    is(value: any): boolean {
        return typeof value === 'string';
    }
}