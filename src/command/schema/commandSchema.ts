import {Message, Guild, User} from 'discord.js';
import {ArgumentSchema, OptionalArgumentSchema} from "../../argument/schema/argumentSchema";
import {Schema} from "../../schema/schema";

export class CommandSchema extends Schema{
    execution: (instructions: CommandInstructions) => void;
    argumentSchema: ArgumentSchema[];
    optionalArgumentSchema: OptionalArgumentSchema[];
    cooldown: number;
    canExecute: (user: User) => boolean;
    prefix: string;
}

export interface CommandInstructions {
    arguments: { [key: string]: any },
    message: Message,
    user: User
    server: Guild
}