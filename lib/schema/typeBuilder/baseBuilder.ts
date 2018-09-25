class TypeBuilder extends ArgumentBuilder {
    checks: Check[];
    protected type: Type;

    constructor(argument: Argument, type: Type) {
        super(argument);
        this.type = type;
        this.checks = [];
        this.checks.push({ checkFunction: this.type.is });
    }

    protected addCheck(check: Check) {
        if(this.checksIncludeFunction(check.checkFunction)) {
            throw new Error(`${check.checkFunction.name} cannot be included into checks twice`);
        }
        this.checks.push(check);
    }

    private checksIncludeFunction(fn: Function) {
        for(let check of this.checks) {
            if(!!fn.name && check.checkFunction.name === fn.name || check.checkFunction.toString() === fn.toString()) {
                return true;
            }
        }
        return false;
    }
}
