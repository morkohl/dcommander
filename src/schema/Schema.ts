import {Validator} from "../argument/schema/builder/validator/Validator";

export abstract class Schema {
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

