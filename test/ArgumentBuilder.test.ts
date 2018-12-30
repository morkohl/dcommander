import * as chai from 'chai';
import {AnySchemaBuilder} from "../lib/argument/schema/type/builder/AnyBuilder";
import {NumberSchemaBuilder} from "../lib/argument/schema/type/builder/NumberBuilder";
import {BooleanSchemaBuilder} from "../lib/argument/schema/type/builder/BooleanBuilder";
import {StringSchemaBuilder} from "../lib/argument/schema/type/builder/StringBuilder";
import {argument} from "../lib/argument/schema/builder/argument";
import {SchemaBuilder} from "../lib/argument/schema/builder/ArgumentSchemaBuilder";
import {ARGUMENT_CONSTANTS} from "../lib/argument/schema/ArgumentSchema";

const expect = chai.expect;

const testArgumentName = "test";

describe('ArgumentSchema Test', () => {
    describe('Without types', () => {
        it('should have a set name', () => {
            const builder = argument(testArgumentName);
            expect(builder.__schema.name).to.equal(testArgumentName);
        });
        it('should be set as optional', () => {
            const builder = argument("test").optional();
            expect(builder.__schema.required).to.equal(false);

        });

        it('should set further defaults if optional was chosen and built', () => {
            const schema = argument(testArgumentName).optional().__build();

            expect(schema.prefix).to.not.be.undefined;
            expect(schema.prefix).to.eq(ARGUMENT_CONSTANTS.DEFAULT_PREFIX);

            expect(schema.aliases.length).to.eq(1);
            expect(schema.aliases[0]).to.eq(ARGUMENT_CONSTANTS.DEFAULT_ALIAS + testArgumentName.charAt(0));
        });

        it('should not be a typebuilder type if no type was chosen', () => {
            const builder = argument(testArgumentName).optional().prefix("s!");
            expect(builder).to.be.an.instanceOf(SchemaBuilder);
        });

        it('should be allowed to have multiple validators', () => {
            expect(
                argument(testArgumentName).number().max(1).min(0).condition((value: any) => value * 2 < 1)
            ).to.not.throw;
            expect(
                argument(testArgumentName).number().max(1).min(0).condition((value: any) => value * 2 < 1).__build().validators.length
            ).to.equal(3);
        });

        it('should set sanitization', () => {
            const fn = (value: any) => 20;
            const builder = argument(testArgumentName).number().prefix('s!').sanitize(fn).__build();
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
            const anyBuilder = argument(testArgumentName).prefix().any();
            expect(anyBuilder).to.be.an.instanceOf(AnySchemaBuilder);
        });

        it('should still be a type builder after more options on __schema', () => {
            const anyBuilder = argument(testArgumentName).prefix().any();
            expect(anyBuilder).to.be.an.instanceOf(AnySchemaBuilder);
        })
    });

    describe('Number type', () => {
        it('should be an any type builder', () => {
            const numberBuilder = argument(testArgumentName).prefix().number();
            expect(numberBuilder).to.be.an.instanceOf(NumberSchemaBuilder);
        });

        it('should still be a type builder after more options on __schema', () => {
            const numberBuilder = argument(testArgumentName).prefix().number().sanitize((value: any) => value + 1);
            expect(numberBuilder).to.be.an.instanceOf(NumberSchemaBuilder);
        });
    });

    describe('Boolean type', () => {
        it('should be an any type builder', () => {
            const booleanBuilder = argument(testArgumentName).prefix().boolean();
            expect(booleanBuilder).to.be.an.instanceOf(BooleanSchemaBuilder);
        });

        it('should still be a type builder after more options on __schema', () => {
            const booleanBuilder = argument(testArgumentName).prefix().boolean().optional();
            expect(booleanBuilder).to.be.an.instanceOf(BooleanSchemaBuilder);
        });
    });

    describe('String type', () => {
        it('should be an any type builder', () => {
            const stringBuilder = argument(testArgumentName).prefix().string();
            expect(stringBuilder).to.be.an.instanceOf(StringSchemaBuilder);
        });

        it('should still be a type builder after more options on __schema', () => {
            const stringBuilder = argument(testArgumentName).prefix().string();
            expect(stringBuilder).to.be.an.instanceOf(StringSchemaBuilder);
        })
    });
});