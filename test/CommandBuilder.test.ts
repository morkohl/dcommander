import * as chai from 'chai';
import * as mocha from 'mocha';
import {command} from "../lib/command/commandBuilder/commandBuilder";
import {CommandInstructions} from "../lib/command/CommandSchema";
import {argument} from "../lib/schema/schemaBuilder/schemaBaseBuilder";
import {User} from "discord.js";

const expect = chai.expect;

const testExec = (instructions: CommandInstructions) => null;
const testCanExec = (user: User) => true;

describe('CommandBuilder Test', () => {
    it('should set all properties of a CommandSchema', () => {
        const commandArgs = [
            argument('test')
                .prefix('--')
                .number()
                .min(1)
                .max(50),
            argument('test1')
                .boolean()
                .optional()
        ];
        const commandBuilder = command('test')
            .execute(testExec)
            .canExecute(testCanExec)
            .arguments(commandArgs)
            .cooldown(5)
            .__build();
        expect(commandBuilder.execution.toString()).to.eq(testExec.toString());
        expect(commandBuilder.canExecute.toString()).to.eq(testCanExec.toString());
        expect(commandBuilder.name).to.eq('test');
        expect(commandBuilder.argumentSchema.length).to.eq(commandArgs.length);
    });

    it('should throw if duplicate argument names are supplied', () => {
        const commandArgs = [
            argument('test')
                .prefix('--')
                .number()
                .min(1)
                .max(50),
            argument('test')
                .boolean()
                .optional()
        ];
        const commandBuilder = command('tFest')
            .execute(testExec);
        const build = function () {
            commandBuilder.arguments(commandArgs);
        };
        expect(build).to.throw();
    });
});