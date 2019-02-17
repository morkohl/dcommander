import {Type} from "./type/BaseType";
import {Schema} from "../../schema/Schema";


export abstract class ArgumentSchema extends Schema {
    readonly required: boolean;
    sanitize: (value: any) => any;
    type: Type;
    numArgs: string | number;
}

export class RequiredArgumentSchema extends ArgumentSchema {
    readonly required: boolean = true;
}

export class OptionalArgumentSchema extends ArgumentSchema {
    readonly required: boolean = false;
    identifiers: string[];
    isFlag: boolean;


    constructor(argumentName: string, identifiers: string[]) {
        super(argumentName);
        this.identifiers = identifiers;
    }
}