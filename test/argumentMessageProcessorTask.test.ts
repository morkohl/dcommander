import * as chai from 'chai';
import {OptionalArgSchemaSpec, RequiredArgSchemaSpec} from "./spec/argumentSchema.spec";
import {ArgumentMessageProcessingTasks} from "../src/dcommander/argument/processor/tasks";

const expect = chai.expect;

describe("ArgumentTask Test", () => {
    describe("Parse Task", () => {
        it("should do nothing if there is no arguments to parse", () => {
            const task = new ArgumentMessageProcessingTasks.ParseArgumentsTask(
                [],
                [OptionalArgSchemaSpec.optionalArgumentSchema, OptionalArgSchemaSpec.optionalArgumentSchemaTwoArguments]
            );

            let state = {
                inputArguments: [],
                parsedArguments: [],
                argumentNamespace: {}
            };

            let stateAfterExecution = task.execute(state);

            expect(state).to.deep.eq(stateAfterExecution)
        });

        it("should parse input arguments", () => {
            const task = new ArgumentMessageProcessingTasks.ParseArgumentsTask(
                [RequiredArgSchemaSpec.requiredArgumentSchema],
                [OptionalArgSchemaSpec.optionalArgumentSchema, OptionalArgSchemaSpec.optionalArgumentSchemaTwoArguments]
            );

            let state = {
                inputArguments: ["test"],
                parsedArguments: [],
                argumentNamespace: {}
            };

            let stateAfterExecution = task.execute(state);

            expect(stateAfterExecution.parsedArguments.length).to.eq(1);
            expect(stateAfterExecution.parsedArguments).to.deep.eq([{schema: RequiredArgSchemaSpec.requiredArgumentSchema, values: ["test"], excludeFromValidationAndSanitization: false}]);
        });

        it("should throw an error if anything went wrong", () => {
            const task = new ArgumentMessageProcessingTasks.ParseArgumentsTask([], []);

            let state = {
                inputArguments: ["too", "many", "arguments"],
                parsedArguments: [],
                argumentNamespace: {}
            };

            expect(() => task.execute(state)).to.throw()
        });
    });

    describe("Validation Task", () => {
        it("should validate parsed arguments", () => {
            const task = new ArgumentMessageProcessingTasks.ValidateArgumentsTask();

            const state = {
                inputArguments: [],
                parsedArguments: [{
                    schema: RequiredArgSchemaSpec.expandableRequiredArgumentSchema.number(numberBuilder => numberBuilder.max(10)).build(),
                    values: [11],
                    excludeFromValidationAndSanitization: false
                }],
                argumentNamespace: {}
            };

            expect(() => task.execute(state)).to.throw();
        });

        it("should not throw an error if all values are ok", () => {
            const task = new ArgumentMessageProcessingTasks.ValidateArgumentsTask();

            const state = {
                inputArguments: [],
                parsedArguments: [{
                    schema: RequiredArgSchemaSpec.expandableRequiredArgumentSchema.number(numberBuilder => numberBuilder.max(10)).build(),
                    values: [5],
                    excludeFromValidationAndSanitization: false
                }],
                argumentNamespace: {}
            };

            expect(() => task.execute(state)).to.not.throw();

        });

        it("should not throw an error if the parsedArgument is excluded from validation", () => {
            const task = new ArgumentMessageProcessingTasks.ValidateArgumentsTask();

            const state = {
                inputArguments: [],
                parsedArguments: [{
                    schema: RequiredArgSchemaSpec.expandableRequiredArgumentSchema.number(numberBuilder => numberBuilder.max(10)).build(),
                    values: [11],
                    excludeFromValidationAndSanitization: true
                }],
                argumentNamespace: {}
            };

            expect(() => task.execute(state)).to.not.throw();
        });
    });

    describe("Sanitization Task", () => {
        const sanitizationSchema = RequiredArgSchemaSpec.expandableRequiredArgumentSchema.sanitization(value => value[0]).build();
        const testValue = "testValue";

        it("should sanitize", () => {
            const task = new ArgumentMessageProcessingTasks.SanitizeArgumentsTask();

            let state = {
                inputArguments: [],
                parsedArguments: [
                    {
                        schema: sanitizationSchema,
                        values: [testValue],
                        excludeFromValidationAndSanitization: false
                    }
                ],
                argumentNamespace: {}
            };

            let stateAfterExecution = task.execute(state);

            expect(stateAfterExecution.parsedArguments[0].values[0]).to.deep.eq(testValue[0]);
        });

        it("should do nothing if all tasks are excluded from validation or have no sanitzation function", () => {
            const task = new ArgumentMessageProcessingTasks.SanitizeArgumentsTask();

            let state = {
                inputArguments: [],
                parsedArguments: [
                    {
                        schema: sanitizationSchema,
                        values: [testValue],
                        excludeFromValidationAndSanitization: true
                    }
                ],
                argumentNamespace: {}
            };

            let stateAfterExecution = task.execute(state);

            expect(stateAfterExecution.parsedArguments[0].values[0]).to.deep.eq(testValue);
        });
    });

    describe("NamespaceTransformer Task", () => {

        it("should generate an ArgumentsNameSpace", () => {
            const task = new ArgumentMessageProcessingTasks.NameSpaceTransformerTask();

            let state = {
                inputArguments: [],
                parsedArguments: [
                    {
                        schema: RequiredArgSchemaSpec.requiredArgumentSchema,
                        values: ["testValue"],
                        excludeFromValidationAndSanitization: false
                    }
                ],
                argumentNamespace: {}
            };

            const stateAfterExecution = task.execute(state);

            expect(stateAfterExecution.argumentNamespace.reqTestArg).to.not.be.undefined;
            expect(stateAfterExecution.argumentNamespace.reqTestArg.values).to.deep.eq(["testValue"]);
            expect(stateAfterExecution.argumentNamespace.reqTestArg.schema).to.eq(RequiredArgSchemaSpec.requiredArgumentSchema);
        });

        it("should not generate an ArgumentsNameSpace if there are no parsedArguments", () => {
            const task = new ArgumentMessageProcessingTasks.NameSpaceTransformerTask();

            let state = {
                inputArguments: [],
                parsedArguments: [],
                argumentNamespace: {}
            };

            const stateAfterExecution = task.execute(state);

            expect(stateAfterExecution.argumentNamespace).to.deep.equal({});
        })

    })
});