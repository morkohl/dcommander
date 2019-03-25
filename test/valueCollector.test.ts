import * as chai from 'chai';
import {ArgumentBuilders} from "../src/dcommander/builder/argument/argumentBuilders";
import {ValueCollector} from "../src/dcommander/service/parser/argumentParser";
import {ARGUMENTS_LENGTH} from "../src/dcommander/argument/argumentSchema";

const expect = chai.expect;

const testArgumentRequiredNumeric = ArgumentBuilders.argumentSchema("requiredTestArgument1").build();

const testArgumentAmbiguousAtLeastOne = ArgumentBuilders.optionalArgumentSchema("optionalTestArgument1")
    .identifiers(["--string", "-s"])
    .argumentsLength(ARGUMENTS_LENGTH.AT_LEAST_ONE)
    .build();

const testArgumentAmbiguousAllOrDefault = ArgumentBuilders.optionalArgumentSchema("optionalTestArgument2")
    .identifiers(["--number", "-n"])
    .argumentsLength(ARGUMENTS_LENGTH.ALL_OR_DEFAULT)
    .build();

describe('ValueCollector Test', () => {
    it("should add a value to an existing ValueCollector", () => {
        const valueCollector = new ValueCollector(testArgumentRequiredNumeric);

        expect(valueCollector.values.length).to.eq(0);

        valueCollector.collect("test");

        expect(valueCollector.values.length).to.eq(1);
        expect(valueCollector.values[0]).to.eq("test");
    });

    it("should calculate wether an ValueCollector is empty", () => {
        const valueCollector = new ValueCollector(testArgumentRequiredNumeric);

        expect(valueCollector.isEmpty()).to.be.true;

        valueCollector.collect("test");

        expect(valueCollector.isEmpty()).to.be.false;
    });

    it("should calculate wether an ValueCollector is full", () => {
        const valueCollector = new ValueCollector(testArgumentRequiredNumeric);
        valueCollector.collect("test");

        expect(valueCollector.isFull()).to.be.true;

        const anotherValueCollector = new ValueCollector(testArgumentRequiredNumeric);
        anotherValueCollector.setFilled();

        expect(anotherValueCollector.isFull()).to.be.true;

        const aThirdValueHolder = new ValueCollector(testArgumentRequiredNumeric);

        expect(aThirdValueHolder.isFull()).to.be.false;
    });
    
    it("should throw an error if a ValueCollector is full but still collecting arguments", () => {
        const valueCollector = new ValueCollector(testArgumentRequiredNumeric);
        expect(() => valueCollector.collect("test")).to.not.throw();

        expect(valueCollector.isFull()).to.be.true;

        expect(() => valueCollector.collect("test")).to.throw();
    });

    it("should return wether the number of arguments of a schema of a ValueCollector are ambiguous", () => {
        const ambiguousValueHolder = new ValueCollector(testArgumentAmbiguousAtLeastOne);

        expect(ambiguousValueHolder.isAmbiguous()).to.be.true;
    });

    it("should return wether the number of arguments of a schema of a ValueCollector is a specific ambiguous token", () => {
        const ambiguousValueHolder = new ValueCollector(testArgumentAmbiguousAtLeastOne);

        expect(ambiguousValueHolder.isSpecificAmbiguous(ARGUMENTS_LENGTH.AT_LEAST_ONE)).to.be.true;
        expect(ambiguousValueHolder.isSpecificAmbiguous(ARGUMENTS_LENGTH.ALL_OR_DEFAULT)).to.be.false;

        const anotherAmbiguousValueCollector = new ValueCollector(testArgumentAmbiguousAllOrDefault);

        expect(anotherAmbiguousValueCollector.isSpecificAmbiguous(ARGUMENTS_LENGTH.ALL_OR_DEFAULT)).to.be.true;
        expect(anotherAmbiguousValueCollector.isSpecificAmbiguous(ARGUMENTS_LENGTH.AT_LEAST_ONE)).to.be.false;
    });

    const schemaWithType = ArgumentBuilders.argumentSchema("number")
        .default(42)
        .argumentsLength(ARGUMENTS_LENGTH.ALL_OR_DEFAULT)
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
        expect(parsedArgument.excludeValidation).to.be.false;
    });

    it("should return the defaultValue of a schema if it exists and the values length supplied equals 0", () => {
        const valueCollector = new ValueCollector(schemaWithType);

        const parsedArgument = valueCollector.getResult();

        expect(parsedArgument.schema).to.deep.eq(schemaWithType);
        expect(parsedArgument.values).to.eq(42);
        expect(parsedArgument.excludeValidation).to.be.true;
    });

    it("should return the flag value of a schema as the value of the parsed argument", () => {
        const schemaWithFlag = ArgumentBuilders.optionalArgumentSchema("number").flag().build();
        const valueCollector = new ValueCollector(schemaWithFlag);

        const parsedArgument = valueCollector.getResult();

        expect(parsedArgument.schema).to.deep.eq(schemaWithFlag);
        expect(parsedArgument.values).to.be.true;
        expect(parsedArgument.excludeValidation).to.be.true;
    });

    it("should throw an error if a provided value cannot be converted", () => {
       const valueCollector = new ValueCollector(schemaWithType);
       expect(() => valueCollector.collect("not a number")).to.throw();
    })
});
