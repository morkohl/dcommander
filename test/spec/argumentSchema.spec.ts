import {ArgumentBuilders} from "../../src/dcommander/builder/argument/argumentBuilders";
import {AMBIGUITIES} from "../../src/dcommander/argument/argumentSchema";

const argSchema = ArgumentBuilders.argumentSchema;
const optArgSchema = ArgumentBuilders.optionalArgumentSchema;

export namespace RequiredArgSchemaSpec {
    export const requiredArgumentSchema = argSchema("reqTestArg").build();

    export const requiredArgumentSchemaTwoArguments = argSchema("reqTestArgTwoArgs").argumentsLength(2).build();

    export const requiredArgumentSchemaBoolean = argSchema("reqTestArgBool").boolean().build();
    export const requiredArgumentSchemaNumber = argSchema("reqTestArgNumber").number().build();
    export const requiredArgumentSchemaDate = argSchema("reqTestArgDate").date().build();
    export const requiredArgumentSchemaObject = argSchema("reqTestArgObject").object().build();

    export const requiredArgumentSchemaAmbiguousAllOrDefault = argSchema("reqTestAllOrDefault").argumentsLength(AMBIGUITIES.ALL_OR_DEFAULT).default("default value").build();
    export const requiredArgumentSchemaAmbiguousAtLeastOne = argSchema("reqTestAtLeastOne").argumentsLength(AMBIGUITIES.AT_LEAST_ONE).build();

    export const expandableRequiredArgumentSchema = argSchema("reqTestArgExp");
}

export namespace OptionalArgSchemaSpec {
    export const optionalArgumentSchema = optArgSchema("optTestArg").identifiers("--opt", "-o").build();

    export const optionalArgumentSchemaTwoArguments = optArgSchema("optTestArgTwoArgs").identifiers("--opt2", "-o2").argumentsLength(2).build();

    export const optionalArgumentSchemaIsFlag = optArgSchema("optTestArgFlag").identifiers("--flag", "-f").flag(true).build();

    export const optionalArgSchemaWithDuplicates = optArgSchema("optTestArgDuplicats").identifiers("--dup", "-dup").allowDuplicates().build();

    export const optionalArgumentSchemaBoolean = optArgSchema("optTestArgBool").identifiers("--bool", "-b").boolean().build();
    export const optionalArgumentSchemaNumber = optArgSchema("optTestArgNumber").identifiers("--number", "-n").number().build();
    export const optionalArgumentSchemaDate = optArgSchema("optTestArgDate").identifiers("--date", "-d").date().build();
    export const optionalArgumentSchemaObject = optArgSchema("optTestArgObject").identifiers("--object", "-obj").object().build();

    export const optionalArgumentSchemaAmbiguousAllOrDefault = optArgSchema("optTestArgAllOrDefault").identifiers("--ambig1", "-a1").argumentsLength(AMBIGUITIES.ALL_OR_DEFAULT).default("default value").build();
    export const optionalArgumentSchemaAmbiguousAtLeastOne = optArgSchema("optTestArgAllOrAtLeastOne").identifiers("--ambig2", "-a2").argumentsLength(AMBIGUITIES.AT_LEAST_ONE).build();


    export const expandableOptionalArgumentSchema = optArgSchema("optTestArgExp").identifiers("--exp", "-e");
}