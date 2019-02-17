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

    static copyFromRequiredArgument(from: RequiredArgumentSchema): OptionalArgumentSchema {
        const optionalArgument = new OptionalArgumentSchema(from.name);
        optionalArgument.isFlag = false;
        optionalArgument.sanitize = from.sanitize;
        optionalArgument.type = from.type;
        optionalArgument.numArgs = from.numArgs;
        return optionalArgument;
    }
}