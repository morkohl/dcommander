import {SchemaBuilder} from "./ArgumentSchemaBuilder";
import {StringSchemaBuilder} from "../type/builder/StringBuilder";
import {ArgumentSchema, OptionalArgumentSchema, RequiredArgumentSchema} from "../ArgumentSchema";
import {NumberSchemaBuilder} from "../type/builder/NumberBuilder";
import {AnySchemaBuilder} from "../type/builder/AnyBuilder";

class SchemaTypeChooserBuilder extends SchemaBuilder {
    string(): StringSchemaBuilder {
        return new StringSchemaBuilder(this.buildObject);
    }

    number(): NumberSchemaBuilder {
        return new NumberSchemaBuilder(this.buildObject)
    }

    any(): AnySchemaBuilder {
        return new AnySchemaBuilder(this.buildObject);
    }

    build(): ArgumentSchema {
        if(this.buildObject instanceof OptionalArgumentSchema && this.buildObject.isFlag) {
            return super.build();
        }
        return this.any().build();
    }
}

export function argument(argumentName: string) {
    const schema = new RequiredArgumentSchema(argumentName);
    return new SchemaTypeChooserBuilder(schema);
}

