export interface ValueRule {
    readonly ruleFunction: RuleFunction;
    readonly errorFormatter: ErrorFormatter
}

export type RuleFunction = (value: any) => boolean;
export type ErrorFormatter = ((value: string) => string) | string;

