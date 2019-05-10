import * as chai from "chai"
import {ArgumentMessageProcessor} from "../src/dcommander/argument/processor/processor";
import {OptionalArgSchemaSpec, RequiredArgSchemaSpec} from "./spec/argumentSchema.spec";
import {AMBIGUITIES} from "../src/dcommander/argument/argumentSchema";
import {Errors} from "../src/dcommander/error/errors";

const expect = chai.expect;

describe("ArgumentMessageProcessor Test", () => {
    it("should process a message", () => {
        const firstSchema = RequiredArgSchemaSpec.requiredArgumentSchema;
        const secondSchema = RequiredArgSchemaSpec.requiredArgumentSchemaAmbiguousAtLeastOne;

        const firstOptSchema = OptionalArgSchemaSpec.optionalArgumentSchema;
        const secondOptSchema = OptionalArgSchemaSpec.optionalArgumentSchemaTwoArguments;

        const schemas = [firstSchema, secondSchema];
        const optionalSchemas = [firstOptSchema, secondOptSchema];

        const argumentProcessor = new ArgumentMessageProcessor(schemas, optionalSchemas);

        const testMessageSegment = ["hello", "hello", "world"];

        const result = argumentProcessor.process(testMessageSegment);

        expect(result[firstSchema.argumentInfo.name]).to.not.be.undefined;
        expect(result[firstSchema.argumentInfo.name].values).to.deep.eq(["hello"]);

        expect(result[secondSchema.argumentInfo.name]).to.not.be.undefined;
        expect(result[secondSchema.argumentInfo.name].values).to.deep.eq(["hello", "world"]);

        expect(result[firstOptSchema.argumentInfo.name]).to.be.undefined;
        expect(result[secondOptSchema.argumentInfo.name]).to.be.undefined;
    });

    it("should merge the values of duplicates", () => {
        const duplicateSchema = OptionalArgSchemaSpec.optionalArgSchemaWithDuplicates;
        const optionalSchemas = [duplicateSchema];

        const argumentProcessor = new ArgumentMessageProcessor([], optionalSchemas);

        const testMessageSegment = [duplicateSchema.identifiers[0], "hello", duplicateSchema.identifiers[0], "world"];

        const result = argumentProcessor.process(testMessageSegment);

        expect(result[duplicateSchema.argumentInfo.name]).to.not.be.undefined;
        expect(result[duplicateSchema.argumentInfo.name].values).to.deep.eq(["hello", "world"]);
    });

    it("should merge the values of defaults", () => {
        const defaultSchema = OptionalArgSchemaSpec.expandableOptionalArgumentSchema
            .argumentsLength(AMBIGUITIES.ALL_OR_DEFAULT)
            .allowDuplicates()
            .default("test")
            .build();
        const optionalSchemas = [defaultSchema];

        const argumentProcessor = new ArgumentMessageProcessor([], optionalSchemas);

        const testMessageSegment = [defaultSchema.identifiers[0], defaultSchema.identifiers[0]];

        const result = argumentProcessor.process(testMessageSegment);

        expect(result[defaultSchema.argumentInfo.name]).to.not.be.undefined;
        expect(result[defaultSchema.argumentInfo.name].values).to.deep.eq([defaultSchema.valueInfo.defaultValue, defaultSchema.valueInfo.defaultValue]);
    });

    it("should not merge the values of flags", () => {
        const flagSchema = OptionalArgSchemaSpec.expandableOptionalArgumentSchema
            .flag()
            .allowDuplicates()
            .build();
        const optionalSchemas = [flagSchema];

        const argumentProcessor = new ArgumentMessageProcessor([], optionalSchemas);

        const testMessageSegment = [flagSchema.identifiers[0], flagSchema.identifiers[0]];

        const result = argumentProcessor.process(testMessageSegment);

        expect(result[flagSchema.argumentInfo.name]).to.not.be.undefined;
        expect(result[flagSchema.argumentInfo.name].values).to.deep.eq([flagSchema.flag, flagSchema.flag])
    });

    it("should throw a validation error", () => {
        const schemaWithMatchers = RequiredArgSchemaSpec.expandableRequiredArgumentSchema.number(
            numberBuilder => numberBuilder.max(10)
        ).build();

        const schemas = [schemaWithMatchers];

        const argumentMessageProcessor = new ArgumentMessageProcessor(schemas, []);

        const testMessageSegment = ["11"];

        expect(() => argumentMessageProcessor.process(testMessageSegment)).to.throw(Errors.ValidationError);
    });

    it("should throw a conversion error", () => {
        const schemas = [RequiredArgSchemaSpec.requiredArgumentSchemaNumber];

        const argumentMessageProcessor = new ArgumentMessageProcessor(schemas, []);

        const testMessageSegment = ["NaN"];

        expect(() => argumentMessageProcessor.process(testMessageSegment)).to.throw(Errors.ConversionError);
    });

    it("should throw a parsing error", () => {
        const schemas = [RequiredArgSchemaSpec.requiredArgumentSchemaTwoArguments];

        const argumentMessageProcessor = new ArgumentMessageProcessor(schemas, []);

        const testMessageSegment = ["too", "many", "arguments"];

        expect(() => argumentMessageProcessor.process(testMessageSegment)).to.throw(Errors.ParseError);
    });
});