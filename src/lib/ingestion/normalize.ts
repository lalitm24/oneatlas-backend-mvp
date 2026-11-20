import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api/errors";
import { IngestModelPayload } from "@/lib/validation/schemas";

const CAPABILITY_ALIASES: Record<string, string> = {
  tools: "function-calling",
  "tool-calling": "function-calling",
  "tool_use": "function-calling",
  "function_calling": "function-calling",
  json: "structured-outputs",
  "json-mode": "structured-outputs",
  "structured_outputs": "structured-outputs",
  cot: "reasoning",
  thinking: "reasoning",
  coding: "code-generation",
  code: "code-generation",
  vision: "vision",
  image: "vision",
  search: "web-search",
};

const MODALITY_ALIASES: Record<string, string> = {
  txt: "text",
  img: "image",
  images: "image",
  aud: "audio",
  vid: "video",
  pdf: "document",
};

export function toSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizePricePer1M(
  value: number,
  unit: "per_1m" | "per_1k" | "per_token"
): number {
  const multiplier =
    unit === "per_1m" ? 1 : unit === "per_1k" ? 1000 : 1_000_000;
  return Number((value * multiplier).toFixed(4));
}

export function parseTokenCount(input: number | string): number {
  if (typeof input === "number") {
    if (!Number.isFinite(input) || input <= 0) {
      throw new ApiError(400, "INVALID_TOKEN_COUNT", "Token count must be positive");
    }
    return Math.round(input);
  }

  const cleaned = input.trim().toLowerCase().replace(/,/g, "");
  const match = cleaned.match(/^(\d+(?:\.\d+)?)\s*([km])?$/);
  if (!match) {
    throw new ApiError(
      400,
      "INVALID_TOKEN_COUNT",
      `Cannot parse token count "${input}". Expected integer or shorthand like "128k" or "1m".`
    );
  }

  const base = parseFloat(match[1]);
  const suffix = match[2];
  if (suffix === "k") return Math.round(base * 1_000);
  if (suffix === "m") return Math.round(base * 1_000_000);
  return Math.round(base);
}

export function normalizeTags(
  tags: string[],
  aliasMap: Record<string, string>
): string[] {
  const set = new Set<string>();
  for (const raw of tags) {
    const slug = toSlug(raw);
    if (!slug) continue;
    set.add(aliasMap[slug] ?? slug);
  }
  return Array.from(set).sort();
}

