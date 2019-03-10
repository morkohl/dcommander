import * as chai from 'chai';
import {command} from "../src/command/builder/commandBuilder";
import {User} from "discord.js";
import {argument, optionalArgument} from "../src/argument/schema/builder/argument";
import {CommandInstructions} from "../src/command/schema/commandSchema";

const expect = chai.expect;

const testExec = (instructions: CommandInstructions) => null;
const testCanExec = (user: User) => true;

describe('CommandBuilder Test', () => {
    it('should set all properties of a built CommandSchema', () => {
        const commandArgs = [
            argument('test')
                .number()
                .min(1)
                .max(50),
            optionalArgument('test1')
        ];
        const commandSchema = command('test')
            .execute(testExec)
            .canExecute(testCanExec)
            .arguments(commandArgs)
            .cooldown(5)
            .build();
        expect(commandSchema.execution.toString()).to.eq(testExec.toString());
        expect(commandSchema.canExecute.toString()).to.eq(testCanExec.toString());
        expect(commandSchema.name).to.eq('test');
        expect(commandSchema.argumentSchema.length).to.eq(1);
        expect(commandSchema.argumentSchema[0].name).to.eq('test');
        expect(commandSchema.optionalArgumentSchema[0].name).to.eq("test1")
    });

    it('should throw if duplicate argument names are supplied', () => {
        const commandArgs = [
            argument('test')
                .number()
                .min(1)
                .max(50),
            optionalArgument('test')
                .flag()
        ];
        const commandBuilder = command('test')
            .execute(testExec)
            .arguments(commandArgs);
        expect(() => commandBuilder.build()).to.throw();
    });
});