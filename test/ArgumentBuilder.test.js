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
var AnyBuilder_1 = require("../lib/argument/schema/type/builder/AnyBuilder");
var NumberBuilder_1 = require("../lib/argument/schema/type/builder/NumberBuilder");
var BooleanBuilder_1 = require("../lib/argument/schema/type/builder/BooleanBuilder");
var StringBuilder_1 = require("../lib/argument/schema/type/builder/StringBuilder");
var argument_1 = require("../lib/argument/schema/builder/argument");
var ArgumentSchemaBuilder_1 = require("../lib/argument/schema/builder/ArgumentSchemaBuilder");
var ArgumentSchema_1 = require("../lib/argument/schema/ArgumentSchema");
var expect = chai.expect;
var testArgumentName = "test";
describe('ArgumentSchema Test', function () {
    describe('Without types', function () {
        it('should have a set name', function () {
            var builder = argument_1.argument(testArgumentName);
            expect(builder.__schema.name).to.equal(testArgumentName);
        });
        it('should be set as optional', function () {
            var builder = argument_1.argument("test").optional();
            expect(builder.__schema.required).to.equal(false);
        });
        it('should set further defaults if optional was chosen and built', function () {
            var schema = argument_1.argument(testArgumentName).optional().__build();
            expect(schema.prefix).to.not.be.undefined;
            expect(schema.prefix).to.eq(ArgumentSchema_1.ARGUMENT_CONSTANTS.DEFAULT_PREFIX);
            expect(schema.aliases.length).to.eq(1);
            expect(schema.aliases[0]).to.eq(ArgumentSchema_1.ARGUMENT_CONSTANTS.DEFAULT_ALIAS + testArgumentName.charAt(0));
        });
        it('should not be a typebuilder type if no type was chosen', function () {
            var builder = argument_1.argument(testArgumentName).optional().prefix("s!");
            expect(builder).to.be.an.instanceOf(ArgumentSchemaBuilder_1.SchemaBuilder);
        });
        it('should be allowed to have multiple validators', function () {
            expect(argument_1.argument(testArgumentName).number().max(1).min(0).condition(function (value) { return value * 2 < 1; })).to.not.throw;
            expect(argument_1.argument(testArgumentName).number().max(1).min(0).condition(function (value) { return value * 2 < 1; }).__build().validators.length).to.equal(3);
        });
        it('should set sanitization', function () {
            var fn = function (value) { return 20; };
            var builder = argument_1.argument(testArgumentName).number().prefix('s!').sanitize(fn).__build();
            expect(builder.sanitize.toString()).to.eq(fn.toString());
        });
        it('should throw an error if a property gets set twice', function () {
            var build = function () {
                argument_1.argument(testArgumentName).number().max(1).max(2);
            };
            expect(build).to.throw();
        });
    });
    describe('Any type', function () {
        it('should be an any type builder', function () {
            var anyBuilder = argument_1.argument(testArgumentName).prefix().any();
            expect(anyBuilder).to.be.an.instanceOf(AnyBuilder_1.AnySchemaBuilder);
        });
        it('should still be a type builder after more options on __schema', function () {
            var anyBuilder = argument_1.argument(testArgumentName).prefix().any();
            expect(anyBuilder).to.be.an.instanceOf(AnyBuilder_1.AnySchemaBuilder);
        });
    });
    describe('Number type', function () {
        it('should be an any type builder', function () {
            var numberBuilder = argument_1.argument(testArgumentName).prefix().number();
            expect(numberBuilder).to.be.an.instanceOf(NumberBuilder_1.NumberSchemaBuilder);
        });
        it('should still be a type builder after more options on __schema', function () {
            var numberBuilder = argument_1.argument(testArgumentName).prefix().number().sanitize(function (value) { return value + 1; });
            expect(numberBuilder).to.be.an.instanceOf(NumberBuilder_1.NumberSchemaBuilder);
        });
    });
    describe('Boolean type', function () {
        it('should be an any type builder', function () {
            var booleanBuilder = argument_1.argument(testArgumentName).prefix().boolean();
            expect(booleanBuilder).to.be.an.instanceOf(BooleanBuilder_1.BooleanSchemaBuilder);
        });
        it('should still be a type builder after more options on __schema', function () {
            var booleanBuilder = argument_1.argument(testArgumentName).prefix().boolean().optional();
            expect(booleanBuilder).to.be.an.instanceOf(BooleanBuilder_1.BooleanSchemaBuilder);
        });
    });
    describe('String type', function () {
        it('should be an any type builder', function () {
            var stringBuilder = argument_1.argument(testArgumentName).prefix().string();
            expect(stringBuilder).to.be.an.instanceOf(StringBuilder_1.StringSchemaBuilder);
        });
        it('should still be a type builder after more options on __schema', function () {
            var stringBuilder = argument_1.argument(testArgumentName).prefix().string();
            expect(stringBuilder).to.be.an.instanceOf(StringBuilder_1.StringSchemaBuilder);
        });
    });
});
