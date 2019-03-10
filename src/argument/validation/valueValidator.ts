export interface ValueValidator {
    isAcceptable: (value: any) => boolean;
    errFormatter?: (value: any) => string
}