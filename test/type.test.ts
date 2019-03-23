import * as chai from "chai";
import {NumberValueType} from "../src/dcommander/validation/argumentValue/valueType/number.value.type";
import {StringValueType} from "../src/dcommander/validation/argumentValue/valueType/string.value.type";
import {ObjectValueType} from "../src/dcommander/validation/argumentValue/valueType/object.value.type";
import {BooleanValueType} from "../src/dcommander/validation/argumentValue/valueType/boolean.value.type";

const expect = chai.expect;

describe("ValueType Test", () => {
    describe("NumberValueType Test", () => {
        it("should be true if a value is a valid number", () => {
            const type = new NumberValueType();
            expect(type.is("1")).to.be.true;
            expect(type.is("19a")).to.be.false;
            expect(type.is("abc")).to.be.false;
            expect(type.is("0x12")).to.be.true;
        });

        it("should convert to a valid number", () => {
            const type = new NumberValueType();
            expect(type.convertValue("1")).to.eq(1);
            expect(type.convertValue("1234")).to.eq(1234);
            expect(type.convertValue("0x12")).to.eq(18);
            expect(() => type.convertValue("a")).to.throw();
        });
    });

    describe("StringValueType Test", () => {
        it("should be true if a value is a valid string", () => {
            const type = new StringValueType();
            expect(type.is("discord is spying on you right now")).to.be.true;
            expect(type.is("1")).to.be.true;
        });

        it("should convert to a valid string", () => {
            const type = new StringValueType();
            expect(type.convertValue("discord is spying on you right now")).to.eq("discord is spying on you right now");
        });
    });

    describe("BooleanValueType Test", () => {
        it("should be true if a value is a valid symbol that could point to a boolean expression", () => {
            const type = new BooleanValueType();
            expect(type.is("true")).to.be.true;
            expect(type.is("1")).to.be.true;
            expect(type.is("y")).to.be.true;
            expect(type.is("yes")).to.be.true;
            expect(type.is("false")).to.be.true;
            expect(type.is("0")).to.be.true;
            expect(type.is("n")).to.be.true;
            expect(type.is("no")).to.be.true;
        });

        it("should convert any value to the same as before", () => {
            const type = new BooleanValueType();
            expect(type.convertValue("true")).to.be.true;
            expect(type.convertValue("1")).to.be.true;
            expect(type.convertValue("y")).to.be.true;
            expect(type.convertValue("yes")).to.be.true;
            expect(type.convertValue("false")).to.be.false;
            expect(type.convertValue("0")).to.be.false;
            expect(type.convertValue("n")).to.be.false;
            expect(type.convertValue("no")).to.be.false;
        });
    });

    describe("ObjectValueType Test", () => {
        it("should be true for an object", () => {
            const type = new ObjectValueType();
            expect(type.is("{}")).to.be.true;
            expect(type.is("{ \"a\": \"1\", \"b\": \"2\" }")).to.be.true;
            expect(type.is("[1, 2, 3]")).to.be.true;
            expect(type.is("1")).to.be.true;
            expect(type.is("a string")).to.be.false;
        });

        it("should convert any valid JSON to an object", () => {
            const type = new ObjectValueType();
            expect(type.convertValue("{ \"foo\": true, \"bar\": 1 }")).to.deep.eq({ foo: true, bar: 1});
            expect(type.convertValue("{}")).to.deep.eq({});
            expect(type.convertValue("[1, 2, 3]")).to.deep.eq([1, 2, 3]);
            expect(type.convertValue("1")).to.eq(1);
            expect(() => type.convertValue("a string")).to.throw();
        })
    });
});