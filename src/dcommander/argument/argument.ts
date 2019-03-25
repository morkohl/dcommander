import {ArgumentSchema} from "./argumentSchema";

export interface ArgumentsNamespace {
    [key: string]: Argument
}

export interface Argument {
    schema: ArgumentSchema,
    values: any[]
}