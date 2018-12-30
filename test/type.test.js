"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var chai = __importStar(require("chai"));
var boolean_1 = require("../lib/argument/argumentSchemaBuilder/typeBuilder/type/boolean");
var number_1 = require("../lib/argument/argumentSchemaBuilder/typeBuilder/type/number");
var string_1 = require("../lib/argument/argumentSchemaBuilder/typeBuilder/type/string");
var expect = chai.expect;
describe('Type Test', function () {
    describe('Boolean Type', function () {
        it('should be true if a value is a valid boolean', function () {
            var type = new boolean_1.BooleanType();
            expect(type.is(true)).to.eq(true);
            expect(type.is(false)).to.eq(true);
            expect(type.is('1')).to.eq(true);
            expect(type.is('0')).to.eq(true);
            expect(type.is('y')).to.eq(true);
            expect(type.is('Y')).to.eq(true);
            expect(type.is('n')).to.eq(true);
            expect(type.is('N')).to.eq(true);
            expect(type.is('yes')).to.eq(true);
            expect(type.is('yEs')).to.eq(true);
            expect(type.is('YES')).to.eq(true);
            expect(type.is('no')).to.eq(true);
            expect(type.is('nO')).to.eq(true);
            expect(type.is('NO')).to.eq(true);
            expect(type.is(1)).to.eq(true);
            expect(type.is(2)).to.eq(false);
            expect(type.is('I am false')).to.eq(false);
        });
        it('should transform to a valid boolean', function () {
            var type = new boolean_1.BooleanType();
            expect(type.transform(true)).to.eq(true);
            expect(type.transform('true')).to.eq(true);
            expect(type.transform('1')).to.eq(true);
            expect(type.transform('y')).to.eq(true);
            expect(type.transform('Y')).to.eq(true);
            expect(type.transform('yes')).to.eq(true);
            expect(type.transform('Yes')).to.eq(true);
            expect(type.transform(false)).to.eq(false);
            expect(type.transform('false')).to.eq(false);
            expect(type.transform('0')).to.eq(false);
            expect(type.transform('n')).to.eq(false);
            expect(type.transform('N')).to.eq(false);
            expect(type.transform('no')).to.eq(false);
            expect(type.transform('No')).to.eq(false);
        });
    });
    describe('Number Type', function () {
        it('should be true if a value is a valid number', function () {
            var type = new number_1.NumberType();
            expect(type.is(1)).to.eq(true);
            expect(type.is('1')).to.eq(true);
            expect(type.is('19a')).to.eq(false);
            expect(type.is('abc')).to.eq(false);
        });
        it('should transform to a valid number', function () {
            var type = new number_1.NumberType();
            expect(type.transform(1)).to.eq(1);
            expect(type.transform('1')).to.eq(1);
            expect(type.transform('1234')).to.eq(1234);
            expect(type.transform('a')).to.throw;
        });
    });
    describe('String Type', function () {
        it('should be true if a value is a valid string', function () {
            var type = new string_1.StringType();
            expect(type.is('discord is spying on you right now')).to.eq(true);
            expect(type.is('b')).to.eq(true);
            expect(type.is(1)).to.eq(false);
            expect(type.is(true)).to.eq(false);
            expect(type.is({})).to.eq(false);
        });
        it('should transform to a valid string', function () {
            var type = new string_1.StringType();
            expect(type.transform(1)).to.eq('1');
            expect(type.transform('1')).to.eq('1');
        });
    });
});
