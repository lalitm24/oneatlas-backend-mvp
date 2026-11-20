import { z } from "zod";
import { BenchmarkCategory, ModelStatus, ModelType } from "@prisma/client";

const csvToArray = (val: string | undefined) =>
  val
    ? val
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : undefined;

export const modelListQuerySchema = z.object({
  q: z.string().trim().max(120).optional(),
  lab: z.string().trim().optional(),
  provider: z.string().trim().optional(),
  modelType: z.nativeEnum(ModelType).optional(),
  capability: z.string().trim().optional(),
  modality: z.string().trim().optional(),
  openWeights: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
  minContext: z.coerce.number().int().min(0).optional(),
  maxInputPrice: z.coerce.number().min(0).optional(),
  sort: z
    .enum([
      "release_desc",
      "release_asc",
      "price_asc",
      "price_desc",
      "context_desc",
      "name_asc",
    ])
    .default("release_desc"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export const compareQuerySchema = z.object({
  models: z
    .string()
    .trim()
    .min(1, "Provide at least one model slug via ?models=slug1,slug2")
    .transform(csvToArray)
    .pipe(
      z
        .array(z.string().min(1))
        .min(1, "At least 1 model slug is required")
        .max(4, "Compare supports up to 4 models at once")
    ),
});

export const rankingsQuerySchema = z.object({
  category: z.nativeEnum(BenchmarkCategory).optional(),
  benchmark: z.string().trim().optional(),
  modelType: z.nativeEnum(ModelType).optional(),
  openWeights: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const ingestModelPayloadSchema = z.object({
  slug: z.string().trim().min(2).max(100).optional(),
  name: z.string().trim().min(2).max(120),
  labSlug: z.string().trim().min(2).max(80),
  labName: z.string().trim().min(2).max(120).optional(),
  modelType: z.nativeEnum(ModelType).default(ModelType.CHAT),
  status: z.nativeEnum(ModelStatus).default(ModelStatus.ACTIVE),
  description: z.string().trim().min(10).max(2000),
  contextWindow: z.union([z.number().int().positive(), z.string().min(1)]),
  maxOutputTokens: z
    .union([z.number().int().positive(), z.string().min(1)])
    .optional(),
  releaseDate: z.string().refine((val) => !Number.isNaN(Date.parse(val)), {
    message: "releaseDate must be a valid ISO date string",
  }),
  isOpenWeights: z.boolean().default(false),
  license: z.string().trim().max(80).optional(),
  parameterCount: z.string().trim().max(40).optional(),
  architecture: z.string().trim().max(80).optional(),
  pricingUnit: z.enum(["per_1m", "per_1k", "per_token"]).default("per_1m"),
  inputPrice: z.number().min(0),
  outputPrice: z.number().min(0),
  capabilities: z.array(z.string().trim().min(1)).default([]),
  modalities: z.array(z.string().trim().min(1)).default(["text"]),
  offerings: z
    .array(
      z.object({
        providerSlug: z.string().trim().min(2).max(80),
        providerModelId: z.string().trim().min(1).max(160),
        pricingUnit: z
          .enum(["per_1m", "per_1k", "per_token"])
          .default("per_1m"),
        inputPrice: z.number().min(0),
        outputPrice: z.number().min(0),
        cachedInputPrice: z.number().min(0).optional(),
        latencyMsP50: z.number().int().positive().optional(),
        throughputTps: z.number().positive().optional(),
        uptimePct: z.number().min(0).max(100).optional(),
        supportsStreaming: z.boolean().default(true),
        supportsToolCalling: z.boolean().default(true),
        supportsJsonMode: z.boolean().default(true),
        endpointUrl: z.string().url().optional(),
      })
    )
    .default([]),
  benchmarks: z
    .array(
      z.object({
        benchmarkSlug: z.string().trim().min(2).max(80),
        score: z.number().min(0),
        notes: z.string().trim().max(300).optional(),
      })
    )
    .default([]),
});

export type IngestModelPayload = z.infer<typeof ingestModelPayloadSchema>;
