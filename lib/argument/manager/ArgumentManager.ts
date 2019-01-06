import {CommandSchema} from "../../command/schema/CommandSchema";
import {PrefixSchema, Schema} from "../../schema/Schema";
import {Command} from "../../command/Command";
import {ArgumentSchema} from "../schema/ArgumentSchema";
import {Argument} from "../Argument";



/*    do(contents: string[]): any {
        let detected: ArgumentSchema[] = [];
        for(let schema of this.schemas) {
            //prefix used to call argument
            let prefixUsed = contents.indexOf(` ${schema.prefix + schema.name} `) >= 0;
            //any alias used
            let usedAliases = schema.aliases.filter(alias => contents.indexOf(` ${alias} `) >= 0);

            if(prefixUsed && usedAliases.length !== 0) {
                throw new Error(`Duplicate call of argument '${schema.name}'; ${schema.prefix + schema.name} and ${usedAliases.join(', ')} used.`);
            } else if(prefixUsed) {

            } else if(usedAliases.length !== 0) {
                if(usedAliases.length !== 1) {

                } else {
                    throw new Error(`Duplicate call of argument '${schema.name}'; ${usedAliases.join(', ')} used.`)
                }
            } else {
                return null;
            }
         }
    }*/


/*
    findArgumentCandidates(contents: string[]): ArgumentSchema[] | null {
        let detected: ArgumentSchema[] = [];

        for(let schema of this.schemas) {
            if(contents.indexOf(` ${schema.prefix + schema.name} `) >= 0 || schema.aliases.filter(alias => contents.indexOf(` ${alias} `) >= 0).length != 0) {
                detected.push(schema);
            }
        }

        if(detected.length > 0) {
            return detected;
        } else {
            return null;
        }
    }
*/

}

export abstract class Parser<S extends PrefixSchema, Out> {
    protected schemas: S[];

    constructor(schemas: S[]) {
        this.schemas = schemas;
    }

    abstract parse(contents: string): Out

    protected abstract step(any: any): any

    protected abstract find(schema: S): FindContext<S>;
    protected abstract getValue(findContext: FindContext<S>): any
}

export class CommandParser extends Parser<CommandSchema, Command>{
    protected argumentParser: ArgumentParser;

    constructor(schemas: CommandSchema[], argumentParser: ArgumentParser) {
        super(schemas);
        this.argumentParser = argumentParser
    }

    parse(contents: string): Command {
    }

    protected find(schema: CommandSchema): FindContext<CommandSchema> {
        return undefined;
    }

    protected getValue(findContext: FindContext<CommandSchema>): any {
        return undefined;
    }
}

export class ArgumentParser extends Parser<ArgumentSchema, Argument> {
    requiredArgs(): ArgumentSchema[] {
        return this.schemas.filter(schema => schema.required);
    }

    optionalArgs(): ArgumentSchema[] {
        return this.schemas.filter(schema => !schema.required);
    }

    parse(contents: string): Argument {
        return undefined;
    }

    protected step(any: any): any {
        return undefined;
    }


    protected find(schema: ArgumentSchema): FindContext<ArgumentSchema> {
        return undefined;
    }

    protected getValue(findContext: FindContext<ArgumentSchema>): any {
        return undefined;
    }
}

export interface FindContext<S extends PrefixSchema> {
    schema: S;
    usedPrefix: string | null;
    usedAlias: string | null;
}

export interface ArgumentFindContext extends FindContext<ArgumentSchema> {}
export interface CommandFindContext extends FindContext<CommandSchema> {}