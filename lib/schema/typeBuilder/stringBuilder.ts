import {TypeBuilder} from "./baseBuilder";
import {Argument} from "../argument";
import {StringType} from "./type/string";

export class StringArgumentBuilder extends TypeBuilder {
    constructor(argument: Argument) {
        super(argument, new StringType());
    }

    regex(regex: RegExp, errFormatter?: (value: any) => string | string): StringArgumentBuilder {
        this.addValidator({ isAcceptable: regex.test, errFormatter: errFormatter });
        return this;
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
