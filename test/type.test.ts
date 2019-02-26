import * as chai from 'chai';
import {NumberType} from "../src/argument/schema/type/NumberType";
import {StringType} from "../src/argument/schema/type/StringType";

const expect = chai.expect;

describe('Type Test', () => {
    describe('Number Type', () => {
        it('should be true if a value is a valid number', () => {
            const type = new NumberType();
            expect(type.is(1)).to.eq(true);
            expect(type.is('1')).to.eq(true);
            expect(type.is('19a')).to.eq(false);
            expect(type.is('abc')).to.eq(false);
        });

        it('should transform to a valid number', () => {
            const type = new NumberType();
            expect(type.transform(1)).to.eq(1);
            expect(type.transform('1')).to.eq(1);
            expect(type.transform('1234')).to.eq(1234);
            expect(type.transform('a')).to.throw;
        });
    });

    describe('String Type', () => {
        it('should be true if a value is a valid string', () => {
            const type = new StringType();
            expect(type.is('discord is spying on you right now')).to.eq(true);
            expect(type.is('b')).to.eq(true);
            expect(type.is(1)).to.eq(false);
            expect(type.is(true)).to.eq(false);
            expect(type.is({})).to.eq(false);
        });

        it('should transform to a valid string', () => {
            const type = new StringType();
            expect(type.transform(1)).to.eq('1');
            expect(type.transform('1')).to.eq('1');
        });
    })
});