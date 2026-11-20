import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/api/errors";

export const dynamic = "force-dynamic";

export const GET = withErrorHandler(async () => {
  const start = performance.now();
  await prisma.$queryRaw`SELECT 1`;
  const dbLatencyMs = Math.round(performance.now() - start);

  const [models, labs, providers, benchmarks] = await Promise.all([
    prisma.model.count(),
    prisma.lab.count(),
    prisma.provider.count(),
    prisma.benchmark.count(),
  ]);

  return NextResponse.json({
    ok: true,
    service: "oneatlas-api",
    timestamp: new Date().toISOString(),
    database: {
      status: "connected",
      latencyMs: dbLatencyMs,
    },
    counts: {
      models,
      labs,
      providers,
      benchmarks,
    },
  });
});
