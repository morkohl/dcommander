import {ArgumentTypeBuilder} from "./ArgumentTypeBuilder";
import {AnyType} from "../AnyType";
import {ArgumentSchema} from '../../ArgumentSchema';

export class AnyArgumentBuilder extends ArgumentTypeBuilder {
    constructor(schema: ArgumentSchema) {
        super(schema, new AnyType());
    }
}