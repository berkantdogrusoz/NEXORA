import Link from "next/link";
import { AnimatedShaderBackground } from "@/components/ui/animated-shader-background";

export default function PricingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Shader Background */}
      <div className="fixed inset-0 z-0">
        <AnimatedShaderBackground />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Header */}
      <header className="relative z-10 max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">N</span>
          </div>
          <span className="text-lg font-semibold tracking-tight text-white">
            Nexora AI
          </span>
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link
            href="/generate"
            className="text-white/60 hover:text-white transition-colors"
          >
            Generate
          </Link>
          <Link href="/pricing" className="text-white font-medium">
            Pricing
          </Link>
          <Link
            href="/generate"
            className="px-4 py-2 shimmer-btn text-white rounded-xl hover:opacity-90 transition font-medium"
          >
            Get Started
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-14 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 text-sm rounded-full glass text-purple-300 mb-8">
          Pricing &middot; Simple &amp; transparent
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white">
          Choose a plan that fits
          <br />
          <span className="gradient-text">your workflow.</span>
        </h1>

        <p className="mt-6 text-lg text-white/50 max-w-2xl mx-auto">
          Start free with 3 generations. Upgrade when you&apos;re ready to
          generate more and export assets.
        </p>
      </section>

      {/* Plans */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="glass-card rounded-2xl p-8 relative overflow-hidden">
            <div className="text-xs uppercase tracking-widest text-white/30 font-medium mb-3">
              Starter
            </div>
            <div className="text-2xl font-bold text-white">Free</div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-white">$0</span>
              <span className="text-white/40">/forever</span>
            </div>

            <div className="mt-8 space-y-4">
              {[
                "3 generations",
                "Brand names + description",
                "Basic structured output",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 text-sm text-white/70"
                >
                  <svg
                    className="w-4 h-4 text-purple-400 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {item}
                </div>
              ))}
            </div>

            <Link
              href="/generate"
              className="mt-8 inline-flex w-full items-center justify-center px-6 py-3.5 glass text-white rounded-xl hover:bg-white/10 transition-all font-medium"
            >
              Start Free
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="relative glass-card rounded-2xl p-8 overflow-hidden glow-purple">
            {/* Popular badge */}
            <div className="absolute top-0 right-0 px-4 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs font-semibold rounded-bl-xl">
              POPULAR
            </div>

            <div className="text-xs uppercase tracking-widest text-purple-400 font-medium mb-3">
              Professional
            </div>
            <div className="text-2xl font-bold text-white">Pro</div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold gradient-text">$19</span>
              <span className="text-white/40">/month</span>
            </div>

            <div className="mt-8 space-y-4">
              {[
                "Unlimited generations",
                "Advanced launch copy",
                "Exports + templates",
                "Priority processing",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 text-sm text-white/70"
                >
                  <svg
                    className="w-4 h-4 text-purple-400 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {item}
                </div>
              ))}
            </div>

            <button
              disabled
              className="mt-8 inline-flex w-full items-center justify-center px-6 py-3.5 bg-white/10 text-white/40 rounded-xl cursor-not-allowed font-medium"
            >
              Coming Soon
            </button>

            <p className="mt-3 text-xs text-white/30 text-center">
              Payments will be enabled soon.
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-4xl mx-auto mt-20">
          <h2 className="text-2xl font-bold text-white text-center mb-10">
            Frequently Asked Questions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card rounded-2xl p-6">
              <div className="font-semibold text-white mb-2">
                What counts as a generation?
              </div>
              <p className="text-sm text-white/50 leading-relaxed">
                Each time you click Generate and receive outputs, that&apos;s
                one generation.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <div className="font-semibold text-white mb-2">
                Can I use outputs commercially?
              </div>
              <p className="text-sm text-white/50 leading-relaxed">
                Free is for testing. Pro will include commercial usage terms
                (coming soon).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-10 text-sm text-white/30 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">N</span>
            </div>
            &copy; {new Date().getFullYear()} Nexora AI
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="hover:text-white/60 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/generate"
              className="hover:text-white/60 transition-colors"
            >
              Generate
            </Link>
            <Link
              href="/pricing"
              className="hover:text-white/60 transition-colors"
            >
              Pricing
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
