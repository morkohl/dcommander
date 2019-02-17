import * as chai from 'chai';
import {argument} from "../lib/argument/schema/builder/argument";
import {AnySchemaBuilder} from "../lib/argument/schema/type/builder/AnyBuilder";
import {NumberSchemaBuilder} from "../lib/argument/schema/type/builder/NumberBuilder";
import {StringSchemaBuilder} from "../lib/argument/schema/type/builder/StringBuilder";

import {AnyType} from "../lib/argument/schema/type/AnyType";
import {NumberType} from "../lib/argument/schema/type/NumberType";
import {StringType} from "../lib/argument/schema/type/StringType";

import {OptionalArgumentSchema} from "../lib/argument/schema/ArgumentSchema";
import {NARGS} from "../lib/argument/schema/builder/ArgumentSchemaBuilder";

const expect = chai.expect;

const testArgumentName = "test";
const testPrefix = 's!';

describe('ArgumentSchema Test', () => {
    describe('Required Arguments', () => {
        it('should have a set name', () => {
            const builder = argument(testArgumentName);
            const schema = builder.build();
            expect(schema.name).to.equal(testArgumentName);
        });

        it('should set placeholder symbols for number of arguments', () => {
            const builder = argument(testArgumentName).numberOfArguments('?');
            const schema = builder.build();

            expect(schema.numArgs).to.equal(NARGS.AMBIGUOUS);
        });

        it('should throw an error if an inexistant symbol was chosen', () => {
            expect(() => argument(testArgumentName).numberOfArguments('123123213123asdjajsdjasd')).to.throw;
        });

        it('should set number of arguments if a number was given', () => {
            let number = 2;
            const builder = argument(testArgumentName).numberOfArguments(number);
            const schema = builder.build();

            expect(schema.numArgs).to.equal(number)
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

    describe('Optional Arguments', () => {
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

        it('should set identifiers if optional', () => {
            const identifiers = ['--test', '-t'];
            const builder = argument(testArgumentName).optional().identifiers(identifiers);
            const schema = <OptionalArgumentSchema>builder.build();

            expect(schema.identifiers).to.equal(identifiers);
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

    describe('String type', () => {
        it('should be an any type builder', () => {
            const builder = argument(testArgumentName).string();
            expect(builder).to.be.an.instanceOf(StringSchemaBuilder);

            const schema = builder.build();
            expect(schema.type).to.be.an.instanceOf(StringType);

        });
    });
});