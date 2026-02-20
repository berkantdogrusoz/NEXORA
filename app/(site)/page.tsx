import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-xs font-medium text-violet-300 mb-8 animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
            </span>
            AI Video & Image Generation — Now Live
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 animate-fade-in-up">
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40">
              Create Anything
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400">
              with AI
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up">
            Generate videos, images, and social content in seconds.
            Schedule and auto-post to Instagram. The AI creative studio for modern brands.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up">
            <Link
              href="/studio"
              className="group relative px-8 py-4 rounded-full bg-white text-black font-bold text-lg hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.25)] flex items-center gap-2"
            >
              <span>✨</span> Start Creating
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/pricing"
              className="px-8 py-4 rounded-full bg-white/[0.05] border border-white/[0.08] text-white font-medium hover:bg-white/[0.08] transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Product Cards — Prototipal Style */}
      <section className="py-10 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Video */}
            <Link href="/studio" className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0a0a0a] aspect-[4/3] flex flex-col justify-end p-6 hover:border-white/[0.12] transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-violet-500/20 border border-violet-500/30 text-[10px] font-semibold text-violet-300 uppercase tracking-wider">
                Popular
              </div>
              <div className="relative z-10">
                <div className="text-5xl mb-4">🎬</div>
                <p className="text-xs text-slate-500 mb-1">AI-powered video generation</p>
                <h3 className="text-xl font-bold text-white mb-1">AI Video Studio</h3>
                <p className="text-sm text-slate-400">Turn text prompts into stunning HD videos with AI. Cinematic quality in seconds.</p>
              </div>
            </Link>

            {/* Card 2: Image */}
            <Link href="/generate" className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0a0a0a] aspect-[4/3] flex flex-col justify-end p-6 hover:border-white/[0.12] transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-600/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="text-5xl mb-4">🖼️</div>
                <p className="text-xs text-slate-500 mb-1">DALL-E 3 powered</p>
                <h3 className="text-xl font-bold text-white mb-1">Image Generation</h3>
                <p className="text-sm text-slate-400">Create professional photos, illustrations, and social media visuals from text.</p>
              </div>
            </Link>

            {/* Card 3: Scheduling */}
            <Link href="/calendar" className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0a0a0a] aspect-[4/3] flex flex-col justify-end p-6 hover:border-white/[0.12] transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="text-5xl mb-4">📅</div>
                <p className="text-xs text-slate-500 mb-1">Auto-post to Instagram</p>
                <h3 className="text-xl font-bold text-white mb-1">Smart Scheduling</h3>
                <p className="text-sm text-slate-400">AI generates a full week of content. Approve and auto-publish to Instagram.</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats / Social Proof */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "10K+", label: "Videos Created" },
              { value: "50K+", label: "Images Generated" },
              { value: "99%", label: "Uptime" },
              { value: "4.9★", label: "User Rating" },
            ].map((stat, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-pink-400">
            Ready to create?
          </h2>
          <p className="text-lg text-slate-400 mb-8">
            Join thousands of creators using AI to build their brand. Start free — no credit card required.
          </p>
          <Link
            href="/studio"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold text-lg hover:scale-105 transition-transform shadow-2xl shadow-violet-500/20"
          >
            ✨ Open Studio — It&apos;s Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">Nexora</span>
            <span className="text-slate-500 text-sm">© 2026</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
