import {Type} from "./type/BaseType";
import {Validator} from "./builder/validator/Validator";

export class Schema {
    name: string;
    validators: Validator[];

    constructor(argumentName: string) {
        this.name = argumentName;
        this.validators = [];
    }

    addValidator(validator: Validator) {
        if (this.validatorsInclude(validator.isAcceptable)) {
            throw new Error(`${validator.isAcceptable.name} cannot be included into validators more than once.`);
        }
        this.validators.push(validator);
    }

    protected validatorsInclude(fn: Function) {
        for (let validator of this.validators) {
            if (!!fn.name && validator.isAcceptable.name === fn.name || validator.isAcceptable.toString() === fn.toString()) {
                return true;
            }
        }
        return false;
    }
}

export class ArgumentSchema extends Schema {
    required: boolean;
    sanitize: Function;
    type: Type;
    prefix: string;
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