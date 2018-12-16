import {CommandSchema} from "./CommandSchema";
import {Message, User} from "discord.js";

export class CommandManager {
    commandSchemas: CommandSchema[];

    constructor(commands: CommandSchema[]) {
        this.commandSchemas = commands;
    }

    findCommand(message: Message): Context | null {
        for(let command of this.commandSchemas) {
            if(message.content.trim().startsWith(command.prefix + command.name)) {
                return {
                    message: message,
                    contents: message.content.split(' ')
                };
            }
        }
        return null;
    }
}

export interface Context {
    message: Message;
    contents: string[];
}