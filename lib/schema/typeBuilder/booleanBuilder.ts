import {BooleanType} from "./type/boolean";
import {Argument} from "../argument";
import {TypeBuilder} from "./baseBuilder";

export class BooleanArgumentBuilder extends TypeBuilder {
    constructor(argument: Argument) {
        super(argument, new BooleanType());
    }

    condition(fn: (value: any) => boolean, errFormatter?: (value: any) => string | string): BooleanArgumentBuilder {
        this.addValidator({ isAcceptable: fn, errFormatter: errFormatter });
        return this;
    }
}