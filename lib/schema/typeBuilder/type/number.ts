class NumberType implements Type {
    is(value: any): boolean {
        try {
            Number(value);
            return true;
        } catch(err) {
            return false;
        }
    }
}