import {ARGUMENT_CONSTANTS, ArgumentSchema} from "../ArgumentSchema";
import {Builder} from "../../../builder/Builder";

export class SchemaBuilder implements Builder<ArgumentSchema> {
    __schema: ArgumentSchema;

    constructor(schema: ArgumentSchema) {
        this.__schema = schema;
    }

    optional(): this {
        this.__schema.required = false;
        return this;
    }

    prefix(prefix?: string): this {
        if (prefix) {
            if (prefix.length === 0) {
                throw new Error("Prefix cannot be an empty string")
            }
            if (prefix.includes(' ')) {
                throw new Error("Prefix cannot include a whitespace")
            }
        }
        this.__schema.prefix = prefix ? prefix : ARGUMENT_CONSTANTS.DEFAULT_PREFIX;
        return this;
    }

    alias(alias?: string | string[]): this {
        if (alias) {
            if (typeof alias === 'string') {
                this.__schema.aliases.push(alias);
                return this;
            }
            this.__schema.aliases = alias;
            return this;
        }
        if(this.__schema.aliases.length === 0 || this.__schema.aliases.indexOf(ARGUMENT_CONSTANTS.DEFAULT_ALIAS) < 0) {
            this.__schema.aliases.push(ARGUMENT_CONSTANTS.DEFAULT_ALIAS);
        }
        return this;
    }

    __build(): ArgumentSchema {
        if (!this.__schema.prefix) {
            this.__schema.prefix = ARGUMENT_CONSTANTS.DEFAULT_PREFIX;
        }
        if(this.__schema.aliases.length === 0) {
            this.__schema.aliases.push(ARGUMENT_CONSTANTS.DEFAULT_ALIAS + this.__schema.name.charAt(0))
        }
        return this.__schema;
    }
}
