import Link from "next/link";
import Navbar from "@/app/components/navbar";

const builderFeatures = [
  "Prompt → app architecture + page map",
  "Landing page + pricing + onboarding copy",
  "Starter component suggestions for Next.js",
  "Offer & monetization plan for fast validation",
];

const roadmap = [
  {
    phase: "Phase 1 · Product Studio (Now)",
    items: ["Brand + positioning", "Landing page copy", "Marketing messaging"],
  },
  {
    phase: "Phase 2 · Agent Platform (Now)",
    items: ["Custom AI agents", "Agent workflows", "AI agent builder"],
  },
  {
    phase: "Phase 3 · App Builder (Next)",
    items: ["Prompt-to-app scaffolding", "Built-in AI coding assistant", "Deploy in one click"],
  },
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f8fafc] text-gray-900">
      <div className="antigravity-bg" aria-hidden="true" />

      <Navbar />

      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-14 pb-16 text-center">
        <p className="inline-flex items-center gap-2 px-3 py-1 text-sm rounded-full bg-white/90 border border-gray-200 text-gray-700">
          Nexora AI &middot; AI Agent Platform
        </p>

        <h1 className="mt-6 text-5xl md:text-6xl font-bold leading-tight tracking-tight">
          Build, Run, and Scale AI Agents for Your Startup.
        </h1>

        <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto">
          Create custom AI agents or use built-in ones to generate brand identity, positioning,
          landing page copy, and marketing messaging — all in one workflow.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/run"
            className="inline-flex items-center justify-center px-8 py-4 bg-black text-white rounded-xl hover:opacity-90 transition"
          >
            Run Agents
          </Link>

          <Link
            href="/agents"
            className="inline-flex items-center justify-center px-8 py-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition"
          >
            Manage Agents
          </Link>

          <Link
            href="/generate"
            className="inline-flex items-center justify-center px-8 py-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition"
          >
            Quick Generate
          </Link>
        </div>
      </section>

      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-gray-200 bg-white/90 backdrop-blur-sm">
            <h2 className="text-xl font-semibold">Built-in Agents</h2>
            <p className="mt-3 text-gray-600 text-sm">
              4 pre-configured agents ready to go: Brand, Positioning, Landing Page, Marketing.
            </p>
            <Link href="/run" className="mt-4 inline-flex text-sm font-medium text-gray-900 hover:underline">
              Run now &rarr;
            </Link>
          </div>

          <div className="p-6 rounded-2xl border border-gray-200 bg-white/90 backdrop-blur-sm">
            <h2 className="text-xl font-semibold">Custom Agents</h2>
            <p className="mt-3 text-gray-600 text-sm">
              Create your own agents with custom prompts, or let AI build them for you.
            </p>
            <Link href="/agents" className="mt-4 inline-flex text-sm font-medium text-gray-900 hover:underline">
              Build agents &rarr;
            </Link>
          </div>

          <div className="p-6 rounded-2xl border border-gray-200 bg-white/90 backdrop-blur-sm">
            <h2 className="text-xl font-semibold">Workflow Engine</h2>
            <p className="mt-3 text-gray-600 text-sm">
              Run agents in parallel or sequential mode. Chain outputs for coherent results.
            </p>
            <Link href="/run" className="mt-4 inline-flex text-sm font-medium text-gray-900 hover:underline">
              Try workflows &rarr;
            </Link>
          </div>
        </div>
      </section>

      <section id="builder" className="relative z-10 max-w-6xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl border border-gray-200 bg-white/90 backdrop-blur-sm">
            <h2 className="text-2xl font-semibold">Nexora Builder (Next Target)</h2>
            <p className="mt-3 text-gray-600">
              Kullanıcının fikrinden sadece içerik değil, doğrudan çalışır web uygulaması iskeleti üretmek için.
            </p>

            <ul className="mt-5 list-disc pl-5 space-y-2 text-gray-700">
              {builderFeatures.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="p-6 rounded-2xl border border-gray-200 bg-white/90 backdrop-blur-sm">
            <h2 className="text-2xl font-semibold">Para Kazandıran İçerik Sistemi</h2>
            <p className="mt-3 text-gray-600">Her jenerasyonda conversion odaklı hazır çıktılar:</p>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {[
                "Offer angle + pricing hook",
                "Ad creatives için hızlı mesaj seti",
                "Email subject + funnel intro",
                "Landing hero + CTA optimizasyonu",
              ].map((item) => (
                <div key={item} className="rounded-xl border border-gray-200 bg-white p-3">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-semibold text-center">Roadmap</h2>
        <p className="mt-3 text-gray-600 text-center max-w-2xl mx-auto">
          Çalışan sistemi bozmadan, adım adım Product Studio → Agent Platform → App Builder.
        </p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {roadmap.map((step) => (
            <div key={step.phase} className="p-6 rounded-2xl border border-gray-200 bg-white/90 backdrop-blur-sm">
              <h3 className="font-semibold">{step.phase}</h3>
              <ul className="mt-4 list-disc pl-5 space-y-2 text-gray-700">
                {step.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 border-t border-gray-200 bg-white/60">
        <div className="max-w-6xl mx-auto px-6 py-10 text-sm text-gray-500 flex flex-col md:flex-row items-center justify-between gap-3">
          <div>&copy; {new Date().getFullYear()} Nexora AI</div>
          <div className="flex items-center gap-4">
            <Link href="/agents" className="hover:text-gray-700">
              Agents
            </Link>
            <Link href="/run" className="hover:text-gray-700">
              Run
            </Link>
            <Link href="/generate" className="hover:text-gray-700">
              Generate
            </Link>
            <Link href="/pricing" className="hover:text-gray-700">
              Pricing
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
