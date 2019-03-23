import * as chai from 'chai';
import {ARGUMENTS_LENGTH, ArgumentSchema, OptionalArgumentSchema} from "../src/dcommander/argument/argument.schema";
import {ArgumentBuilder} from "../src/dcommander/builder/argument/argument.builder";
import {ArgumentParser, IdentifierUtil} from "../src/dcommander/service/parser/argument.parser";
import argumentSchema = ArgumentBuilder.argumentSchema;
import optionalArgumentSchema = ArgumentBuilder.optionalArgumentSchema;


const expect = chai.expect;

const testArgumentBuilderRequired = argumentSchema("requiredTestArgument1");
const testArgumentRequired = testArgumentBuilderRequired.build();

const testArgumentOptionalString = optionalArgumentSchema("optionalTestArgument1")
    .identifiers(["--string", "-s"])
    .argumentsLength(3)
    .build();

const testArgumentOptionalNumber = optionalArgumentSchema("optionalTestArgument2")
    .identifiers(["--number", "-n"])
    .argumentsLength(1)
    .build();

const testRequiredArguments: ArgumentSchema[] = [testArgumentRequired];
const testOptionalArguments: OptionalArgumentSchema[] = [testArgumentOptionalString, testArgumentOptionalNumber];

const testArgumentOptionalAmbiguousAllOrDefault = optionalArgumentSchema("optionalTestArgument1")
    .identifiers(["--number", "-n"])
    .argumentsLength(ARGUMENTS_LENGTH.ALL_OR_DEFAULT)
    .build();

const testArgumentOptionalAmbiguousAllOrOne = optionalArgumentSchema("optionalTestArgument2")
    .identifiers(["--string", "-s"])
    .argumentsLength(ARGUMENTS_LENGTH.AT_LEAST_ONE)
    .build();

const testArgumentRequiredAmbiguousAllOrOne = argumentSchema("requiredTestArgument1").argumentsLength(ARGUMENTS_LENGTH.AT_LEAST_ONE).build();
const testArgumentRequiredAmbiguousAllOrDefault = argumentSchema("requiredTestArgument2").argumentsLength(ARGUMENTS_LENGTH.ALL_OR_DEFAULT).default({foo: "bar"}).build();

describe("IdentifierUtil Test", () => {
    it("should detect an identifier", () => {
        const identifierUtil = new IdentifierUtil(testOptionalArguments);
        const result = identifierUtil.isIdentifier(testArgumentOptionalString.identifiers[0]);

        expect(result).to.be.true;
    });

    it("should not detect an invalid identifier", () => {
        const identifierUtil = new IdentifierUtil(testOptionalArguments);
        const result = identifierUtil.isIdentifier("not an identifier");

        expect(result).to.be.false;
    });

    it("should get the appropriate optional schema for an identifier", () => {
        const identifierUtil = new IdentifierUtil(testOptionalArguments);
        const result = identifierUtil.getForIdentifier(testArgumentOptionalString.identifiers[0]);

        expect(result).to.deep.eq(testArgumentOptionalString);
    });

    it("should throw an error if no valid identifier was provided", () => {
        const identifierUtil = new IdentifierUtil(testOptionalArguments);

        expect(() => identifierUtil.getForIdentifier("not an identifier")).to.throw();
    })
});

