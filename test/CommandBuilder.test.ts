import * as chai from 'chai';
import * as mocha from 'mocha';
import {command} from "../lib/command/builder/commandBuilder";
import {CommandInstructions} from "../lib/command/schema/CommandSchema";
import {User} from "discord.js";
import {argument} from "../lib/argument/schema/builder/argument";
import {ARGUMENT_CONSTANTS} from "../lib/argument/schema/ArgumentSchema";

const expect = chai.expect;

const testExec = (instructions: CommandInstructions) => null;
const testCanExec = (user: User) => true;

describe('CommandBuilder Test', () => {
    it('should set all properties of a built CommandSchema', () => {
        const commandArgs = [
            argument('test')
                .prefix()
                .number()
                .min(1)
                .max(50),
            argument('test1')
                .boolean()
                .optional()
        ];
        const commandSchema = command('test')
            .execute(testExec)
            .canExecute(testCanExec)
            .arguments(commandArgs)
            .cooldown(5)
            .__build();
        expect(commandSchema.execution.toString()).to.eq(testExec.toString());
        expect(commandSchema.canExecute.toString()).to.eq(testCanExec.toString());
        expect(commandSchema.name).to.eq('test');
        expect(commandSchema.argumentSchema.length).to.eq(commandArgs.length);
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
        const commandBuilder = command('test')
            .execute(testExec)
            .arguments(commandArgs);
        const build = function () {
            commandBuilder.__build();
        };
        expect(build).to.throw();
    });

    it('should return the required args', () => {
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
        const commandSchema = command('test')
            .execute(testExec)
            .canExecute(testCanExec)
            .arguments(commandArgs)
            .cooldown(5)
            .__build();
        expect(commandSchema.requiredArgs().length).to.equal(1);
    })
});