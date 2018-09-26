export interface Validator {
    isAcceptable: (value: any) => boolean;
    errFormatter?: (value: any) => string | string
}