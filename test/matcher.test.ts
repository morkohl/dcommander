import * as chai from 'chai';
import {Matchers} from "../src/dcommander/validation/matchers/matchers";
import {Constants} from "../src/dcommander/validation/matchers/constants";

const expect = chai.expect;

describe("Matcher Test", () => {
    describe("NumberMatchers Test", () => {
        describe("inRange", () => {
            const matcher = Matchers.NumberMatchers.inRange(0, 10);

            it("should return true if the supplied value is valid", () => {
                expect(matcher.isMatching(0)).to.be.true;
                expect(matcher.isMatching(5)).to.be.true;
                expect(matcher.isMatching(10)).to.be.true;
            });

            it("should return false if the supplied value is invalid", () => {
                expect(matcher.isMatching(-1)).to.be.false;
                expect(matcher.isMatching(11)).to.be.false;
            });
        });
        describe("equalsOrAboveMinimum", () => {
            const matcher = Matchers.NumberMatchers.equalsOrAboveMinimum(10);

            it("should return true if the supplied value is valid", () => {
                expect(matcher.isMatching(10)).to.be.true;
                expect(matcher.isMatching(11)).to.be.true;
            });

            it("should return false if the supplied value is invalid", () => {
                expect(matcher.isMatching(9)).to.be.false;
                expect(matcher.isMatching(-1)).to.be.false;
            });
        });
        describe("equalsOrBelowMaximum", () => {
            const matcher = Matchers.NumberMatchers.equalsOrBelowMaximum(10);

            it("should return true if the supplied value is valid", () => {
                expect(matcher.isMatching(10)).to.be.true;
                expect(matcher.isMatching(9)).to.be.true;
                expect(matcher.isMatching(-1)).to.be.true;
            });

            it("should return false if the supplied value is invalid", () => {
                expect(matcher.isMatching(11)).to.be.false;
                expect(matcher.isMatching(200)).to.be.false;

            });
        });
    });
    describe("StringMatchers Test", () => {
        describe("isRegex", () => {
            const matcher = Matchers.StringMatchers.isRegex(/^[a-z]+$/i);

            it("should return true if the supplied value is valid", () => {
                expect(matcher.isMatching("h")).to.be.true;
                expect(matcher.isMatching("hello")).to.be.true;
            });

            it("should return false if the supplied value is invalid", () => {
                expect(matcher.isMatching("Hello world")).to.be.false;
                expect(matcher.isMatching("1234")).to.be.false;
            });
        });
        describe("isEmail", () => {
            const matcher = Matchers.StringMatchers.isEmail();

            it("should return true if the supplied value is valid", () => {
                expect(matcher.isMatching("john-doe@mail.com")).to.be.true;
                expect(matcher.isMatching("john.doe@mail-domain.com")).to.be.true
            });

            it("should return false if the supplied value is invalid", () => {
                expect(matcher.isMatching("john.doe")).to.be.false

            });
        });
        describe("isIPAddress", () => {
            const matcherIPv4 = Matchers.StringMatchers.isIPAddress(Constants.String.IPProtocolVersion.IPV4);
            const matcherIPv6 = Matchers.StringMatchers.isIPAddress(Constants.String.IPProtocolVersion.IPV6);

            it("should return true if the supplied value is valid", () => {
                expect(matcherIPv4.isMatching("192.168.172.0")).to.be.true;
                expect(matcherIPv4.isMatching("0.0.0.0")).to.be.true;
                expect(matcherIPv4.isMatching("10.10.255.10")).to.be.true;

                expect(matcherIPv6.isMatching("::1")).to.be.true;
                expect(matcherIPv6.isMatching("::")).to.be.true;
                expect(matcherIPv6.isMatching("01::")).to.be.true;
                expect(matcherIPv6.isMatching("fe80::")).to.be.true;
                expect(matcherIPv6.isMatching("0000:0000:0001:1::")).to.be.true;
            });

            it("should return false if the supplied value is invalid", () => {
                expect(matcherIPv4.isMatching("192.168.0.")).to.be.false;
                expect(matcherIPv4.isMatching("not an ipv4 address")).to.be.false;
                expect(matcherIPv4.isMatching("10.8.0.256")).to.be.false;

                expect(matcherIPv6.isMatching("0000:0000::0001:1::")).to.be.false;
                expect(matcherIPv6.isMatching(":::")).to.be.false;
                expect(matcherIPv6.isMatching("0000:0000:0000:0000:0000:0000:0000:0000:0001")).to.be.false;

            });
        });
        describe("isURL", () => {
            const matcher = Matchers.StringMatchers.isURL();

            it("should return true if the supplied value is valid", () => {
                expect(matcher.isMatching("https://google.com")).to.be.true;
                expect(matcher.isMatching("http://subdomain.domain.com/path?q=10&p=20")).to.be.true;
                expect(matcher.isMatching("domain.com")).to.be.true;
            });

            it("should return false if the supplied value is invalid", () => {
                //sockets are not supported yet
                expect(matcher.isMatching("ws+unix:///var/run/docker.sock")).to.be.false;
                expect(matcher.isMatching("http:/google.com")).to.be.false;
                expect(matcher.isMatching("htptps://google.com/path/to/something")).to.be.false;

            });
        });
    });
    describe("BooleanMatchers Test", () => {
        describe("isTrue", () => {
            const matcher = Matchers.BooleanMatchers.isTrue();

            it("should return true if the supplied value is valid", () => {
                expect(matcher.isMatching(true)).to.be.true;
            });

            it("should return false if the supplied value is invalid", () => {
                expect(matcher.isMatching(false)).to.be.false;

            });
        });
        describe("isFalse", () => {
            const matcher = Matchers.BooleanMatchers.isFalse();

            it("should return true if the supplied value is valid", () => {
                expect(matcher.isMatching(false)).to.be.true;
            });

            it("should return false if the supplied value is invalid", () => {
                expect(matcher.isMatching(true)).to.be.false;
            });
        });
    });
    describe("ObjectMatchers Test", () => {
        describe("hasOwnProperty", () => {
            const matcher = Matchers.ObjectMatchers.hasOwnProperty("property");

            it("should return true if the supplied value is valid", () => {
                expect(matcher.isMatching({property:"string"})).to.be.true;
            });

            it("should return false if the supplied value is invalid", () => {
                expect(matcher.isMatching({string:"property"})).to.be.false

            });
        });
    });
});