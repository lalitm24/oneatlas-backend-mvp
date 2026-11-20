"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Cpu, GitCompare, Server } from "lucide-react";
import { formatDate, formatPrice, formatTokens } from "@/lib/format";

interface ModelDetail {
  id: string;
  slug: string;
  name: string;
  modelType: string;
  status: string;
  description: string;
  contextWindow: number;
  maxOutputTokens: number | null;
  releaseDate: string;
  isOpenWeights: boolean;
  license: string | null;
  parameterCount: string | null;
  architecture: string | null;
  defaultInputPricePer1M: number;
  defaultOutputPricePer1M: number;
  capabilities: string[];
  modalities: string[];
  lab: { slug: string; name: string; country: string | null; websiteUrl: string | null };
  offerings: {
    id: string;
    providerModelId: string;
    inputPricePer1M: number;
    outputPricePer1M: number;
    cachedInputPricePer1M: number | null;
    latencyMsP50: number | null;
    throughputTps: number | null;
    supportsStreaming: boolean;
    supportsToolCalling: boolean;
    supportsJsonMode: boolean;
    provider: { slug: string; name: string; region: string | null };
  }[];
  benchmarks: {
    id: string;
    score: number;
    normalizedScore: number;
    benchmark: {
      slug: string;
      name: string;
      category: string;
      unit: string;
      maxScore: number;
    };
  }[];
}

export default function ModelDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const [model, setModel] = useState<ModelDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/v1/models/${params.slug}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.ok) setModel(res.data);
        else setError(res.error?.message ?? "Model not found");
      })
      .catch(() => setError("Failed to load model"))
      .finally(() => setLoading(false));
  }, [params.slug]);

  if (loading) {
    return <div className="text-sm text-zinc-400">Loading model specifications...</div>;
  }

  if (error || !model) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
        <p className="text-sm text-red-400">{error ?? "Model not found"}</p>
        <Link href="/" className="mt-4 inline-block text-sm text-indigo-400 hover:underline">
          Back to Models
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Discovery
        </Link>

        <div className="mt-4 flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-indigo-400">{model.lab.name}</span>
              <span className="rounded border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300">
                {model.modelType}
              </span>
              <span className="rounded border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300">
                {model.isOpenWeights ? "Open Weights" : "Proprietary"}
              </span>
            </div>
            <h1 className="mt-1 text-3xl font-bold text-white">{model.name}</h1>
            <p className="mt-2 max-w-3xl text-sm text-zinc-400">{model.description}</p>
          </div>

          <Link
            href={`/compare?models=${model.slug}`}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            <GitCompare className="h-4 w-4" />
            Compare Model
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: "Input Price", value: formatPrice(model.defaultInputPricePer1M) },
          { label: "Output Price", value: formatPrice(model.defaultOutputPricePer1M) },
          { label: "Context Window", value: formatTokens(model.contextWindow) },
          { label: "Max Output", value: formatTokens(model.maxOutputTokens) },
          { label: "Release Date", value: formatDate(model.releaseDate) },
          { label: "License", value: model.license ?? "Proprietary" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"
          >
            <div className="text-xs text-zinc-500">{stat.label}</div>
            <div className="mt-1 text-base font-semibold text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Specs, Modalities & Capabilities */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold text-white">
            <Cpu className="h-4 w-4 text-indigo-400" />
            Architecture & Modalities
          </h2>
          <dl className="mt-4 space-y-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-zinc-400">Architecture</dt>
              <dd className="font-medium text-zinc-200">{model.architecture ?? "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-400">Parameters</dt>
              <dd className="font-medium text-zinc-200">{model.parameterCount ?? "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-400">Modalities</dt>
              <dd className="flex flex-wrap gap-1.5">
                {model.modalities.map((mod) => (
                  <span
                    key={mod}
                    className="rounded bg-zinc-800 px-2 py-0.5 text-xs capitalize text-zinc-200"
                  >
                    {mod}
                  </span>
                ))}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold text-white">
            <CheckCircle2 className="h-4 w-4 text-indigo-400" />
            Supported Capabilities
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {model.capabilities.map((cap) => (
              <span
                key={cap}
                className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300"
              >
                {cap}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Providers Table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
        <h2 className="flex items-center gap-2 text-base font-semibold text-white">
          <Server className="h-4 w-4 text-indigo-400" />
          Available Providers ({model.offerings.length})
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-800 text-xs uppercase text-zinc-400">
              <tr>
                <th className="py-2 pr-4">Provider</th>
                <th className="py-2 pr-4">Provider Model ID</th>
                <th className="py-2 pr-4">Input / 1M</th>
                <th className="py-2 pr-4">Output / 1M</th>
                <th className="py-2 pr-4">Latency (p50)</th>
                <th className="py-2 pr-4">Throughput</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/70">
              {model.offerings.map((off) => (
                <tr key={off.id}>
                  <td className="py-3 pr-4 font-medium text-white">{off.provider.name}</td>
                  <td className="py-3 pr-4 font-mono text-xs text-zinc-400">
                    {off.providerModelId}
                  </td>
                  <td className="py-3 pr-4 text-zinc-200">${off.inputPricePer1M.toFixed(2)}</td>
                  <td className="py-3 pr-4 text-zinc-200">${off.outputPricePer1M.toFixed(2)}</td>
                  <td className="py-3 pr-4 text-zinc-300">
                    {off.latencyMsP50 ? `${off.latencyMsP50} ms` : "—"}
                  </td>
                  <td className="py-3 pr-4 text-zinc-300">
                    {off.throughputTps ? `${off.throughputTps} tok/s` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Benchmarks */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
        <h2 className="text-base font-semibold text-white">Benchmark Evaluations</h2>
        {model.benchmarks.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-400">No benchmark scores recorded yet.</p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {model.benchmarks.map((bm) => (
              <div
                key={bm.id}
                className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-white">{bm.benchmark.name}</div>
                    <div className="text-xs text-zinc-500">{bm.benchmark.category}</div>
                  </div>
                  <div className="text-lg font-bold text-indigo-400">
                    {bm.score}
                    {bm.benchmark.unit}
                  </div>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-indigo-500"
                    style={{ width: `${Math.min(100, bm.normalizedScore)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
