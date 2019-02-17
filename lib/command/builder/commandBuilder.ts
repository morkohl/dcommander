import {CommandSchema, CommandInstructions} from "../schema/CommandSchema";
import {ArgumentSchema} from "../../argument/schema/ArgumentSchema";
import {User} from "discord.js";
import {Builder} from "../../builder/Builder";
import {ArgumentBuilder} from "../../argument/schema/builder/ArgumentBuilder";

export class CommandBuilder extends Builder<CommandSchema> {
    schemaBuilders: ArgumentBuilder[];

    constructor(commandName: string) {
        super(new CommandSchema(commandName));
    }

    execute(execute: (instructions: CommandInstructions) => void): this {
        if (this.buildObject.execution) {
            throw new Error("CommandSchema already has a set execution function");
        }
        this.buildObject.execution = execute;
        return this;
    }

    arguments(argumentBuilders: ArgumentBuilder[]): this {
        if (this.schemaBuilders) {
            throw new Error("CommandSchema already has argumentSchema. Please define args as an array.");
        }
        this.schemaBuilders = argumentBuilders;
        return this;
    }

    cooldown(cooldown: number): this {
        if (this.buildObject.cooldown) {
            throw new Error("CommandSchema already has a cooldown.")
        }
        this.buildObject.cooldown = cooldown;
        return this;
    }

    canExecute(canExecute: (user: User) => boolean): this {
        if (this.buildObject.canExecute) {
            throw new Error("CommandSchema already has a set canExecute function");
        }
        this.buildObject.canExecute = canExecute;
        return this;
    }

    prefix(prefix: string): this {
        //if dcommander has default prefix set then take that instead if none taken
        if (this.buildObject.prefix) {
            throw new Error("CommandSchema already has a set prefix");
        }
        this.buildObject.prefix = prefix;
        return this;
    }

    build(): CommandSchema {
        if(this.schemaBuilders) {
            const builtArguments: ArgumentSchema[] = this.schemaBuilders.map(builder => builder.build());
            //@ts-ignore
            const argumentNameCount = builtArguments.reduce((acc, curr) => Object.assign(acc, {[curr.name]: (acc[curr.name] || 0) + 1}), {});
            //@ts-ignore
            if (Object.keys(argumentNameCount).filter((countItem: string) => argumentNameCount[countItem] > 1).length > 0) {
                throw new Error("CommandSchema cannot have multiple argumentSchema with the same name");
            }
            this.buildObject.argumentSchema = builtArguments;
        }

        if (!this.buildObject.execution) {
            throw new Error("No execution for command set");
        }
        return this.buildObject;
    }
}

export function command(commandName: string): CommandBuilder {
    return new CommandBuilder(commandName);
}