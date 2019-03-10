import * as chai from "chai";
import {NumberType} from "../src/argument/schema/type/numberType";
import {StringType} from "../src/argument/schema/type/stringType";
import {AnyType} from "../src/argument/schema/type/anyType";

const expect = chai.expect;

describe("Type Test", () => {
    describe("Number Type", () => {
        it("should be true if a value is a valid number", () => {
            const type = new NumberType();
            expect(type.is(1)).to.be.true;
            expect(type.is("1")).to.be.true;
            expect(type.is("19a")).to.be.false;
            expect(type.is("abc")).to.be.false;
        });

        it("should transform to a valid number", () => {
            const type = new NumberType();
            expect(type.transform(1)).to.eq(1);
            expect(type.transform("1")).to.eq(1);
            expect(type.transform("1234")).to.eq(1234);
            expect(type.transform("a")).to.throw;
        });
    });

    describe("String Type", () => {
        it("should be true if a value is a valid string", () => {
            const type = new StringType();
            expect(type.is("discord is spying on you right now")).to.be.true;
            expect(type.is("b")).to.be.true;
            expect(type.is(1)).to.be.false;
            expect(type.is(true)).to.be.false;
            expect(type.is({})).to.be.false;
        });

        it("should transform to a valid string", () => {
            const type = new StringType();
            expect(type.transform(1)).to.eq("1");
            expect(type.transform("1")).to.eq("1");
        });
    });
    
    describe("Any Type", () => {
        it("should be true for any value", () => {
           const type = new AnyType();
           expect(type.is({})).to.be.true;
           expect(type.is("abc")).to.be.true;
           expect(type.is(123)).to.be.true
        });
        
        it("should transform any value to the same as before", () => {
            const type = new AnyType();
            expect(type.transform({})).to.deep.eq({});
            expect(type.transform("abc")).to.eq("abc");
            expect(type.transform(123)).to.eq(123);
        });
    })
});