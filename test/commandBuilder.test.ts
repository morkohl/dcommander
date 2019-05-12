import * as chai from 'chai';
import {CommandBuilders} from "../src/dcommander/builder/command/commandBuilder";
import {OptionalArgSchemaSpec, RequiredArgSchemaSpec} from "./spec/argumentSchema.spec";
import {INSPECT_CUSTOM} from "ts-node";

const expect = chai.expect;

const testCommandName = "testCommandName";

describe("CommandBuilders Test", () => {
    describe("CommandBuilder Test", () => {
        let builder: CommandBuilders.CommandBuilder;

        beforeEach(() => {
            builder = new CommandBuilders.CommandBuilder(testCommandName);
        });

        it("should build a command schema", () => {
            expect(() => builder.build()).to.not.throw();
            expect(builder.build().name).to.eq(testCommandName);
        });

        it("should build with arguments", () => {
            const result = builder.arguments([
                RequiredArgSchemaSpec.expandableRequiredArgumentSchema,
                OptionalArgSchemaSpec.expandableOptionalArgumentSchema]
            ).build();

            expect(result.argumentSchema).to.deep.eq([
                RequiredArgSchemaSpec.expandableRequiredArgumentSchema.build(),
                OptionalArgSchemaSpec.expandableOptionalArgumentSchema.build()
            ]);
        });

        it("should build with an execution function", () => {
            const result = builder
                .execution(instructions => instructions)
                .build();

            expect(result.execution).to.not.be.undefined;
        });

        it("should build with a prefix", () => {
            const prefix = "--";
            const result = builder.prefix(prefix).build();

            expect(result.prefix).to.eq(prefix);
        });

        it("should build with a canExecute function", () => {
            const result = builder.canExecute(user => true).build();

            expect(result.canExecute).to.not.be.undefined;
        });
    });
});