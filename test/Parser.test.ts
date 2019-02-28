import * as chai from "chai";
import {command} from "../src/command/builder/commandBuilder";
import {argument, optionalArgument} from "../src/argument/schema/builder/argument";
import {ArgumentParser, CommandParser} from "../src/argument/manager/ArgumentManager";
import {OptionalArgumentSchema, RequiredArgumentSchema} from "../src/argument/schema/ArgumentSchema";

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

    const testRequiredArguments: RequiredArgumentSchema[] = [testArgumentRequired];
    const testOptionalArguments: OptionalArgumentSchema[] = [testArgumentOptionalString, testArgumentOptionalNumber];

    const testCommandBuilder = command("test")
        .arguments(testArgumentBuilders)
        .prefix("!")
        .execute(console.log);

    const testCommands = [testCommandBuilder.build()];

    describe("CommandParser Test", () => {
        it("should find the correct command for input", () => {
            const parser = new CommandParser();
            parser.parse(testCommands, ["!test", "abc", "-n", "15", "-s", "https://google.com", "bad_string", "test"]);
        });
    });

    describe("ArgumentParser Test", () => {
        it("should find the correct argument for input", () => {
            const parser = new ArgumentParser(testRequiredArguments, testOptionalArguments);
            parser.parse(["abc", "-n", "15", "adawd", "-s", "https://google.com", "bad_string", "test", "test123"]);
        });

        describe("Parsing Optional Arguments", () => {
            describe("Finding index results", () => {
                describe("Finding Identifier Index Results", () => {
                    it("should find index results", () => {
                        const parser = new ArgumentParser(testRequiredArguments, testOptionalArguments);
                        parser._inputArguments(["abc", "-n", "15"]);
                        const results = parser.getOptionalSchemaIdentifierIndexResults(testOptionalArguments);

                        expect(results.length).to.equal(1);

                        expect(results[0].schema.name).to.equal("number");
                        expect(results[0].identifierIndex).to.equal(1);
                        expect(results[0].usedIdentifier).to.equal("-n")
                    });

                    it("should find the correct index result for multiple used arguments", () => {
                        const parser = new ArgumentParser(testRequiredArguments, testOptionalArguments);
                        parser._inputArguments(["abc", "--number", "-n", "15", "-s"]);
                        const results = parser.getOptionalSchemaIdentifierIndexResults(testOptionalArguments);

                        expect(results.length).to.equal(2);

                        expect(results[0].schema.name).to.equal("number");
                        expect(results[0].identifierIndex).to.equal(1);
                        expect(results[0].usedIdentifier).to.equal("--number");

                        expect(results[1].schema.name).to.equal("string");
                        expect(results[1].identifierIndex).to.equal(4);
                        expect(results[1].usedIdentifier).to.equal("-s");
                    });

                    it("should only find the index for the first supplied identifier", () => {
                        const parser = new ArgumentParser(testRequiredArguments, testOptionalArguments);
                        parser._inputArguments(["abc", "-n", "--number", "15"]);
                        const results = parser.getOptionalSchemaIdentifierIndexResults(testOptionalArguments);

                        expect(results.length).to.equal(1);

                        expect(results[0].schema.name).to.equal("number");
                        expect(results[0].identifierIndex).to.equal(1);
                        expect(results[0].usedIdentifier).to.equal("-n")
                    });

                    it("should find no index results if none of the supplied schemas were detected", () => {
                        const parser = new ArgumentParser(testRequiredArguments, testOptionalArguments);
                        parser._inputArguments(["abc", "def"]);
                        const results = parser.getOptionalSchemaIdentifierIndexResults(testOptionalArguments);

                        expect(results.length).to.equal(0);
                    })
                });

                describe("Finding Value Index Results for explicit numberOfArguments", () => {
                    it("should find index results for a value", () => {
                        const parser = new ArgumentParser(testRequiredArguments, testOptionalArguments);
                        parser._inputArguments(["--number", "15"]);
                        const identifierIndexResults = parser.getOptionalSchemaIdentifierIndexResults(testOptionalArguments);
                        const results = parser.getOptionalValueIndexResults(identifierIndexResults);

                        expect(results.length).to.equal(1);
                        expect(results[0].from).to.equal(1);
                        expect(results[0].to).to.equal(2);
                        expect(results[0].identifierIndexResult).to.deep.equal(identifierIndexResults[0]);
                    })
                });

                describe("Finding Value Index Results for ambigous numberOfArguments", () => {
                    const testArgumentBuilderOptionalNumberAmbigousBuilder = optionalArgument("number", ["--number", "-n"])
                        .numberOfArguments("+")
                        .number()
                        .min(10)
                        .max(20);
                    const testArgumentBuilderOptionalNumberAmbigous = <OptionalArgumentSchema>testArgumentBuilderOptionalNumberAmbigousBuilder.build();

                    const testArgumentBuilderOptionalStringAmbigousBuilder = optionalArgument("string", ["--string", "-s"])
                        .numberOfArguments("?")
                        .default("my string!")
                        .string()
                    const testArgumentBuilderOptionalStringAmbigous = <OptionalArgumentSchema>testArgumentBuilderOptionalStringAmbigousBuilder.build();

                    const testOptionalArgumentsAmbigous: OptionalArgumentSchema[] = [testArgumentBuilderOptionalStringAmbigous, testArgumentBuilderOptionalNumberAmbigous];

                    it("should find index results for a value", () => {
                        const parser = new ArgumentParser(testRequiredArguments, testOptionalArgumentsAmbigous);
                        parser._inputArguments(["--number", "15"]);
                        const identifierIndexResults = parser.getOptionalSchemaIdentifierIndexResults(testOptionalArgumentsAmbigous);
                        const results = parser.getOptionalValueIndexResults(identifierIndexResults);

                        expect(results.length).to.equal(2);

                        expect(results[0].from).to.equal(1);
                        expect(results[0].to).to.equal(2);
                        expect(results[0].identifierIndexResult).to.deep.equal(identifierIndexResults[0]);

                        expect(results[1].from).to.equal(1);
                        expect(results[1].to).to.equal(2);
                        expect(results[1].identifierIndexResult.schema.name).to.equal(testArgumentBuilderOptionalStringAmbigous.name);
                    })
                });
            });
        })
    });
});