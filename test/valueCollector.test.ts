import * as chai from 'chai';
import {FlagValueCollector, ValueCollector} from "../src/dcommander/argument/value/collector";
import {OptionalArgSchemaSpec, RequiredArgSchemaSpec} from "./spec/argumentSchema.spec";
import {AMBIGUITIES} from "../src/dcommander/argument/argumentSchema";
import {ArgumentBuilders} from "../src/dcommander/builder/argument/argumentBuilders";

const expect = chai.expect;

describe("ValueCollectors Test", () => {
    describe("ValueCollector Test", () => {
        it("should collect a value", () => {
            const valueCollector = new ValueCollector(RequiredArgSchemaSpec.requiredArgumentSchema);

            expect(valueCollector.values.length).to.eq(0);

            valueCollector.collect("test");

            expect(valueCollector.values.length).to.eq(1);
            expect(valueCollector.values[0]).to.eq("test");
        });

        it("should calculate wether an ValueCollector is empty", () => {
            const valueCollector = new ValueCollector(RequiredArgSchemaSpec.requiredArgumentSchema);

            expect(valueCollector.isEmpty()).to.be.true;

            valueCollector.collect("test");

            expect(valueCollector.isEmpty()).to.be.false;
        });

        it("should calculate wether an ValueCollector is full", () => {
            const valueCollector = new ValueCollector(RequiredArgSchemaSpec.requiredArgumentSchema);
            valueCollector.collect("test");

            expect(valueCollector.isFull()).to.be.true;

            const anotherValueCollector = new ValueCollector(RequiredArgSchemaSpec.requiredArgumentSchema);
            anotherValueCollector.setFilled();

            expect(anotherValueCollector.isFull()).to.be.true;

            const aThirdValueHolder = new ValueCollector(RequiredArgSchemaSpec.requiredArgumentSchema);

            expect(aThirdValueHolder.isFull()).to.be.false;
        });

        it("should throw an error if a ValueCollector is full but still collecting arguments", () => {
            const valueCollector = new ValueCollector(RequiredArgSchemaSpec.requiredArgumentSchema);
            expect(() => valueCollector.collect("test")).to.not.throw();

            expect(valueCollector.isFull()).to.be.true;

            expect(() => valueCollector.collect("test")).to.throw();
        });

        it("should return wether the number of arguments of a schema of a ValueCollector are ambiguous", () => {
            const ambiguousValueHolder = new ValueCollector(OptionalArgSchemaSpec.optionalArgumentSchemaAmbiguousAtLeastOne);

            expect(ambiguousValueHolder.isAmbiguous()).to.be.true;
        });

        it("should return wether the number of arguments of a schema of a ValueCollector is a specific ambiguous token", () => {
            const ambiguousValueHolder = new ValueCollector(OptionalArgSchemaSpec.optionalArgumentSchemaAmbiguousAtLeastOne);

            expect(ambiguousValueHolder.isSpecificAmbiguous(AMBIGUITIES.AT_LEAST_ONE)).to.be.true;
            expect(ambiguousValueHolder.isSpecificAmbiguous(AMBIGUITIES.ALL_OR_DEFAULT)).to.be.false;

            const anotherAmbiguousValueCollector = new ValueCollector(OptionalArgSchemaSpec.optionalArgumentSchemaAmbiguousAllOrDefault);

            expect(anotherAmbiguousValueCollector.isSpecificAmbiguous(AMBIGUITIES.ALL_OR_DEFAULT)).to.be.true;
            expect(anotherAmbiguousValueCollector.isSpecificAmbiguous(AMBIGUITIES.AT_LEAST_ONE)).to.be.false;
        });

        const schemaWithType = ArgumentBuilders.argumentSchema("number")
            .default(42)
            .argumentsLength(AMBIGUITIES.ALL_OR_DEFAULT)
            .number(numberBuilder => numberBuilder)
            .build();

        it("should return a ParsedArgument", () => {
            const valueCollector = new ValueCollector(schemaWithType);
            valueCollector.collect("5");
            valueCollector.collect("10");
            valueCollector.collect("15");

            const parsedArgument = valueCollector.getResult();

            expect(parsedArgument.values).to.deep.eq([5, 10, 15]);
            expect(parsedArgument.schema).to.deep.eq(schemaWithType);
            expect(parsedArgument.excludeFromValidationAndSanitization).to.be.false;
        });

        it("should return the default value of a schema if it exists and the values length supplied equals 0", () => {
            const valueCollector = new ValueCollector(schemaWithType);

            const parsedArgument = valueCollector.getResult();

            expect(parsedArgument.schema).to.deep.eq(schemaWithType);
            expect(parsedArgument.values).to.eq(42);
            expect(parsedArgument.excludeFromValidationAndSanitization).to.be.true;
        });

        it("should throw an error if a provided value cannot be converted", () => {
            const valueCollector = new ValueCollector(schemaWithType);
            expect(() => valueCollector.collect("not a number")).to.throw();
        })
    });

    describe("FlagValueCollector Test", () => {
        it("should collect a value", () => {
            const valueCollector = new FlagValueCollector(OptionalArgSchemaSpec.optionalArgumentSchema);

            expect(valueCollector.values.length).to.eq(0);

            valueCollector.collect("test");

            expect(valueCollector.values.length).to.eq(1);
            expect(valueCollector.values[0]).to.eq("test");
        });

        it("should return the flag value of a schema as the value of the parsed argument", () => {
            let valueCollector = new FlagValueCollector(OptionalArgSchemaSpec.optionalArgumentSchemaIsFlag);

            let parsedArgument = valueCollector.getResult();

            expect(parsedArgument.schema).to.deep.eq(OptionalArgSchemaSpec.optionalArgumentSchemaIsFlag);
            expect(parsedArgument.values).to.be.true;
            expect(parsedArgument.excludeFromValidationAndSanitization).to.be.true;

            let anotherFlagSchema = OptionalArgSchemaSpec.expandableOptionalArgumentSchema.flag(false).build();
            valueCollector = new FlagValueCollector(anotherFlagSchema);

            parsedArgument = valueCollector.getResult();

            expect(parsedArgument.schema).to.deep.eq(anotherFlagSchema);
            expect(parsedArgument.values).to.be.false;
            expect(parsedArgument.excludeFromValidationAndSanitization).to.be.true;
        });
    });
});