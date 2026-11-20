import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, withErrorHandler } from "@/lib/api/errors";
import { compareQuerySchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

export const GET = withErrorHandler(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const query = compareQuerySchema.parse(
    Object.fromEntries(searchParams.entries())
  );

  const models = await prisma.model.findMany({
    where: { slug: { in: query.models } },
    include: {
      lab: { select: { slug: true, name: true } },
      offerings: {
        orderBy: { inputPricePer1M: "asc" },
        include: {
          provider: { select: { slug: true, name: true } },
        },
      },
      benchmarks: {
        include: {
          benchmark: true,
        },
      },
    },
  });

  if (models.length === 0) {
    throw new ApiError(
      404,
      "MODELS_NOT_FOUND",
      "None of the requested model slugs were found"
    );
  }

  // Preserve requested order
  const bySlug = new Map(models.map((m) => [m.slug, m]));
  const ordered = query.models
    .map((s) => bySlug.get(s))
    .filter((m): m is NonNullable<typeof m> => Boolean(m));

  // Build unified benchmark matrix across compared models
  const benchmarkMap = new Map<
    string,
    {
      slug: string;
      name: string;
      category: string;
      unit: string;
      scores: Record<string, number | null>;
    }
  >();

  for (const model of ordered) {
    for (const bm of model.benchmarks) {
      if (!benchmarkMap.has(bm.benchmark.slug)) {
        benchmarkMap.set(bm.benchmark.slug, {
          slug: bm.benchmark.slug,
          name: bm.benchmark.name,
          category: bm.benchmark.category,
          unit: bm.benchmark.unit,
          scores: {},
        });
      }
      benchmarkMap.get(bm.benchmark.slug)!.scores[model.slug] = bm.score;
    }
  }

  // Ensure every model slug has an entry (null if not evaluated)
  const benchmarkMatrix = Array.from(benchmarkMap.values()).map((row) => {
    const scores: Record<string, number | null> = {};
    for (const m of ordered) {
      scores[m.slug] = row.scores[m.slug] ?? null;
    }
    return { ...row, scores };
  });

  const allCapabilities = Array.from(
    new Set(ordered.flatMap((m) => m.capabilities))
  ).sort();

  const allModalities = Array.from(
    new Set(ordered.flatMap((m) => m.modalities))
  ).sort();

  return NextResponse.json({
    ok: true,
    data: {
      models: ordered,
      benchmarkMatrix,
      allCapabilities,
      allModalities,
    },
  });
});
