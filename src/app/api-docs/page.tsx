"use client";

import { useEffect, useState } from "react";
import { Activity, Play, Terminal } from "lucide-react";

const ENDPOINTS = [
  {
    method: "GET",
    path: "/api/health",
    description: "Database connectivity check, query latency, and entity counts.",
  },
  {
    method: "GET",
    path: "/api/v1/models?sort=price_asc&limit=5",
    description: "Paginated, filtered, and sorted AI model catalog.",
  },
  {
    method: "GET",
    path: "/api/v1/models/claude-3-7-sonnet",
    description: "Full model specification, provider offerings, and benchmark scores.",
  },
  {
    method: "GET",
    path: "/api/v1/compare?models=claude-3-7-sonnet,gpt-4o,gemini-2-5-pro",
    description: "Side-by-side comparison payload with unified benchmark matrix.",
  },
  {
    method: "GET",
    path: "/api/v1/rankings?category=CODING",
    description: "Normalized leaderboard rankings filtered by category or benchmark.",
  },
  {
    method: "GET",
    path: "/api/v1/labs",
    description: "AI research labs directory with associated models.",
  },
  {
    method: "GET",
    path: "/api/v1/providers",
    description: "Inference providers directory with pricing and latency.",
  },
];

export default function ApiDocsPage() {
  const [selectedPath, setSelectedPath] = useState("/api/health");
  const [responseJson, setResponseJson] = useState<string>("");
  const [status, setStatus] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  async function runEndpoint(path: string) {
    setSelectedPath(path);
    setLoading(true);
    try {
      const res = await fetch(path);
      setStatus(res.status);
      const data = await res.json();
      setResponseJson(JSON.stringify(data, null, 2));
    } catch (err) {
      setResponseJson(String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    runEndpoint("/api/health");
  }, []);

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-800 pb-5">
        <h1 className="flex items-center gap-2 text-3xl font-bold text-white">
          <Terminal className="h-7 w-7 text-indigo-400" />
          Backend API Explorer
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Inspect live PostgreSQL + Prisma API responses, Zod validation, and normalization endpoints.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          {ENDPOINTS.map((ep) => (
            <div
              key={ep.path}
              className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-emerald-500/15 px-2 py-0.5 font-mono text-xs font-semibold text-emerald-400">
                    {ep.method}
                  </span>
                  <code className="truncate font-mono text-xs text-zinc-200">{ep.path}</code>
                </div>
                <p className="mt-1 text-xs text-zinc-400">{ep.description}</p>
              </div>
              <button
                onClick={() => runEndpoint(ep.path)}
                className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500"
              >
                <Play className="h-3 w-3" />
                Test
              </button>
            </div>
          ))}

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
            <div className="flex items-center gap-2">
              <span className="rounded bg-amber-500/15 px-2 py-0.5 font-mono text-xs font-semibold text-amber-400">
                POST
              </span>
              <code className="font-mono text-xs text-zinc-200">/api/v1/ingest</code>
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              Validates with Zod, normalizes pricing units (per_token / per_1k / per_1m), parses context shorthands (&quot;128k&quot;, &quot;1m&quot;), canonicalizes capability tags, and upserts atomically via Prisma transactions.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          <div className="mb-3 flex items-center justify-between border-b border-zinc-800 pb-2">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Activity className="h-4 w-4 text-indigo-400" />
              <code>{selectedPath}</code>
            </div>
            {status !== null && (
              <span className="rounded bg-zinc-800 px-2 py-0.5 font-mono text-xs text-emerald-400">
                HTTP {status}
              </span>
            )}
          </div>
          <pre className="max-h-[540px] overflow-auto font-mono text-xs text-zinc-300">
            {loading ? "Fetching..." : responseJson}
          </pre>
        </div>
      </div>
    </div>
  );
}
