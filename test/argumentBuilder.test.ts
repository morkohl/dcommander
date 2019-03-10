import * as chai from 'chai';
import {argument, optionalArgument} from "../src/argument/schema/builder/argument";
import {NARGS} from "../src/argument/schema/builder/argumentBuilder";
import {OptionalArgumentSchema} from "../src/argument/schema/argumentSchema";
import {AnyType} from "../src/argument/schema/type/anyType";
import {AnyArgumentBuilder} from "../src/argument/schema/builder/typeBuilder/anyArgumentBuilder";
import {NumberArgumentBuilder} from "../src/argument/schema/builder/typeBuilder/numberArgumentBuilder";
import {NumberType} from "../src/argument/schema/type/numberType";
import {StringArgumentBuilder} from "../src/argument/schema/builder/typeBuilder/stringArgumentBuilder";
import {StringType} from "../src/argument/schema/type/stringType";

const expect = chai.expect;

const testArgumentName = "test";

describe('ArgumentSchema Test', () => {
    it('should have a set name', () => {
        const builder = argument(testArgumentName);
        const schema = builder.build();
        expect(schema.name).to.eq(testArgumentName);
    });

    it('should set placeholder symbols for number of arguments', () => {
        const builder = argument(testArgumentName).numberOfArguments('?');
        const schema = builder.build();

        expect(schema.numArgs).to.eq(NARGS.ALL_OR_DEFAULT);
    });

    it('should throw an error if an inexistant symbol was chosen for number of arguments', () => {
        expect(() => argument(testArgumentName).numberOfArguments('123123213123asdjajsdjasd')).to.throw;
    });

    it('should set a default value for number of arguments', () => {
        const builder = argument(testArgumentName);
        const schema = builder.build();

        expect(schema.numArgs).to.eq(1);
    });

    it('should set number of arguments if a number was given', () => {
        let number = 2;
        const builder = argument(testArgumentName).numberOfArguments(number);
        const schema = builder.build();

        expect(schema.numArgs).to.eq(number)
    });

    it('should be allowed to have multiple validators', () => {
        expect(() => argument(testArgumentName).number().max(1).min(0).condition((value: any) => value * 2 < 1)).to.not.throw;
        expect(argument(testArgumentName).number().max(1).min(0).condition((value: any) => value * 2 < 1).build().validators.length).to.eq(3);
    });

    it('should set sanitization', () => {
        const fn = (value: any) => 20;
        const builder = argument(testArgumentName).number().sanitize(fn).build();
        expect(builder.sanitize.toString()).to.eq(fn.toString());
    });

    it('should throw an error if a property gets set twice', () => {
        expect(() => argument(testArgumentName).number().max(1).max(2)).to.throw()
    });

    it('should set a default value only if numberOfArguments field eqs \'?\'', () => {
        const builder = argument(testArgumentName).numberOfArguments(NARGS.ALL_OR_DEFAULT).default("test");
        const schema = builder.build();

        expect(schema.default).to.eq("test");
    });

    it('should throw if a default value is chosen and numberOfArguments field doesn\'t eq \'?\'', () => {
        expect(() => argument(testArgumentName).numberOfArguments(2).default("test")).to.throw()
    });

    describe('Optional Arguments', () => {
        it('should be set as optional', () => {
            const builder = optionalArgument(testArgumentName);
            const schema = builder.build();
            expect(schema.required).to.eq(false);
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

            expect(schemaIdentifiers).to.be.an('array').and.eq(identifiers);
            expect(schemaWithDefaultsIdentifiers).to.be.an('array').and.deep.eq(defaultsResult);
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