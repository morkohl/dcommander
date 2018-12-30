import {SchemaBuilder} from "./ArgumentSchemaBuilder";
import {StringSchemaBuilder} from "../type/builder/StringBuilder";
import {ArgumentSchema} from "../ArgumentSchema";
import {NumberSchemaBuilder} from "../type/builder/NumberBuilder";
import {BooleanSchemaBuilder} from "../type/builder/BooleanBuilder";
import {AnySchemaBuilder} from "../type/builder/AnyBuilder";

class SchemaTypeChooserBuilder extends SchemaBuilder {
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

    __build(): ArgumentSchema {
        return this.any().__build();
    }
}

export function argument(argumentName: string) {
    const schema = new ArgumentSchema(argumentName);
    return new SchemaTypeChooserBuilder(schema);
}