"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { formatPrice, formatTokens } from "@/lib/format";

interface ModelOption {
  slug: string;
  name: string;
  lab: { name: string };
}

interface CompareData {
  models: {
    id: string;
    slug: string;
    name: string;
    modelType: string;
    contextWindow: number;
    maxOutputTokens: number | null;
    isOpenWeights: boolean;
    license: string | null;
    defaultInputPricePer1M: number;
    defaultOutputPricePer1M: number;
    capabilities: string[];
    modalities: string[];
    lab: { name: string };
    offerings: { provider: { name: string } }[];
  }[];
  benchmarkMatrix: {
    slug: string;
    name: string;
    category: string;
    unit: string;
    scores: Record<string, number | null>;
  }[];
  allCapabilities: string[];
}

function ComparePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialSlugs = (searchParams.get("models") ?? "claude-3-7-sonnet,gpt-4o,gemini-2-5-pro")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);

  const [selectedSlugs, setSelectedSlugs] = useState<string[]>(initialSlugs);
  const [allModels, setAllModels] = useState<ModelOption[]>([]);
  const [compareData, setCompareData] = useState<CompareData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/models?limit=50")
      .then((r) => r.json())
      .then((res) => {
        if (res.ok) setAllModels(res.data);
      });
  }, []);

  useEffect(() => {
    if (selectedSlugs.length === 0) {
      setCompareData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/v1/compare?models=${selectedSlugs.join(",")}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.ok) setCompareData(res.data);
      })
      .finally(() => setLoading(false));
  }, [selectedSlugs]);

  function toggleSlug(slug: string) {
    const next = selectedSlugs.includes(slug)
      ? selectedSlugs.filter((s) => s !== slug)
      : selectedSlugs.length < 4
      ? [...selectedSlugs, slug]
      : selectedSlugs;
    setSelectedSlugs(next);
    router.replace(next.length ? `/compare?models=${next.join(",")}` : "/compare");
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-800 pb-5">
        <h1 className="text-3xl font-bold text-white">Model Comparison</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Select up to 4 models to compare pricing, context windows, capabilities, and benchmarks side by side.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {allModels.map((m) => {
          const active = selectedSlugs.includes(m.slug);
          return (
            <button
              key={m.slug}
              onClick={() => toggleSlug(m.slug)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                active
                  ? "border-indigo-500 bg-indigo-600 text-white"
                  : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700"
              }`}
            >
              {m.name}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="text-sm text-zinc-400">Loading comparison matrix...</div>
      ) : !compareData || compareData.models.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center text-sm text-zinc-400">
          Select at least one model above to compare.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/50">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-950/70">
              <tr>
                <th className="p-4 text-xs font-semibold uppercase text-zinc-400">
                  Attribute
                </th>
                {compareData.models.map((m) => (
                  <th key={m.slug} className="p-4 font-semibold text-white">
                    <div>{m.name}</div>
                    <div className="text-xs font-normal text-indigo-400">{m.lab.name}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              <tr>
                <td className="p-4 text-zinc-400">Model Type</td>
                {compareData.models.map((m) => (
                  <td key={m.slug} className="p-4 text-zinc-200">{m.modelType}</td>
                ))}
              </tr>
              <tr>
                <td className="p-4 text-zinc-400">Input Price</td>
                {compareData.models.map((m) => (
                  <td key={m.slug} className="p-4 font-medium text-zinc-100">
                    {formatPrice(m.defaultInputPricePer1M)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 text-zinc-400">Output Price</td>
                {compareData.models.map((m) => (
                  <td key={m.slug} className="p-4 font-medium text-zinc-100">
                    {formatPrice(m.defaultOutputPricePer1M)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 text-zinc-400">Context Window</td>
                {compareData.models.map((m) => (
                  <td key={m.slug} className="p-4 text-zinc-200">
                    {formatTokens(m.contextWindow)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 text-zinc-400">Weights / License</td>
                {compareData.models.map((m) => (
                  <td key={m.slug} className="p-4 text-zinc-200">
                    {m.isOpenWeights ? `Open (${m.license ?? "OSS"})` : "Proprietary"}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 text-zinc-400">Providers</td>
                {compareData.models.map((m) => (
                  <td key={m.slug} className="p-4 text-zinc-300">
                    {m.offerings.map((o) => o.provider.name).join(", ") || "—"}
                  </td>
                ))}
              </tr>
              {compareData.allCapabilities.map((cap) => (
                <tr key={cap}>
                  <td className="p-4 text-zinc-400">Capability: {cap}</td>
                  {compareData.models.map((m) => (
                    <td key={m.slug} className="p-4">
                      {m.capabilities.includes(cap) ? (
                        <span className="text-emerald-400">Supported</span>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              {compareData.benchmarkMatrix.map((bm) => (
                <tr key={bm.slug}>
                  <td className="p-4 text-zinc-400">
                    {bm.name}{" "}
                    <span className="text-xs text-zinc-500">({bm.category})</span>
                  </td>
                  {compareData.models.map((m) => {
                    const score = bm.scores[m.slug];
                    return (
                      <td key={m.slug} className="p-4 font-semibold text-indigo-300">
                        {score !== null && score !== undefined ? `${score}${bm.unit}` : "—"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="text-sm text-zinc-400">Loading compare...</div>}>
      <ComparePageContent />
    </Suspense>
  );
}
