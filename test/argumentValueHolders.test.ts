import * as chai from 'chai';
import {argument} from "../src/argument/schema/builder/argument";
import {RequiredArgumentValueHolders} from "../src/argument/parser/argumentValueHolders";
import {RequiredArgumentValueHolder} from "../src/argument/parser/argumentValueHolder";

const expect = chai.expect;

const testArgumentBuilderRequired = argument("xyz");
const testArgumentRequired = testArgumentBuilderRequired.build();

describe('Test', () => {
    it("should add a new ArgumentValueHolder", () => {
        const valueHolders = new RequiredArgumentValueHolders();

        expect(valueHolders.argumentSchemaValueHolders.length).to.eq(0);

        valueHolders.add(new RequiredArgumentValueHolder(testArgumentRequired));

        expect(valueHolders.argumentSchemaValueHolders.length).to.eq(1);
    });

    it("should update the values of an ArgumentValueHolder", () => {
       const valueHolders = new RequiredArgumentValueHolders();
       let valueHolder = new RequiredArgumentValueHolder(testArgumentRequired);

       valueHolders.add(valueHolder);

       expect(valueHolders.argumentSchemaValueHolders[0].values.length).to.eq(0);

       valueHolder = valueHolders.updateValueHolderValues(valueHolder, "test");

       expect(valueHolders.argumentSchemaValueHolders[0].values.length).to.eq(1);
       expect(valueHolders.argumentSchemaValueHolders[0].values[0]).to.eq("test");

       expect(valueHolder.values.length).to.eq(1);
       expect(valueHolder.values[0]).to.eq("test");
    })
});