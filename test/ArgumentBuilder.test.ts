import * as chai from 'chai';
import {argument, optionalArgument} from "../lib/argument/schema/builder/argument";
import {AnyArgumentBuilder} from "../lib/argument/schema/type/builder/AnyArgumentBuilder";
import {NumberArgumentBuilder} from "../lib/argument/schema/type/builder/NumberArgumentBuilder";
import {StringArgumentBuilder} from "../lib/argument/schema/type/builder/StringArgumentBuilder";

import {AnyType} from "../lib/argument/schema/type/AnyType";
import {NumberType} from "../lib/argument/schema/type/NumberType";
import {StringType} from "../lib/argument/schema/type/StringType";

import {OptionalArgumentSchema} from "../lib/argument/schema/ArgumentSchema";
import {NARGS} from "../lib/argument/schema/builder/ArgumentBuilder";

const expect = chai.expect;

const testArgumentName = "test";

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
            const builder = optionalArgument(testArgumentName);
            const schema = builder.build();
            expect(schema.required).to.equal(false);
        });

        it('should set identifiers and default identifiers', () => {
            let identifiers = ["--abc", "-a"];
            const builder = optionalArgument(testArgumentName, identifiers);
            const builderWithDefaults = optionalArgument(testArgumentName);
            let schema = builder.build();
            let schemaWithDefaults = builderWithDefaults.build();

            expect(schema.required).to.be.false;
            expect(schema).to.be.an.instanceOf(OptionalArgumentSchema);
            expect(schemaWithDefaults.required).to.be.false;
            expect(schemaWithDefaults).to.be.an.instanceOf(OptionalArgumentSchema);

            let schemaIdentifiers = (<OptionalArgumentSchema>schema).identifiers;
            let schemaWithDefaultsIdentifiers = (<OptionalArgumentSchema>schemaWithDefaults).identifiers;

            const defaultsResult = [`--${testArgumentName}`, `-${testArgumentName.charAt(0)}`];

            expect(schemaIdentifiers).to.be.an('array').and.equal(identifiers);
            expect(schemaWithDefaultsIdentifiers).to.be.an('array').and.deep.equal(defaultsResult);
        });

        it('should set flag to true if chosen so', () => {
            const builder = optionalArgument(testArgumentName).flag();
            const schema = builder.build();

            expect(schema.required).to.be.false;
            expect(schema).to.be.an.instanceOf(OptionalArgumentSchema);
            expect((<OptionalArgumentSchema>schema).isFlag).to.be.true;
        });
    });


    describe('Any type', () => {
        it('should be an any type builder', () => {
            const builder = argument(testArgumentName).any();
            expect(builder).to.be.an.instanceOf(AnyArgumentBuilder);

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
            expect(builder).to.be.an.instanceOf(NumberArgumentBuilder);

            const schema = builder.build();
            expect(schema.type).to.be.an.instanceOf(NumberType);
        });
    });

    describe('String type', () => {
        it('should be an any type builder', () => {
            const builder = argument(testArgumentName).string();
            expect(builder).to.be.an.instanceOf(StringArgumentBuilder);

            const schema = builder.build();
            expect(schema.type).to.be.an.instanceOf(StringType);

        });
    });
});