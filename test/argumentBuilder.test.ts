import * as chai from 'chai';
import {ArgumentBuilders} from "../src/dcommander/builder/argument/argumentBuilders";
import {Types} from "../src/dcommander/argument/value/types";
import {AMBIGUITIES} from "../src/dcommander/argument/argumentSchema";

const expect = chai.expect;

const testArgumentName = "testArgumentName";

describe("ArgumentBuilders Test", () => {
    describe("ArgumentBuilder Test", () => {
        let builder: ArgumentBuilders.ArgumentBuilder;

        beforeEach(() => {
            builder = ArgumentBuilders.argument(testArgumentName);
        });

        it("should build an argument schema", () => {
            expect(() => builder.build()).to.not.throw();
            expect(builder.build().argumentInfo.name).to.eq(testArgumentName);
        });

        it("should build with argument info", () => {
            const testDescription = "test";
            const testUsage = "test";

            const result = builder.description(testDescription).usage(testUsage).build();

            expect(result.argumentInfo.description).to.eq(testDescription);
            expect(result.argumentInfo.usage).to.eq(testUsage);
        });

        it("should build with proposed amount of arguments of an argument", () => {
            const testArgumentsLength = AMBIGUITIES.ALL_OR_DEFAULT;

            const result = builder.argumentsLength(testArgumentsLength).build();

            expect(result.valueInfo.argumentsLength).to.eq(testArgumentsLength);
        });

        it("should build with empty matchers and ArgumentsLength if no other option was chosen", () => {
            const result = builder.build();

            expect(result.valueInfo.argumentsLength).to.eq(1);
            expect(result.validationMatchers).to.deep.eq([]);
        });

        it("should build with a SanitizationFunction", () => {
            const sanitizationFunction = (value: any) => value * 5;
            const result = builder.sanitization(sanitizationFunction).build();

            expect(result.sanitization).to.eq(sanitizationFunction);
        });

        describe("Building With Matchers and Types", () => {
            it("should build with a StringValueType if any() was chosen", () => {
                const result = builder.any().build();

                expect(result.valueInfo.valueType).to.be.an.instanceOf(Types.StringValueType);
                expect(result.validationMatchers).to.deep.eq([]);
            });

            it("should build with a StringValueType if string() was chosen", () => {
                const result = builder.string(stringBuilder => stringBuilder).build();

                expect(result.valueInfo.valueType).to.be.an.instanceOf(Types.StringValueType);
                expect(result.validationMatchers).to.deep.eq([]);
            });

            it("should build with a NumberValueType if number() was chosen", () => {
                const result = builder.number(numberBuilder => numberBuilder).build();

                expect(result.valueInfo.valueType).to.be.an.instanceOf(Types.NumberValueType);
                expect(result.validationMatchers).to.deep.eq([]);
            });

            it("should build with a BooleanValueType if boolean() was chosen", () => {
                const result = builder.boolean(booleanBuilder => booleanBuilder).build();

                expect(result.valueInfo.valueType).to.be.an.instanceOf(Types.BooleanValueType);
                expect(result.validationMatchers).to.deep.eq([]);
            });

            it("should build with a ObjectValueType if object() was chosen", () => {
                const result = builder.object(objectBuilder => objectBuilder).build();

                expect(result.valueInfo.valueType).to.be.an.instanceOf(Types.ObjectValueType);
                expect(result.validationMatchers).to.deep.eq([]);
            });

            it("should build with a DateValueType if date() was chosen", () => {
                const result = builder.date(dateBuilder => dateBuilder).build();

                expect(result.valueInfo.valueType).to.be.an.instanceOf(Types.DateValueType);
                expect(result.validationMatchers).to.deep.eq([]);
            });

            it("should build with matchers", () => {
                const result = builder.string(stringBuilder => stringBuilder.email().url()).build();

                expect(result.validationMatchers.length).to.eq(2);
            })
        })
    });

    describe("OptionalArgumentBuilder Test", () => {
        let builder: ArgumentBuilders.OptionalArgumentBuilder;

        const testIdentifiers = ["--testArgumentName", "-t"];

        beforeEach(() => {
            builder = ArgumentBuilders.optionalArgument(testArgumentName);
        });

        it("should build an optional argument _schema", () => {
            const result = builder.build();

            expect(result.argumentInfo.name).to.eq(testArgumentName);
            expect(result.identifiers).to.deep.eq(testIdentifiers);
        });

        it("should build with identifiers if supplied", () => {
            const someOtherIdentifiers = ["testArgumentIdentifier", "shortTestArgumentIdentifier"];
            builder = builder.identifiers(...someOtherIdentifiers);

            const result = builder.build();

            expect(result.identifiers).to.deep.eq(someOtherIdentifiers);
        });

        it("should build with identifiers with the prefixes of supplied options", () => {
            builder = ArgumentBuilders.optionalArgument(testArgumentName, { defaultIdentifierPrefix: '!!', defaultIdentifierShortPrefix: '!'});

            const result = builder.build();

            expect(result.argumentInfo.name).to.eq(testArgumentName);
            expect(result.identifiers).to.deep.eq(['!!testArgumentName', '!t']);
        });

        it("should build with the allowDuplicates flag if chosen", () => {
            builder = ArgumentBuilders.optionalArgument(testArgumentName).allowDuplicates();

            const result = builder.build();

            expect(result.allowDuplicates).to.be.true;
        });

        it("should build with a flag value if chosen", () => {
            const result = builder.flag(true).build();

            expect(result.flag).to.be.true;

            builder = ArgumentBuilders.optionalArgument(testArgumentName).flag(false);

            const andAnotherResult = builder.build();

            expect(andAnotherResult.flag).to.be.false;
        });

        it("should build with a flag even if no value was chosen", () => {
            const result = builder.flag().build();

            expect(result.flag).to.be.true;
        });

        it("should build with a default value if chosen", () => {
            const testDefaultValue = "testDefaultValue";

            const result = builder.default(testDefaultValue).build();

            expect(result.valueInfo.defaultValue).to.eq(testDefaultValue);
        })
    })
});