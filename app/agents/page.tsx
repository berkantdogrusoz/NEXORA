"use client";

import { useCallback, useEffect, useState } from "react";
import Navbar from "@/app/components/navbar";

type Agent = {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  userPromptTemplate: string;
  outputSchema: string;
  createdAt: number;
  builtIn: boolean;
};

type FormData = {
  name: string;
  description: string;
  systemPrompt: string;
  userPromptTemplate: string;
};

const emptyForm: FormData = {
  name: "",
  description: "",
  systemPrompt: "",
  userPromptTemplate: "",
};

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // AI Builder state
  const [showBuilder, setShowBuilder] = useState(false);
  const [builderGoal, setBuilderGoal] = useState("");
  const [building, setBuilding] = useState(false);
  const [builderError, setBuilderError] = useState<string | null>(null);

  // Delete confirm
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/agents");
      if (!res.ok) throw new Error("Failed to fetch agents.");
      const data = await res.json();
      setAgents(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load agents.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setFormError(null);
    setShowModal(true);
  };

  const openEdit = (agent: Agent) => {
    setEditingId(agent.id);
    setForm({
      name: agent.name,
      description: agent.description,
      systemPrompt: agent.systemPrompt,
      userPromptTemplate: agent.userPromptTemplate,
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleSave = async () => {
    setFormError(null);

    if (form.name.trim().length < 2) {
      setFormError("Name must be at least 2 characters.");
      return;
    }
    if (form.systemPrompt.trim().length < 10) {
      setFormError("System prompt must be at least 10 characters.");
      return;
    }
    if (!form.userPromptTemplate.includes("{{idea}}")) {
      setFormError("User prompt template must include {{idea}} placeholder.");
      return;
    }

    setSaving(true);

    try {
      const url = editingId ? `/api/agents/${editingId}` : "/api/agents";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || "Failed to save agent.");
      }

      setShowModal(false);
      await fetchAgents();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/agents/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete.");
      setDeletingId(null);
      await fetchAgents();
    } catch {
      setError("Failed to delete agent.");
    }
  };

  const handleAIBuild = async () => {
    setBuilderError(null);

    if (builderGoal.trim().length < 10) {
      setBuilderError("Describe your goal with at least 10 characters.");
      return;
    }

    setBuilding(true);

    try {
      const res = await fetch("/api/agents/builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: builderGoal.trim() }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || "AI build failed.");
      }

      const data = await res.json();
      const suggested = data.suggestedAgent;

      setForm({
        name: suggested.name || "",
        description: suggested.description || "",
        systemPrompt: suggested.systemPrompt || "",
        userPromptTemplate: suggested.userPromptTemplate || "",
      });

      setEditingId(null);
      setFormError(null);
      setShowBuilder(false);
      setBuilderGoal("");
      setShowModal(true);
    } catch (e: unknown) {
      setBuilderError(e instanceof Error ? e.message : "AI build failed.");
    } finally {
      setBuilding(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Agents</h1>
            <p className="mt-1 text-gray-600">
              Manage your AI agents. Run them individually or as a workflow.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setShowBuilder(true);
                setBuilderError(null);
                setBuilderGoal("");
              }}
              className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium hover:bg-gray-50 transition"
            >
              AI Build Agent
            </button>
            <button
              onClick={openCreate}
              className="px-4 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition"
            >
              Create Agent
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-white border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-6 rounded-2xl border border-gray-200 bg-white animate-pulse">
                <div className="h-5 bg-gray-100 rounded w-1/3 mb-3" />
                <div className="h-4 bg-gray-100 rounded w-2/3 mb-4" />
                <div className="h-3 bg-gray-50 rounded w-full mb-2" />
                <div className="h-3 bg-gray-50 rounded w-4/5" />
              </div>
            ))}
          </div>
        ) : agents.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">0</div>
            <p className="text-gray-500 mb-4">No agents yet. Create your first one.</p>
            <button
              onClick={openCreate}
              className="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition"
            >
              Create Agent
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="group p-6 rounded-2xl border border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm transition"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{agent.name}</h3>
                    {agent.builtIn && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-500">
                        Built-in
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(agent)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 text-sm"
                      title="Edit"
                    >
                      Edit
                    </button>
                    {!agent.builtIn && (
                      <>
                        {deletingId === agent.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(agent.id)}
                              className="px-2 py-1 rounded-lg bg-red-50 text-red-600 text-xs hover:bg-red-100"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeletingId(null)}
                              className="px-2 py-1 rounded-lg bg-gray-50 text-gray-500 text-xs hover:bg-gray-100"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeletingId(agent.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 text-sm"
                            title="Delete"
                          >
                            Delete
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4">{agent.description || "No description."}</p>

                <div className="text-xs text-gray-400">
                  Created {new Date(agent.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold">
                {editingId ? "Edit Agent" : "Create Agent"}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Define the agent&apos;s behavior and prompt template.
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. SEO Content Agent"
                  className="w-full p-3 border border-gray-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-gray-900/10 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Description</label>
                <input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="What does this agent do?"
                  className="w-full p-3 border border-gray-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-gray-900/10 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">System Prompt</label>
                <textarea
                  value={form.systemPrompt}
                  onChange={(e) => setForm({ ...form, systemPrompt: e.target.value })}
                  placeholder="Instructions for the AI model..."
                  rows={5}
                  className="w-full p-3 border border-gray-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-gray-900/10 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  User Prompt Template{" "}
                  <span className="text-gray-400 font-normal">
                    (must include {"{{idea}}"})
                  </span>
                </label>
                <textarea
                  value={form.userPromptTemplate}
                  onChange={(e) => setForm({ ...form, userPromptTemplate: e.target.value })}
                  placeholder="e.g. Analyze this idea and provide feedback:\n\n{{idea}}"
                  rows={3}
                  className="w-full p-3 border border-gray-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-gray-900/10 text-sm font-mono"
                />
                {form.userPromptTemplate.length > 0 &&
                  !form.userPromptTemplate.includes("{{idea}}") && (
                    <p className="text-xs text-amber-600 mt-1">
                      Template must include {"{{idea}}"} placeholder.
                    </p>
                  )}
              </div>

              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  {formError}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-40 transition"
              >
                {saving ? "Saving..." : editingId ? "Update Agent" : "Create Agent"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Builder Modal */}
      {showBuilder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowBuilder(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold">AI Agent Builder</h2>
              <p className="text-sm text-gray-500 mt-1">
                Describe what you want your agent to do. AI will generate the full agent definition.
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Your Goal</label>
                <textarea
                  value={builderGoal}
                  onChange={(e) => setBuilderGoal(e.target.value)}
                  placeholder="e.g. An agent that analyzes competitor websites and suggests differentiation strategies"
                  rows={4}
                  className="w-full p-3 border border-gray-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-gray-900/10 text-sm"
                />
              </div>

              {builderError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  {builderError}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowBuilder(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAIBuild}
                disabled={building}
                className="px-6 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-40 transition"
              >
                {building ? "Building..." : "Generate Agent"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
