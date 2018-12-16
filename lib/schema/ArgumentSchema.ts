import {Validator} from "./schemaBuilder/validator";
import {Parseable} from "../parse/Parser";
import {Message} from "discord.js";
import {Type} from "./schemaBuilder/typeBuilder/type/baseType";

export class ArgumentSchema implements Parseable {
    name: string;
    prefix: string;
    required: boolean;
    sanitize: Function;
    validators: Validator[];
    type: Type;

    constructor(argumentName :string) {
        this.name = argumentName;
        this.validators = [];
    }

    addValidator(validator: Validator) {
        if(this.validatorsInclude(validator.isAcceptable)) {
            throw new Error(`${validator.isAcceptable.name} cannot be included into validators twice`);
        }
        this.validators.push(validator);
    }

    private validatorsInclude(fn: Function) {
        for(let validator of this.validators) {
            if(!!fn.name && validator.isAcceptable.name === fn.name || validator.isAcceptable.toString() === fn.toString()) {
                return true;
            }
        }
        return false;
    }

    matches(message: Message): boolean {
        return message.content.trim().split(' ').indexOf(this.prefix + this.name) > 0;
    }

    //return argument impl class
    parse(contents: String[]): any {
        return undefined;
    }
}

