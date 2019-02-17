import {ArgumentSchema, OptionalArgumentSchema} from "../ArgumentSchema";
import {Builder} from "../../../builder/Builder";

export class SchemaBuilder extends Builder<ArgumentSchema> {
    constructor(schema: ArgumentSchema) {
        super(schema);
    }

    optional(): this {
        this.buildObject = OptionalArgumentSchema.copyFromRequiredArgument(this.buildObject)
        return this;
    }

    identifiers(identifiers: string[]): this {
        if (this.buildObject instanceof OptionalArgumentSchema) {
            if(identifiers.length === 0) {
                throw new Error("Has to be optional to set identifiers")
            }
            this.buildObject.identifiers = identifiers;
        }
        return this;
    }

    flag(): this {
        if (this.buildObject instanceof OptionalArgumentSchema) {
            this.buildObject.isFlag = true;
            return this;
        }
        throw new Error("Has to be optional in order to be a flag");
    }

    numberOfArguments(num: string | number): this {
        if(typeof num === 'string') {
            const placeHolders = Object.keys(NARGS).map(key => NARGS[key as any]);
            const index = placeHolders.indexOf(num);
            if(index >= 0) {
                this.buildObject.numArgs = placeHolders[index];
            } else {
                throw new Error(`Used an inexistant placeholder symbol: ${num}`)
            }
        }
        if(typeof num === 'number') {
            this.buildObject.numArgs = num;
        }
        return this;
    }

    build(): ArgumentSchema {
        return this.buildObject;
    }
}

export enum NARGS {
    AMBIGUOUS = '?',
    ALL_OR_ZERO = '*',
    ALL = '+'
}