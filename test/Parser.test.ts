import * as chai from 'chai';
import {argument, optionalArgument} from "../src/argument/schema/builder/argument";
import {OptionalArgumentSchema, RequiredArgumentSchema} from "../src/argument/schema/ArgumentSchema";
import {command} from "../src/command/builder/commandBuilder";
import {ArgumentParser} from "../src/argument/parser/ArgumentParser";

const expect = chai.expect;

describe('Argument Parser Test', () => {
    const testArgumentBuilderRequired = argument("xyz");
    const testArgumentRequired = testArgumentBuilderRequired.build();

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
    describe("Detecting Identifiers", () => {
        it("should detect an identifier", () => {
            const parser = new ArgumentParser(testRequiredArguments, testOptionalArguments);
            const result: boolean = parser.isIdentifier(testArgumentOptionalString.identifiers[0]);

            expect(result).to.be.true;

            const anotherResult: boolean = parser.isIdentifier("not an identifier");

            expect(anotherResult).to.be.false;
        });

        it("should get the appropriate identifier", () => {
            const parser = new ArgumentParser(testRequiredArguments, testOptionalArguments);
            const result: OptionalArgumentSchema = parser.getOptionalForIdentifier(testArgumentOptionalString.identifiers[0]);

            expect(result).to.deep.equal(testArgumentOptionalString);
        });

        it("should throw an error if no valid identifier was provided", () => {
            const parser = new ArgumentParser(testRequiredArguments, testOptionalArguments);

            expect(() => parser.getOptionalForIdentifier("not an identifier")).to.throw();
        })
    });

    describe("Parse Arguments", () => {
        it("should parse arguments", () => {
            const parser = new ArgumentParser(testRequiredArguments, testOptionalArguments);
            const result = parser.parse(["xyz", "--number", "1"]);
        });

        it("should throw an error if all required arguments are filled but there is still non identifier tokens remaining", () => {
            const parser = new ArgumentParser(testRequiredArguments, testOptionalArguments);

            expect(() => parser.parse(["valid_token", "invalid_token"]))
        })
    })
});