import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/api/errors";
import { modelListQuerySchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

export const GET = withErrorHandler(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const rawParams = Object.fromEntries(searchParams.entries());
  const query = modelListQuerySchema.parse(rawParams);

  const where: Prisma.ModelWhereInput = {};

  if (query.q) {
    where.OR = [
      { name: { contains: query.q, mode: "insensitive" } },
      { slug: { contains: query.q, mode: "insensitive" } },
      { description: { contains: query.q, mode: "insensitive" } },
      { lab: { name: { contains: query.q, mode: "insensitive" } } },
    ];
  }

  if (query.lab) {
    where.lab = { slug: query.lab };
  }

  if (query.provider) {
    where.offerings = {
      some: {
        provider: { slug: query.provider },
      },
    };
  }

  if (query.modelType) {
    where.modelType = query.modelType;
  }

  if (query.capability) {
    where.capabilities = { has: query.capability };
  }

  if (query.modality) {
    where.modalities = { has: query.modality };
  }

  if (query.openWeights !== undefined) {
    where.isOpenWeights = query.openWeights;
  }

  if (query.minContext !== undefined) {
    where.contextWindow = { gte: query.minContext };
  }

  if (query.maxInputPrice !== undefined) {
    where.defaultInputPricePer1M = { lte: query.maxInputPrice };
  }

  const orderByMap: Record<
    typeof query.sort,
    Prisma.ModelOrderByWithRelationInput
  > = {
    release_desc: { releaseDate: "desc" },
    release_asc: { releaseDate: "asc" },
    price_asc: { defaultInputPricePer1M: "asc" },
    price_desc: { defaultInputPricePer1M: "desc" },
    context_desc: { contextWindow: "desc" },
    name_asc: { name: "asc" },
  };

  const skip = (query.page - 1) * query.limit;

  const [total, models] = await Promise.all([
    prisma.model.count({ where }),
    prisma.model.findMany({
      where,
      orderBy: orderByMap[query.sort],
      skip,
      take: query.limit,
      include: {
        lab: {
          select: { id: true, slug: true, name: true, country: true },
        },
        offerings: {
          orderBy: { inputPricePer1M: "asc" },
          include: {
            provider: {
              select: { id: true, slug: true, name: true },
            },
          },
        },
        benchmarks: {
          include: {
            benchmark: {
              select: { slug: true, name: true, category: true, unit: true },
            },
          },
        },
      },
    }),
  ]);

  return NextResponse.json({
    ok: true,
    data: models,
    meta: {
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    },
  });
});
