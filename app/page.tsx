import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-16 text-center">
        <p className="inline-flex items-center gap-2 px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-700">
          Nexora AI • Idea → Product
        </p>

        <h1 className="mt-6 text-5xl md:text-6xl font-bold leading-tight tracking-tight">
          Turn Your Idea Into a Sellable Product in Minutes.
        </h1>

        <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
          Nexora AI generates product concepts, brand names, and launch-ready copy—so
          you can move from idea to output instantly.
        </p>

        <div className="mt-10 flex items-center justify-center gap-3">
          <Link
            href="/generate"
            className="inline-flex items-center justify-center px-8 py-4 bg-black text-white rounded-xl hover:opacity-90 transition"
          >
            Create Your Product
          </Link>

          <a
            href="#how"
            className="inline-flex items-center justify-center px-8 py-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition"
          >
            See How It Works
          </a>

          <Link
            href="/pricing"
            className="inline-flex items-center justify-center px-8 py-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition"
          >
            View Pricing
          </Link>
        </div>

        <p className="mt-4 text-sm text-gray-500">
          Free plan includes <span className="font-medium">3 generations</span>.
        </p>
      </section>

      {/* How it works */}
      <section id="how" className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-semibold text-center">How it works</h2>
        <p className="mt-3 text-gray-600 text-center max-w-2xl mx-auto">
          Describe what you want. Nexora turns it into a product-ready package.
        </p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-gray-200 bg-white">
            <div className="text-sm font-medium text-gray-500">Step 1</div>
            <div className="mt-2 text-xl font-semibold">Describe your idea</div>
            <p className="mt-2 text-gray-600">
              Tell Nexora what you’re trying to create—audience, vibe, and goal.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-gray-200 bg-white">
            <div className="text-sm font-medium text-gray-500">Step 2</div>
            <div className="mt-2 text-xl font-semibold">Generate outputs</div>
            <p className="mt-2 text-gray-600">
              Get brand names, positioning, and product copy in a clean structure.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-gray-200 bg-white">
            <div className="text-sm font-medium text-gray-500">Step 3</div>
            <div className="mt-2 text-xl font-semibold">Launch-ready</div>
            <p className="mt-2 text-gray-600">
              Use the output directly for a landing page, store listing, or marketing.
            </p>
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-semibold text-center">Built for creators</h2>
          <p className="mt-3 text-gray-600 text-center max-w-2xl mx-auto">
            Nexora is modular—start with product concepts today, expand to more modules later.
          </p>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Merch & clothing", desc: "Generate brand + product copy for apparel drops." },
              { title: "Digital products", desc: "Create a clean positioning + description instantly." },
              { title: "Launch pages", desc: "Turn ideas into a simple landing narrative." },
            ].map((x) => (
              <div key={x.title} className="p-6 rounded-2xl border border-gray-200 bg-white">
                <div className="text-xl font-semibold">{x.title}</div>
                <p className="mt-2 text-gray-600">{x.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center px-8 py-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition"
            >
              See Plans & Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200">
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
