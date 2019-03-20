import * as chai from 'chai';
import {ArgumentBuilder} from "../src/dcommander/builder/argument/argument.builder";
import {ARGUMENTS_LENGTH,} from "../src/dcommander/argument/argument.schema";
import argument = ArgumentBuilder.argumentSchema;
import ArgumentSchemaBuilder = ArgumentBuilder.ArgumentSchemaBuilder;
import {ValueValidationInfo} from "../src/dcommander/validation/argumentValue/validation.valueInfo";
import {StringValueType} from "../src/dcommander/validation/argumentValue/valueType/string.value.type";
import {NumberValueType} from "../src/dcommander/validation/argumentValue/valueType/number.value.type";
import {ObjectValueType} from "../src/dcommander/validation/argumentValue/valueType/object.value.type";
import {BooleanValueType} from "../src/dcommander/validation/argumentValue/valueType/boolean.value.type";
import OptionalArgumentSchemaBuilder = ArgumentBuilder.OptionalArgumentSchemaBuilder;
import optionalArgumentSchema = ArgumentBuilder.optionalArgumentSchema;

const expect = chai.expect;

const testArgumentName = "testArgumentName";

const defaultArgumentsLength = 1;
const defaultValueValidationInfo: ValueValidationInfo = { valueRules: [], valueType: new StringValueType() };


describe("ArgumentSchemaBuilder Test", () => {
    let builder: ArgumentSchemaBuilder;

    beforeEach(() => {
        builder = argument(testArgumentName);
    });

    it("should build an argumentSchema _schema", () => {
        expect(() => builder.build()).to.not.throw();
        expect(builder.build().info.name).to.eq(testArgumentName);
    });

    it("should build with the argumentSchema info of an argumentSchema _schema", () => {
        const testDescription = "test";
        const testUsage = "test";

        const result = builder.description(testDescription).usage(testUsage).build();

        expect(result.info.description).to.eq(testDescription);
        expect(result.info.usage).to.eq(testUsage);
    });

    it("should build with proposed amount of arguments of an argumentSchema _schema", () => {
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

describe("OptionalArgumentSchemaBuilder Test", () => {
    let builder: OptionalArgumentSchemaBuilder;

    const testIdentifiers = ["--testArgumentName", "-t"];

    it("should build an optional argumentSchema _schema", () => {
        builder = optionalArgumentSchema(testArgumentName);

        const result = builder.build();

        expect(result.info.name).to.eq(testArgumentName);
        expect(result.identifiers).to.deep.eq(testIdentifiers);
    });

    it("should build with identifiers if supplied", () => {
        const someOtherIdentifiers = ["testArgumentIdentifier", "shortTestArgumentIdentifier"];
        builder = optionalArgumentSchema(testArgumentName).identifiers(someOtherIdentifiers);

        const result = builder.build();

        expect(result.identifiers).to.deep.eq(someOtherIdentifiers);
    });

    it("should build with identifiers with the prefixes of supplied options", () => {
       builder = optionalArgumentSchema(testArgumentName, { defaultIdentifierPrefix: '!!', defaultIdentifierShortPrefix: '!'});

       const result = builder.build();

       expect(result.info.name).to.eq(testArgumentName);
       expect(result.identifiers).to.deep.eq(['!!testArgumentName', '!t']);

       builder = optionalArgumentSchema(testArgumentName, undefined, )
    });

    it("should build with a flag value if chosen", () => {
        builder = optionalArgumentSchema(testArgumentName).flag(true);

        const result = builder.build();

        expect(result.flag).to.be.true;

        builder = optionalArgumentSchema(testArgumentName).flag();

        const anotherResult = builder.build();

        expect(anotherResult.flag).to.be.true;

        builder = optionalArgumentSchema(testArgumentName).flag(false);

        const andAnotherResult = builder.build();

        expect(andAnotherResult.flag).to.be.false;
    });

    it("should build with a default value if chosen", () => {
        const testDefaultValue = "testDefaultValue";
        builder = optionalArgumentSchema(testArgumentName).default(testDefaultValue);

       const result = builder.build();

       expect(result.defaultValue).to.eq(testDefaultValue);
    })
});