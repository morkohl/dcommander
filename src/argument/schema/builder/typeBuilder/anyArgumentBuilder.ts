import {ArgumentTypeBuilder} from "./argumentTypeBuilder";
import {ArgumentSchema} from '../../argumentSchema';
import {AnyType} from "../../type/anyType";

export class AnyArgumentBuilder extends ArgumentTypeBuilder {
    constructor(schema: ArgumentSchema) {
        super(schema, new AnyType());
    }
}