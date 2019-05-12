import {Message, Guild, User} from 'discord.js';
import {ArgumentSchema} from "../argument/argumentSchema";
import {ArgumentsNamespace} from "../argument/argument";

//implement cooldown
export interface  CommandSchema{
    readonly name: string;
    readonly execution: ExecutionFunction;
    readonly canExecute: CanExecuteFunction;
    readonly argumentSchema: ArgumentSchema[];
    readonly prefix: string;
}

export type CommandSchemaDto = {
    -readonly [K in keyof CommandSchema]: CommandSchema[K]
}

type TestType = {
    [K in keyof CommandSchema]:  CommandSchema[K]
}

export type CanExecuteFunction = (user: User) => boolean;

export type ExecutionFunction = (instructions: CommandInstructions) => Promise<any> | any;

export interface CommandInstructions {
    arguments: ArgumentsNamespace,
    message: Message,
    user: User
    server: Guild
}