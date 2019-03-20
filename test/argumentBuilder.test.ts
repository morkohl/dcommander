import * as chai from 'chai';
import {ArgumentBuilder} from "../src/dcommander/builder/argument/argument.builder";
import {ARGUMENTS_LENGTH} from "../src/dcommander/argument/argument.schema";
import argument = ArgumentBuilder.argument;
import ArgumentSchemaBuilder = ArgumentBuilder.ArgumentSchemaBuilder;
import {ValueValidationInfo} from "../src/dcommander/validation/argumentValue/validation.valueInfo";
import {StringValueType} from "../src/dcommander/validation/argumentValue/valueType/string.value.type";
import {NumberValueType} from "../src/dcommander/validation/argumentValue/valueType/number.value.type";
import {ObjectValueType} from "../src/dcommander/validation/argumentValue/valueType/object.value.type";
import {BooleanValueType} from "../src/dcommander/validation/argumentValue/valueType/boolean.value.type";

const expect = chai.expect;

const testArgumentName = "testArgumentName";

const defaultArgumentsLength = 0;
const defaultValueValidationInfo: ValueValidationInfo = { valueRules: [], valueType: new StringValueType() };

let builder: ArgumentSchemaBuilder;

describe("ArgumentSchemaBuilder Test", () => {
    beforeEach(() => {
        builder = argument(testArgumentName);
    });

    it("should build a schema", () => {
        expect(() => builder.build()).to.not.throw();
        expect(builder.build().info.name).to.eq(testArgumentName);
    });

    it("should build with the argument info of a schema", () => {
        const testDescription = "test";
        const testUsage = "test";

        const result = builder.description(testDescription).usage(testUsage).build();

        expect(result.info.description).to.eq(testDescription);
        expect(result.info.usage).to.eq(testUsage);
    });

    it("should build with proposed amount of arguments of a schema", () => {
        const testArgumentsLength = ARGUMENTS_LENGTH.ALL_OR_DEFAULT;

        const result = builder.argumentsLength(testArgumentsLength).build();

        expect(result.argumentsLength).to.eq(testArgumentsLength);
    });

    it("should build with a default ValueValidationInfo and ArgumentsLength if no other option was chosen", () => {
        const result = builder.build();

        expect(result.argumentsLength).to.eq(defaultArgumentsLength);
        expect(result.valueValidationInfo).to.deep.eq(defaultValueValidationInfo);
    });

    describe("Building With ValueValidationInfo", () => {
        it("should build with a ValueValidationInfo with a StiringValueType if any was chosen", () => {
            const result = builder.any().build();

            expect(result.valueValidationInfo.valueType).to.be.an.instanceOf(StringValueType);
            expect(result.valueValidationInfo.valueRules).to.deep.eq([]);
        });

        it("should build with a ValueValidationInfo with a StringValueType if string() was chosen", () => {
            const result = builder.string(stringBuilder => stringBuilder).build();

            expect(result.valueValidationInfo.valueType).to.be.an.instanceOf(StringValueType);
            expect(result.valueValidationInfo.valueRules).to.deep.eq([]);
        });

        it("should build with a ValueValidationInfo with a NumberValueType if number() was chosen", () => {
            const result = builder.number(numberBuilder => numberBuilder).build();

            expect(result.valueValidationInfo.valueType).to.be.an.instanceOf(NumberValueType);
            expect(result.valueValidationInfo.valueRules).to.deep.eq([]);
        });

        it("should build with a ValueValidationInfo with a BooleanBuilder if boolean() was chosen", () => {
            const result = builder.boolean(booleanBuilder => booleanBuilder).build();

            expect(result.valueValidationInfo.valueType).to.be.an.instanceOf(BooleanValueType);
            expect(result.valueValidationInfo.valueRules).to.deep.eq([]);
        });

        it("should build with a ValueValidationInfo with a NumberValueType if object() was chosen", () => {
            const result = builder.object(objectBuilder => objectBuilder).build();

            expect(result.valueValidationInfo.valueType).to.be.an.instanceOf(ObjectValueType);
            expect(result.valueValidationInfo.valueRules).to.deep.eq([]);
        });
    })
});