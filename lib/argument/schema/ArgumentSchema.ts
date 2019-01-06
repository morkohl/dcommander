import {Type} from "./type/BaseType";
import {PrefixSchema} from "../../schema/Schema";

export class ArgumentSchema extends PrefixSchema {
    required: boolean;
    sanitize: (value: any) => any;
    type: Type;
    aliases: string[];

    constructor(argumentName: string) {
        super(argumentName);
        this.required = true;
        this.aliases = [];
        }
}

export const ARGUMENT_CONSTANTS = {
    DEFAULT_PREFIX: '--',
    DEFAULT_ALIAS: '-',
};