export async function ingestNormalizedModel(payload: IngestModelPayload) {
  const slug = payload.slug ? toSlug(payload.slug) : toSlug(payload.name);
  const labSlug = toSlug(payload.labSlug);
  const contextWindow = parseTokenCount(payload.contextWindow);
  const maxOutputTokens = payload.maxOutputTokens
    ? parseTokenCount(payload.maxOutputTokens)
    : null;
  const defaultInputPricePer1M = normalizePricePer1M(
    payload.inputPrice,
    payload.pricingUnit
  );
  const defaultOutputPricePer1M = normalizePricePer1M(
    payload.outputPrice,
    payload.pricingUnit
  );
  const capabilities = normalizeTags(payload.capabilities, CAPABILITY_ALIASES);
  const modalities = normalizeTags(payload.modalities, MODALITY_ALIASES);

  return prisma.$transaction(async (tx) => {
    let lab = await tx.lab.findUnique({ where: { slug: labSlug } });
    if (!lab) {
      if (!payload.labName) {
        throw new ApiError(
          400,
          "LAB_NOT_FOUND",
          `Lab "${labSlug}" does not exist. Provide "labName" to auto-create it.`
        );
      }
      lab = await tx.lab.create({
        data: {
          slug: labSlug,
          name: payload.labName,
          description: `${payload.labName} AI research lab.`,
        },
      });
    }

    const model = await tx.model.upsert({
      where: { slug },
      update: {
        name: payload.name,
        labId: lab.id,
        modelType: payload.modelType,
        status: payload.status,
        description: payload.description,
        contextWindow,
        maxOutputTokens,
        releaseDate: new Date(payload.releaseDate),
        isOpenWeights: payload.isOpenWeights,
        license: payload.license ?? null,
        parameterCount: payload.parameterCount ?? null,
        architecture: payload.architecture ?? null,
        defaultInputPricePer1M,
        defaultOutputPricePer1M,
        capabilities,
        modalities,
      },
      create: {
        slug,
        name: payload.name,
        labId: lab.id,
        modelType: payload.modelType,
        status: payload.status,
        description: payload.description,
        contextWindow,
        maxOutputTokens,
        releaseDate: new Date(payload.releaseDate),
        isOpenWeights: payload.isOpenWeights,
        license: payload.license ?? null,
        parameterCount: payload.parameterCount ?? null,
        architecture: payload.architecture ?? null,
        defaultInputPricePer1M,
        defaultOutputPricePer1M,
        capabilities,
        modalities,
      },
    });

    for (const off of payload.offerings) {
      const providerSlug = toSlug(off.providerSlug);
      const provider = await tx.provider.findUnique({
        where: { slug: providerSlug },
      });
      if (!provider) {
        throw new ApiError(
          400,
          "PROVIDER_NOT_FOUND",
          `Provider "${providerSlug}" does not exist.`
        );
      }

      const inputPricePer1M = normalizePricePer1M(
        off.inputPrice,
        off.pricingUnit
      );
      const outputPricePer1M = normalizePricePer1M(
        off.outputPrice,
        off.pricingUnit
      );
      const cachedInputPricePer1M =
        off.cachedInputPrice !== undefined
          ? normalizePricePer1M(off.cachedInputPrice, off.pricingUnit)
          : null;

      await tx.modelProvider.upsert({
        where: {
          modelId_providerId: {
            modelId: model.id,
            providerId: provider.id,
          },
        },
        update: {
          providerModelId: off.providerModelId,
          inputPricePer1M,
          outputPricePer1M,
          cachedInputPricePer1M,
          latencyMsP50: off.latencyMsP50 ?? null,
          throughputTps: off.throughputTps ?? null,
          uptimePct: off.uptimePct ?? 99.9,
          supportsStreaming: off.supportsStreaming,
          supportsToolCalling: off.supportsToolCalling,
          supportsJsonMode: off.supportsJsonMode,
          endpointUrl: off.endpointUrl ?? null,
        },
        create: {
          modelId: model.id,
          providerId: provider.id,
          providerModelId: off.providerModelId,
          inputPricePer1M,
          outputPricePer1M,
          cachedInputPricePer1M,
          latencyMsP50: off.latencyMsP50 ?? null,
          throughputTps: off.throughputTps ?? null,
          uptimePct: off.uptimePct ?? 99.9,
          supportsStreaming: off.supportsStreaming,
          supportsToolCalling: off.supportsToolCalling,
          supportsJsonMode: off.supportsJsonMode,
          endpointUrl: off.endpointUrl ?? null,
        },
      });
    }

    for (const bm of payload.benchmarks) {
      const benchmarkSlug = toSlug(bm.benchmarkSlug);
      const benchmark = await tx.benchmark.findUnique({
        where: { slug: benchmarkSlug },
      });
      if (!benchmark) {
        throw new ApiError(
          400,
          "BENCHMARK_NOT_FOUND",
          `Benchmark "${benchmarkSlug}" does not exist.`
        );
      }
      const normalizedScore = Number(
        Math.min(100, (bm.score / benchmark.maxScore) * 100).toFixed(2)
      );

      await tx.modelBenchmark.upsert({
        where: {
          modelId_benchmarkId: {
            modelId: model.id,
            benchmarkId: benchmark.id,
          },
        },
        update: {
          score: bm.score,
          normalizedScore,
          notes: bm.notes ?? null,
        },
        create: {
          modelId: model.id,
          benchmarkId: benchmark.id,
          score: bm.score,
          normalizedScore,
          notes: bm.notes ?? null,
        },
      });
    }

    return tx.model.findUnique({
      where: { id: model.id },
      include: {
        lab: true,
        offerings: { include: { provider: true } },
        benchmarks: { include: { benchmark: true } },
      },
    });
  });
}
