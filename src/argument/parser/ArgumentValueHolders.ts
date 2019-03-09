import {ArgumentSchema, OptionalArgumentSchema, RequiredArgumentSchema} from "../schema/ArgumentSchema";
import {ArgumentValueHolder, OptionalArgumentValueHolder, RequiredArgumentValueHolder} from "./ArgumentValueHolder";

export abstract class ArgumentValueHolders<S extends ArgumentSchema, VH extends ArgumentValueHolder<S>> {
    argumentSchemaValueHolders: VH[] = [];

    add(valueHolder: VH): void {
        this.argumentSchemaValueHolders = this.argumentSchemaValueHolders.concat([valueHolder]);
    }

    updateValueHolderValues(valueHolder: VH, value: string): VH {
        const index = this.argumentSchemaValueHolders.indexOf(valueHolder);
        if(index < 0) {
            throw new Error("Value Holder does not exist in the collection.")
        }
        this.argumentSchemaValueHolders[index].addValue(value);
        return this.argumentSchemaValueHolders[index];
    }
}

export class RequiredArgumentValueHolders extends ArgumentValueHolders<RequiredArgumentSchema, RequiredArgumentValueHolder> {
}

export class OptionalArgumentValueHolders extends ArgumentValueHolders<OptionalArgumentSchema, OptionalArgumentValueHolder> {
}
