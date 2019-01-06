import {Message, Guild, User} from 'discord.js';
import {ArgumentSchema} from "../../argument/schema/ArgumentSchema";
import {Argument} from "../../argument/Argument";
import {PrefixSchema} from "../../schema/Schema";

export class CommandSchema extends PrefixSchema {
    name: string;
    execution: (instructions: CommandInstructions) => void;
    argumentSchema: ArgumentSchema[];
    cooldown: number;
    canExecute: (user: User) => boolean;

    requiredArgs() {
        return this.argumentSchema.filter(schema => schema.required);
    }
}

export interface CommandInstructions {
    //this should be context.. and should have argumentSchema be parsed arguments
    arguments: { [key: string]: Argument },
    message: Message,
    user: User
    server: Guild
}