import * as chai from 'chai';
import {argument, optionalArgument} from "../src/argument/schema/builder/argument";
import {OptionalArgumentSchema, RequiredArgumentSchema} from "../src/argument/schema/ArgumentSchema";
import {ArgumentParser} from "../src/argument/parser/ArgumentParser";
import {NARGS} from "../src/argument/schema/builder/ArgumentBuilder";

const expect = chai.expect;

//todo write and implement flags and default values

describe('Argument Parser Test', () => {
    const testArgumentBuilderRequired = argument("requiredTestArgument1");
    const testArgumentRequired = testArgumentBuilderRequired.build();

    const testArgumentOptionalString = <OptionalArgumentSchema>optionalArgument("optionalTestArgument1", ["--string", "-s"])
        .numberOfArguments(3)
        .string()
        .url()
        .build();

    const testArgumentOptionalNumber = <OptionalArgumentSchema>optionalArgument("optionalTestArgument2", ["--number", "-n"])
        .numberOfArguments(1)
        .number()
        .min(10)
        .max(20)
        .build();

    const testRequiredArguments: RequiredArgumentSchema[] = [testArgumentRequired];
    const testOptionalArguments: OptionalArgumentSchema[] = [testArgumentOptionalString, testArgumentOptionalNumber];

    const testArgumentOptionalAmbiguousAllOrDefault = <OptionalArgumentSchema>optionalArgument("optionalTestArgument1", ["--number", "-n"])
        .numberOfArguments(NARGS.ALL_OR_DEFAULT.toString())
        .number()
        .min(10)
        .max(20)
        .build();

    const testArgumentOptionalAmbiguousAllOrOne = <OptionalArgumentSchema>optionalArgument("optionalTestArgument2", ["--string", "-s"])
        .numberOfArguments(NARGS.AT_LEAST_ONE.toString())
        .string()
        .url()
        .build();

    const testArgumentRequiredAmbiguousAllOrOne = argument("requiredTestArgument1").numberOfArguments(NARGS.AT_LEAST_ONE.toString()).build();
    const testArgumentRequiredAmbiguousAllOrDefault = argument("requiredTestArgument2").numberOfArguments(NARGS.ALL_OR_DEFAULT.toString()).build();


    describe("Detecting Identifiers", () => {
        it("should detect an identifier", () => {
            const parser = new ArgumentParser(testRequiredArguments, testOptionalArguments);
            const result: boolean = parser.isIdentifier(testArgumentOptionalString.identifiers[0]);

            expect(result).to.be.true;
        });

        it("should not detect an invalid identifier", () => {
            const parser = new ArgumentParser(testRequiredArguments, testOptionalArguments);
            const result: boolean = parser.isIdentifier("not an identifier");

            expect(result).to.be.false;
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

    describe("Parse Explicit Number Of Arguments", () => {
        it("should parse arguments even if only a limited number of optional input arguments were supplied", () => {
            const parser = new ArgumentParser(testRequiredArguments, testOptionalArguments);
            const result = parser.parse(["xyz", "--number", "1"]);

            expect(result.length).to.equal(2);

            const resultReqArg = result[0];
            expect(resultReqArg.schema).to.deep.equal(testArgumentRequired);
            expect(resultReqArg.values.length).to.equal(1);
            expect(resultReqArg.values).to.deep.equal(["xyz"]);

            const resultOptArg = result[1];
            expect(resultOptArg.schema).to.deep.equal(testArgumentOptionalNumber);
            expect(resultOptArg.values.length).to.equal(1);
            expect(resultOptArg.values).to.deep.equal(["1"]);
        });

        it("should parse arguments with more than one resulting value", () => {
            const parser = new ArgumentParser(testRequiredArguments, testOptionalArguments);
            const result = parser.parse(["abc", "--string", "a", "bbb", "ckajwdajwdja", "-n", "test"]);

            expect(result.length).to.equal(3);

            const resultReqArg = result[0];
            expect(resultReqArg.schema).to.deep.equal(testArgumentRequired);
            expect(resultReqArg.values.length).to.equal(1);
            expect(resultReqArg.values).to.deep.equal(["abc"]);

            const resultOptArg1 = result[1];
            expect(resultOptArg1.schema).to.deep.equal(testArgumentOptionalString);
            expect(resultOptArg1.values.length).to.equal(3);
            expect(resultOptArg1.values).to.deep.equal(["a", "bbb", "ckajwdajwdja"]);

            const resultOptArg2 = result[2];
            expect(resultOptArg2.schema).to.deep.equal(testArgumentOptionalNumber);
            expect(resultOptArg2.values.length).to.equal(1);
            expect(resultOptArg2.values).to.deep.equal(["test"]);
        });

        it("should parse more than one value for a required argument if the values for an optional argument are supplied in between", () => {
            const anotherTestRequiredArgumentBuilder = argument("xyz").numberOfArguments(2);
            const anotherTestRequiredArgument = anotherTestRequiredArgumentBuilder.build();

            const parser = new ArgumentParser([anotherTestRequiredArgument], testOptionalArguments);
            const result = parser.parse(["abc", "-n", "test", "cde"]);

            expect(result.length).to.equal(2);

            const resultReqArg = result[0];
            expect(resultReqArg.schema).to.deep.equal(anotherTestRequiredArgument);
            expect(resultReqArg.values.length).to.equal(2);
            expect(resultReqArg.values).to.deep.equal(["abc", "cde"]);

            const resultOptArg = result[1];
            expect(resultOptArg.schema).to.deep.equal(testArgumentOptionalNumber);
            expect(resultOptArg.values.length).to.equal(1);
            expect(resultOptArg.values).to.deep.equal(["test"]);
        });

        it("should parse even optional arguments only", () => {
            const parser = new ArgumentParser([], testOptionalArguments);
            const result = parser.parse(["--string", "string", "string", "string"]);

            expect(result.length).to.equal(1);

            const resultOptArg = result[0];
            expect(resultOptArg.schema).to.deep.equal(testArgumentOptionalString);
            expect(resultOptArg.values.length).to.equal(3);
            expect(resultOptArg.values).to.deep.equal(["string", "string", "string"])
        });

        it("should do nothing if no input arguments were given and if no required arguments were given", () => {
            const parser = new ArgumentParser([], testOptionalArguments);
            const result = parser.parse([]);

            expect(result.length).to.equal(0);
        });

        it("should throw an error if all required arguments are filled but there is still non identifier tokens remaining", () => {
            const parser = new ArgumentParser(testRequiredArguments, testOptionalArguments);

            expect(() => parser.parse(["valid_token", "invalid_token"])).to.throw()
        });

        it("should throw an error if too many arguments were supplied to a required argument", () => {
            const parser = new ArgumentParser(testRequiredArguments, testOptionalArguments);

            expect(() => parser.parse(["too", "many", "arguments"])).to.throw()
        });

        it("should throw an error if too many arguments were supplied to an optional argument", () => {
            const parser = new ArgumentParser(testRequiredArguments, testOptionalArguments);

            expect(() => parser.parse(["xyz", "-n", "1", "2"])).to.throw()
        });

        it("should throw an error if too few arguments were supplied to a non ambiguous optional argument", () => {
            const parser = new ArgumentParser(testRequiredArguments, testOptionalArguments);

            expect(() => parser.parse(["abc", "-n"])).to.throw();
        });
    });

    describe("Parse Ambiguous Number Of Arguments", () => {
        it("should parse ambiguous number of arguments (all or one) for a required argument", () => {
            const reqArgs: RequiredArgumentSchema[] = [testArgumentRequiredAmbiguousAllOrOne];
            const optArgs: OptionalArgumentSchema[] = [];
            const parser = new ArgumentParser(reqArgs, optArgs);

            const result = parser.parse(["argument", "argument", "argument", "argument"]);
            expect(result.length).to.equal(1);

            const resultReqArg = result[0];
            expect(resultReqArg.schema).to.deep.equal(testArgumentRequiredAmbiguousAllOrOne);
            expect(resultReqArg.values.length).to.equal(4);
            expect(resultReqArg.values).to.deep.equal(["argument", "argument", "argument", "argument"]);

            expect(() => parser.parse([])).to.throw();
            expect(() => parser.parse(["argument"])).to.not.throw();
        });

        it("should parse ambiguous number of arguments (all or default) for a required argument", () => {
            const reqArgs: RequiredArgumentSchema[] = [testArgumentRequiredAmbiguousAllOrDefault];
            const optArgs: OptionalArgumentSchema[] = [];
            const parser = new ArgumentParser(reqArgs, optArgs);

            const result = parser.parse(["argument"]);
            expect(result.length).to.equal(1);

            const resultOptArg = result[0];
            expect(resultOptArg.values.length).to.equal(1);
            expect(resultOptArg.values).to.deep.equal(["argument"]);

            const anotherResult = parser.parse([]);

            const anotherResultReqArg = anotherResult[0];
            expect(anotherResultReqArg.values.length).to.equal(0);
        });

        it("should parse ambiguous number of arguments (all or one) for a optional argument", () => {
            const reqArgs: RequiredArgumentSchema[] = [];
            const optArgs: OptionalArgumentSchema[] = [testArgumentOptionalAmbiguousAllOrOne];
            const parser = new ArgumentParser(reqArgs, optArgs);

            const result = parser.parse(["--string", "string", "string", "string", "string"]);
            expect(result.length).to.equal(1);

            const resultOptArg = result[0];
            expect(resultOptArg.schema).to.deep.equal(testArgumentOptionalAmbiguousAllOrOne);
            expect(resultOptArg.values.length).to.equal(4);
            expect(resultOptArg.values).to.deep.equal(["string", "string", "string", "string"]);

            expect(() => parser.parse([])).to.not.throw();
            expect(() => parser.parse(["--string"])).to.throw();
            expect(() => parser.parse(["--string", "string"])).to.not.throw();
        });

        it("should parse ambiguous number of arguments (all or default) for a optional argument", () => {
            const reqArgs: RequiredArgumentSchema[] = [];
            const optArgs: OptionalArgumentSchema[] = [testArgumentOptionalAmbiguousAllOrDefault];
            const parser = new ArgumentParser(reqArgs, optArgs);

            const result = parser.parse(["--number", "1", "2", "3", "4"]);
            expect(result.length).to.equal(1);

            const resultOptArg = result[0];
            expect(resultOptArg.schema).to.deep.equal(testArgumentOptionalAmbiguousAllOrDefault);
            expect(resultOptArg.values.length).to.equal(4);
            expect(resultOptArg.values).to.deep.equal(["1", "2", "3", "4"]);

            const anotherResult = parser.parse(["--number"]);
            expect(result.length).to.equal(1);

            const resultOptArg1 = anotherResult[0];
            expect(resultOptArg1.schema).to.deep.equal(testArgumentOptionalAmbiguousAllOrDefault);
            expect(resultOptArg1.values.length).to.equal(0);

            const anotherAnotherResult = parser.parse([]);

            expect(anotherAnotherResult.length).to.equal(0);
            expect(anotherAnotherResult.values.length).to.equal(0);
        });

        it("should parse ambiguous number of arguments for required arguments", () => {
            const reqArgs: RequiredArgumentSchema[] = [testArgumentRequiredAmbiguousAllOrDefault, testArgumentRequiredAmbiguousAllOrOne];
            const reqArgsIncorrectOrder: RequiredArgumentSchema[] = [testArgumentRequiredAmbiguousAllOrOne, testArgumentRequiredAmbiguousAllOrDefault];
            const optArgs: OptionalArgumentSchema[] = [testArgumentOptionalAmbiguousAllOrDefault, testArgumentOptionalAmbiguousAllOrOne];
            const parser = new ArgumentParser(reqArgs, optArgs);
            const anotherParser = new ArgumentParser(reqArgsIncorrectOrder, optArgs);

            const result = parser.parse(["argument", "argument", "argument"]);
            expect(result.length).to.equal(1);

            const resultReqArg = result[0];
            expect(resultReqArg.schema).to.equal(testArgumentRequiredAmbiguousAllOrDefault);
            expect(resultReqArg.values.length).to.equal(3);
            expect(resultReqArg.values).to.deep.equal(["argument", "argument", "argument"]);

            expect(() => anotherParser.parse([])).to.throw();
            expect(() => anotherParser.parse(["argument"])).to.not.throw();
        });

        it("should parse ambiguous number of arguments for optional arguments", () => {
            const reqArgs: RequiredArgumentSchema[] = [];
            const optArgs: OptionalArgumentSchema[] = [testArgumentOptionalAmbiguousAllOrDefault, testArgumentOptionalAmbiguousAllOrOne];
            const parser = new ArgumentParser(reqArgs, optArgs);

            const result = parser.parse(["--string", "string", "string", "string", "--number", "number", "number", "number"]);
            expect(result.length).to.equal(2);

            const resultOptArg1 = result[0];
            expect(resultOptArg1.schema).to.deep.equal(testArgumentOptionalAmbiguousAllOrOne);
            expect(resultOptArg1.values.length).to.equal(3);
            expect(resultOptArg1.values).to.deep.equal(["string", "string", "string"]);

            const resultOptArg2 = result[1];
            expect(resultOptArg2.schema).to.deep.equal(testArgumentOptionalAmbiguousAllOrDefault);
            expect(resultOptArg2.values.length).to.equal(3);
            expect(resultOptArg2.values).to.deep.equal(["number", "number", "number"])
        });

        it("should parse ambiguous number of arguments", () => {
            const reqArgs: RequiredArgumentSchema[] = [testArgumentRequiredAmbiguousAllOrOne, testArgumentRequiredAmbiguousAllOrDefault];
            const optArgs: OptionalArgumentSchema[] = [testArgumentOptionalAmbiguousAllOrOne, testArgumentOptionalAmbiguousAllOrDefault];
            const parser = new ArgumentParser(reqArgs, optArgs);

            const result = parser.parse(["argument", "argument", "--string", "string", "string", "--number"]);
            expect(result.length).to.equal(3);

            const resultReqArg = result[0];
            expect(resultReqArg.schema).to.deep.equal(testArgumentRequiredAmbiguousAllOrOne);
            expect(resultReqArg.values.length).to.equal(2);
            expect(resultReqArg.values).to.deep.equal(["argument", "argument"]);

            const resultOptArg1 = result[1];
            expect(resultOptArg1.schema).to.deep.equal(testArgumentOptionalAmbiguousAllOrOne);
            expect(resultOptArg1.values.length).to.equal(2);
            expect(resultOptArg1.values).to.deep.equal(["string", "string"]);


            const resultOptArg2 = result[2];
            expect(resultOptArg2.schema).to.deep.equal(testArgumentOptionalAmbiguousAllOrDefault);
            expect(resultOptArg2.values.length).to.equal(0);
        });
    });
});