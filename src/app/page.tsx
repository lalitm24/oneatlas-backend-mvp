"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowUpRight, Filter, GitCompare, Layers, Search } from "lucide-react";
import { formatDate, formatPrice, formatTokens } from "@/lib/format";

interface ModelItem {
  id: string;
  slug: string;
  name: string;
  modelType: string;
  description: string;
  contextWindow: number;
  releaseDate: string;
  isOpenWeights: boolean;
  defaultInputPricePer1M: number;
  defaultOutputPricePer1M: number;
  capabilities: string[];
  modalities: string[];
  lab: { slug: string; name: string };
  offerings: { provider: { slug: string; name: string } }[];
}

interface LabOption {
  slug: string;
  name: string;
}

interface ProviderOption {
  slug: string;
  name: string;
}

function ModelsDiscoveryContent() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";

  const [q, setQ] = useState(initialQ);
  const [lab, setLab] = useState("");
  const [provider, setProvider] = useState("");
  const [modelType, setModelType] = useState("");
  const [capability, setCapability] = useState("");
  const [openWeights, setOpenWeights] = useState("");
  const [sort, setSort] = useState("release_desc");
  const [page, setPage] = useState(1);

  const [models, setModels] = useState<ModelItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [labs, setLabs] = useState<LabOption[]>([]);
  const [providers, setProviders] = useState<ProviderOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [compareSlugs, setCompareSlugs] = useState<string[]>([]);

  useEffect(() => {
    setQ(searchParams.get("q") ?? "");
  }, [searchParams]);

  useEffect(() => {
    Promise.all([
      fetch("/api/v1/labs").then((r) => r.json()),
      fetch("/api/v1/providers").then((r) => r.json()),
    ]).then(([labsRes, provRes]) => {
      if (labsRes.ok) setLabs(labsRes.data);
      if (provRes.ok) setProviders(provRes.data);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (lab) params.set("lab", lab);
    if (provider) params.set("provider", provider);
    if (modelType) params.set("modelType", modelType);
    if (capability) params.set("capability", capability);
    if (openWeights) params.set("openWeights", openWeights);
    params.set("sort", sort);
    params.set("page", String(page));
    params.set("limit", "9");

    fetch(`/api/v1/models?${params.toString()}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.ok) {
          setModels(res.data);
          setTotal(res.meta.total);
          setTotalPages(res.meta.totalPages);
        }
      })
      .finally(() => setLoading(false));
  }, [q, lab, provider, modelType, capability, openWeights, sort, page]);

  function toggleCompare(slug: string) {
    setCompareSlugs((prev) =>
      prev.includes(slug)
        ? prev.filter((s) => s !== slug)
        : prev.length < 4
        ? [...prev, slug]
        : prev
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b border-zinc-800 pb-6 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            AI Model Discovery
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Explore {total} database-backed models across frontier labs and inference providers.
          </p>
        </div>

        {compareSlugs.length > 0 && (
          <Link
            href={`/compare?models=${compareSlugs.join(",")}`}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            <GitCompare className="h-4 w-4" />
            Compare Selected ({compareSlugs.length})
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          <Filter className="h-3.5 w-3.5" />
          Search & Filter
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <div className="relative lg:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Filter by model name, lab, or description..."
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2 pl-9 pr-3 text-sm text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <select
            value={lab}
            onChange={(e) => {
              setLab(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-indigo-500 focus:outline-none"
          >
            <option value="">All Labs</option>
            {labs.map((l) => (
              <option key={l.slug} value={l.slug}>
                {l.name}
              </option>
            ))}
          </select>

          <select
            value={provider}
            onChange={(e) => {
              setProvider(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-indigo-500 focus:outline-none"
          >
            <option value="">All Providers</option>
            {providers.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={modelType}
            onChange={(e) => {
              setModelType(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-indigo-500 focus:outline-none"
          >
            <option value="">All Types</option>
            <option value="CHAT">Chat</option>
            <option value="REASONING">Reasoning</option>
            <option value="CODE">Code</option>
            <option value="MULTIMODAL">Multimodal</option>
            <option value="EMBEDDING">Embedding</option>
          </select>

          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-indigo-500 focus:outline-none"
          >
            <option value="release_desc">Newest First</option>
            <option value="price_asc">Lowest Input Price</option>
            <option value="price_desc">Highest Input Price</option>
            <option value="context_desc">Largest Context</option>
            <option value="name_asc">Name (A–Z)</option>
          </select>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <select
            value={capability}
            onChange={(e) => {
              setCapability(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-300 focus:border-indigo-500 focus:outline-none"
          >
            <option value="">Any Capability</option>
            <option value="reasoning">Reasoning</option>
            <option value="code-generation">Code Generation</option>
            <option value="function-calling">Function Calling</option>
            <option value="vision">Vision</option>
            <option value="structured-outputs">Structured Outputs</option>
            <option value="long-context">Long Context</option>
          </select>

          <select
            value={openWeights}
            onChange={(e) => {
              setOpenWeights(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-300 focus:border-indigo-500 focus:outline-none"
          >
            <option value="">All Licenses</option>
            <option value="true">Open Weights Only</option>
            <option value="false">Proprietary Only</option>
          </select>

          {(q || lab || provider || modelType || capability || openWeights) && (
            <button
              onClick={() => {
                setQ("");
                setLab("");
                setProvider("");
                setModelType("");
                setCapability("");
                setOpenWeights("");
                setPage(1);
              }}
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Model Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-56 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/50"
            />
          ))}
        </div>
      ) : models.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-12 text-center">
          <Layers className="mx-auto h-8 w-8 text-zinc-600" />
          <p className="mt-2 text-sm text-zinc-400">
            No models match your current filter criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {models.map((m) => {
            const isSelected = compareSlugs.includes(m.slug);
            return (
              <div
                key={m.id}
                className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition hover:border-zinc-700"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-medium text-indigo-400">
                        {m.lab.name}
                      </span>
                      <Link
                        href={`/models/${m.slug}`}
                        className="mt-0.5 flex items-center gap-1 text-lg font-semibold text-white hover:text-indigo-300"
                      >
                        {m.name}
                        <ArrowUpRight className="h-4 w-4 text-zinc-500" />
                      </Link>
                    </div>
                    <span className="rounded-md border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[11px] font-medium text-zinc-300">
                      {m.modelType}
                    </span>
                  </div>

                  <p className="mt-2 line-clamp-2 text-sm text-zinc-400">
                    {m.description}
                  </p>

                  <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg border border-zinc-800/80 bg-zinc-950/60 p-2.5 text-xs">
                    <div>
                      <div className="text-zinc-500">Input</div>
                      <div className="font-semibold text-zinc-200">
                        {formatPrice(m.defaultInputPricePer1M)}
                      </div>
                    </div>
                    <div>
                      <div className="text-zinc-500">Output</div>
                      <div className="font-semibold text-zinc-200">
                        {formatPrice(m.defaultOutputPricePer1M)}
                      </div>
                    </div>
                    <div>
                      <div className="text-zinc-500">Context</div>
                      <div className="font-semibold text-zinc-200">
                        {formatTokens(m.contextWindow)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-zinc-800/80 pt-3">
                  <span className="text-xs text-zinc-500">
                    {m.offerings.length} provider{m.offerings.length === 1 ? "" : "s"} ·{" "}
                    {formatDate(m.releaseDate)}
                  </span>
                  <button
                    onClick={() => toggleCompare(m.slug)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                      isSelected
                        ? "bg-indigo-600 text-white"
                        : "border border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                    }`}
                  >
                    {isSelected ? "Selected" : "+ Compare"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
          <span className="text-xs text-zinc-400">
            Page {page} of {totalPages} ({total} models)
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="text-sm text-zinc-400">Loading models...</div>}>
      <ModelsDiscoveryContent />
    </Suspense>
  );
}
