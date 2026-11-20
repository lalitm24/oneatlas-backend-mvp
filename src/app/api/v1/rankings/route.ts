import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/api/errors";
import { rankingsQuerySchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

export const GET = withErrorHandler(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const query = rankingsQuerySchema.parse(
    Object.fromEntries(searchParams.entries())
  );

  const benchmarks = await prisma.benchmark.findMany({
    orderBy: { name: "asc" },
  });

  const modelWhere: Prisma.ModelWhereInput = {};
  if (query.modelType) {
    modelWhere.modelType = query.modelType;
  }
  if (query.openWeights !== undefined) {
    modelWhere.isOpenWeights = query.openWeights;
  }

  const models = await prisma.model.findMany({
    where: modelWhere,
    include: {
      lab: { select: { slug: true, name: true } },
      benchmarks: {
        include: {
          benchmark: true,
        },
      },
    },
  });

  const ranked = models
    .map((model) => {
      const relevantScores = model.benchmarks.filter((b) => {
        if (query.benchmark) return b.benchmark.slug === query.benchmark;
        if (query.category) return b.benchmark.category === query.category;
        return true;
      });

      if (relevantScores.length === 0) return null;

      const avgNormalizedScore = Number(
        (
          relevantScores.reduce((acc, item) => acc + item.normalizedScore, 0) /
          relevantScores.length
        ).toFixed(2)
      );

      const primaryScore = query.benchmark
        ? relevantScores[0]?.score ?? avgNormalizedScore
        : avgNormalizedScore;

      return {
        id: model.id,
        slug: model.slug,
        name: model.name,
        lab: model.lab,
        modelType: model.modelType,
        isOpenWeights: model.isOpenWeights,
        contextWindow: model.contextWindow,
        defaultInputPricePer1M: model.defaultInputPricePer1M,
        defaultOutputPricePer1M: model.defaultOutputPricePer1M,
        primaryScore,
        avgNormalizedScore,
        evaluatedBenchmarksCount: relevantScores.length,
        scores: relevantScores.map((s) => ({
          benchmarkSlug: s.benchmark.slug,
          benchmarkName: s.benchmark.name,
          category: s.benchmark.category,
          score: s.score,
          unit: s.benchmark.unit,
        })),
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => b.primaryScore - a.primaryScore)
    .slice(0, query.limit)
    .map((item, idx) => ({
      rank: idx + 1,
      ...item,
    }));

  return NextResponse.json({
    ok: true,
    data: {
      rankings: ranked,
      benchmarks,
    },
    meta: {
      total: ranked.length,
      category: query.category ?? null,
      benchmark: query.benchmark ?? null,
    },
  });
});
