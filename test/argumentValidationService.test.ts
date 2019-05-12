import * as chai from 'chai';
import {ArgumentBuilders} from "../src/dcommander/builder/argument/argumentBuilders";
import {ArgumentValidation} from "../src/dcommander/validation/validationService";
import {Errors} from "../src/dcommander/error/errors";


const expect = chai.expect;

const testArgumentName = "test";


describe("ArgumentValidationService Test", () => {
    it("should return a validation result without errors if the arguments passed were valid", () => {
        const testParsedArgument = {
            schema: ArgumentBuilders.optionalArgument(testArgumentName).number(
                numberBuilder => numberBuilder.range(1,5)
            ).build(),
            values: [1,2,3],
            excludeFromValidationAndSanitization: false
        };

        const validationResult = ArgumentValidation.validateParsedArguments([testParsedArgument]);

        expect(validationResult.hasErrors()).to.be.false;
        expect(validationResult.errors.length).to.eq(0);
        expect(validationResult.getMessage()).to.eq("");
    });

    it("should return a validation result with errors", () => {
        const testParsedArgument = {
            schema: ArgumentBuilders.optionalArgument(testArgumentName).number(
                numberBuilder => numberBuilder.range(0,2)
            ).build(),
            values: [3,4],
            excludeFromValidationAndSanitization: false
        };

        const validationResult = ArgumentValidation.validateParsedArguments([testParsedArgument]);

        expect(validationResult.hasErrors()).to.be.true;
        expect(validationResult.errors.length).to.eq(1);
        expect(validationResult.getMessage()).to.eq("3 is not in range of 0, 2");
        expect(() => validationResult.throw()).to.throw(Errors.ValidationError);
    });

    it("should catch all errors if that option was passed", () => {
        const testParsedArgument = {
            schema: ArgumentBuilders.optionalArgument(testArgumentName).number(
                numberBuilder => numberBuilder.range(0,2)
            ).build(),
            values: [3,4],
            excludeFromValidationAndSanitization: false
        };

        const validationResult = ArgumentValidation.validateParsedArguments([testParsedArgument], {
            gatherAllValidationErrors: true,
            errorFormatSeparator: "; "
        });

        expect(validationResult.hasErrors()).to.be.true;
        expect(validationResult.errors.length).to.eq(2);
        expect(validationResult.getMessage()).to.eq("3 is not in range of 0, 2; 4 is not in range of 0, 2");
    });

    it("should exclude parsed arguments from validation where the corresponding flag was set", () => {
        const testParsedArgument = {
            schema: ArgumentBuilders.optionalArgument(testArgumentName).number(
                numberBuilder => numberBuilder.range(0,2)
            ).build(),
            values: [3,4],
            excludeFromValidationAndSanitization: true
        };

        const validationResult = ArgumentValidation.validateParsedArguments([testParsedArgument]);

        expect(validationResult.hasErrors()).to.be.false;
        expect(validationResult.errors.length).to.eq(0);
        expect(validationResult.getMessage()).to.eq("");
    })
});