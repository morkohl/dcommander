import {Type} from "./BaseType";

export class BooleanType implements Type {
    transform(value: any): boolean {
        return this.isTrue(value);
    }

    is(value: any): boolean {
        return this.isTrue(value) || this.isFalse(value);
    }

    private isTrue(value: any): boolean {
        return /^(true|1|y|yes)/i.test(value.toString());
    }

    private isFalse(value: any): boolean {
        return /^(false|0|n|no)/i.test(value.toString());
    }
}
