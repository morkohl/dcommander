import * as chai from 'chai';
import {ArgumentBuilders} from "../src/dcommander/builder/argument/argumentBuilders";
import {ArgumentParser, IdentifierUtil} from "../src/dcommander/service/parser/argumentParser";
import {AMBIGUITIES} from "../src/dcommander/argument/argumentSchema";
import argumentSchema = ArgumentBuilders.argumentSchema;

const expect = chai.expect;

const argSchema = ArgumentBuilders.argumentSchema;
const optArgSchema = ArgumentBuilders.optionalArgumentSchema;

const reqArg1 = argSchema("reqTestArg1")
    .string()
    .build();

const reqArg2 = argSchema("reqTestArg2")
    .string()
    .argumentsLength(2)
    .build();

const reqArg3 = argSchema("reqTestArg3")
    .argumentsLength(AMBIGUITIES.AT_LEAST_ONE)
    .build();

const reqArg4 = argSchema("reqTestArg4")
    .argumentsLength(AMBIGUITIES.ALL_OR_DEFAULT)
    .default("default value")
    .build();

const optArg1 = optArgSchema("optTestArg1")
    .identifiers("--number", "-n")
    .number()
    .build();

const optArg2 = optArgSchema("optTestArg2")
    .identifiers("--string", "-s")
    .argumentsLength(2)
    .string()
    .build();

const optArg3 = optArgSchema("optTestArg3")
    .identifiers("--number", "-n")
    .number()
    .argumentsLength(AMBIGUITIES.AT_LEAST_ONE)
    .build();

const optArg4 = optArgSchema("optTestArg4")
    .argumentsLength(AMBIGUITIES.ALL_OR_DEFAULT)
    .default("default value")
    .identifiers("--string", "-s")
    .build();

const reqArgsNumeric = [reqArg1, reqArg2];
const optArgsNumeric = [optArg1, optArg2];

describe("IdentifierUtil Test", () => {
    const identifierUtil = new IdentifierUtil(optArgsNumeric);

    it("should detect an identifier", () => {
        const result = identifierUtil.isIdentifier(optArg1.identifiers[0]);

        expect(result).to.be.true;
    });

    it("should not detect an invalid identifier", () => {
        const result = identifierUtil.isIdentifier("not an identifier");

        expect(result).to.be.false;
    });

    it("should get the appropriate optional schema for an identifier", () => {
        const result = identifierUtil.getForIdentifier(optArg1.identifiers[0]);

        expect(result).to.deep.eq(optArg1);
    });

    it("should throw an error if no valid identifier was provided", () => {
        expect(() => identifierUtil.getForIdentifier("not an identifier")).to.throw();
    })
});

