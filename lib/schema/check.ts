interface Check {
    checkFunction: (value: any) => boolean;
    errFormatter?: (value: any) => string | string
}