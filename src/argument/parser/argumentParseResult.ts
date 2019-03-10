import {OptionalArgumentValueHolder, RequiredArgumentValueHolder} from "./argumentValueHolder";
import {ArgumentSchema, OptionalArgumentSchema} from "../schema/argumentSchema";

export class ArgumentParseResultFactory {
    static fromValueHolder(argumentSchemaValueHolder: RequiredArgumentValueHolder | OptionalArgumentValueHolder): ArgumentParseResult {
        return {
            schema: argumentSchemaValueHolder.schema,
            values: argumentSchemaValueHolder.values.length !== 0 ? argumentSchemaValueHolder.values : undefined,
            flag: argumentSchemaValueHolder.schema instanceof OptionalArgumentSchema && argumentSchemaValueHolder.schema.isFlag,
            defaultValue: argumentSchemaValueHolder.schema.default && argumentSchemaValueHolder.values.length === 0 ? argumentSchemaValueHolder.schema.default : undefined,
        };
    }
}

export class ArgumentParseResult {
    schema: ArgumentSchema;
    values: string[] | undefined;
    flag: boolean;
    defaultValue: any | undefined;
}
