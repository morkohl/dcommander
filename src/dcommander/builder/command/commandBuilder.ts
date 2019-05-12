import {Builder} from "../builder";
import {CanExecuteFunction, CommandSchema, CommandSchemaDto, ExecutionFunction} from "../../command/commandSchema";
import {ArgumentBuilders} from "../argument/argumentBuilders";

export namespace CommandBuilders {
    export class CommandBuilder implements Builder {
        commandSchema: CommandSchemaDto;

        constructor(name: string) {
            this.commandSchema = <CommandSchemaDto>{};
            this.commandSchema.name = name;
            this.commandSchema.argumentSchema = [];
        }

        execution(execution: ExecutionFunction): this {
            this.commandSchema.execution = execution;
            return this;
        }

        canExecute(canExecute: CanExecuteFunction): this {
            this.commandSchema.canExecute = canExecute;
            return this;
        }

        arguments(args: (ArgumentBuilders.OptionalArgumentBuilder | ArgumentBuilders.ArgumentBuilder)[]): this {
            this.commandSchema.argumentSchema = this.commandSchema.argumentSchema.concat(args.map(builder => builder.build()))
            return this;
        }

        prefix(prefix: string): this {
            this.commandSchema.prefix = prefix;
            return this;
        }

        build(): CommandSchema {
            return <CommandSchema>this.commandSchema;
        }
    }
}