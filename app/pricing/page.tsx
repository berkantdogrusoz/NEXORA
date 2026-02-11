import Link from "next/link";

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Top bar */}
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight">
          Nexora AI
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link href="/generate" className="text-gray-600 hover:text-gray-900">
            Generate
          </Link>
          <Link href="/pricing" className="text-gray-900 font-medium">
            Pricing
          </Link>
          <Link
            href="/generate"
            className="px-4 py-2 bg-black text-white rounded-xl hover:opacity-90 transition"
          >
            Get Started
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-10 pb-10 text-center">
        <p className="inline-flex items-center gap-2 px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-700">
          Pricing • Simple & transparent
        </p>

        <h1 className="mt-6 text-4xl md:text-5xl font-bold tracking-tight">
          Choose a plan that fits your workflow.
        </h1>

        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Start free with 3 generations. Upgrade when you’re ready to generate more and export assets.
        </p>
      </section>

      {/* Plans */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Free */}
          <div className="p-8 rounded-2xl border border-gray-200 bg-white">
            <div className="text-xl font-semibold">Free</div>
            <div className="mt-2 text-3xl font-bold">$0</div>

            <ul className="mt-6 space-y-2 text-gray-700">
              <li>• 3 generations</li>
              <li>• Brand names + description</li>
              <li>• Basic structured output</li>
            </ul>

            <Link
              href="/generate"
              className="mt-8 inline-flex w-full items-center justify-center px-6 py-3 bg-black text-white rounded-xl hover:opacity-90 transition"
            >
              Start Free
            </Link>
          </div>

          {/* Pro */}
          <div className="p-8 rounded-2xl border border-gray-200 bg-white">
            <div className="text-xl font-semibold">Pro</div>
            <div className="mt-2 text-3xl font-bold">$19</div>

            <ul className="mt-6 space-y-2 text-gray-700">
              <li>• Unlimited generations</li>
              <li>• Advanced launch copy</li>
              <li>• Exports + templates</li>
              <li>• Priority processing</li>
            </ul>

            {/* Şimdilik ödeme yok: buton “Coming Soon” */}
            <button
              disabled
              className="mt-8 inline-flex w-full items-center justify-center px-6 py-3 bg-gray-100 text-gray-500 rounded-xl cursor-not-allowed"
            >
              Coming Soon
            </button>

            <p className="mt-3 text-xs text-gray-500 text-center">
              Payments will be enabled soon.
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-4xl mx-auto mt-14">
          <h2 className="text-2xl font-semibold text-center">FAQ</h2>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl border border-gray-200 bg-white">
              <div className="font-semibold">What counts as a generation?</div>
              <p className="mt-2 text-gray-600">
                Each time you click Generate and receive outputs, that’s one generation.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-gray-200 bg-white">
              <div className="font-semibold">Can I use outputs commercially?</div>
              <p className="mt-2 text-gray-600">
                Free is for testing. Pro will include commercial usage terms (coming soon).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-10 text-sm text-gray-500 flex flex-col md:flex-row items-center justify-between gap-3">
          <div>© {new Date().getFullYear()} Nexora AI</div>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-gray-700">
              Home
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
