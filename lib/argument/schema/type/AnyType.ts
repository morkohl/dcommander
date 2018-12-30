import {Type} from "./BaseType";

export class AnyType implements Type {
    is(value: any): boolean {
        return true;
    }

    transform(value: any): any {
        return value;
    }
}