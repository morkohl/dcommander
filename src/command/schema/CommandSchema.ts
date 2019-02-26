import {Message, Guild, User} from 'discord.js';
import {ArgumentSchema, OptionalArgumentSchema} from "../../argument/schema/ArgumentSchema";
import {Argument} from "../../argument/Argument";
import {Schema} from "../../schema/Schema";

export class CommandSchema extends Schema{
    execution: (instructions: CommandInstructions) => void;
    argumentSchema: ArgumentSchema[];
    optionalArgumentSchema: OptionalArgumentSchema[];
    cooldown: number;
    canExecute: (user: User) => boolean;
    prefix: string;
}

export interface CommandInstructions {
    //this should be context.. and should have argumentSchema be parsed arguments
    arguments: { [key: string]: Argument },
    message: Message,
    user: User
    server: Guild
}