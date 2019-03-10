import {ArgumentSchema, OptionalArgumentSchema, RequiredArgumentSchema} from "../schema/argumentSchema";
import {ArgumentValueHolder, OptionalArgumentValueHolder, RequiredArgumentValueHolder} from "./argumentValueHolder";
import {Schema} from "../../schema/schema";

export abstract class ValueHolder<S extends Schema> {

}

export abstract class ArgumentValueHolders<VH extends ArgumentValueHolder<ArgumentSchema>> extends ValueHolder<ArgumentSchema> {
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

export class RequiredArgumentValueHolders extends ArgumentValueHolders<RequiredArgumentValueHolder> {
}

export class OptionalArgumentValueHolders extends ArgumentValueHolders<OptionalArgumentValueHolder> {
}
