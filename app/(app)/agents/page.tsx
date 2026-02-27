"use client";

import { useCallback, useEffect, useState } from "react";


type Agent = { id: string; name: string; description: string; systemPrompt: string; userPromptTemplate: string; outputSchema: string; createdAt: number; builtIn: boolean; };
type FormData = { name: string; description: string; systemPrompt: string; userPromptTemplate: string; };
type RunResult = { agentId: string; name: string; outputText?: string; error?: string; ok: boolean; };

const emptyForm: FormData = { name: "", description: "", systemPrompt: "", userPromptTemplate: "" };

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [builderGoal, setBuilderGoal] = useState("");
  const [building, setBuilding] = useState(false);
  const [builderError, setBuilderError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // --- Run State ---
  const [tab, setTab] = useState<"manage" | "run">("manage");
  const [idea, setIdea] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<"parallel" | "sequential">("parallel");
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<RunResult[] | null>(null);

  const fetchAgents = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/agents");
      if (!res.ok) throw new Error("Failed to fetch agents.");
      setAgents(await res.json());
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Failed."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAgents(); }, [fetchAgents]);

  const openCreate = () => { setEditingId(null); setForm({ ...emptyForm }); setFormError(null); setShowModal(true); };
  const openEdit = (agent: Agent) => {
    setEditingId(agent.id);
    setForm({ name: agent.name, description: agent.description, systemPrompt: agent.systemPrompt, userPromptTemplate: agent.userPromptTemplate });
    setFormError(null); setShowModal(true);
  };

  const handleSave = async () => {
    setFormError(null);
    if (form.name.trim().length < 2) { setFormError("Name min 2 chars."); return; }
    if (form.systemPrompt.trim().length < 10) { setFormError("System prompt min 10 chars."); return; }
    if (!form.userPromptTemplate.includes("{{idea}}")) { setFormError("Prompt must include {{idea}}."); return; }
    setSaving(true);
    try {
      const url = editingId ? `/api/agents/${editingId}` : "/api/agents";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) { const err = await res.json().catch(() => null); throw new Error(err?.error || "Failed."); }
      setShowModal(false); await fetchAgents();
    } catch (e: unknown) { setFormError(e instanceof Error ? e.message : "Failed."); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try { await fetch(`/api/agents/${id}`, { method: "DELETE" }); setDeletingId(null); await fetchAgents(); } catch { setError("Delete failed."); }
  };

  const handleAIBuild = async () => {
    setBuilderError(null);
    if (builderGoal.trim().length < 10) { setBuilderError("Min 10 chars."); return; }
    setBuilding(true);
    try {
      const res = await fetch("/api/agents/builder", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ goal: builderGoal.trim() }) });
      if (!res.ok) { const err = await res.json().catch(() => null); throw new Error(err?.error || "Failed."); }
      const data = await res.json();
      setForm({ name: data.suggestedAgent.name || "", description: data.suggestedAgent.description || "", systemPrompt: data.suggestedAgent.systemPrompt || "", userPromptTemplate: data.suggestedAgent.userPromptTemplate || "" });
      setEditingId(null); setFormError(null); setShowBuilder(false); setBuilderGoal(""); setShowModal(true);
    } catch (e: unknown) { setBuilderError(e instanceof Error ? e.message : "Failed."); }
    finally { setBuilding(false); }
  };

  // --- Run Logic ---
  const toggleAgent = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };
  const selectAll = () => setSelectedIds(selectedIds.size === agents.length ? new Set() : new Set(agents.map(a => a.id)));

  const handleRun = async () => {
    if (!idea.trim() || selectedIds.size === 0) return;
    setRunning(true); setResults(null); setError(null);
    try {
      const res = await fetch("/api/agents/run", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idea: idea.trim(), agentIds: Array.from(selectedIds), mode }) });
      if (!res.ok) { const err = await res.json().catch(() => null); throw new Error(err?.error || "Run failed."); }
      const data = await res.json();
      setResults(data.results);
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Failed."); }
    finally { setRunning(false); }
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI Agents</h1>
            <p className="text-sm text-slate-500">Create, manage and run your AI agents.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { setShowBuilder(true); setBuilderError(null); setBuilderGoal(""); }} className="btn-secondary text-sm py-2 px-4">✨ AI Build</button>
            <button onClick={openCreate} className="btn-primary text-sm py-2 px-4">+ Create</button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 p-1 rounded-xl bg-slate-100 w-fit mb-6 animate-fade-in-up stagger-1">
          {[{ v: "manage" as const, label: "📋 Manage" }, { v: "run" as const, label: "⚡ Run" }].map(t => (
            <button key={t.v} onClick={() => setTab(t.v)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.v ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {error && <div className="mb-6 p-3 glass-card border-red-200 text-red-500 text-sm">{error}</div>}

        {/* ═══ MANAGE TAB ═══ */}
        {tab === "manage" && (
          loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1, 2, 3, 4].map(i => <div key={i} className="glass-card p-5"><div className="h-4 skeleton w-1/3 mb-2" /><div className="h-3 skeleton w-2/3" /></div>)}</div>
          ) : agents.length === 0 ? (
            <div className="text-center py-16"><div className="text-3xl mb-3">🤖</div><p className="text-slate-400 mb-4 text-sm">No agents yet.</p><button onClick={openCreate} className="btn-primary text-sm">Create Agent</button></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agents.map((agent, i) => (
                <div key={agent.id} className={`group glass-card p-5 animate-fade-in-up stagger-${Math.min(i + 1, 4)}`}>
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm">{agent.name}</h3>
                      {agent.builtIn && <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-slate-100 text-slate-400">Built-in</span>}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(agent)} className="px-2 py-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 text-xs">Edit</button>
                      {!agent.builtIn && (
                        deletingId === agent.id ? (
                          <div className="flex gap-1">
                            <button onClick={() => handleDelete(agent.id)} className="px-2 py-1 rounded-lg bg-red-50 text-red-500 text-xs">Yes</button>
                            <button onClick={() => setDeletingId(null)} className="px-2 py-1 rounded-lg bg-slate-50 text-slate-400 text-xs">No</button>
                          </div>
                        ) : <button onClick={() => setDeletingId(agent.id)} className="px-2 py-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 text-xs">Delete</button>
                      )}
                    </div>
                  </div>
                  <p className="text-slate-500 text-xs">{agent.description || "No description."}</p>
                </div>
              ))}
            </div>
          )
        )}

        {/* ═══ RUN TAB ═══ */}
        {tab === "run" && (
          <div className="space-y-5 animate-fade-in-up">
            {/* Idea */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Your Idea</label>
              <textarea value={idea} onChange={e => setIdea(e.target.value)} placeholder="Enter your idea here..." rows={3} className="form-input" />
            </div>

            {/* Agent Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-700">Select Agents</label>
                <button onClick={selectAll} className="text-xs text-cyan-500 hover:text-cyan-700">{selectedIds.size === agents.length ? "Deselect all" : "Select all"}</button>
              </div>
              {agents.length === 0 ? (
                <p className="text-xs text-slate-400">No agents found. Create one first.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {agents.map(a => (
                    <button key={a.id} onClick={() => toggleAgent(a.id)} className={`p-3 rounded-xl text-left text-sm border transition-all ${selectedIds.has(a.id) ? "border-cyan-300 bg-violet-50 text-cyan-700" : "border-black/[0.06] bg-white text-slate-600 hover:border-black/[0.12]"}`}>
                      <span className="font-medium">{a.name}</span>
                      <span className="block text-[10px] text-slate-400 mt-0.5">{a.description || "No description"}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mode + Run */}
            <div className="flex items-center gap-3">
              <div className="flex gap-1 p-1 rounded-xl bg-slate-100">
                {[{ v: "parallel" as const, l: "⚡ Parallel" }, { v: "sequential" as const, l: "🔗 Sequential" }].map(m => (
                  <button key={m.v} onClick={() => setMode(m.v)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${mode === m.v ? "bg-white shadow-sm text-slate-900" : "text-slate-500"}`}>{m.l}</button>
                ))}
              </div>
              <button onClick={handleRun} disabled={running || !idea.trim() || selectedIds.size === 0} className="btn-primary text-sm py-2 px-5 disabled:opacity-40">
                {running ? <span className="flex items-center gap-1.5"><svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Running...</span> : `Run ${selectedIds.size} Agent${selectedIds.size !== 1 ? "s" : ""}`}
              </button>
            </div>

            {/* Results */}
            {results && (
              <div className="space-y-3 mt-4">
                <h3 className="text-sm font-semibold text-slate-700">Results</h3>
                {results.map((r, i) => (
                  <div key={i} className={`glass-card p-4 ${r.ok ? "" : "border-red-200"}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-2 h-2 rounded-full ${r.ok ? "bg-emerald-400" : "bg-red-400"}`} />
                      <span className="text-sm font-medium">{r.name}</span>
                    </div>
                    {r.ok ? (
                      <pre className="text-xs text-slate-600 whitespace-pre-wrap bg-slate-50 rounded-xl p-3 max-h-60 overflow-y-auto">{r.outputText}</pre>
                    ) : (
                      <p className="text-xs text-red-500">{r.error}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl border border-black/[0.06] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-black/[0.06]"><h2 className="text-lg font-semibold">{editingId ? "Edit Agent" : "Create Agent"}</h2></div>
            <div className="p-5 space-y-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. SEO Agent" className="form-input" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Description</label><input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What does it do?" className="form-input" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">System Prompt</label><textarea value={form.systemPrompt} onChange={e => setForm({ ...form, systemPrompt: e.target.value })} rows={4} className="form-input font-mono text-xs" /></div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">User Prompt <span className="text-slate-400 font-normal">(include {"{{idea}}"})</span></label>
                <textarea value={form.userPromptTemplate} onChange={e => setForm({ ...form, userPromptTemplate: e.target.value })} rows={3} className="form-input font-mono text-xs" />
              </div>
              {formError && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-500 text-sm">{formError}</div>}
            </div>
            <div className="p-5 border-t border-black/[0.06] flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="btn-secondary text-sm py-2 px-4">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary text-sm py-2 px-4 disabled:opacity-40">{saving ? "Saving..." : editingId ? "Update" : "Create"}</button>
            </div>
          </div>
        </div>
      )}

      {/* AI Builder Modal */}
      {showBuilder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowBuilder(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl border border-black/[0.06] w-full max-w-lg">
            <div className="p-5 border-b border-black/[0.06]">
              <h2 className="text-lg font-semibold">AI Agent Builder</h2>
              <p className="text-xs text-slate-500 mt-0.5">Describe what you need — AI will create the agent.</p>
            </div>
            <div className="p-5">
              <textarea value={builderGoal} onChange={e => setBuilderGoal(e.target.value)} placeholder="e.g. An agent that analyzes competitor websites..." rows={4} className="form-input" />
              {builderError && <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-500 text-sm">{builderError}</div>}
            </div>
            <div className="p-5 border-t border-black/[0.06] flex justify-end gap-2">
              <button onClick={() => setShowBuilder(false)} className="btn-secondary text-sm py-2 px-4">Cancel</button>
              <button onClick={handleAIBuild} disabled={building} className="btn-primary text-sm py-2 px-4 disabled:opacity-40">{building ? "Building..." : "Generate"}</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
