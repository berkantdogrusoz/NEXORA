import Link from "next/link";

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
    phase: "Phase 2 · Website Generator",
    items: ["Section-based page generator", "Editable block library", "One-click export"],
  },
  {
    phase: "Phase 3 · App Builder (Replit-style)",
    items: ["Prompt-to-app scaffolding", "Built-in AI coding assistant", "Deploy in one click"],
  },
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f8fafc] text-gray-900">
      <div className="antigravity-bg" aria-hidden="true" />

      <header className="relative z-10 max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Nexora AI
        </Link>

        <nav className="flex items-center gap-3 text-sm">
          <Link href="/generate" className="px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50">
            Studio
          </Link>
          <Link href="/pricing" className="px-4 py-2 rounded-lg bg-black text-white hover:opacity-90 transition">
            Pricing
          </Link>
        </nav>
      </header>

      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-14 pb-16 text-center">
        <p className="inline-flex items-center gap-2 px-3 py-1 text-sm rounded-full bg-white/90 border border-gray-200 text-gray-700">
          Nexora AI • Product Studio + Builder Vision
        </p>

        <h1 className="mt-6 text-5xl md:text-6xl font-bold leading-tight tracking-tight">
          Idea’dan Gelire: Ürünü, Siteyi ve İçeriği Tek Akışta Üret.
        </h1>

        <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto">
          Nexora; marka, konumlandırma, landing copy ve pazarlama mesajlarını üretir. Hedefimiz bunu
          bir sonraki adımda Replit benzeri “prompt ile web app oluşturma” deneyimine çevirmek.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/generate"
            className="inline-flex items-center justify-center px-8 py-4 bg-black text-white rounded-xl hover:opacity-90 transition"
          >
            Generate Full Package
          </Link>

          <a
            href="#builder"
            className="inline-flex items-center justify-center px-8 py-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition"
          >
            Builder Vision
          </a>

          <Link
            href="/pricing"
            className="inline-flex items-center justify-center px-8 py-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition"
          >
            View Pricing
          </Link>
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
          Çalışan sistemi bozmadan, adım adım Product Studio → Website Generator → App Builder.
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
          <div>© {new Date().getFullYear()} Nexora AI</div>
          <div className="flex items-center gap-4">
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
