import {ArgumentBuilder} from "./ArgumentBuilder";
import {ArgumentSchema, OptionalArgumentSchema, RequiredArgumentSchema} from "../ArgumentSchema";
import {StringArgumentBuilder} from "../type/builder/StringArgumentBuilder";
import {NumberArgumentBuilder} from "../type/builder/NumberArgumentBuilder";
import {AnyArgumentBuilder} from "../type/builder/AnyArgumentBuilder";

export class ArgumentTypeSelectorBuilder extends ArgumentBuilder{
    string(): StringArgumentBuilder {
        return new StringArgumentBuilder(this.buildObject);
    }

    number(): NumberArgumentBuilder {
        return new NumberArgumentBuilder(this.buildObject)
    }

    any(): AnyArgumentBuilder {
        return new AnyArgumentBuilder(this.buildObject);
    }

    build(): ArgumentSchema {
        if(this.buildObject.type) {
            return super.build();
        }
        return this.any().build();
    }

}

export function argument(name: string) {
    const schema = new RequiredArgumentSchema(name);
    return new ArgumentTypeSelectorBuilder(schema);
}

export function optionalArgument(name: string, identifiers?: string[]) {
    identifiers = identifiers ? identifiers : [`--${name}`, `-${name.charAt(0)}`];
    const schema = new OptionalArgumentSchema(name, identifiers);
    return new ArgumentTypeSelectorBuilder(schema)
}