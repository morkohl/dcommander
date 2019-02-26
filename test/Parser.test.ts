import * as chai from "chai";
import {command} from "../src/command/builder/commandBuilder";
import {argument, optionalArgument} from "../src/argument/schema/builder/argument";
import {ArgumentParser, CommandParser} from "../src/argument/manager/ArgumentManager";
import {OptionalArgumentSchema} from "../src/argument/schema/ArgumentSchema";

const expect = chai.expect;

describe("Parser Test", () => {
    const testArgumentBuilderRequired = argument("xyz");
    const testArgumentRequired = argument("xyz").build();

    const testArgumentBuilderOptionalString = optionalArgument("string", ["--string", "-s"])
        .numberOfArguments(3)
        .string()
        .url();
    const testArgumentOptionalString = <OptionalArgumentSchema>testArgumentBuilderOptionalString.build();

    const testArgumentBuilderOptionalNumber = optionalArgument("number", ["--number", "-n"])
        .numberOfArguments(1)
        .number()
        .min(10)
        .max(20);
    const testArgumentOptionalNumber = <OptionalArgumentSchema>testArgumentBuilderOptionalNumber.build();

    const testArgumentBuilders = [testArgumentBuilderRequired, testArgumentBuilderOptionalString, testArgumentBuilderOptionalNumber];

    const testArguments = [testArgumentRequired, testArgumentOptionalString, testArgumentOptionalNumber];
    const testOptionalArguments: OptionalArgumentSchema[] = [testArgumentOptionalString, testArgumentOptionalNumber];

    const testCommandBuilder = command("test")
        .arguments(testArgumentBuilders)
        .prefix("!")
        .execute(console.log);

    const testCommands = [testCommandBuilder.build()];

    describe("CommandParser Test", () => {
        it("should find the correct command for input", () => {
            const parser = new CommandParser();
            parser.parse(testCommands, ["!test", "abc", "-n", "15", "-s", "https://google.com", "bad_string"]);
        });
    });

    describe("ArgumentParser Test", () => {
        it("should find the correct argument for input", () => {
            const parser = new ArgumentParser();
            parser.parse(testCommands[0], ["abc", "-n", "15", "-s", "https://google.com", "bad_string"])
        });

        describe("Parsing Optional Arguments", () => {

            it("should find index results", () => {
                const parser = new ArgumentParser();
                const results = parser.getOptionalArgumentsIndexResults(testOptionalArguments, ["abc", "-n",  "15"]);
                expect(results).to.be.an("array");
                expect(results.length).to.equal(1);
                expect(results[0].schema.name).to.equal("number");
                expect(results[0].index).to.equal(1);
                expect(results[0].usedIdentifier).to.equal("-n")
            });

            it("should find the correct index result for multiple used arguments", () => {
                const parser = new ArgumentParser();
                const results = parser.getOptionalArgumentsIndexResults(testOptionalArguments, ["abc", "--number", "-n",  "15", "-s"]);
                expect(results).to.be.an("array");
                expect(results.length).to.equal(2);
                expect(results[1].schema.name).to.equal("number");
                expect(results[1].index).to.equal(1);
                expect(results[1].usedIdentifier).to.equal("--number");
                expect(results[0].schema.name).to.equal("string");
                expect(results[0].index).to.equal(4);
                expect(results[0].usedIdentifier).to.equal("-s");
            });

            it("should only find the index for the first supplied identifier", () => {
                const parser = new ArgumentParser();
                const results = parser.getOptionalArgumentsIndexResults(testOptionalArguments, ["abc", "-n", "--number", "15"]);
                expect(results).to.be.an("array");
                expect(results.length).to.equal(1);
                expect(results[0].schema.name).to.equal("number");
                expect(results[0].index).to.equal(1);
                expect(results[0].usedIdentifier).to.equal("-n")
            });

            it("should find no index results if none of the supplied schemas were detected", () => {
                const parser = new ArgumentParser();
                const results = parser.getOptionalArgumentsIndexResults(testOptionalArguments, ["abc", "def"]);
                expect(results).to.be.an("array");
                expect(results.length).to.equal(0);
            })
        })
    });
});