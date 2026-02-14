"use client";

import { useCallback, useEffect, useState } from "react";
import Navbar from "@/app/components/navbar";

type Agent = {
  id: string;
  name: string;
  description: string;
  builtIn: boolean;
};

type AgentRunResult = {
  agentId: string;
  name: string;
  outputText?: string;
  error?: string;
  ok: boolean;
};

type RunResponse = {
  idea: string;
  mode: "sequential" | "parallel";
  results: AgentRunResult[];
};

export default function RunPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(true);

  const [idea, setIdea] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<"sequential" | "parallel">("parallel");

  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState<RunResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const fetchAgents = useCallback(async () => {
    try {
      const res = await fetch("/api/agents");
      if (!res.ok) throw new Error("Failed to fetch agents.");
      const data = await res.json();
      setAgents(data);
    } catch {
      setError("Failed to load agents.");
    } finally {
      setLoadingAgents(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const toggleAgent = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === agents.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(agents.map((a) => a.id)));
    }
  };

  const handleRun = async () => {
    setError(null);
    setRunResult(null);

    if (idea.trim().length < 10) {
      setError("Describe your idea with at least 10 characters.");
      return;
    }
    if (selectedIds.size === 0) {
      setError("Select at least one agent.");
      return;
    }

    setRunning(true);

    try {
      const res = await fetch("/api/agents/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: idea.trim(),
          agentIds: Array.from(selectedIds),
          mode,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || `Run failed (${res.status})`);
      }

      const data = (await res.json()) as RunResponse;
      setRunResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setRunning(false);
    }
  };

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // fallback
    }
  };

  const formatOutput = (text: string): string => {
    try {
      const parsed = JSON.parse(text);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return text;
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold tracking-tight mb-1">Run Agents</h1>
        <p className="text-gray-600 mb-8">
          Enter your idea, select agents, and run them as a workflow.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Input & Config */}
          <div className="lg:col-span-2 space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">Your Idea</label>
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Describe your startup idea in detail..."
                rows={5}
                className="w-full p-4 border border-gray-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-gray-900/10 text-sm"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium">Select Agents</label>
                <button
                  onClick={selectAll}
                  className="text-xs text-gray-500 hover:text-gray-900 transition"
                >
                  {selectedIds.size === agents.length ? "Deselect All" : "Select All"}
                </button>
              </div>

              {loadingAgents ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-4 rounded-xl border border-gray-200 bg-white animate-pulse">
                      <div className="h-4 bg-gray-100 rounded w-1/2 mb-2" />
                      <div className="h-3 bg-gray-50 rounded w-3/4" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {agents.map((agent) => {
                    const selected = selectedIds.has(agent.id);
                    return (
                      <button
                        key={agent.id}
                        onClick={() => toggleAgent(agent.id)}
                        className={`p-4 rounded-xl border text-left transition ${
                          selected
                            ? "border-gray-900 bg-gray-900 text-white"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <div className="font-medium text-sm">{agent.name}</div>
                        <div className={`text-xs mt-1 ${selected ? "text-gray-300" : "text-gray-500"}`}>
                          {agent.description || "No description"}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right: Mode & Run */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">Run Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setMode("parallel")}
                  className={`p-3 rounded-xl border text-sm font-medium transition ${
                    mode === "parallel"
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  Parallel
                </button>
                <button
                  onClick={() => setMode("sequential")}
                  className={`p-3 rounded-xl border text-sm font-medium transition ${
                    mode === "sequential"
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  Sequential
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {mode === "parallel"
                  ? "All agents run independently at the same time."
                  : "Agents run one by one. Each gets context from previous outputs."}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-gray-200 bg-white">
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Selected agents</span>
                  <span className="font-semibold text-gray-900">{selectedIds.size}</span>
                </div>
                <div className="flex justify-between">
                  <span>Mode</span>
                  <span className="font-semibold text-gray-900 capitalize">{mode}</span>
                </div>
                <div className="flex justify-between">
                  <span>Idea length</span>
                  <span className="font-semibold text-gray-900">{idea.trim().length} chars</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleRun}
              disabled={running || selectedIds.size === 0 || idea.trim().length < 10}
              className="w-full px-6 py-4 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {running ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Running Agents...
                </span>
              ) : (
                `Run ${selectedIds.size} Agent${selectedIds.size !== 1 ? "s" : ""}`
              )}
            </button>

            {error && (
              <div className="p-3 bg-white border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        {runResult && (
          <div className="mt-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Results</h2>
              <button
                onClick={() =>
                  copyToClipboard(JSON.stringify(runResult, null, 2), "all")
                }
                className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium hover:bg-gray-50 transition"
              >
                {copied === "all" ? "Copied!" : "Copy All JSON"}
              </button>
            </div>

            <div className="space-y-4">
              {runResult.results.map((result, idx) => (
                <div
                  key={`${result.agentId}-${idx}`}
                  className={`p-6 rounded-2xl border bg-white ${
                    result.ok ? "border-gray-200" : "border-red-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          result.ok ? "bg-green-500" : "bg-red-500"
                        }`}
                      />
                      <h3 className="font-semibold">{result.name}</h3>
                      <span className="text-xs text-gray-400">
                        {result.ok ? "Success" : "Failed"}
                      </span>
                    </div>

                    {result.ok && result.outputText && (
                      <button
                        onClick={() =>
                          copyToClipboard(result.outputText!, result.agentId)
                        }
                        className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium hover:bg-gray-50 transition"
                      >
                        {copied === result.agentId ? "Copied!" : "Copy Output"}
                      </button>
                    )}
                  </div>

                  {result.ok && result.outputText ? (
                    <pre className="text-sm text-gray-700 bg-gray-50 rounded-xl p-4 overflow-x-auto whitespace-pre-wrap font-mono">
                      {formatOutput(result.outputText)}
                    </pre>
                  ) : (
                    <div className="text-sm text-red-600 bg-red-50 rounded-xl p-4">
                      {result.error || "Unknown error."}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
