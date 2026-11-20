# OneAtlas (`oneatlas.dev`) — AI Model Discovery & Intelligence Platform

Backend-focused Next.js + TypeScript + Prisma ORM + PostgreSQL MVP built for the AI Software Engineer Internship Demo Task.

## Architecture & Tech Stack
- **Framework**: Next.js 14 (App Router) + TypeScript + TailwindCSS
- **Backend**: Next.js API Routes (`/api/health`, `/api/v1/*`)
- **Database**: PostgreSQL + Prisma ORM (Neon-compatible pooled + direct connection strings)
- **Validation & Normalization**: Zod schemas + transactional ingestion & unit normalization (`src/lib/ingestion/normalize.ts`)

## Database Schema (`prisma/schema.prisma`)
- `Lab`: AI companies & research labs
- `Provider`: Inference/routing providers (direct & aggregators)
- `Model`: Canonical AI models with specs, pricing, capabilities, and modalities
- `ModelProvider`: Join table for per-provider pricing, latency (`latencyMsP50`), and throughput (`throughputTps`)
- `Benchmark`: Evaluation benchmarks categorized by `GENERAL`, `CODING`, `REASONING`, `MATH`, `MULTIMODAL`
- `ModelBenchmark`: Normalized model evaluation scores with composite index `(benchmarkId, normalizedScore DESC)`

## API Endpoints
| Method | Endpoint | Purpose |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Verifies PostgreSQL connectivity, latency, and record counts |
| `GET` | `/api/v1/models` | Search (`q`), multi-filter (`lab`, `provider`, `modelType`, `capability`, `modality`, `openWeights`, `minContext`, `maxInputPrice`), sort, and pagination |
| `GET` | `/api/v1/models/[slug]` | Full model detail with lab, provider offerings, and benchmark scores |
| `GET` | `/api/v1/compare?models=a,b` | Side-by-side model comparison + unified benchmark & capability matrix |
| `GET` | `/api/v1/rankings` | Leaderboard rankings filtered by `category`, `benchmark`, `modelType`, `openWeights` |
| `GET` | `/api/v1/labs` | AI labs directory with models |
| `GET` | `/api/v1/providers` | Inference providers directory with supported offerings |
| `POST` | `/api/v1/ingest` | Validates with Zod, normalizes pricing/tokens/tags, and upserts atomically |

## Quickstart (Local + Neon + Vercel)

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure PostgreSQL (Neon)**:
   Copy `.env.example` to `.env` and paste your Neon `DATABASE_URL` and `DIRECT_URL`.

3. **Push schema & seed database**:
   ```bash
   npx prisma generate
   npx prisma db push
   npm run db:seed
   ```

4. **Run locally**:
   ```bash
   npm run dev
   ```

5. **Deploy to Vercel**:
   Push to GitHub, import into Vercel, add `DATABASE_URL` and `DIRECT_URL` in Vercel Environment Variables, and deploy.
