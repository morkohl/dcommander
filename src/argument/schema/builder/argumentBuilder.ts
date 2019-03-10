import {ArgumentSchema, OptionalArgumentSchema} from "../argumentSchema";
import {Builder} from "../../../builder/builder";

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
            if(num < 0) {
                throw new Error(`${num} needs to be greater than zero.`);
            }
            this.buildObject.numArgs = num;

        }
        return this;
    }

    default(defaultValue: any): this {
        if(this.buildObject.numArgs.toString() !== NARGS.ALL_OR_DEFAULT) {
            throw new Error(`Cannot set default value for ${this.buildObject.name} since its number of arguments ${this.buildObject.numArgs} don\'t qualify.`)
        }
        this.buildObject.default = defaultValue;
        return this;
    }

    build(): ArgumentSchema {
        if(!this.buildObject.numArgs) {
            //set default values
            this.buildObject.numArgs = 1;
        }
        return super.build();
    }
}

export enum NARGS {
    ALL_OR_DEFAULT = '?',
    AT_LEAST_ONE = '+'
}