import {Type} from "./type/BaseType";
import {Schema} from "../../schema/Schema";


export abstract class ArgumentSchema extends Schema {
    readonly required: boolean;
    sanitize: (value: any) => any;
    type: Type;
}

export class RequiredArgumentSchema extends ArgumentSchema {
    readonly required: boolean = true;
}

export class OptionalArgumentSchema extends ArgumentSchema {
    readonly required: boolean = false;
    aliases: string[];
    prefix: string;
    isFlag: boolean;

    static copyFromRequiredArgument(from: RequiredArgumentSchema): OptionalArgumentSchema {
        const optionalArgument = new OptionalArgumentSchema(from.name);
        optionalArgument.isFlag = false;
        optionalArgument.sanitize = from.sanitize;
        optionalArgument.type = from.type;
        optionalArgument.prefix = ARGUMENT_CONSTANTS.DEFAULT_PREFIX;
        optionalArgument.aliases = [ARGUMENT_CONSTANTS.DEFAULT_ALIAS_PREFIX + from.name[0]];
        return optionalArgument;
    }
}

export const ARGUMENT_CONSTANTS = {
    DEFAULT_PREFIX: '--',
    DEFAULT_ALIAS_PREFIX: '-',
};