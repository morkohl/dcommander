import {Validator} from "./schemaBuilder/validator";

export class ArgumentSchema {
    name: string;
    prefix: string;
    required: boolean;
    sanitize: Function;
    validators: Validator[];

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
}

