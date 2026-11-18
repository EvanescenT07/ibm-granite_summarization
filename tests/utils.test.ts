import { describe, expect, it } from "vitest";
import { cn } from "../src/lib/utils";

describe("cn", () => {
  it("merges conditional class names", () => {
    expect(cn("px-2", false && "hidden", "text-sm")).toBe("px-2 text-sm");
  });

  it("resolves conflicting tailwind utilities with the last value", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});
