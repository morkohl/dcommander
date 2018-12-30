import {CommandSchema} from "../schema/CommandSchema";
import {Message, User} from "discord.js";

export class CommandManager {
    commandSchemas: CommandSchema[];

    constructor(commands: CommandSchema[]) {
        this.commandSchemas = commands;
    }

    findCommand(message: Message): Context | null {
        for(let commandSchema of this.commandSchemas) {
            if(message.content.trim().startsWith(commandSchema.prefix + commandSchema.name)) {
                return {
                    schema: commandSchema,
                    message: message,
                    contents: message.content.split(' ')
                };
            }
        }
        return null;
    }
}

export interface Context {
    schema: CommandSchema,
    message: Message;
    contents: string[];
}