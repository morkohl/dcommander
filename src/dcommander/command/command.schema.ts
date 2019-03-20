import {Message, Guild, User} from 'discord.js';
import {ArgumentSchema} from "../argument/argument.schema";

export interface  CommandSchema{
    execution: (instructions: CommandInstructions) => void;
    argumentSchema: ArgumentSchema[];
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