import * as chai from 'chai';
import {ArgumentBuilder} from "../src/dcommander/builder/argument/argument.builder";
import {ARGUMENTS_LENGTH} from "../src/dcommander/argument/argument.schema";
import {ArgumentValueHolder} from "../src/dcommander/service/parser/argument.parser";
import optionalArgumentSchema = ArgumentBuilder.optionalArgumentSchema;
import argumentSchema = ArgumentBuilder.argumentSchema;

const expect = chai.expect;

const testArgumentBuilderRequired = argumentSchema("xyz");
const testArgumentRequired = testArgumentBuilderRequired.build();

const testArgumentBuilderOptionalString = optionalArgumentSchema("string", )
    .identifiers(["--string", "-s"])
    .argumentsLength(ARGUMENTS_LENGTH.AT_LEAST_ONE);

const testArgumentOptionalString = testArgumentBuilderOptionalString.build();

const testArgumentBuilderOptionalNumber = optionalArgumentSchema("number", )
    .identifiers(["--number", "-n"])
    .argumentsLength(ARGUMENTS_LENGTH.ALL_OR_DEFAULT);

const testArgumentOptionalNumber = testArgumentBuilderOptionalNumber.build();

describe('ArgumentValueHolder Test', () => {
    it("should add a value to an existing ArgumentValueHolder", () => {
        const valueHolder = new ArgumentValueHolder(testArgumentRequired);

        expect(valueHolder.values.length).to.eq(0);

        valueHolder.addValue("test");

        expect(valueHolder.values.length).to.eq(1);
        expect(valueHolder.values[0]).to.eq("test");
    });

    it("should calculate wether a valueHolder is full", () => {
        const valueHolder = new ArgumentValueHolder(testArgumentRequired);
        valueHolder.addValue("test");

        expect(valueHolder.isFull()).to.be.true;

        const anotherValueHolder = new ArgumentValueHolder(testArgumentRequired);
        anotherValueHolder.setFilled();

        expect(anotherValueHolder.isFull()).to.be.true;

        const aThirdValueHolder = new ArgumentValueHolder(testArgumentRequired);

        expect(aThirdValueHolder.isFull()).to.be.false;
    });

    it("should return wether the number of arguments of a schema of a value holder are ambiguous", () => {
        const ambiguousValueHolder = new ArgumentValueHolder(testArgumentOptionalString);

        expect(ambiguousValueHolder.isAmbiguous()).to.be.true;
    });

    it("should return wether the number of arguments of a schema of a value holder is a specific ambiguous token", () => {
        const ambiguousValueHolder = new ArgumentValueHolder(testArgumentOptionalString);

        expect(ambiguousValueHolder.isSpecificAmbiguous(ARGUMENTS_LENGTH.AT_LEAST_ONE)).to.be.true;
        expect(ambiguousValueHolder.isSpecificAmbiguous(ARGUMENTS_LENGTH.ALL_OR_DEFAULT)).to.be.false;

        const anotherAmbiguousValueHolder = new ArgumentValueHolder(testArgumentOptionalNumber);

        expect(anotherAmbiguousValueHolder.isSpecificAmbiguous(ARGUMENTS_LENGTH.ALL_OR_DEFAULT)).to.be.true;
        expect(anotherAmbiguousValueHolder.isSpecificAmbiguous(ARGUMENTS_LENGTH.AT_LEAST_ONE)).to.be.false;
    })
});
