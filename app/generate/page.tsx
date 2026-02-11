"use client";

import { useMemo, useState } from "react";

type GenerateResult = {
  brandNames: string[];
  description: string;
};

export default function GeneratePage() {
  const [idea, setIdea] = useState("");
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [remaining, setRemaining] = useState<number>(() => {
    if (typeof window === "undefined") return 3;
    const stored = localStorage.getItem("nexora_uses");
    const used = stored ? parseInt(stored, 10) : 0;
    return Math.max(0, 3 - used);
  });

  const canGenerate = useMemo(() => {
    return !loading && remaining > 0 && idea.trim().length >= 10;
  }, [loading, remaining, idea]);

  const handleGenerate = async () => {
    setErrorMsg(null);
    setResult(null);

    const trimmed = idea.trim();
    if (trimmed.length < 10) {
      setErrorMsg("Please describe your idea with at least 10 characters.");
      return;
    }

    if (remaining <= 0) {
      setErrorMsg("You have reached your free generation limit.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: trimmed }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || `Request failed (${res.status})`);
      }

      const data = (await res.json()) as GenerateResult;
      setResult(data);

      const stored = localStorage.getItem("nexora_uses");
      const used = stored ? parseInt(stored, 10) : 0;
      const newUsed = used + 1;

      localStorage.setItem("nexora_uses", String(newUsed));
      setRemaining(Math.max(0, 3 - newUsed));
    } catch (e: any) {
      setErrorMsg(e?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-16">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-semibold mb-6">Describe Your Product Idea</h2>

        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="Example: I want to create a minimal streetwear brand for Gen Z."
          className="w-full p-4 border rounded-xl mb-4 outline-none focus:ring-2 focus:ring-gray-900/10"
          rows={5}
        />

        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="px-6 py-3 bg-black text-white rounded-xl disabled:opacity-40"
          >
            {loading ? "Generating..." : "Generate"}
          </button>

          <p className="text-sm text-gray-500">
            Free generations remaining: <span className="font-medium">{remaining}</span>
          </p>
        </div>

        {errorMsg && (
          <div className="mt-4 p-4 bg-white border border-red-200 rounded-xl text-red-600">
            {errorMsg}
          </div>
        )}

        {result && (
          <div className="mt-10 p-6 bg-white rounded-xl shadow">
            <h3 className="text-xl font-semibold mb-4">Brand Names</h3>
            <ul className="list-disc pl-5">
              {result.brandNames.map((name, i) => (
                <li key={i}>{name}</li>
              ))}
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-2">Product Description</h3>
            <p className="text-gray-800 leading-relaxed">{result.description}</p>
          </div>
        )}
      </div>
    </main>
  );
}
