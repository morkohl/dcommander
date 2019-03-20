export interface ValueType {
    is(value: string): boolean;

    convertValue(value: string): any;

    are(values: string[]): boolean;

    convertValues(values: string[]): any[];
}

export abstract class ValueTypeImpl implements ValueType {
    abstract convertValue(value: string): any;

    abstract is(value: string): boolean;

    convertValues(values: string[]): any {
        return values.map(this.convertValue)
    }

    are(values: string[]): boolean {
        return !!values.length ? true : this.is(values[0]) && this.are(values.splice(1, values.length));
    }
}

