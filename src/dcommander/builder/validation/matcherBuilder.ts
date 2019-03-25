import {Builder} from "../builder";
import {Matcher, Matchers} from "../../validation/matchers/matchers";
import {ValidationErrorMessageFormatter} from "../../error/errors";
import {Constants} from "../../validation/matchers/constants";

export namespace MatcherBuilders {
    export class MatchersBuilder implements Builder {
        protected _matchers: Matcher[] = [];

        protected addMatcher(matcher: Matcher): this {
            this._matchers.push(matcher);
            return this;
        }

        match(matcher: Matcher) {
            return this.addMatcher(matcher);
        }

        build(): any {
            return this._matchers;
        }
    }

    export class StringMatchersBuilder extends MatchersBuilder {
        regex(regex: RegExp, errorFormatter?: ValidationErrorMessageFormatter): this {
            return this.addMatcher(Matchers.StringMatchers.isRegex(regex, errorFormatter))
        }

        url(): this {
            return this.addMatcher(Matchers.StringMatchers.isURL());
        }

        ip(ipProtocolVersion: Constants.String.IPProtocolVersion | string): this {
            return this.addMatcher(Matchers.StringMatchers.isIPAddress(ipProtocolVersion));
        }

        email(): this {
            return this.addMatcher(Matchers.StringMatchers.isEmail());
        }
    }

    export class NumberMatchersBuilder extends MatchersBuilder {
        min(min: number): this {
            return this.addMatcher(Matchers.NumberMatchers.equalsOrAboveMinimum(min));
        }

        max(max: number): this {
            return this.addMatcher(Matchers.NumberMatchers.equalsOrBelowMaximum(max))
        }

        range(from: number, to: number): this {
            return this.addMatcher(Matchers.NumberMatchers.inRange(from, to))
        }
    }

    export class BooleanMatchersBuilder extends MatchersBuilder {
        true(): this {
            return this.addMatcher(Matchers.BooleanMatchers.isTrue());
        }

        false(): this {
            return this.addMatcher(Matchers.BooleanMatchers.isFalse());
        }
    }


    export class ObjectMatchersBuilder extends MatchersBuilder {
        includeProperty(propertyName: string): this {
            return this.addMatcher(Matchers.ObjectMatchers.hasOwnProperty(propertyName));
        }
    }

    export class DateMatchersBuilder extends MatchersBuilder {
        after(earliest: Date) {
            return this.addMatcher(Matchers.DateMatchers.isAfter(earliest));
        }

        before(latest: Date) {
            return this.addMatcher(Matchers.DateMatchers.isBefore(latest));
        }
    }
}
