import {StringType} from "../StringType";
import {ArgumentSchema} from "../../ArgumentSchema";
import {SchemaTypeBuilder} from "./SchemaTypeBuilder";

export class StringSchemaBuilder extends SchemaTypeBuilder {
    constructor(schema: ArgumentSchema) {
        super(schema, new StringType());
    }

    regex(regex: RegExp, errFormatter?: (value: any) => string | string): StringSchemaBuilder {
        if(errFormatter) {
            return this.satisfy(regex.test, errFormatter);
        }
        return this.satisfy(regex.test, (value: any) => `${value} does not pass regex test ${regex.toString()}`)
    }

    ip(version: string): StringSchemaBuilder {
        if(version.toLowerCase() === 'ipv4') {
            return this.regex(/^(?:[\d]{1,3}\.){3}\d{1,3}$/, (value: any) => `${value} is not an ipv4`);
        } else if(version.toLowerCase() === 'ipv6') {
            return this.regex(/^(?:[A-F0-9]{1,4}:){7}[A-F0-9]{1,4}$/, (value: any) => `${value} is not an ipv6`);
        } else {
            throw new Error("Unknown ip version");
        }
    }

    email(): StringSchemaBuilder {
        return this.regex(/\S+@\S+\.\S+/, (value: any) => `${value} is not a valid email`);
    }

    url(): StringSchemaBuilder {
        return this.regex(/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/, (value: any) => `${value} is not a valid URL`)
    }
}