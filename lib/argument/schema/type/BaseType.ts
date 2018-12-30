export interface Type {
    is(value: any): boolean;
    transform(value: any): any;
}