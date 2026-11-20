"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Building2, Server } from "lucide-react";
import { formatPrice, formatTokens } from "@/lib/format";

interface LabItem {
  id: string;
  slug: string;
  name: string;
  country: string | null;
  foundedYear: number | null;
  description: string;
  models: {
    slug: string;
    name: string;
    modelType: string;
    contextWindow: number;
    defaultInputPricePer1M: number;
  }[];
}

interface ProviderItem {
  id: string;
  slug: string;
  name: string;
  region: string | null;
  isAggregator: boolean;
  description: string;
  offerings: {
    id: string;
    inputPricePer1M: number;
    outputPricePer1M: number;
    latencyMsP50: number | null;
    model: {
      slug: string;
      name: string;
      lab: { name: string };
    };
  }[];
}

export default function DirectoryPage() {
  const [tab, setTab] = useState<"labs" | "providers">("labs");
  const [labs, setLabs] = useState<LabItem[]>([]);
  const [providers, setProviders] = useState<ProviderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/v1/labs").then((r) => r.json()),
      fetch("/api/v1/providers").then((r) => r.json()),
    ])
      .then(([labsRes, provRes]) => {
        if (labsRes.ok) setLabs(labsRes.data);
        if (provRes.ok) setProviders(provRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b border-zinc-800 pb-5 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold text-white">AI Labs & Provider Directory</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Browse frontier research labs and inference providers hosting their models.
          </p>
        </div>

        <div className="flex rounded-lg border border-zinc-800 bg-zinc-900 p-1">
          <button
            onClick={() => setTab("labs")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium ${
              tab === "labs" ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            <Building2 className="h-4 w-4" />
            AI Labs ({labs.length})
          </button>
          <button
            onClick={() => setTab("providers")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium ${
              tab === "providers" ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            <Server className="h-4 w-4" />
            Providers ({providers.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-zinc-400">Loading directory...</div>
      ) : tab === "labs" ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {labs.map((lab) => (
            <div
              key={lab.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">{lab.name}</h2>
                  <p className="text-xs text-zinc-500">
                    {lab.country ?? "Global"}
                    {lab.foundedYear ? ` · Founded ${lab.foundedYear}` : ""}
                  </p>
                </div>
                <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300">
                  {lab.models.length} model{lab.models.length === 1 ? "" : "s"}
                </span>
              </div>
              <p className="mt-2 text-sm text-zinc-400">{lab.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {lab.models.map((m) => (
                  <Link
                    key={m.slug}
                    href={`/models/${m.slug}`}
                    className="rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1 text-xs text-zinc-200 hover:border-indigo-500"
                  >
                    {m.name} · {formatTokens(m.contextWindow)} · {formatPrice(m.defaultInputPricePer1M)}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {providers.map((prov) => (
            <div
              key={prov.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">{prov.name}</h2>
                  <p className="text-xs text-zinc-500">
                    {prov.region ?? "Global"} · {prov.isAggregator ? "Router / Aggregator" : "Direct"}
                  </p>
                </div>
                <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300">
                  {prov.offerings.length} models
                </span>
              </div>
              <p className="mt-2 text-sm text-zinc-400">{prov.description}</p>
              <div className="mt-4 space-y-1.5">
                {prov.offerings.slice(0, 5).map((off) => (
                  <div
                    key={off.id}
                    className="flex items-center justify-between rounded bg-zinc-950/70 px-3 py-1.5 text-xs"
                  >
                    <Link
                      href={`/models/${off.model.slug}`}
                      className="font-medium text-zinc-200 hover:text-indigo-400"
                    >
                      {off.model.name}
                    </Link>
                    <span className="text-zinc-400">
                      ${off.inputPricePer1M.toFixed(2)} / ${off.outputPricePer1M.toFixed(2)} per 1M
                      {off.latencyMsP50 ? ` · ${off.latencyMsP50}ms` : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
