import * as chai from 'chai';
import {argument, optionalArgument} from "../src/argument/schema/builder/argument";
import {OptionalArgumentSchema} from "../src/argument/schema/argumentSchema";
import {OptionalArgumentValueHolder, RequiredArgumentValueHolder} from "../src/argument/parser/argumentValueHolder";
import {NARGS} from "../src/argument/schema/builder/argumentBuilder";

const expect = chai.expect;

const testArgumentBuilderRequired = argument("xyz");
const testArgumentRequired = testArgumentBuilderRequired.build();

const testArgumentBuilderOptionalString = optionalArgument("string", ["--string", "-s"])
    .numberOfArguments("+")
    .string()
    .url();
const testArgumentOptionalString = <OptionalArgumentSchema>testArgumentBuilderOptionalString.build();

const testArgumentBuilderOptionalNumber = optionalArgument("number", ["--number", "-n"])
    .numberOfArguments("?")
    .number()
    .min(10)
    .max(20);
const testArgumentOptionalNumber = <OptionalArgumentSchema>testArgumentBuilderOptionalNumber.build();

describe('ArgumentValueHolder Test', () => {
    it("should add a value to an existing ArgumentValueHolder", () => {
        const valueHolder = new RequiredArgumentValueHolder(testArgumentRequired);

        expect(valueHolder.values.length).to.eq(0);

        valueHolder.addValue("test");

        expect(valueHolder.values.length).to.eq(1);
        expect(valueHolder.values[0]).to.eq("test");
    });

    it("should not add a value if an ArgumentValueHolder is full", () => {
        const valueHolder = new RequiredArgumentValueHolder(testArgumentRequired);

        valueHolder.addValue("test");

        expect(() => valueHolder.addValue("test")).to.throw();
    });

    it("should calculate wether a valueHolder is full", () => {
        const valueHolder = new RequiredArgumentValueHolder(testArgumentRequired);
        valueHolder.addValue("test");

        expect(valueHolder.isFull()).to.be.true;

        const anotherValueHolder = new RequiredArgumentValueHolder(testArgumentRequired);
        anotherValueHolder.setFilled();

        expect(anotherValueHolder.isFull()).to.be.true;

        const aThirdValueHolder = new RequiredArgumentValueHolder(testArgumentRequired);

        expect(aThirdValueHolder.isFull()).to.be.false;
    });

    it("should return wether the number of arguments of a schema of a value holder are ambiguous", () => {
        const ambiguousValueHolder = new OptionalArgumentValueHolder(testArgumentOptionalString);

        expect(ambiguousValueHolder.numberOfArgumentsAreAmbiguous()).to.be.true;
    });

    it("should return wether the number of arguments of a schema of a value holder is a specific ambiguous token", () => {
        const ambiguousValueHolder = new OptionalArgumentValueHolder(testArgumentOptionalString);

        expect(ambiguousValueHolder.numberOfArgumentsAreAmbiguousSpecific(NARGS.AT_LEAST_ONE)).to.be.true;
        expect(ambiguousValueHolder.numberOfArgumentsAreAmbiguousSpecific(NARGS.ALL_OR_DEFAULT)).to.be.false;

        const anotherAmbiguousValueHolder = new OptionalArgumentValueHolder(testArgumentOptionalNumber);

        expect(anotherAmbiguousValueHolder.numberOfArgumentsAreAmbiguousSpecific(NARGS.ALL_OR_DEFAULT)).to.be.true;
        expect(anotherAmbiguousValueHolder.numberOfArgumentsAreAmbiguousSpecific(NARGS.AT_LEAST_ONE)).to.be.false;
    })
});