describe('ArgumentParser Test', () => {
    let parser: ArgumentParser;

    it("should do nothing if no schemas and no arguments were supplied", () => {
        parser = new ArgumentParser([], []);

        const parseResult = parser.parse([]);

        expect(parseResult.length).to.eq(0);
    });

    it("should do nothing if no arguments and no required schemas were supplied", () => {
        parser = new ArgumentParser([], optArgsNumeric);

        const parseResult = parser.parse([]);

        expect(parseResult.length).to.eq(0);
    });


    it("should parse a required schema", () => {
        parser = new ArgumentParser([reqArg1],[]);

        const parseResult = parser.parse(["string"]);

        expect(parseResult.length).to.eq(1);

        expect(parseResult[0].schema).to.deep.eq(reqArg1);
        expect(parseResult[0].values).to.deep.eq(["string"]);
        expect(parseResult[0].excludeValidation).to.be.false;
    });

    it("should parse only those optional schemas of which the identifiers were supplied", () => {
        parser = new ArgumentParser([], optArgsNumeric);

        const parseResult = parser.parse(["--number", "1"]);
        const parseResultOtherIdentifier = parser.parse(["-n", "1"]);

        expect(parseResult.length).to.eq(1);
        expect(parseResult).to.deep.eq(parseResultOtherIdentifier);

        expect(parseResult[0].schema).to.deep.eq(optArg1);
        expect(parseResult[0].values).to.deep.eq([1]);
        expect(parseResult[0].excludeValidation).to.be.false;
    });

    it("should not parse duplicates", () => {
        parser = new ArgumentParser([], [optArg1]);

        expect(() => parser.parse(["--number", "1", "--number", "2"])).to.throw();
    });

    it("should parse duplicates if the allowDuplicate flag is set for that schema", () => {
        const optArg5 = optArgSchema("optTestArg5")
            .identifiers("--string", "-s")
            .allowDuplicates()
            .build();

        parser = new ArgumentParser([], [optArg5]);

        let parseResult = parser.parse(["--string", "1", "-s", "2"]);

        expect(parseResult.length).to.eq(2);

        expect(parseResult[0].schema).to.deep.eq(optArg5);
        expect(parseResult[0].values).to.deep.eq(["1"]);
        expect(parseResult[0].excludeValidation).to.be.false;

        expect(parseResult[1].schema).to.deep.eq(optArg5);
        expect(parseResult[1].values).to.deep.eq(["2"]);
        expect(parseResult[1].excludeValidation).to.be.false;
    });

    it("should parse flags", () => {
        const flagSchema = optArgSchema("flagSchema").identifiers("--flag").flag().build();

        parser = new ArgumentParser([], [flagSchema]);

        const parseResult = parser.parse(["--flag"]);

        expect(parseResult.length).to.eq(1);

        expect(parseResult[0].schema).to.eq(flagSchema);
        expect(parseResult[0].values).to.be.true;
        expect(parseResult[0].excludeValidation).to.be.true;

        expect(() => parser.parse(["--flag", "argument"])).to.throw();
    });

    describe("Parse Explicit ArgumentsLength", () => {

        it("should parse arguments of a schema with an arguments length of more than one", () => {
            parser = new ArgumentParser([reqArg2], [optArg2]);

            const parseResult = parser.parse(["string", "string", "--string", "string", "string"]);

            expect(parseResult.length).to.eq(2);

            expect(parseResult[0].schema).to.deep.eq(optArg2);
            expect(parseResult[0].values).to.deep.eq(["string", "string"]);
            expect(parseResult[0].excludeValidation).to.be.false;

            expect(parseResult[1].schema).to.deep.eq(reqArg2);
            expect(parseResult[1].values).to.deep.eq(["string", "string"]);
            expect(parseResult[1].excludeValidation).to.be.false;
        });

        it("should parse more than one value for a schema if the values for an optional schema are supplied in between", () => {
            parser = new ArgumentParser([reqArg2], [optArg1]);

            const parseResult = parser.parse(["string", "-n", "1", "string"]);

            expect(parseResult.length).to.eq(2);

            expect(parseResult[0].schema).to.deep.eq(optArg1);
            expect(parseResult[0].values).to.deep.eq([1]);
            expect(parseResult[0].excludeValidation).to.be.false;

            expect(parseResult[1].schema).to.deep.eq(reqArg2);
            expect(parseResult[1].values).to.deep.eq(["string", "string"]);
            expect(parseResult[1].excludeValidation).to.be.false;
        });

        it("should throw an error if too many arguments were supplied", () => {
            parser = new ArgumentParser(reqArgsNumeric, optArgsNumeric);

            expect(() => parser.parse(["way", "too", "many", "arguments"])).to.throw();
            expect(() => parser.parse(["string", "-n", "1", "2"])).to.throw();
        });

        it("should throw an error if too few arguments", () => {
            parser = new ArgumentParser(reqArgsNumeric, optArgsNumeric);

            expect(() => parser.parse(["string", "-n"])).to.throw();
        });
    });

    describe("Parse Ambiguous ArgumentsLength", () => {
        it("should not be able to detect wether an argument is supposed to be filled unless the next token is a new identifier", () => {
            parser = new ArgumentParser([reqArg3], [optArg4]);

            let parseResult = parser.parse(["requiredArgument", "requiredArgument", "--string", "optionalArgument", "optionalArgument", "requiredArgument"]);

            expect(parseResult.length).to.eq(2);

            expect(parseResult[0].schema).to.deep.eq(reqArg3);
            expect(parseResult[0].values).to.deep.eq(["requiredArgument", "requiredArgument"]);
            expect(parseResult[0].excludeValidation).to.be.false;

            expect(parseResult[1].schema).to.deep.eq(optArg4);
            expect(parseResult[1].values).to.deep.eq(["optionalArgument", "optionalArgument", "requiredArgument"]);
            expect(parseResult[1].excludeValidation).to.be.false;
        });

        describe("At Least One", () => {
            before(() => {
                parser = new ArgumentParser([reqArg3], [optArg3]);
            });


            it("should parse at least one argument", () => {
                let parseResult = parser.parse(["requiredArgument"]);

                expect(parseResult.length).to.eq(1);

                expect(parseResult[0].schema).to.deep.eq(reqArg3);
                expect(parseResult[0].values).to.deep.eq(["requiredArgument"]);
                expect(parseResult[0].excludeValidation).to.be.false;

                const parserExcludedRequireds = new ArgumentParser([], [optArg3]);

                parseResult = parserExcludedRequireds.parse(["--number", "1"]);

                expect(parseResult.length).to.eq(1);

                expect(parseResult[0].schema).to.deep.eq(optArg3);
                expect(parseResult[0].values).to.deep.eq([1]);
                expect(parseResult[0].excludeValidation).to.be.false;
            });

            it("should parse as many arguments as possible", () => {
                let parseResult = parser.parse(["requiredArgument","requiredArgument","requiredArgument","requiredArgument", "requiredArgument"]);

                expect(parseResult.length).to.eq(1);

                expect(parseResult[0].schema).to.deep.eq(reqArg3);
                expect(parseResult[0].values).to.deep.eq(["requiredArgument","requiredArgument","requiredArgument","requiredArgument", "requiredArgument"]);
                expect(parseResult[0].excludeValidation).to.be.false;

                const parserExcludedRequired = new ArgumentParser([], [optArg3]);

                parseResult = parserExcludedRequired.parse(["--number", "1", "2", "3", "4", "5"]);

                expect(parseResult.length).to.eq(1);

                expect(parseResult[0].schema).to.deep.eq(optArg3);
                expect(parseResult[0].values).to.deep.eq([1, 2, 3, 4, 5]);
                expect(parseResult[0].excludeValidation).to.be.false;
            });

            it("should throw an error if no arguments were supplied", () => {
                expect(() => parser.parse([])).to.throw();
                expect(() => parser.parse(["requiredArgument", "--number"])).to.throw();
            })
        });

        describe("All Or Default", () => {
            before(() => {
                parser = new ArgumentParser([reqArg4], [optArg4]);
            });

            it("should parse as many arguments as possible", () => {
                let parseResult = parser.parse(["requiredArgument", "requiredArgument", "-s", "optionalArgument", "optionalArgument", "optionalArgument", "optionalArgument"]);

                expect(parseResult.length).to.eq(2);

                expect(parseResult[0].schema).to.eq(reqArg4);
                expect(parseResult[0].values).to.deep.eq(["requiredArgument", "requiredArgument"]);
                expect(parseResult[0].excludeValidation).to.be.false;

                expect(parseResult[1].schema).to.eq(optArg4);
                expect(parseResult[1].values).to.deep.eq(["optionalArgument", "optionalArgument", "optionalArgument", "optionalArgument"]);
                expect(parseResult[1].excludeValidation).to.be.false;
            });

            it("should return the defaultValue of the schema if no arguments were supplied", () => {
                let parseResult = parser.parse([]);

                expect(parseResult.length).to.equal(1);

                expect(parseResult[0].schema).to.eq(reqArg4);
                expect(parseResult[0].values).to.eq(reqArg4.valueInfo.defaultValue);
                expect(parseResult[0].excludeValidation).to.be.true;

                parseResult = parser.parse(["--string"]);

                expect(parseResult.length).to.eq(2);

                expect(parseResult[0].schema).to.eq(reqArg4);
                expect(parseResult[0].values).to.eq(reqArg4.valueInfo.defaultValue);
                expect(parseResult[0].excludeValidation).to.be.true;

                expect(parseResult[1].schema).to.eq(optArg4);
                expect(parseResult[1].values).to.eq(optArg4.valueInfo.defaultValue);
                expect(parseResult[1].excludeValidation).to.be.true;
            });

            it("should return the default value of all required schemas that had no arguments supplied", () => {
                const reqArg5 = argumentSchema("reqTestArg5")
                    .argumentsLength(AMBIGUITIES.ALL_OR_DEFAULT)
                    .default("default value")
                    .build();
                parser = new ArgumentParser([reqArg4, reqArg5], [optArg4]);

                let parseResult = parser.parse([]);

                expect(parseResult.length).to.eq(2);

                expect(parseResult[0].schema).to.eq(reqArg4);
                expect(parseResult[0].values).to.eq(reqArg4.valueInfo.defaultValue);
                expect(parseResult[0].excludeValidation).to.be.true;

                expect(parseResult[1].schema).to.eq(reqArg5);
                expect(parseResult[1].values).to.eq(reqArg5.valueInfo.defaultValue);
                expect(parseResult[1].excludeValidation).to.be.true;
            })
        });
    });
});