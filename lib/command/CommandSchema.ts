import {Message, Guild, User} from 'discord.js';
import {ArgumentSchema} from "../schema/ArgumentSchema";
import {Detectable} from "../parse/Parser";
import {Argument} from "../schema/Argument";

export class CommandSchema implements Detectable {
    name: string;
    prefix: string;
    execution: (instructions: CommandInstructions) => void;
    argumentSchema: ArgumentSchema[];
    cooldown: number;
    canExecute: (user: User) => boolean;

    constructor(name: string) {
        this.name = name;
    }
}

export interface CommandInstructions {
    //this should be context.. and should have argumentSchema be parsed arguments
    arguments: { [key: string]: Argument },
    message: Message,
    user: User
    server: Guild
}