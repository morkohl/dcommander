import {AMBIGUITIES, ArgumentSchema, OptionalArgumentSchema,} from "../../argument/argumentSchema";
import {FlagValueCollector, ValueCollector} from "../../argument/value/collector";
import {Errors} from "../../error/errors";

export class IdentifierUtil {
    private readonly optionalSchemas: OptionalArgumentSchema[];
    private readonly mappedIdentifiers: string[][];

    constructor(optionalSchemas: OptionalArgumentSchema[]) {
        this.optionalSchemas = optionalSchemas;
        this.mappedIdentifiers = this.optionalSchemas.map(schema => schema.identifiers);
    }

    isIdentifier(token: string): boolean {
        return this.mappedIdentifiers.filter(identifiers => this.identifiersContain(identifiers, token)).length !== 0
    }

    getForIdentifier(identifier: string): OptionalArgumentSchema | never {
        for (let optionalSchema of this.optionalSchemas) {
            if (this.identifiersContain(optionalSchema.identifiers, identifier)) {
                return optionalSchema;
            }
        }
        throw new Error(`No Schema found for ${identifier}`);
    }

    private identifiersContain(identifiers: string[], token: string): boolean {
        return identifiers.indexOf(token) >= 0;
    }
}

export interface ParsedArgument {
    excludeFromValidationAndSanitization: boolean,
    values: any,
    schema: ArgumentSchema
}

export class ArgumentParser {
    protected argumentSchemas: ArgumentSchema[];
    protected optionalArgumentSchemas: OptionalArgumentSchema[];

    private identifierUtil: IdentifierUtil;

    private parsedArguments: ParsedArgument[];

    private currentRequiredCollector: ValueCollector | null;
    private currentOptionalCollector: ValueCollector | null;

    constructor(schemas: ArgumentSchema[], optionalSchemas: OptionalArgumentSchema[]) {
        this.argumentSchemas = schemas;
        this.optionalArgumentSchemas = optionalSchemas;
    }

    parse(inputArguments: string[]): ParsedArgument[] {
        this.initNewParse();

        for (let inputArgument of inputArguments) {
            if (this.identifierUtil.isIdentifier(inputArgument)) {
                this.handleIfTokenIsIdentifier(inputArgument);
            } else if (this.currentOptionalCollector) {
                this.handleIfCurrentOptionalCollectorIsSet(inputArgument);
            } else if (this.currentRequiredCollector) {
                this.handleIfCurrentRequiredCollectorIsSet(inputArgument);
            } else {
                throw new Errors.ParseError("Too many arguments");
            }
        }

        this.addValueCollectorIfFull(this.currentRequiredCollector);
        this.addValueCollectorIfFull(this.currentOptionalCollector);

        this.addDefaults();

        return this.parsedArguments;
    }

    private addValueCollectorIfFull(currentCollector: ValueCollector | null): void | never {
        if (currentCollector) {
            if (currentCollector.isFull() || currentCollector.isAmbiguous()) {
                if (currentCollector.isSpecificAmbiguous(AMBIGUITIES.AT_LEAST_ONE) && currentCollector.isEmpty()) {
                    throw new Errors.ParseError(`Expected at least one argument but got 0`);
                }
                this.addToResults(currentCollector);
            } else {
                throw new Errors.ParseError(`Expected ${currentCollector.argumentsLength.toString()} arguments but got ${currentCollector.valuesLength}`)
            }

        }
    }

    private initNewParse() {
        this.clearState();

        if (this.argumentSchemas.length !== 0) {
            this.currentRequiredCollector = new ValueCollector(this.argumentSchemas[0]);
        }
    }

    private clearState(): void {
        this.currentOptionalCollector = null;
        this.currentRequiredCollector = null;

        this.parsedArguments = [];

        this.identifierUtil = new IdentifierUtil(this.optionalArgumentSchemas);
    }


    private addToResults(collector: ValueCollector) {
        const index = this.parsedArguments.map(parsedArg => parsedArg.schema).indexOf(collector.schema);
        const result = collector.getResult();

        if(index >= 0) {
            if(Array.isArray(this.parsedArguments[index].values)) {
                this.parsedArguments[index].values = this.parsedArguments[index].values.concat(result.values)
            } else {
                this.parsedArguments[index].values = [this.parsedArguments[index].values].concat(result.values)
            }
        } else {
            this.parsedArguments = this.parsedArguments.concat(result);
        }
    }

    private handleIfTokenIsIdentifier(inputArgument: string): void | never {
        this.addValueCollectorIfFull(this.currentOptionalCollector);
        this.setNextOptionalValueCollector(inputArgument);
    }

    private setNextOptionalValueCollector(inputArgument: string): void {
        const optionalArgumentSchema = this.identifierUtil.getForIdentifier(inputArgument);

        if(this.isSchemaParsed(optionalArgumentSchema)) {
            if(!optionalArgumentSchema.allowDuplicates) {
                throw new Errors.ParseError(`Duplicate call for argument ${inputArgument}`);
            }
        }

        if (optionalArgumentSchema.flag !== undefined) {
            this.addToResults(new FlagValueCollector(optionalArgumentSchema));
            this.currentOptionalCollector = null;
        } else {
            this.currentOptionalCollector = new ValueCollector(optionalArgumentSchema);
        }
    }

    private handleIfCurrentOptionalCollectorIsSet(inputArgument: string): void {
        if (this.currentOptionalCollector) {
            this.currentOptionalCollector.collect(inputArgument);
            if (this.currentOptionalCollector.isFull()) {
                this.addToResults(this.currentOptionalCollector);
                this.currentOptionalCollector = null;
            }
        }
    }

    private handleIfCurrentRequiredCollectorIsSet(inputArgument: string): void {
        if (this.currentRequiredCollector) {
            if (this.currentRequiredCollector.isFull()) {
                this.addToResults(this.currentRequiredCollector);
                const nextSchema = this.argumentSchemas[this.argumentSchemas.indexOf(this.currentRequiredCollector.schema) + 1];
                if (nextSchema) {
                    this.currentRequiredCollector = new ValueCollector(nextSchema);
                    this.currentRequiredCollector.collect(inputArgument);
                } else {
                    throw new Errors.ParseError("Too many arguments.")
                }
            } else {
                this.currentRequiredCollector.collect(inputArgument);
            }
        }
    }

    private isSchemaParsed(schema: ArgumentSchema): boolean {
        return this.parsedArguments.find(parsedArg => parsedArg.schema === schema) !== undefined;
    }

    private addDefaults() {
        this.argumentSchemas
            .filter(schema => schema.valueInfo.argumentsLength === AMBIGUITIES.ALL_OR_DEFAULT && !this.isSchemaParsed(schema))
            .forEach(schema => this.addToResults(new ValueCollector(schema)));
    }
}