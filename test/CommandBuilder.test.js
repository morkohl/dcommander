"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var chai = __importStar(require("chai"));
var commandBuilder_1 = require("../lib/command/builder/commandBuilder");
var argument_1 = require("../lib/argument/schema/builder/argument");
var expect = chai.expect;
var testExec = function (instructions) { return null; };
var testCanExec = function (user) { return true; };
describe('CommandBuilder Test', function () {
    it('should set all properties of a built CommandSchema', function () {
        var commandArgs = [
            argument_1.argument('test')
                .prefix()
                .number()
                .min(1)
                .max(50),
            argument_1.argument('test1')
                .boolean()
                .optional()
        ];
        var commandSchema = commandBuilder_1.command('test')
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
    it('should throw if duplicate argument names are supplied', function () {
        var commandArgs = [
            argument_1.argument('test')
                .prefix('--')
                .number()
                .min(1)
                .max(50),
            argument_1.argument('test')
                .boolean()
                .optional()
        ];
        var commandBuilder = commandBuilder_1.command('test')
            .execute(testExec)
            .arguments(commandArgs);
        var build = function () {
            commandBuilder.__build();
        };
        expect(build).to.throw();
    });
    it('should return the required args', function () {
        var commandArgs = [
            argument_1.argument('test')
                .prefix('--')
                .number()
                .min(1)
                .max(50),
            argument_1.argument('test1')
                .boolean()
                .optional()
        ];
        var commandSchema = commandBuilder_1.command('test')
            .execute(testExec)
            .canExecute(testCanExec)
            .arguments(commandArgs)
            .cooldown(5)
            .__build();
        expect(commandSchema.requiredArgs().length).to.equal(1);
    });
});
