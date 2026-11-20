"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { formatPrice, formatTokens } from "@/lib/format";

interface RankedModel {
  rank: number;
  slug: string;
  name: string;
  modelType: string;
  isOpenWeights: boolean;
  contextWindow: number;
  defaultInputPricePer1M: number;
  defaultOutputPricePer1M: number;
  primaryScore: number;
  evaluatedBenchmarksCount: number;
  lab: { slug: string; name: string };
}

interface BenchmarkItem {
  slug: string;
  name: string;
  category: string;
}

export default function RankingsPage() {
  const [category, setCategory] = useState("");
  const [benchmark, setBenchmark] = useState("");
  const [rankings, setRankings] = useState<RankedModel[]>([]);
  const [benchmarks, setBenchmarks] = useState<BenchmarkItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (benchmark) params.set("benchmark", benchmark);

    fetch(`/api/v1/rankings?${params.toString()}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.ok) {
          setRankings(res.data.rankings);
          setBenchmarks(res.data.benchmarks);
        }
      })
      .finally(() => setLoading(false));
  }, [category, benchmark]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b border-zinc-800 pb-5 md:flex-row md:items-end">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold text-white">
            <Trophy className="h-7 w-7 text-amber-400" />
            Model Rankings & Leaderboards
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Normalized benchmark scores computed directly from PostgreSQL evaluation records.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setBenchmark("");
            }}
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 focus:border-indigo-500 focus:outline-none"
          >
            <option value="">All Categories</option>
            <option value="CODING">Coding</option>
            <option value="REASONING">Reasoning</option>
            <option value="MATH">Math</option>
            <option value="GENERAL">General</option>
            <option value="MULTIMODAL">Multimodal</option>
          </select>

          <select
            value={benchmark}
            onChange={(e) => setBenchmark(e.target.value)}
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 focus:border-indigo-500 focus:outline-none"
          >
            <option value="">Composite Average</option>
            {benchmarks.map((b) => (
              <option key={b.slug} value={b.slug}>
                {b.name} ({b.category})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-zinc-400">Computing leaderboard...</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/50">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-950/70 text-xs uppercase text-zinc-400">
              <tr>
                <th className="p-4">Rank</th>
                <th className="p-4">Model</th>
                <th className="p-4">Lab</th>
                <th className="p-4">Type</th>
                <th className="p-4">Context</th>
                <th className="p-4">Input / Output</th>
                <th className="p-4 text-right">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {rankings.map((r) => (
                <tr key={r.slug} className="hover:bg-zinc-900/80">
                  <td className="p-4 font-bold text-zinc-300">#{r.rank}</td>
                  <td className="p-4">
                    <Link
                      href={`/models/${r.slug}`}
                      className="font-semibold text-white hover:text-indigo-400"
                    >
                      {r.name}
                    </Link>
                  </td>
                  <td className="p-4 text-zinc-400">{r.lab.name}</td>
                  <td className="p-4 text-xs text-zinc-300">{r.modelType}</td>
                  <td className="p-4 text-zinc-300">{formatTokens(r.contextWindow)}</td>
                  <td className="p-4 text-xs text-zinc-300">
                    {formatPrice(r.defaultInputPricePer1M)} /{" "}
                    {formatPrice(r.defaultOutputPricePer1M)}
                  </td>
                  <td className="p-4 text-right font-bold text-indigo-400">
                    {r.primaryScore.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
