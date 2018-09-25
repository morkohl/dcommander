class BooleanType implements Type {
    is(value: any): boolean {
        return typeof value === 'boolean' || /^(1|0|y|n|yes|no)$/i.test(value)
    }
}
