import {ArgumentBuilder} from "./argumentBuilder";
import {ArgumentSchema, OptionalArgumentSchema, RequiredArgumentSchema} from "../argumentSchema";
import {StringArgumentBuilder} from "./typeBuilder/stringArgumentBuilder";
import {NumberArgumentBuilder} from "./typeBuilder/numberArgumentBuilder";
import {AnyArgumentBuilder} from "./typeBuilder/anyArgumentBuilder";

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

export function argument(name: string): ArgumentTypeSelectorBuilder {
    const schema = new RequiredArgumentSchema(name);
    return new ArgumentTypeSelectorBuilder(schema);
}

export function optionalArgument(name: string, identifiers?: string[]): ArgumentTypeSelectorBuilder {
    identifiers = identifiers ? identifiers : [`--${name}`, `-${name.charAt(0)}`];
    const schema = new OptionalArgumentSchema(name, identifiers);
    return new ArgumentTypeSelectorBuilder(schema)
}