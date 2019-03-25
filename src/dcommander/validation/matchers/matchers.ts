import {Constants} from "./constants";
import {ValidationErrorMessageFormatter} from "../../error/errors";

export interface Matcher {
    isMatching(value: any): boolean,
    validationErrorMessage: ValidationErrorMessageFormatter
}

export namespace Matchers {

    export namespace NumberMatchers {
        export function inRange(from: number, to: number): Matcher {
            return {
                isMatching(value: number): boolean {
                    return value >= from && value <= to;
                },
                validationErrorMessage: value => `${value} is not in range of ${from}, ${to}`
            }
        }

        export function equalsOrBelowMaximum(maximum: number): Matcher {
            return {
                isMatching(value: number): boolean {
                    return value <= maximum
                },
                validationErrorMessage: value => `${value} is above maximum value ${maximum}`
            }
        }

        export function equalsOrAboveMinimum(minimum: number): Matcher {
            return {
                isMatching(value: number): boolean {
                    return value >= minimum;
                },
                validationErrorMessage: value => `${value} is below minimum value ${minimum}`
            }
        }
    }

    export namespace StringMatchers {
        export function isRegex(regex: RegExp, validationErrorMessage?: ValidationErrorMessageFormatter): Matcher {
            return {
                isMatching(value: string): boolean {
                    return regex.test(value);
                },
                validationErrorMessage: validationErrorMessage ? validationErrorMessage : value => `${value} does not fulfill regex ${regex.toString()}`

            };
        }

        export function isEmail(): Matcher {
            return isRegex(Constants.String.Regexps.emailRegex, value => `${value} is not a valid E-mail`)
        }

        export function isIPAddress(ipVersion: Constants.String.IPProtocolVersion | string): Matcher {
            if(ipVersion === Constants.String.IPProtocolVersion.IPV4) {
                return isRegex(Constants.String.Regexps.ipv4Regex);
            } else if(ipVersion === Constants.String.IPProtocolVersion.IPV6) {
                return isRegex(Constants.String.Regexps.ipv6Regex);
            } else {
                throw new Error(`${ipVersion} is not a valid ip protocol version`);
            }
        }

        export function isURL(): Matcher {
            return isRegex(Constants.String.Regexps.urlRegex, value => `${value} is not a valid URL`)
        }
    }

    export namespace BooleanMatchers {
        export function isTrue(): Matcher {
            return {
                isMatching(value: any): boolean {
                    return value;
                },
                validationErrorMessage: value => `${value} is not true`
            }
        }

        export function isFalse(): Matcher {
            return {
                isMatching(value: boolean): boolean {
                    return !value
                },
                validationErrorMessage: value => `${value} is not false`
            }
        }
    }

    export namespace DateMatchers {

        export function isBefore(latest: Date): Matcher {
            return {
                isMatching(value: Date): boolean {
                    return latest.getTime() > value.getTime();
                },
                validationErrorMessage: (value: Date) => `${value.toUTCString()} is not before ${latest.toUTCString()}`
            }
        }

        export function isAfter(earliest: Date): Matcher {
            return {
                isMatching(value: Date): boolean {
                    return earliest.getTime() < value.getTime();
                },
                validationErrorMessage: (value: Date) => `${value.toUTCString()} is not after ${earliest.toUTCString()}`
            }
        }
    }

    export namespace ObjectMatchers {
        export function hasOwnProperty(propertyName: string): Matcher {
            return {
                isMatching(object: any): boolean {
                    return object.hasOwnProperty(propertyName);
                },
                validationErrorMessage: value => `${value} does not have own property ${propertyName}`
            }
        }
    }
}