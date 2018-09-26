import {TypeBuilder} from "./typeBuilder/baseBuilder";
import {StringArgumentBuilder} from "./typeBuilder/stringBuilder";
import {NumberArgumentBuilder} from "./typeBuilder/numberBuilder";
import {BooleanArgumentBuilder} from "./typeBuilder/booleanBuilder";
import {Argument} from "./argument";

export class ArgumentBuilder {
    argument: Argument;

    constructor(argument: Argument) {
        this.argument = argument;
    }

    private isTypeBuilder(): boolean {
        return this instanceof TypeBuilder;
    }

    prefix(prefix?: string): ArgumentBuilder {
        if(this.argument.prefix) {
            throw new Error("Argument already has a set prefix");
        }
        prefix = prefix ? prefix : (this.argument.argumentName.length <= 2 ? '-' : '--');
        this.argument.setPrefix(prefix);
        return this;
    }

    required(): ArgumentBuilder {
        if(this.argument.required) {
            throw new Error("Argument is already set as required");
        }
        this.argument.setRequired();
        return this;
    }

    sanitize(fn: Function): ArgumentBuilder {
        this.argument.setSanitize(fn);
        return this;
    }


    string(): StringArgumentBuilder {
        return this.convertTo(StringArgumentBuilder)
    }

    number(): NumberArgumentBuilder {
        return this.convertTo(NumberArgumentBuilder)
    }

    boolean(): BooleanArgumentBuilder {
        return this.convertTo(BooleanArgumentBuilder)
    }

    private convertTo<T extends TypeBuilder>(type: { new(argument: Argument): T}): T {
        if(this.isTypeBuilder()) {
            throw new Error("An argument can only be of one type");
        }
        return new type(this.argument);
    }
}

module argument {
    export function argument(argumentName: string) {
        return new ArgumentBuilder(new Argument(argumentName));
    }
}
