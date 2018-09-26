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

    setRequired() {
        this.required = true;
    }

    setSanitize(fn: Function) {
        this.sanitize = fn;
    }
}