import {ArgumentSchema} from "../../argumentSchema";
import {ArgumentTypeBuilder} from "./argumentTypeBuilder";
import {StringType} from "../../type/stringType";

export class StringArgumentBuilder extends ArgumentTypeBuilder {
    constructor(schema: ArgumentSchema) {
        super(schema, new StringType());
    }

    regex(regex: RegExp, errFormatter?: (value: any) => string | string): StringArgumentBuilder {
        if(errFormatter) {
            return this.satisfy(regex.test, errFormatter);
        }
        return this.satisfy(regex.test, (value: any) => `${value} does not pass regex test ${regex.toString()}`)
    }

    ip(version: string): StringArgumentBuilder {
        if(version.toLowerCase() === 'ipv4') {
            return this.regex(/^(?:[\d]{1,3}\.){3}\d{1,3}$/, (value: any) => `${value} is not an ipv4`);
        } else if(version.toLowerCase() === 'ipv6') {
            return this.regex(/^(?:[A-F0-9]{1,4}:){7}[A-F0-9]{1,4}$/, (value: any) => `${value} is not an ipv6`);
        } else {
            throw new Error("Unknown ip version");
        }
    }

    email(): StringArgumentBuilder {
        return this.regex(/\S+@\S+\.\S+/, (value: any) => `${value} is not a valid email`);
    }

    url(): StringArgumentBuilder {
        return this.regex(/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/, (value: any) => `${value} is not a valid URL`)
    }
}