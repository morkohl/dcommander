import {OptionalArgumentValueHolder, RequiredArgumentValueHolder} from "./argumentValueHolder";
import {ArgumentSchema, OptionalArgumentSchema} from "../schema/argumentSchema";

export class ArgumentParseResultFactory {
    static fromValueHolder(argumentSchemaValueHolder: RequiredArgumentValueHolder | OptionalArgumentValueHolder): ArgumentParseResult {
        return {
            schema: argumentSchemaValueHolder.schema,
            values: argumentSchemaValueHolder.values,
            flag: argumentSchemaValueHolder.schema instanceof OptionalArgumentSchema && argumentSchemaValueHolder.schema.isFlag,
            defaultValue: argumentSchemaValueHolder.schema.defaultValue && argumentSchemaValueHolder.values.length === 0 ? argumentSchemaValueHolder.schema.defaultValue : undefined,
        };
    }
}

export class ArgumentParseResult {
    schema: ArgumentSchema;
    values: string[];
    flag: boolean;
    defaultValue: any | undefined;
}
