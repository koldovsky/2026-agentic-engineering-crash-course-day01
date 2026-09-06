// @vitest-environment node
import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("GET /api/health", () => {
  it("returns 200 and an ok payload", async () => {
    const res = await GET(new Request("http://localhost/api/health") as never);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ status: "ok", service: "day01" });
    expect(typeof body.uptimeSeconds).toBe("number");
    expect(() => new Date(body.checkedAt).toISOString()).not.toThrow();
  });
});
