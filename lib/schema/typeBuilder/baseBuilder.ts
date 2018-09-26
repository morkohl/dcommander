import {ArgumentBuilder} from "../argumentBuilder";
import {Validator} from "../validator";
import {Argument} from "../argument";
import {Type} from "./type/baseType";

export class TypeBuilder extends ArgumentBuilder {
    validators: Validator[];
    protected type: Type;

    constructor(argument: Argument, type: Type) {
        super(argument);
        this.type = type;
        this.validators = [];
        this.validators.push({ isAcceptable: this.type.is });
    }

    protected addValidator(validator: Validator) {
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
