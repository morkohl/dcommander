module.exports = {
    is: (value, type) => {
        return typeof value === type;
    },
    string: {
        matches: (regex, value) => {
            return value.matches(regex);
        },
    },
    number: {
        min: (min, value) => {
            return value > min;
        },
        max: (max, value) => {
            return value < max;
        }
    }
};