export class Argument {
    argumentName: string;
    prefix: string;
    required: boolean = false;
    sanitize: Function;

    constructor(argumentName :string) {
        this.argumentName = argumentName;
    }

    setPrefix(prefix: string) {
        this.prefix = prefix;
    }

    setRequired(required: boolean) {
        this.required = required;
    }

    setSanitize(fn: Function) {
        this.sanitize = fn;
    }
}