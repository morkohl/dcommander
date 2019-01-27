import {ArgumentSchema, OptionalArgumentSchema} from "../ArgumentSchema";
import {Builder} from "../../../builder/Builder";

export class SchemaBuilder extends Builder<ArgumentSchema> {
    constructor(schema: ArgumentSchema) {
        super(schema);
    }

    optional(): this {
        this.buildObject = OptionalArgumentSchema.copyFromRequiredArgument(this.buildObject);
        return this;
    }

    prefix(prefix: string): this {
        if (this.buildObject instanceof OptionalArgumentSchema) {
            if (prefix.length === 0) {
                throw new Error("Prefix cannot be an empty string");
            }
            if (prefix.includes(' ')) {
                throw new Error("Prefix cannot include a whitespace");
            }
            return this;
        }
        throw new Error("Has to be optional in order to set prefix");
    }

    flag(): this {
        if (this.buildObject instanceof OptionalArgumentSchema) {
            this.buildObject.isFlag = true;
            return this;
        }
        throw new Error("Has to be optional in order to be a flag");
    }

    alias(alias: string | string[]): this {
        if (this.buildObject instanceof OptionalArgumentSchema) {
            if (typeof alias === 'string') {
                this.buildObject.aliases.push(alias);
                return this;
            }
            this.buildObject.aliases = alias;
            return this;
        }
        throw new Error("Has to be optional in order to set alias");
    }

    build(): ArgumentSchema {
        return this.buildObject;
    }
}
