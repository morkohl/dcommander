import * as chai from 'chai';
import {
    StringValueValidationInfoBuilder,
    NumberValueValidationInfoBuilder,
    BooleanValueValidationInfoBuilder,
    ObjectValueValidationInfoBuilder, IPProtocolVersion
} from "../src/dcommander/builder/validation/validation.valueInfo.builder";
import {StringValueType} from "../src/dcommander/validation/argumentValue/valueType/string.value.type";
import {NumberValueType} from "../src/dcommander/validation/argumentValue/valueType/number.value.type";
import {BooleanValueType} from "../src/dcommander/validation/argumentValue/valueType/boolean.value.type";
import {ObjectValueType} from "../src/dcommander/validation/argumentValue/valueType/object.value.type";

const expect = chai.expect;

describe("ValueValidationInfoBuilder Test", () => {

    describe("StringValueValidationInfoBuilder Test", () => {
        let builder: StringValueValidationInfoBuilder;

        beforeEach(() => {
            builder = new StringValueValidationInfoBuilder();
        });

        it("should build with a StringValueType", () => {
            const result = builder.build();

            expect(result.valueType).to.be.an.instanceOf(StringValueType);
        });

        it("should add validation rules to the list of value rules", () => {
           const result = builder.email().ip(IPProtocolVersion.IPV6).regex(/[a-z]/).build();

           expect(result.valueRules.length).to.eq(3);
        });

        it("should throw if an incorrect IPProtocolVersion was supplied", () => {
            expect(() => builder.ip("invalidIpVersion")).to.throw();
        });
    });

    describe("NumberValueValidationInfoBuilder Test", () => {
        let builder: NumberValueValidationInfoBuilder;

        beforeEach(() => {
            builder = new NumberValueValidationInfoBuilder();
        });

        it("should build with a NumberValueType", () => {
            const result = builder.build();

            expect(result.valueType).to.be.an.instanceOf(NumberValueType)
        });

        it("should add validation rules to the list of value rules", () => {
            const result = builder.max(10).min(20).range(10, 20).build();

            expect(result.valueRules.length).to.eq(3);
        });
    });

    describe("BooleanValueValidationInfoBuilder Test", () => {
        let builder: BooleanValueValidationInfoBuilder;

        beforeEach(() => {
            builder = new BooleanValueValidationInfoBuilder();
        });

        it("should build with a BooleanValueType", () => {
            const result = builder.build();

            expect(result.valueType).to.be.an.instanceOf(BooleanValueType)
        });

        it("should add validation rules to the list of value rules", () => {
            const result = builder.false().build();

            expect(result.valueRules.length).to.eq(1);
        });
    });

    describe("ObjectValueValidationInfoBuilder Test", () => {
        let builder: ObjectValueValidationInfoBuilder;

        beforeEach(() => {
            builder = new ObjectValueValidationInfoBuilder();
        });

        it("should build with an ObjectValueType", () => {
            const result = builder.build();

            expect(result.valueType).to.be.an.instanceOf(ObjectValueType)
        });

        it("should add validation rules to the list of value rules", () => {
            const result = builder.includeProperty("testProperty").build();

            expect(result.valueRules.length).to.eq(1);
        });
    });
});
