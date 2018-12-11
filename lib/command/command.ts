import {Message, Guild, User} from 'discord.js';
import {ArgumentSchema} from "../schema/schema";

export class Command {
    name: string;
    prefix: string;
    execution: (instructions: CommandInstructions) => void;
    arguments: ArgumentSchema[];
    cooldown: number;
    canExecute: (user: User) => boolean;

    constructor(name: string) {
        this.name = name;
    }
}

export interface CommandInstructions {
    arguments: ArgumentSchema[] | ArgumentSchema,
    message: Message,
    user: User
    server: Guild
}


