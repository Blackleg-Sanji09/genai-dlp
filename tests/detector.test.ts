import { describe, expect, it } from "vitest";
import { containsSensitiveMarker } from "../src/dlp/detector";

describe("containsSensitiveMarker", () => {
    it("returns false for normal text", () => {
        expect(containsSensitiveMarker("Hello world")).toBe(false);
    });

    it("returns true when the sensitive marker is present", () => {
        expect(containsSensitiveMarker("This contains WALLED_SENSITIVE data")).toBe(true);
    });

    it("returns true when the marker is at the beginning", () => {
        expect(containsSensitiveMarker("WALLED_SENSITIVE information")).toBe(true);
    });

    it("returns true when the marker is at the end", () => {
        expect(containsSensitiveMarker("My secret is WALLED_SENSITIVE")).toBe(true);
    });

    it("returns true when the marker is embedded in a sentence", () => {
        expect(containsSensitiveMarker("Please check this WALLED_SENSITIVE content carefully")).toBe(true);
    });

    it("returns false for an empty string", () => {
        expect(containsSensitiveMarker("")).toBe(false);
    });

    it("is case-sensitive", () => {
        expect(containsSensitiveMarker("walled_sensitive")).toBe(false);
    });
});