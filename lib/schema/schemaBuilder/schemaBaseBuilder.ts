import {ArgumentSchema} from "../schema";
import {StringSchemaBuilder} from "./typeBuilder/stringBuilder";
import {NumberSchemaBuilder} from "./typeBuilder/numberBuilder";
import {BooleanSchemaBuilder} from "./typeBuilder/booleanBuilder";
import {AnySchemaBuilder} from "./typeBuilder/anyBuilder";

export class SchemaBuilder {
    __schema: ArgumentSchema;

    constructor(argumentName: string) {
        this.__schema = new ArgumentSchema(argumentName);
    }

    prefix(prefix?: string): this {
        if (this.__schema.prefix) {
            throw new Error("ArgumentSchema already has a set prefix");
        }
        prefix = prefix ? prefix : (this.__schema.name.length <= 2 ? '-' : '--');
        this.__schema.prefix = prefix;
        return this;
    }

    string(): StringSchemaBuilder {
        return new StringSchemaBuilder(this.__schema);
    }

    number(): NumberSchemaBuilder {
        return new NumberSchemaBuilder(this.__schema)
    }

    boolean(): BooleanSchemaBuilder {
        return new BooleanSchemaBuilder(this.__schema);
    }

    any(): AnySchemaBuilder {
        return new AnySchemaBuilder(this.__schema);
    }
}

export function argument(argumentName: string) {
    return new SchemaBuilder(argumentName);
}

argument('test').prefix().any();