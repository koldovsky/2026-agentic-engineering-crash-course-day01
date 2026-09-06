import { describe, expect, it } from "vitest";
import { buildHealth } from "@/lib/health";

describe("buildHealth", () => {
  const startedAt = new Date("2026-09-08T16:30:00.000Z");

  it("reports ok with uptime in whole seconds", () => {
    const now = new Date("2026-09-08T16:31:07.900Z");
    expect(buildHealth({ service: "day01", version: "0.1.0", startedAt, now })).toEqual({
      status: "ok",
      service: "day01",
      version: "0.1.0",
      uptimeSeconds: 67,
      checkedAt: "2026-09-08T16:31:07.900Z",
    });
  });

  it("never reports negative uptime", () => {
    const now = new Date("2026-09-08T16:29:00.000Z");
    expect(buildHealth({ service: "day01", version: "0.1.0", startedAt, now }).uptimeSeconds).toBe(0);
  });

  it("rejects an empty service name", () => {
    expect(() => buildHealth({ service: "  ", version: "0.1.0", startedAt })).toThrow(/service name/);
  });
});
