import {
  BenchmarkCategory,
  ModelStatus,
  ModelType,
  PrismaClient,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding OneAtlas PostgreSQL database...");

  // Clear existing data in dependency order for idempotent re-seeding
  await prisma.modelBenchmark.deleteMany();
  await prisma.modelProvider.deleteMany();
  await prisma.model.deleteMany();
  await prisma.benchmark.deleteMany();
  await prisma.provider.deleteMany();
  await prisma.lab.deleteMany();

  // 1. AI Labs
  const labsData = [
    {
      slug: "openai",
      name: "OpenAI",
      country: "USA",
      websiteUrl: "https://openai.com",
      foundedYear: 2015,
      description:
        "AI research and deployment company building frontier GPT and reasoning models.",
    },
    {
      slug: "anthropic",
      name: "Anthropic",
      country: "USA",
      websiteUrl: "https://anthropic.com",
      foundedYear: 2021,
      description:
        "AI safety and research company behind the Claude family of models.",
    },
    {
      slug: "google-deepmind",
      name: "Google DeepMind",
      country: "UK / USA",
      websiteUrl: "https://deepmind.google",
      foundedYear: 2010,
      description:
        "Google's AI research lab developing the Gemini multimodal model series.",
    },
    {
      slug: "meta-ai",
      name: "Meta AI",
      country: "USA",
      websiteUrl: "https://ai.meta.com",
      foundedYear: 2013,
      description:
        "Fundamental AI research organization advancing open-weights Llama models.",
    },
    {
      slug: "deepseek",
      name: "DeepSeek",
      country: "China",
      websiteUrl: "https://deepseek.com",
      foundedYear: 2023,
      description:
        "AI research lab specializing in efficient Mixture-of-Experts and open reasoning models.",
    },
    {
      slug: "mistral-ai",
      name: "Mistral AI",
      country: "France",
      websiteUrl: "https://mistral.ai",
      foundedYear: 2023,
      description:
        "European frontier AI lab producing compact and enterprise-grade models.",
    },
    {
      slug: "qwen",
      name: "Qwen (Alibaba Cloud)",
      country: "China",
      websiteUrl: "https://qwenlm.github.io",
      foundedYear: 2023,
      description:
        "Alibaba Cloud's AI lab releasing high-performing open-weights Qwen models.",
    },
    {
      slug: "xai",
      name: "xAI",
      country: "USA",
      websiteUrl: "https://x.ai",
      foundedYear: 2023,
      description: "AI lab developing the Grok family of reasoning and chat models.",
    },
  ];

  const labs: Record<string, string> = {};
  for (const lab of labsData) {
    const created = await prisma.lab.create({ data: lab });
    labs[lab.slug] = created.id;
  }

  // 2. Inference Providers
  const providersData = [
    {
      slug: "openai-direct",
      name: "OpenAI Direct",
      websiteUrl: "https://platform.openai.com",
      docsUrl: "https://platform.openai.com/docs",
      region: "Global",
      isAggregator: false,
      description: "First-party API endpoints hosted directly by OpenAI.",
    },
    {
      slug: "anthropic-direct",
      name: "Anthropic Direct",
      websiteUrl: "https://console.anthropic.com",
      docsUrl: "https://docs.anthropic.com",
      region: "Global",
      isAggregator: false,
      description: "First-party Claude API with prompt caching and batching.",
    },
    {
      slug: "google-vertex-ai",
      name: "Google Vertex AI",
      websiteUrl: "https://cloud.google.com/vertex-ai",
      docsUrl: "https://cloud.google.com/vertex-ai/docs",
      region: "Multi-Region",
      isAggregator: true,
      description:
        "Enterprise Google Cloud AI platform hosting Gemini, Claude, and Llama models.",
    },
    {
      slug: "aws-bedrock",
      name: "AWS Bedrock",
      websiteUrl: "https://aws.amazon.com/bedrock",
      docsUrl: "https://docs.aws.amazon.com/bedrock",
      region: "Multi-Region",
      isAggregator: true,
      description:
        "Managed AWS inference service supporting Claude, Llama, and Mistral.",
    },
    {
      slug: "openrouter",
      name: "OpenRouter",
      websiteUrl: "https://openrouter.ai",
      docsUrl: "https://openrouter.ai/docs",
      region: "Global",
      isAggregator: true,
      description:
        "Unified model routing layer across dozens of upstream providers.",
    },
    {
      slug: "together-ai",
      name: "Together AI",
      websiteUrl: "https://together.ai",
      docsUrl: "https://docs.together.ai",
      region: "US / EU",
      isAggregator: false,
      description:
        "High-throughput inference cloud optimized for open-weights models.",
    },
    {
      slug: "groq",
      name: "Groq",
      websiteUrl: "https://groq.com",
      docsUrl: "https://console.groq.com/docs",
      region: "US",
      isAggregator: false,
      description:
        "LPU-accelerated ultra-low-latency inference for open-weights LLMs.",
    },
  ];

  const providers: Record<string, string> = {};
  for (const prov of providersData) {
    const created = await prisma.provider.create({ data: prov });
    providers[prov.slug] = created.id;
  }

  // 3. Benchmarks
  const benchmarksData = [
    {
      slug: "swe-bench-verified",
      name: "SWE-bench Verified",
      category: BenchmarkCategory.CODING,
      maxScore: 100,
      unit: "%",
      description:
        "Real-world GitHub issue resolution rate on verified Python repositories.",
      sourceUrl: "https://www.swebench.com/",
    },
    {
      slug: "gpqa-diamond",
      name: "GPQA Diamond",
      category: BenchmarkCategory.REASONING,
      maxScore: 100,
      unit: "%",
      description:
        "Graduate-level PhD-hard science questions across physics, biology, and chemistry.",
      sourceUrl: "https://arxiv.org/abs/2311.12022",
    },
    {
      slug: "aime-2025",
      name: "AIME 2025",
      category: BenchmarkCategory.MATH,
      maxScore: 100,
      unit: "%",
      description:
        "Competition mathematics problems from the American Invitational Mathematics Examination.",
      sourceUrl: "https://maa.org/",
    },
    {
      slug: "mmlu-pro",
      name: "MMLU-Pro",
      category: BenchmarkCategory.GENERAL,
      maxScore: 100,
      unit: "%",
      description:
        "10-choice multi-task language understanding across 14 academic and professional domains.",
      sourceUrl: "https://github.com/TIGER-AI-Lab/MMLU-Pro",
    },
    {
      slug: "livecodebench",
      name: "LiveCodeBench",
      category: BenchmarkCategory.CODING,
      maxScore: 100,
      unit: "%",
      description:
        "Contamination-free competitive programming benchmark sourced from LeetCode and AtCoder.",
      sourceUrl: "https://livecodebench.github.io/",
    },
    {
      slug: "mmmu",
      name: "MMMU",
      category: BenchmarkCategory.MULTIMODAL,
      maxScore: 100,
      unit: "%",
      description:
        "Massive Multi-discipline Multimodal Understanding across college-level visual tasks.",
      sourceUrl: "https://mmmu-benchmark.github.io/",
    },
  ];

  const benchmarks: Record<string, string> = {};
  for (const bm of benchmarksData) {
    const created = await prisma.benchmark.create({ data: bm });
    benchmarks[bm.slug] = created.id;
  }

  // 4. Models + Offerings + Benchmarks
  const modelsSeed = [
    {
      slug: "claude-3-7-sonnet",
      name: "Claude 3.7 Sonnet",
      labSlug: "anthropic",
      modelType: ModelType.REASONING,
      status: ModelStatus.ACTIVE,
      description:
        "Hybrid reasoning model supporting standard fast responses and extended step-by-step thinking for coding and complex analysis.",
      contextWindow: 200000,
      maxOutputTokens: 64000,
      releaseDate: "2025-02-24",
      isOpenWeights: false,
      license: "Proprietary",
      parameterCount: "Undisclosed",
      architecture: "Transformer (Hybrid Reasoning)",
      defaultInputPricePer1M: 3.0,
      defaultOutputPricePer1M: 15.0,
      capabilities: [
        "code-generation",
        "function-calling",
        "reasoning",
        "structured-outputs",
        "vision",
      ],
      modalities: ["document", "image", "text"],
      offerings: [
        {
          providerSlug: "anthropic-direct",
          providerModelId: "claude-3-7-sonnet-20250219",
          inputPricePer1M: 3.0,
          outputPricePer1M: 15.0,
          cachedInputPricePer1M: 0.3,
          latencyMsP50: 780,
          throughputTps: 78,
        },
        {
          providerSlug: "aws-bedrock",
          providerModelId: "anthropic.claude-3-7-sonnet-20250219-v1:0",
          inputPricePer1M: 3.0,
          outputPricePer1M: 15.0,
          cachedInputPricePer1M: 0.3,
          latencyMsP50: 840,
          throughputTps: 72,
        },
        {
          providerSlug: "google-vertex-ai",
          providerModelId: "claude-3-7-sonnet@20250219",
          inputPricePer1M: 3.0,
          outputPricePer1M: 15.0,
          latencyMsP50: 820,
          throughputTps: 74,
        },
        {
          providerSlug: "openrouter",
          providerModelId: "anthropic/claude-3.7-sonnet",
          inputPricePer1M: 3.0,
          outputPricePer1M: 15.0,
          latencyMsP50: 890,
          throughputTps: 70,
        },
      ],
      benchmarks: {
        "swe-bench-verified": 70.3,
        "gpqa-diamond": 68.0,
        "aime-2025": 61.3,
        "mmlu-pro": 80.5,
        livecodebench: 64.2,
        mmmu: 71.8,
      },
    },
    {
      slug: "gpt-4o",
      name: "GPT-4o",
      labSlug: "openai",
      modelType: ModelType.MULTIMODAL,
      status: ModelStatus.ACTIVE,
      description:
        "Flagship omni-modal model balancing low latency, strong general reasoning, vision understanding, and tool calling.",
      contextWindow: 128000,
      maxOutputTokens: 16384,
      releaseDate: "2024-05-13",
      isOpenWeights: false,
      license: "Proprietary",
      parameterCount: "Undisclosed",
      architecture: "Omni-modal Transformer",
      defaultInputPricePer1M: 2.5,
      defaultOutputPricePer1M: 10.0,
      capabilities: [
        "code-generation",
        "function-calling",
        "structured-outputs",
        "vision",
      ],
      modalities: ["audio", "image", "text"],
      offerings: [
        {
          providerSlug: "openai-direct",
          providerModelId: "gpt-4o",
          inputPricePer1M: 2.5,
          outputPricePer1M: 10.0,
          cachedInputPricePer1M: 1.25,
          latencyMsP50: 540,
          throughputTps: 105,
        },
        {
          providerSlug: "openrouter",
          providerModelId: "openai/gpt-4o",
          inputPricePer1M: 2.5,
          outputPricePer1M: 10.0,
          latencyMsP50: 610,
          throughputTps: 98,
        },
      ],
      benchmarks: {
        "swe-bench-verified": 38.8,
        "gpqa-diamond": 53.6,
        "mmlu-pro": 74.7,
        livecodebench: 49.5,
        mmmu: 69.1,
      },
    },
    {
      slug: "o3-mini",
      name: "OpenAI o3-mini",
      labSlug: "openai",
      modelType: ModelType.REASONING,
      status: ModelStatus.ACTIVE,
      description:
        "Cost-efficient STEM reasoning model with configurable reasoning effort for math, coding, and science.",
      contextWindow: 200000,
      maxOutputTokens: 100000,
      releaseDate: "2025-01-31",
      isOpenWeights: false,
      license: "Proprietary",
      parameterCount: "Undisclosed",
      architecture: "Reasoning Transformer",
      defaultInputPricePer1M: 1.1,
      defaultOutputPricePer1M: 4.4,
      capabilities: [
        "code-generation",
        "function-calling",
        "reasoning",
        "structured-outputs",
      ],
      modalities: ["text"],
      offerings: [
        {
          providerSlug: "openai-direct",
          providerModelId: "o3-mini",
          inputPricePer1M: 1.1,
          outputPricePer1M: 4.4,
          cachedInputPricePer1M: 0.55,
          latencyMsP50: 1450,
          throughputTps: 135,
        },
        {
          providerSlug: "openrouter",
          providerModelId: "openai/o3-mini",
          inputPricePer1M: 1.1,
          outputPricePer1M: 4.4,
          latencyMsP50: 1520,
          throughputTps: 128,
        },
      ],
      benchmarks: {
        "swe-bench-verified": 49.3,
        "gpqa-diamond": 77.0,
        "aime-2025": 83.6,
        "mmlu-pro": 79.1,
        livecodebench: 74.1,
      },
    },
    {
      slug: "gemini-2-5-pro",
      name: "Gemini 2.5 Pro",
      labSlug: "google-deepmind",
      modelType: ModelType.REASONING,
      status: ModelStatus.ACTIVE,
      description:
        "Long-context native multimodal thinking model with 1M+ token context window across text, code, audio, and video.",
      contextWindow: 1048576,
      maxOutputTokens: 65536,
      releaseDate: "2025-03-25",
      isOpenWeights: false,
      license: "Proprietary",
      parameterCount: "Undisclosed",
      architecture: "Native Multimodal MoE",
      defaultInputPricePer1M: 1.25,
      defaultOutputPricePer1M: 10.0,
      capabilities: [
        "code-generation",
        "function-calling",
        "long-context",
        "reasoning",
        "structured-outputs",
        "vision",
      ],
      modalities: ["audio", "document", "image", "text", "video"],
      offerings: [
        {
          providerSlug: "google-vertex-ai",
          providerModelId: "gemini-2.5-pro",
          inputPricePer1M: 1.25,
          outputPricePer1M: 10.0,
          cachedInputPricePer1M: 0.31,
          latencyMsP50: 890,
          throughputTps: 92,
        },
        {
          providerSlug: "openrouter",
          providerModelId: "google/gemini-2.5-pro",
          inputPricePer1M: 1.25,
          outputPricePer1M: 10.0,
          latencyMsP50: 950,
          throughputTps: 88,
        },
      ],
      benchmarks: {
        "swe-bench-verified": 63.8,
        "gpqa-diamond": 84.0,
        "aime-2025": 86.7,
        "mmlu-pro": 84.1,
        livecodebench: 75.6,
        mmmu: 81.7,
      },
    },
    {
      slug: "gemini-2-0-flash",
      name: "Gemini 2.0 Flash",
      labSlug: "google-deepmind",
      modelType: ModelType.MULTIMODAL,
      status: ModelStatus.ACTIVE,
      description:
        "High-speed, ultra-low-cost multimodal workhorse model with 1M token context window.",
      contextWindow: 1048576,
      maxOutputTokens: 8192,
      releaseDate: "2025-02-05",
      isOpenWeights: false,
      license: "Proprietary",
      parameterCount: "Undisclosed",
      architecture: "Multimodal Transformer",
      defaultInputPricePer1M: 0.1,
      defaultOutputPricePer1M: 0.4,
      capabilities: [
        "code-generation",
        "function-calling",
        "long-context",
        "structured-outputs",
        "vision",
      ],
      modalities: ["audio", "image", "text", "video"],
      offerings: [
        {
          providerSlug: "google-vertex-ai",
          providerModelId: "gemini-2.0-flash-001",
          inputPricePer1M: 0.1,
          outputPricePer1M: 0.4,
          cachedInputPricePer1M: 0.025,
          latencyMsP50: 320,
          throughputTps: 185,
        },
        {
          providerSlug: "openrouter",
          providerModelId: "google/gemini-2.0-flash-001",
          inputPricePer1M: 0.1,
          outputPricePer1M: 0.4,
          latencyMsP50: 370,
          throughputTps: 170,
        },
      ],
      benchmarks: {
        "gpqa-diamond": 60.1,
        "mmlu-pro": 77.6,
        livecodebench: 52.3,
        mmmu: 71.7,
      },
    },
    {
      slug: "deepseek-r1",
      name: "DeepSeek-R1",
      labSlug: "deepseek",
      modelType: ModelType.REASONING,
      status: ModelStatus.ACTIVE,
      description:
        "Open-weights 671B MoE reasoning model trained with large-scale reinforcement learning.",
      contextWindow: 128000,
      maxOutputTokens: 32768,
      releaseDate: "2025-01-20",
      isOpenWeights: true,
      license: "MIT",
      parameterCount: "671B (37B active)",
      architecture: "Mixture-of-Experts (MoE)",
      defaultInputPricePer1M: 0.55,
      defaultOutputPricePer1M: 2.19,
      capabilities: ["code-generation", "reasoning", "structured-outputs"],
      modalities: ["text"],
      offerings: [
        {
          providerSlug: "together-ai",
          providerModelId: "deepseek-ai/DeepSeek-R1",
          inputPricePer1M: 0.9,
          outputPricePer1M: 3.0,
          latencyMsP50: 980,
          throughputTps: 62,
        },
        {
          providerSlug: "openrouter",
          providerModelId: "deepseek/deepseek-r1",
          inputPricePer1M: 0.55,
          outputPricePer1M: 2.19,
          latencyMsP50: 1120,
          throughputTps: 54,
        },
      ],
      benchmarks: {
        "swe-bench-verified": 49.2,
        "gpqa-diamond": 71.5,
        "aime-2025": 79.8,
        "mmlu-pro": 84.0,
        livecodebench: 65.9,
      },
    },
    {
      slug: "deepseek-v3",
      name: "DeepSeek-V3",
      labSlug: "deepseek",
      modelType: ModelType.CHAT,
      status: ModelStatus.ACTIVE,
      description:
        "High-efficiency open-weights 671B MoE general chat and coding model with Multi-head Latent Attention.",
      contextWindow: 128000,
      maxOutputTokens: 16384,
      releaseDate: "2024-12-26",
      isOpenWeights: true,
      license: "MIT",
      parameterCount: "671B (37B active)",
      architecture: "Mixture-of-Experts (MoE)",
      defaultInputPricePer1M: 0.27,
      defaultOutputPricePer1M: 1.1,
      capabilities: [
        "code-generation",
        "function-calling",
        "structured-outputs",
      ],
      modalities: ["text"],
      offerings: [
        {
          providerSlug: "together-ai",
          providerModelId: "deepseek-ai/DeepSeek-V3",
          inputPricePer1M: 0.6,
          outputPricePer1M: 1.25,
          latencyMsP50: 490,
          throughputTps: 88,
        },
        {
          providerSlug: "openrouter",
          providerModelId: "deepseek/deepseek-chat",
          inputPricePer1M: 0.27,
          outputPricePer1M: 1.1,
          latencyMsP50: 540,
          throughputTps: 76,
        },
      ],
      benchmarks: {
        "swe-bench-verified": 42.0,
        "gpqa-diamond": 59.1,
        "mmlu-pro": 75.9,
        livecodebench: 58.2,
      },
    },
    {
      slug: "llama-3-3-70b-instruct",
      name: "Llama 3.3 70B Instruct",
      labSlug: "meta-ai",
      modelType: ModelType.CHAT,
      status: ModelStatus.ACTIVE,
      description:
        "Open-weights 70B dense instruction-tuned model delivering strong multilingual and tool-use performance.",
      contextWindow: 131072,
      maxOutputTokens: 8192,
      releaseDate: "2024-12-06",
      isOpenWeights: true,
      license: "Llama 3.3 Community",
      parameterCount: "70B",
      architecture: "Dense Transformer (GQA)",
      defaultInputPricePer1M: 0.23,
      defaultOutputPricePer1M: 0.4,
      capabilities: [
        "code-generation",
        "function-calling",
        "structured-outputs",
      ],
      modalities: ["text"],
      offerings: [
        {
          providerSlug: "groq",
          providerModelId: "llama-3.3-70b-versatile",
          inputPricePer1M: 0.59,
          outputPricePer1M: 0.79,
          latencyMsP50: 190,
          throughputTps: 275,
        },
        {
          providerSlug: "together-ai",
          providerModelId: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
          inputPricePer1M: 0.88,
          outputPricePer1M: 0.88,
          latencyMsP50: 360,
          throughputTps: 112,
        },
        {
          providerSlug: "aws-bedrock",
          providerModelId: "meta.llama3-3-70b-instruct-v1:0",
          inputPricePer1M: 0.72,
          outputPricePer1M: 0.72,
          latencyMsP50: 410,
          throughputTps: 95,
        },
        {
          providerSlug: "openrouter",
          providerModelId: "meta-llama/llama-3.3-70b-instruct",
          inputPricePer1M: 0.23,
          outputPricePer1M: 0.4,
          latencyMsP50: 430,
          throughputTps: 90,
        },
      ],
      benchmarks: {
        "gpqa-diamond": 50.5,
        "mmlu-pro": 68.9,
        livecodebench: 44.8,
      },
    },
    {
      slug: "qwen-2-5-coder-32b",
      name: "Qwen 2.5 Coder 32B Instruct",
      labSlug: "qwen",
      modelType: ModelType.CODE,
      status: ModelStatus.ACTIVE,
      description:
        "Specialized open-weights 32B coding model excelling at code generation, debugging, and repository edits.",
      contextWindow: 131072,
      maxOutputTokens: 8192,
      releaseDate: "2024-11-12",
      isOpenWeights: true,
      license: "Apache 2.0",
      parameterCount: "32B",
      architecture: "Dense Transformer",
      defaultInputPricePer1M: 0.14,
      defaultOutputPricePer1M: 0.28,
      capabilities: ["code-generation", "structured-outputs"],
      modalities: ["text"],
      offerings: [
        {
          providerSlug: "together-ai",
          providerModelId: "Qwen/Qwen2.5-Coder-32B-Instruct",
          inputPricePer1M: 0.8,
          outputPricePer1M: 0.8,
          latencyMsP50: 290,
          throughputTps: 140,
        },
        {
          providerSlug: "openrouter",
          providerModelId: "qwen/qwen-2.5-coder-32b-instruct",
          inputPricePer1M: 0.14,
          outputPricePer1M: 0.28,
          latencyMsP50: 340,
          throughputTps: 118,
        },
      ],
      benchmarks: {
        "swe-bench-verified": 34.4,
        livecodebench: 54.6,
        "mmlu-pro": 64.2,
      },
    },
    {
      slug: "mistral-large-2",
      name: "Mistral Large 2",
      labSlug: "mistral-ai",
      modelType: ModelType.CHAT,
      status: ModelStatus.ACTIVE,
      description:
        "123B flagship European model designed for multilingual enterprise workflows, function calling, and code.",
      contextWindow: 128000,
      maxOutputTokens: 16384,
      releaseDate: "2024-07-24",
      isOpenWeights: true,
      license: "Mistral Research",
      parameterCount: "123B",
      architecture: "Dense Transformer",
      defaultInputPricePer1M: 2.0,
      defaultOutputPricePer1M: 6.0,
      capabilities: [
        "code-generation",
        "function-calling",
        "structured-outputs",
      ],
      modalities: ["text"],
      offerings: [
        {
          providerSlug: "aws-bedrock",
          providerModelId: "mistral.mistral-large-2407-v1:0",
          inputPricePer1M: 2.0,
          outputPricePer1M: 6.0,
          latencyMsP50: 620,
          throughputTps: 68,
        },
        {
          providerSlug: "openrouter",
          providerModelId: "mistralai/mistral-large-2411",
          inputPricePer1M: 2.0,
          outputPricePer1M: 6.0,
          latencyMsP50: 670,
          throughputTps: 65,
        },
      ],
      benchmarks: {
        "gpqa-diamond": 48.2,
        "mmlu-pro": 69.5,
        livecodebench: 47.0,
      },
    },
    {
      slug: "claude-3-5-haiku",
      name: "Claude 3.5 Haiku",
      labSlug: "anthropic",
      modelType: ModelType.CHAT,
      status: ModelStatus.ACTIVE,
      description:
        "Fast, cost-effective Claude model tuned for low-latency coding assistants, sub-agents, and data extraction.",
      contextWindow: 200000,
      maxOutputTokens: 8192,
      releaseDate: "2024-11-04",
      isOpenWeights: false,
      license: "Proprietary",
      parameterCount: "Undisclosed",
      architecture: "Transformer",
      defaultInputPricePer1M: 0.8,
      defaultOutputPricePer1M: 4.0,
      capabilities: [
        "code-generation",
        "function-calling",
        "structured-outputs",
      ],
      modalities: ["text"],
      offerings: [
        {
          providerSlug: "anthropic-direct",
          providerModelId: "claude-3-5-haiku-20241022",
          inputPricePer1M: 0.8,
          outputPricePer1M: 4.0,
          cachedInputPricePer1M: 0.08,
          latencyMsP50: 360,
          throughputTps: 130,
        },
        {
          providerSlug: "aws-bedrock",
          providerModelId: "anthropic.claude-3-5-haiku-20241022-v1:0",
          inputPricePer1M: 0.8,
          outputPricePer1M: 4.0,
          latencyMsP50: 410,
          throughputTps: 122,
        },
      ],
      benchmarks: {
        "swe-bench-verified": 40.6,
        "gpqa-diamond": 41.6,
        "mmlu-pro": 65.0,
      },
    },
    {
      slug: "grok-3",
      name: "Grok 3",
      labSlug: "xai",
      modelType: ModelType.REASONING,
      status: ModelStatus.ACTIVE,
      description:
        "Large-scale reasoning and chat model trained on xAI's Colossus cluster with strong math and coding accuracy.",
      contextWindow: 131072,
      maxOutputTokens: 32768,
      releaseDate: "2025-02-17",
      isOpenWeights: false,
      license: "Proprietary",
      parameterCount: "Undisclosed",
      architecture: "Transformer",
      defaultInputPricePer1M: 3.0,
      defaultOutputPricePer1M: 15.0,
      capabilities: [
        "code-generation",
        "function-calling",
        "reasoning",
        "structured-outputs",
      ],
      modalities: ["text"],
      offerings: [
        {
          providerSlug: "openrouter",
          providerModelId: "x-ai/grok-3",
          inputPricePer1M: 3.0,
          outputPricePer1M: 15.0,
          latencyMsP50: 760,
          throughputTps: 84,
        },
      ],
      benchmarks: {
        "gpqa-diamond": 75.4,
        "aime-2025": 83.9,
        "mmlu-pro": 79.9,
        livecodebench: 70.2,
      },
    },
  ];

  for (const m of modelsSeed) {
    const model = await prisma.model.create({
      data: {
        slug: m.slug,
        name: m.name,
        labId: labs[m.labSlug],
        modelType: m.modelType,
        status: m.status,
        description: m.description,
        contextWindow: m.contextWindow,
        maxOutputTokens: m.maxOutputTokens,
        releaseDate: new Date(m.releaseDate),
        isOpenWeights: m.isOpenWeights,
        license: m.license,
        parameterCount: m.parameterCount,
        architecture: m.architecture,
        defaultInputPricePer1M: m.defaultInputPricePer1M,
        defaultOutputPricePer1M: m.defaultOutputPricePer1M,
        capabilities: m.capabilities,
        modalities: m.modalities,
      },
    });

    for (const off of m.offerings) {
      const cachedInputPricePer1M =
        "cachedInputPricePer1M" in off ? off.cachedInputPricePer1M ?? null : null;

      await prisma.modelProvider.create({
        data: {
          modelId: model.id,
          providerId: providers[off.providerSlug],
          providerModelId: off.providerModelId,
          inputPricePer1M: off.inputPricePer1M,
          outputPricePer1M: off.outputPricePer1M,
          cachedInputPricePer1M,
          latencyMsP50: off.latencyMsP50 ?? null,
          throughputTps: off.throughputTps ?? null,
          uptimePct: 99.9,
          supportsStreaming: true,
          supportsToolCalling: m.capabilities.includes("function-calling"),
          supportsJsonMode: m.capabilities.includes("structured-outputs"),
        },
      });
    }

    for (const [bmSlug, score] of Object.entries(m.benchmarks)) {
      if (score === undefined) continue;
      await prisma.modelBenchmark.create({
        data: {
          modelId: model.id,
          benchmarkId: benchmarks[bmSlug],
          score,
          normalizedScore: score,
        },
      });
    }
  }

  console.log("Seed completed successfully.");
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