describe('ArgumentParser Test', () => {
    describe("Parse Explicit Number Of Arguments", () => {
        it("should parse values even if only a subset of the optional schemas were supplied with values", () => {
            const parser = new ArgumentParser(testRequiredArguments, testOptionalArguments);
            const result = parser.parse(["abc", "--number", "1"]);

            expect(result.length).to.eq(2);

            const resultReqArg = result[0];
            expect(resultReqArg.schema).to.deep.eq(testArgumentRequired);
            expect(resultReqArg.values.length).to.eq(1);
            expect(resultReqArg.values).to.deep.eq(["abc"]);

            const resultOptArg = result[1];
            expect(resultOptArg.schema).to.deep.eq(testArgumentOptionalNumber);
            expect(resultOptArg.values.length).to.eq(1);
            expect(resultOptArg.values).to.deep.eq(["1"]);
        });

        it("should parse values with more than one resulting value", () => {
            const parser = new ArgumentParser(testRequiredArguments, testOptionalArguments);
            const result = parser.parse(["abc", "--string", "string", "string", "string", "-n", "number"]);

            expect(result.length).to.eq(3);

            const resultReqArg = result[0];
            expect(resultReqArg.schema).to.deep.eq(testArgumentRequired);
            expect(resultReqArg.values.length).to.eq(1);
            expect(resultReqArg.values).to.deep.eq(["abc"]);

            const resultOptArg1 = result[1];
            expect(resultOptArg1.schema).to.deep.eq(testArgumentOptionalString);
            expect(resultOptArg1.values.length).to.eq(3);
            expect(resultOptArg1.values).to.deep.eq(["string", "string", "string"]);

            const resultOptArg2 = result[2];
            expect(resultOptArg2.schema).to.deep.eq(testArgumentOptionalNumber);
            expect(resultOptArg2.values.length).to.eq(1);
            expect(resultOptArg2.values).to.deep.eq(["number"]);
        });

        it("should parse more than one value for a schema if the values for an optional schema are supplied in between", () => {
            const anotherTestRequiredArgumentBuilder = argumentSchema("xyz").argumentsLength(2);
            const anotherTestRequiredArgument = anotherTestRequiredArgumentBuilder.build();

            const parser = new ArgumentParser([anotherTestRequiredArgument], testOptionalArguments);
            const result = parser.parse(["abc", "-n", "number", "cde"]);

            expect(result.length).to.eq(2);

            const resultReqArg = result[0];
            expect(resultReqArg.schema).to.deep.eq(anotherTestRequiredArgument);
            expect(resultReqArg.values.length).to.eq(2);
            expect(resultReqArg.values).to.deep.eq(["abc", "cde"]);

            const resultOptArg = result[1];
            expect(resultOptArg.schema).to.deep.eq(testArgumentOptionalNumber);
            expect(resultOptArg.values.length).to.eq(1);
            expect(resultOptArg.values).to.deep.eq(["number"]);
        });

        it("should parse optional schemas only", () => {
            const parser = new ArgumentParser([], testOptionalArguments);
            const result = parser.parse(["--string", "string", "string", "string"]);

            expect(result.length).to.eq(1);

            const resultOptArg = result[0];
            expect(resultOptArg.schema).to.deep.eq(testArgumentOptionalString);
            expect(resultOptArg.values.length).to.eq(3);
            expect(resultOptArg.values).to.deep.eq(["string", "string", "string"])
        });

        it("should do nothing if no input arguments were given and if no schemas were given", () => {
            const parser = new ArgumentParser([], testOptionalArguments);
            const result = parser.parse([]);

            expect(result.length).to.eq(0);
        });

        it("should throw an error if all schemas are filled but there is still non identifier tokens remaining", () => {
            const parser = new ArgumentParser(testRequiredArguments, testOptionalArguments);

            expect(() => parser.parse(["valid_token", "invalid_token"])).to.throw()
        });

        it("should throw an error if too many arguments were supplied to a schema", () => {
            const parser = new ArgumentParser(testRequiredArguments, testOptionalArguments);

            expect(() => parser.parse(["too", "many", "arguments"])).to.throw()
        });

        it("should throw an error if too many arguments were supplied to an optional schema", () => {
            const parser = new ArgumentParser(testRequiredArguments, testOptionalArguments);

            expect(() => parser.parse(["abc", "-n", "1", "2"])).to.throw()
        });

        it("should throw an error if too few arguments were supplied to an optional schema", () => {
            const parser = new ArgumentParser(testRequiredArguments, testOptionalArguments);

            expect(() => parser.parse(["abc", "-n"])).to.throw();
        });
    });

    describe("Parse Ambiguous Number Of Arguments", () => {
        it("should parse ambiguous number of arguments (all or one) for a schema", () => {
            const reqArgs: ArgumentSchema[] = [testArgumentRequiredAmbiguousAllOrOne];
            const optArgs: OptionalArgumentSchema[] = [];
            const parser = new ArgumentParser(reqArgs, optArgs);

            const result = parser.parse(["argumentSchema", "argumentSchema", "argumentSchema", "argumentSchema"]);
            expect(result.length).to.eq(1);

            const resultReqArg = result[0];
            expect(resultReqArg.schema).to.deep.eq(testArgumentRequiredAmbiguousAllOrOne);
            expect(resultReqArg.values).to.deep.eq(["argumentSchema", "argumentSchema", "argumentSchema", "argumentSchema"]);

            expect(() => parser.parse([])).to.throw();
            expect(() => parser.parse(["argumentSchema"])).to.not.throw();
        });

        it("should parse ambiguous number of arguments (all or default) for a schema", () => {
            const reqArgs: ArgumentSchema[] = [testArgumentRequiredAmbiguousAllOrDefault];
            const optArgs: OptionalArgumentSchema[] = [];
            const parser = new ArgumentParser(reqArgs, optArgs);

            const result = parser.parse(["argument", "argument", "argument", "argument"]);
            expect(result.length).to.eq(1);

            const resultReqArg = result[0];
            expect(resultReqArg.values).to.deep.eq(["argument", "argument", "argument", "argument"]);

            const anotherResult = parser.parse(["argument", "argument"]);
            expect(result.length).to.eq(1);

            const anotherResultReqArg = anotherResult[0];
            expect(anotherResultReqArg.values).to.deep.eq(["argument", "argument"]);
        });

        it("should return the default value of a schema if the length of supplied arguments is 0", () => {
            const reqArgs: ArgumentSchema[] = [testArgumentRequiredAmbiguousAllOrDefault];
            const optArgs: OptionalArgumentSchema[] = [];
            const parser = new ArgumentParser(reqArgs, optArgs);

            const result = parser.parse([]);
            expect(result.length).to.eq(1);

            const resultReqArg = result[0];
            expect(resultReqArg.values).to.eq(testArgumentRequiredAmbiguousAllOrDefault.defaultValue);
        });

        it("should return the default value of multiple schemas if the length of supplied arguments is 0", () => {
            const reqArgs: ArgumentSchema[] = [testArgumentRequiredAmbiguousAllOrDefault, testArgumentRequiredAmbiguousAllOrDefault];
            const optArgs: OptionalArgumentSchema[] = [];
            const parser = new ArgumentParser(reqArgs, optArgs);

            const result = parser.parse([]);
            expect(result.length).to.eq(2);

            const resultReqArg = result[0];
            expect(resultReqArg.values).to.eq(testArgumentRequiredAmbiguousAllOrDefault.defaultValue);

            const anotherResultReqArg = result[1];
            expect(anotherResultReqArg.values).to.eq(testArgumentRequiredAmbiguousAllOrDefault.defaultValue);
        });

        it("should parse ambiguous number of arguments (all or one) for a optional schema", () => {
            const reqArgs: ArgumentSchema[] = [];
            const optArgs: OptionalArgumentSchema[] = [testArgumentOptionalAmbiguousAllOrOne];
            const parser = new ArgumentParser(reqArgs, optArgs);

            const result = parser.parse(["--string", "string", "string", "string", "string"]);
            expect(result.length).to.eq(1);

            const resultOptArg = result[0];
            expect(resultOptArg.schema).to.deep.eq(testArgumentOptionalAmbiguousAllOrOne);
            expect(resultOptArg.values.length).to.eq(4);
            expect(resultOptArg.values).to.deep.eq(["string", "string", "string", "string"]);

            expect(() => parser.parse([])).to.not.throw();
            expect(() => parser.parse(["--string"])).to.throw();
            expect(() => parser.parse(["--string", "string"])).to.not.throw();
        });

        it("should parse ambiguous number of arguments (all or default) for a optional argumentSchema", () => {
            const reqArgs: ArgumentSchema[] = [];
            const optArgs: OptionalArgumentSchema[] = [testArgumentOptionalAmbiguousAllOrDefault];
            const parser = new ArgumentParser(reqArgs, optArgs);

            const result = parser.parse(["--number", "1", "2", "3", "4"]);
            expect(result.length).to.eq(1);

            const resultOptArg = result[0];
            expect(resultOptArg.schema).to.deep.eq(testArgumentOptionalAmbiguousAllOrDefault);
            expect(resultOptArg.values.length).to.eq(4);
            expect(resultOptArg.values).to.deep.eq(["1", "2", "3", "4"]);

            const anotherResult = parser.parse(["--number"]);
            expect(result.length).to.eq(1);

            const resultOptArg1 = anotherResult[0];
            expect(resultOptArg1.schema).to.deep.eq(testArgumentOptionalAmbiguousAllOrDefault);
            expect(resultOptArg1.values.length).to.eq(0);

            const anotherAnotherResult = parser.parse([]);

            expect(anotherAnotherResult.length).to.eq(0);
            expect(anotherAnotherResult.values.length).to.eq(0);
        });

        it("should parse ambiguous number of arguments for required arguments", () => {
            const reqArgs: ArgumentSchema[] = [testArgumentRequiredAmbiguousAllOrDefault, testArgumentRequiredAmbiguousAllOrOne];
            const reqArgsIncorrectOrder: ArgumentSchema[] = [testArgumentRequiredAmbiguousAllOrOne, testArgumentRequiredAmbiguousAllOrDefault];
            const optArgs: OptionalArgumentSchema[] = [testArgumentOptionalAmbiguousAllOrDefault, testArgumentOptionalAmbiguousAllOrOne];
            const parser = new ArgumentParser(reqArgs, optArgs);
            const anotherParser = new ArgumentParser(reqArgsIncorrectOrder, optArgs);

            const result = parser.parse(["argumentSchema", "argumentSchema", "argumentSchema"]);
            expect(result.length).to.eq(1);

            const resultReqArg = result[0];
            expect(resultReqArg.schema).to.eq(testArgumentRequiredAmbiguousAllOrDefault);
            expect(resultReqArg.values.length).to.eq(3);
            expect(resultReqArg.values).to.deep.eq(["argumentSchema", "argumentSchema", "argumentSchema"]);

            expect(() => anotherParser.parse([])).to.throw();
            expect(() => anotherParser.parse(["argumentSchema"])).to.not.throw();
        });

        it("should parse ambiguous number of arguments for optional arguments", () => {
            const reqArgs: ArgumentSchema[] = [];
            const optArgs: OptionalArgumentSchema[] = [testArgumentOptionalAmbiguousAllOrDefault, testArgumentOptionalAmbiguousAllOrOne];
            const parser = new ArgumentParser(reqArgs, optArgs);

            const result = parser.parse(["--string", "string", "string", "string", "--number", "number", "number", "number"]);
            expect(result.length).to.eq(2);

            const resultOptArg1 = result[0];
            expect(resultOptArg1.schema).to.deep.eq(testArgumentOptionalAmbiguousAllOrOne);
            expect(resultOptArg1.values.length).to.eq(3);
            expect(resultOptArg1.values).to.deep.eq(["string", "string", "string"]);

            const resultOptArg2 = result[1];
            expect(resultOptArg2.schema).to.deep.eq(testArgumentOptionalAmbiguousAllOrDefault);
            expect(resultOptArg2.values.length).to.eq(3);
            expect(resultOptArg2.values).to.deep.eq(["number", "number", "number"])
        });

        it("should parse ambiguous number of arguments", () => {
            const reqArgs: ArgumentSchema[] = [testArgumentRequiredAmbiguousAllOrOne, testArgumentRequiredAmbiguousAllOrDefault];
            const optArgs: OptionalArgumentSchema[] = [testArgumentOptionalAmbiguousAllOrOne, testArgumentOptionalAmbiguousAllOrDefault];
            const parser = new ArgumentParser(reqArgs, optArgs);

            const result = parser.parse(["argument", "argument", "--string", "string", "string", "--number"]);
            expect(result.length).to.eq(3);

            const resultReqArg = result[0];
            expect(resultReqArg.schema).to.deep.eq(testArgumentRequiredAmbiguousAllOrOne);
            expect(resultReqArg.values.length).to.eq(2);
            expect(resultReqArg.values).to.deep.eq(["argument", "argument"]);

            const resultOptArg1 = result[1];
            expect(resultOptArg1.schema).to.deep.eq(testArgumentOptionalAmbiguousAllOrOne);
            expect(resultOptArg1.values.length).to.eq(2);
            expect(resultOptArg1.values).to.deep.eq(["string", "string"]);


            const resultOptArg2 = result[2];
            expect(resultOptArg2.schema).to.deep.eq(testArgumentOptionalAmbiguousAllOrDefault);
            expect(resultOptArg2.values.length).to.eq(0);
        });
    });
});