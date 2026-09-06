import type { NextRequest } from "next/server";
import { version } from "@/package.json";
import { buildHealth } from "@/lib/health";

// Thin handler: all logic lives in lib/health.ts and is unit-tested there.
const startedAt = new Date();

export async function GET(_req: NextRequest) {
  return Response.json(buildHealth({ service: "day01", version, startedAt }));
}
