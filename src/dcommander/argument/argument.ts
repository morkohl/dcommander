import {ArgumentSchema} from "./argument.schema";

export interface ArgumentsNamespace {
    [key: string]: Argument
}

export interface Argument {
    schema: ArgumentSchema,
    values: any[]
}