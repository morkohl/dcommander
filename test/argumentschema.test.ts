import * as chai from 'chai';
import {argument, SchemaBuilder} from "../lib/schema/schemaBuilder/schemaBaseBuilder";
import {AnySchemaBuilder} from "../lib/schema/schemaBuilder/typeBuilder/anyBuilder";
import {NumberSchemaBuilder} from "../lib/schema/schemaBuilder/typeBuilder/numberBuilder";
import {BooleanSchemaBuilder} from "../lib/schema/schemaBuilder/typeBuilder/booleanBuilder";
import {StringSchemaBuilder} from "../lib/schema/schemaBuilder/typeBuilder/stringBuilder";

const expect = chai.expect;

describe('ArgumentSchema Test', () => {
    describe('Without types', () => {
        it('should not be a typebuilder type if no type was chosen', () => {
            const builder = argument("test").prefix("s!");
            expect(builder).to.be.an.instanceOf(SchemaBuilder);
        });

        it('should get the correct prefixes if no default chosen', () => {
            const builder = argument("test").prefix();
            expect(builder.__schema.prefix).to.eq('--');
            const builder2 = argument("ts").prefix();
            expect(builder2.__schema.prefix).to.eq('-');
        });

        it('should be allowed to have multiple validators', () => {
            expect(
                argument('test').number().max(1).min(0).condition(value => value * 2 < 1)
            ).to.not.throw;
            expect(
                argument('test').number().max(1).min(0).condition(value => value * 2 < 1).__build().validators.length
            ).to.equal(3);
        });

        it('should set required', () => {
            const schema = argument('test').prefix('s!').number().optional().__build();
            const schema2 = argument('test').prefix('s!').number().required().__build();
            expect(schema.required).to.eq(false);
            expect(schema2.required).to.eq(true);
        });

        it('should set required implicitly if not supplied', () => {
            const schema = argument('test').prefix('s!').number().__build();
            expect(schema.required).to.eq(false);
        });

        it('should set sanitization', () => {
            const fn = (value: any) => 20;
            const builder = argument('test').prefix('s!').number().sanitize(fn).__build();
            expect(builder.sanitize.toString()).to.eq(fn.toString());
        });

        it('should throw an error if a property gets set twice', () => {
            const build = () => {
                argument('test').number().max(1).max(2)
            };
            expect(build).to.throw()
        });
    });

    describe('Any type', () => {
        it('should be an any type builder', () => {
            const anyBuilder = argument('test').prefix().any();
            expect(anyBuilder).to.be.an.instanceOf(AnySchemaBuilder);
        });

        it('should still be a type builder after more options on __schema', () => {
            const anyBuilder = argument('test').prefix().any().required();
            expect(anyBuilder).to.be.an.instanceOf(AnySchemaBuilder);
        })
    });

    describe('Number type', () => {
        it('should be an any type builder', () => {
            const numberBuilder = argument('test').prefix().number();
            expect(numberBuilder).to.be.an.instanceOf(NumberSchemaBuilder);
        });

        it('should still be a type builder after more options on __schema', () => {
            const numberBuilder = argument('test').prefix().number().sanitize((value: any) => value + 1);
            expect(numberBuilder).to.be.an.instanceOf(NumberSchemaBuilder);
        });
    });

    describe('Boolean type', () => {
        it('should be an any type builder', () => {
            const booleanBuilder = argument('test').prefix().boolean();
            expect(booleanBuilder).to.be.an.instanceOf(BooleanSchemaBuilder);
        });

        it('should still be a type builder after more options on __schema', () => {
            const booleanBuilder = argument('test').prefix().boolean().optional();
            expect(booleanBuilder).to.be.an.instanceOf(BooleanSchemaBuilder);
        });
    });

    describe('String type', () => {
        it('should be an any type builder', () => {
            const stringBuilder = argument('test').prefix().string();
            expect(stringBuilder).to.be.an.instanceOf(StringSchemaBuilder);
        });

        it('should still be a type builder after more options on __schema', () => {
            const stringBuilder = argument('test').prefix().string().required();
            expect(stringBuilder).to.be.an.instanceOf(StringSchemaBuilder);
        })
    });
});