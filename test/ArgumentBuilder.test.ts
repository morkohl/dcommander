import * as chai from 'chai';
import {AnySchemaBuilder} from "../lib/argument/schema/type/builder/AnyBuilder";
import {NumberSchemaBuilder} from "../lib/argument/schema/type/builder/NumberBuilder";
import {BooleanSchemaBuilder} from "../lib/argument/schema/type/builder/BooleanBuilder";
import {StringSchemaBuilder} from "../lib/argument/schema/type/builder/StringBuilder";
import {argument} from "../lib/argument/schema/builder/argument";
import {ARGUMENT_CONSTANTS, OptionalArgumentSchema} from "../lib/argument/schema/ArgumentSchema";
import {AnyType} from "../lib/argument/schema/type/AnyType";
import {NumberType} from "../lib/argument/schema/type/NumberType";
import {BooleanType} from "../lib/argument/schema/type/BooleanType";
import {StringType} from "../lib/argument/schema/type/StringType";

const expect = chai.expect;

const testArgumentName = "test";
const testPrefix = 's!';

describe('ArgumentSchema Test', () => {
    describe('Without types', () => {
        it('should have a set name', () => {
            const builder = argument(testArgumentName);
            const schema = builder.build();
            expect(schema.name).to.equal(testArgumentName);
        });
        it('should be set as optional', () => {
            const builder = argument(testArgumentName).optional();
            const schema = builder.build();
            expect(schema.required).to.equal(false);
        });

        it('should be an OptionalArgumentSchema if optional', () => {
            const builder = argument(testArgumentName).optional();
            const schema = builder.build();

            expect(schema).to.be.an.instanceOf(OptionalArgumentSchema);
        });

        it('should set flag to true if chosen so', () => {
           const builder = argument(testArgumentName).optional().flag();
           const schema = builder.build();

            expect(schema.required).to.be.false;
            expect(schema).to.be.an.instanceOf(OptionalArgumentSchema);
            expect((<OptionalArgumentSchema>schema).isFlag).to.be.true;

        });

        it('should set further defaults if optional was chosen and built', () => {
            const builder = argument(testArgumentName).optional();
            const schema = <OptionalArgumentSchema>builder.build();


            expect(schema.prefix).to.not.be.undefined;
            expect(schema.prefix).to.eq(ARGUMENT_CONSTANTS.DEFAULT_PREFIX);

            expect(schema.aliases.length).to.eq(1);
            expect(schema.aliases[0]).to.eq(ARGUMENT_CONSTANTS.DEFAULT_ALIAS_PREFIX + testArgumentName.charAt(0));
        });

        it('should be allowed to have multiple validators', () => {
            expect(
                argument(testArgumentName).number().max(1).min(0).condition((value: any) => value * 2 < 1)
            ).to.not.throw;
            expect(
                argument(testArgumentName).number().max(1).min(0).condition((value: any) => value * 2 < 1).build().validators.length
            ).to.equal(3);
        });

        it('should set sanitization', () => {
            const fn = (value: any) => 20;
            const builder = argument(testArgumentName).number().sanitize(fn).build();
            expect(builder.sanitize.toString()).to.eq(fn.toString());
        });

        it('should throw an error if a property gets set twice', () => {
            const build = () => {
                argument(testArgumentName).number().max(1).max(2)
            };
            expect(build).to.throw()
        });
    });

    describe('Any type', () => {
        it('should be an any type builder', () => {
            const builder = argument(testArgumentName).any();
            expect(builder).to.be.an.instanceOf(AnySchemaBuilder);

            const schema = builder.build();
            expect(schema.type).to.be.an.instanceOf(AnyType);
        });

        it('should implicitly be an AnySchemaBuilder if no type was chosen', () => {
            const builder = argument(testArgumentName);
            const schema = builder.build();
            expect(schema.type).to.be.an.instanceOf(AnyType);
        });
    });

    describe('Number type', () => {
        it('should be a NumberTypeBuilder if number was chosen', () => {
            const builder = argument(testArgumentName).number();
            expect(builder).to.be.an.instanceOf(NumberSchemaBuilder);

            const schema = builder.build();
            expect(schema.type).to.be.an.instanceOf(NumberType);
        });
    });

    describe('Boolean type', () => {
        it('should be an any type builder', () => {
            const builder = argument(testArgumentName).boolean();
            expect(builder).to.be.an.instanceOf(BooleanSchemaBuilder);

            const schema = builder.build();
            expect(schema.type).to.be.an.instanceOf(BooleanType);
        });
    });

    describe('String type', () => {
        it('should be an any type builder', () => {
            const builder = argument(testArgumentName).string();
            expect(builder).to.be.an.instanceOf(StringSchemaBuilder);

            const schema = builder.build();
            expect(schema.type).to.be.an.instanceOf(StringType);

        });
    });
});