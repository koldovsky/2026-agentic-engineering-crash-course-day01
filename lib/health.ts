// Pure logic for GET /api/health — no React, no Next imports, so it is unit-testable in isolation.

export type Health = {
  status: "ok";
  service: string;
  version: string;
  uptimeSeconds: number;
  checkedAt: string; // ISO 8601
};

export type HealthInput = {
  service: string;
  version: string;
  startedAt: Date;
  now?: Date;
};

export function buildHealth({ service, version, startedAt, now = new Date() }: HealthInput): Health {
  if (!service.trim()) throw new Error("service name is required");
  const uptimeSeconds = Math.max(0, Math.floor((now.getTime() - startedAt.getTime()) / 1000));
  return { status: "ok", service, version, uptimeSeconds, checkedAt: now.toISOString() };
}
