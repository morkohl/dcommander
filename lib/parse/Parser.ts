import {Context} from "../command/CommandManager";
import {CommandSchema} from "../command/CommandSchema";
import {ArgumentSchema} from "../schema/ArgumentSchema";
import {Argument} from "../schema/Argument";
import {Command} from "../command/Command";
import {AnyType} from "../schema/schemaBuilder/typeBuilder/type/anyType";
import {StringType} from "../schema/schemaBuilder/typeBuilder/type/string";

export class CommandParser {
    parse(schema: CommandSchema, context: Context) {
    }

    private argumentNames(schema: CommandSchema): string[] {
        return schema.argumentSchema.map(argumentSchema => argumentSchema.name);
    }

    private calledArguments(schema: CommandSchema, context: Context): ArgumentSchema[] {
        return schema.argumentSchema.filter(argumentSchema => context.contents.indexOf(argumentSchema.prefix + argumentSchema.name) < 0)
    }

    private requiredArgs(schema: CommandSchema): ArgumentSchema[] {
        return schema.argumentSchema.filter(argumentSchema => !argumentSchema.required);
    }

    private validateCommand(schema: CommandSchema, context: Context): Command {
        const argumentNames = this.argumentNames(schema);
        const calledArgs = this.calledArguments(schema, context);
        const requiredArgs = this.requiredArgs(schema);

        if(calledArgs.filter(calledArg => requiredArgs.indexOf(calledArg) >= 0).length !== 0) {

        }

        const args = schema.argumentSchema
            .reduce((acc, arg) => Object.assign(acc, { [arg.name]: arg}), {});

        return {
            arguments: args,
            name: schema.name,
            execution: schema.execution
        }
    }

    private validateArgument(schema: ArgumentSchema, context: Context, possibleArguments: string[]): Argument {
        const idx = context.contents.indexOf(schema.prefix + schema.name);
        if(idx > 0) {
            let value: any;
            if(schema.type instanceof AnyType || schema.type instanceof StringType) {
                value = null;
            } else {
                value = context.contents[idx + 1];
            }

        }

    }
}