import {ArgumentSchema, OptionalArgumentSchema} from "../ArgumentSchema";
import {Builder} from "../../../builder/Builder";

export class ArgumentBuilder extends Builder<ArgumentSchema> {
    flag(): this {
        if (this.buildObject instanceof OptionalArgumentSchema) {
            this.buildObject.isFlag = true;
            return this;
        }
        throw new Error("Has to be optional in order to be a flag");
    }

    numberOfArguments(num: string | number): this {
        if (typeof num === 'string') {
            const placeHolders = Object.keys(NARGS).map(key => NARGS[key as any]);
            const index = placeHolders.indexOf(num);
            if (index >= 0) {
                this.buildObject.numArgs = placeHolders[index];
            } else {
                throw new Error(`Used an inexistant placeholder symbol: ${num}`)
            }
        }
        if (typeof num === 'number') {
            this.buildObject.numArgs = num;
        }
        return this;
    }
}

export enum NARGS {
    AMBIGUOUS = '?',
    ALL_OR_ZERO = '*',
    ALL = '+'
}