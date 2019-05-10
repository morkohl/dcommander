import * as chai from 'chai';
import {ArgumentParser, IdentifierUtil} from "../src/dcommander/service/parser/argumentParser";
import {AMBIGUITIES} from "../src/dcommander/argument/argumentSchema";
import {OptionalArgSchemaSpec, RequiredArgSchemaSpec} from "./spec/argumentSchema.spec";
import {Errors} from "../src/dcommander/error/errors";

const expect = chai.expect;

const reqArgsNumeric = [RequiredArgSchemaSpec.requiredArgumentSchema, RequiredArgSchemaSpec.requiredArgumentSchemaTwoArguments];
const optArgsNumeric = [OptionalArgSchemaSpec.optionalArgumentSchema, OptionalArgSchemaSpec.optionalArgumentSchemaTwoArguments];


describe("ArgumentParser Test", () => {
    describe("IdentifierUtil Test", () => {
        const identifierUtil = new IdentifierUtil(optArgsNumeric);

        it("should detect an identifier", () => {
            const result = identifierUtil.isIdentifier(OptionalArgSchemaSpec.optionalArgumentSchema.identifiers[0]);

            expect(result).to.be.true;
        });

        it("should not detect an invalid identifier", () => {
            const result = identifierUtil.isIdentifier("not an identifier");

            expect(result).to.be.false;
        });

        it("should get the appropriate optional schema for an identifier", () => {
            const schema = OptionalArgSchemaSpec.optionalArgumentSchema;
            const result = identifierUtil.getForIdentifier(schema.identifiers[0]);

            expect(result).to.deep.eq(schema);
        });

        it("should throw an error if no valid identifier was provided", () => {
            expect(() => identifierUtil.getForIdentifier("not an identifier")).to.throw(Error);
        })
    });

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
        const schema = RequiredArgSchemaSpec.requiredArgumentSchema;
        parser = new ArgumentParser([schema], []);

        const parseResult = parser.parse(["string"]);

        expect(parseResult.length).to.eq(1);

        expect(parseResult[0].schema).to.deep.eq(schema);
        expect(parseResult[0].values).to.deep.eq(["string"]);
        expect(parseResult[0].excludeFromValidationAndSanitization).to.be.false;
    });

    it("should parse only those optional schemas of which the identifiers were supplied", () => {
        const schema = OptionalArgSchemaSpec.optionalArgumentSchemaNumber;
        parser = new ArgumentParser([], [schema]);

        const parseResult = parser.parse(["--number", "1"]);
        const parseResultOtherIdentifier = parser.parse(["-n", "1"]);

        expect(parseResult.length).to.eq(1);
        expect(parseResult).to.deep.eq(parseResultOtherIdentifier);

        expect(parseResult[0].schema).to.deep.eq(schema);
        expect(parseResult[0].values).to.deep.eq([1]);
        expect(parseResult[0].excludeFromValidationAndSanitization).to.be.false;
    });

    it("should not parse duplicates", () => {
        parser = new ArgumentParser([], [OptionalArgSchemaSpec.optionalArgumentSchemaNumber]);

        expect(() => parser.parse(["--number", "1", "--number", "2"])).to.throw(Errors.ParseError);
    });


    it("should parse duplicates if the allowDuplicate flag is set for that schema", () => {
        const schema = OptionalArgSchemaSpec.optionalArgSchemaWithDuplicates;
        parser = new ArgumentParser([], [schema]);

        let parseResult = parser.parse(["--dup", "1", "--dup", "2"]);

        expect(parseResult.length).to.eq(1);

        expect(parseResult[0].schema).to.deep.eq(schema);
        expect(parseResult[0].values).to.deep.eq(["1", "2"]);
        expect(parseResult[0].excludeFromValidationAndSanitization).to.be.false;
    });

    it("should parse flags", () => {
        const schema = OptionalArgSchemaSpec.optionalArgumentSchemaIsFlag;

        parser = new ArgumentParser([], [schema]);

        const parseResult = parser.parse(["--flag"]);

        expect(parseResult.length).to.eq(1);

        expect(parseResult[0].schema).to.eq(schema);
        expect(parseResult[0].values).to.be.true;
        expect(parseResult[0].excludeFromValidationAndSanitization).to.be.true;

        expect(() => parser.parse(["--flag", "argument"])).to.throw(Errors.ParseError);
    });

    describe("Parse Explicit ArgumentsLength", () => {

        it("should parse arguments of a schema with an arguments length of more than one", () => {
            const schema = RequiredArgSchemaSpec.requiredArgumentSchemaTwoArguments;
            const optionalSchema = OptionalArgSchemaSpec.optionalArgumentSchemaTwoArguments;

            parser = new ArgumentParser([schema], [optionalSchema]);

            const parseResult = parser.parse(["string", "string", "--opt2", "string", "string"]);

            expect(parseResult.length).to.eq(2);

            expect(parseResult[0].schema).to.deep.eq(optionalSchema);
            expect(parseResult[0].values).to.deep.eq(["string", "string"]);
            expect(parseResult[0].excludeFromValidationAndSanitization).to.be.false;

            expect(parseResult[1].schema).to.deep.eq(schema);
            expect(parseResult[1].values).to.deep.eq(["string", "string"]);
            expect(parseResult[1].excludeFromValidationAndSanitization).to.be.false;
        });

        it("should parse more than one value for a schema if the values for an optional schema are supplied in between", () => {
            const schema = RequiredArgSchemaSpec.requiredArgumentSchemaTwoArguments;
            const optionalSchema = OptionalArgSchemaSpec.optionalArgumentSchema;
            parser = new ArgumentParser([schema], [optionalSchema]);

            const parseResult = parser.parse(["string", "-o", "1", "string"]);

            expect(parseResult.length).to.eq(2);

            expect(parseResult[0].schema).to.deep.eq(optionalSchema);
            expect(parseResult[0].values).to.deep.eq(["1"]);
            expect(parseResult[0].excludeFromValidationAndSanitization).to.be.false;

            expect(parseResult[1].schema).to.deep.eq(schema);
            expect(parseResult[1].values).to.deep.eq(["string", "string"]);
            expect(parseResult[1].excludeFromValidationAndSanitization).to.be.false;
        });

        it("should throw an error if too many arguments were supplied", () => {
            parser = new ArgumentParser(reqArgsNumeric, optArgsNumeric);

            expect(() => parser.parse(["way", "too", "many", "arguments"])).to.throw(Errors.ParseError);
            expect(() => parser.parse(["string", "-o", "1", "2"])).to.throw(Errors.ParseError);
        });

        it("should throw an error if too few arguments", () => {
            parser = new ArgumentParser(reqArgsNumeric, optArgsNumeric);

            expect(() => parser.parse(["string", "--opt"])).to.throw(Errors.ParseError);
        });
    });

    describe("Parse Ambiguous ArgumentsLength", () => {
        it("should not be able to detect wether an argument is supposed to be filled unless the next token is a new identifier", () => {
            const schema = RequiredArgSchemaSpec.requiredArgumentSchemaAmbiguousAllOrDefault;
            const optionalSchema = OptionalArgSchemaSpec.optionalArgumentSchemaTwoArguments;
            parser = new ArgumentParser([schema], [optionalSchema]);

            let parseResult = parser.parse(["requiredArgument", "requiredArgument", "--opt2", "optionalArgument", "optionalArgument", "requiredArgument"]);

            expect(parseResult.length).to.eq(2);

            expect(parseResult[0].schema).to.deep.eq(optionalSchema);
            expect(parseResult[0].values).to.deep.eq(["optionalArgument", "optionalArgument"]);
            expect(parseResult[0].excludeFromValidationAndSanitization).to.be.false;

            expect(parseResult[1].schema).to.deep.eq(schema);
            expect(parseResult[1].values).to.deep.eq(["requiredArgument", "requiredArgument", "requiredArgument"]);
            expect(parseResult[1].excludeFromValidationAndSanitization).to.be.false;

        });

        describe("At Least One", () => {

            const schema = RequiredArgSchemaSpec.requiredArgumentSchemaAmbiguousAtLeastOne;
            const optionalSchema = OptionalArgSchemaSpec.optionalArgumentSchemaAmbiguousAtLeastOne;

            before(() => {
                parser = new ArgumentParser([schema], [optionalSchema]);
            });


            it("should parse at least one argument", () => {
                let parseResult = parser.parse(["requiredArgument"]);

                expect(parseResult.length).to.eq(1);

                expect(parseResult[0].schema).to.deep.eq(schema);
                expect(parseResult[0].values).to.deep.eq(["requiredArgument"]);
                expect(parseResult[0].excludeFromValidationAndSanitization).to.be.false;

                const parserExcludedRequireds = new ArgumentParser([], [optionalSchema]);

                parseResult = parserExcludedRequireds.parse(["--ambig2", "1"]);

                expect(parseResult.length).to.eq(1);

                expect(parseResult[0].schema).to.deep.eq(optionalSchema);
                expect(parseResult[0].values).to.deep.eq(["1"]);
                expect(parseResult[0].excludeFromValidationAndSanitization).to.be.false;
            });

            it("should parse as many arguments as possible", () => {
                let parseResult = parser.parse(["requiredArgument", "requiredArgument", "requiredArgument", "requiredArgument", "requiredArgument"]);

                expect(parseResult.length).to.eq(1);

                expect(parseResult[0].schema).to.deep.eq(schema);
                expect(parseResult[0].values).to.deep.eq(["requiredArgument", "requiredArgument", "requiredArgument", "requiredArgument", "requiredArgument"]);
                expect(parseResult[0].excludeFromValidationAndSanitization).to.be.false;

                const parserExcludedRequired = new ArgumentParser([], [optionalSchema]);

                parseResult = parserExcludedRequired.parse(["--ambig2", "1", "2", "3", "4", "5"]);

                expect(parseResult.length).to.eq(1);

                expect(parseResult[0].schema).to.deep.eq(optionalSchema);
                expect(parseResult[0].values).to.deep.eq(["1", "2", "3", "4", "5"]);
                expect(parseResult[0].excludeFromValidationAndSanitization).to.be.false;
            });

            it("should throw an error if no arguments were supplied", () => {
                expect(() => parser.parse([])).to.throw(Errors.ParseError);
                expect(() => parser.parse(["requiredArgument", "--ambig2"])).to.throw(Errors.ParseError);
            })
        });

        describe("All Or Default", () => {

            const schema = RequiredArgSchemaSpec.requiredArgumentSchemaAmbiguousAllOrDefault;
            const optionalSchema = OptionalArgSchemaSpec.optionalArgumentSchemaAmbiguousAllOrDefault;

            before(() => {
                parser = new ArgumentParser([schema], [optionalSchema]);
            });

            it("should parse as many arguments as possible", () => {
                let parseResult = parser.parse(["requiredArgument", "requiredArgument", "--ambig1", "optionalArgument", "optionalArgument", "optionalArgument", "optionalArgument"]);

                expect(parseResult.length).to.eq(2);

                expect(parseResult[0].schema).to.eq(schema);
                expect(parseResult[0].values).to.deep.eq(["requiredArgument", "requiredArgument"]);
                expect(parseResult[0].excludeFromValidationAndSanitization).to.be.false;

                expect(parseResult[1].schema).to.eq(optionalSchema);
                expect(parseResult[1].values).to.deep.eq(["optionalArgument", "optionalArgument", "optionalArgument", "optionalArgument"]);
                expect(parseResult[1].excludeFromValidationAndSanitization).to.be.false;
            });

            it("should return the defaultValue of the schema if no arguments were supplied", () => {
                let parseResult = parser.parse([]);

                expect(parseResult.length).to.equal(1);

                expect(parseResult[0].schema).to.eq(schema);
                expect(parseResult[0].values).to.eq(schema.valueInfo.defaultValue);
                expect(parseResult[0].excludeFromValidationAndSanitization).to.be.true;

                parseResult = parser.parse(["--ambig1"]);

                expect(parseResult.length).to.eq(2);

                expect(parseResult[0].schema).to.eq(schema);
                expect(parseResult[0].values).to.eq(schema.valueInfo.defaultValue);
                expect(parseResult[0].excludeFromValidationAndSanitization).to.be.true;

                expect(parseResult[1].schema).to.eq(optionalSchema);
                expect(parseResult[1].values).to.eq(optionalSchema.valueInfo.defaultValue);
                expect(parseResult[1].excludeFromValidationAndSanitization).to.be.true;
            });

            it("should return the default value of all required schemas that had no arguments supplied", () => {
                const schema2 = RequiredArgSchemaSpec.expandableRequiredArgumentSchema
                    .argumentsLength(AMBIGUITIES.ALL_OR_DEFAULT)
                    .default("default value")
                    .build();
                parser = new ArgumentParser([schema, schema2], [optionalSchema]);

                let parseResult = parser.parse([]);

                expect(parseResult.length).to.eq(2);

                expect(parseResult[0].schema).to.eq(schema);
                expect(parseResult[0].values).to.eq(schema.valueInfo.defaultValue);
                expect(parseResult[0].excludeFromValidationAndSanitization).to.be.true;

                expect(parseResult[1].schema).to.eq(schema2);
                expect(parseResult[1].values).to.eq(schema2.valueInfo.defaultValue);
                expect(parseResult[1].excludeFromValidationAndSanitization).to.be.true;
            })
        });
    });
});