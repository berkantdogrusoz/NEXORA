import Link from "next/link";
import Navbar from "@/app/components/navbar";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="orb-bg" aria-hidden="true">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      <Navbar />

      {/* ─── HERO ─── */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
        <span className="pill-badge animate-fade-in-up">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Instagram Marketing on Autopilot
        </span>

        <h1 className="mt-6 text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight animate-fade-in-up stagger-1">
          AI generates & posts to{" "}
          <span className="gradient-text">Instagram for you</span>
        </h1>

        <p className="mt-5 text-lg text-slate-500 max-w-xl mx-auto animate-fade-in-up stagger-2">
          Set up your brand once. Nexora creates stunning visuals, writes captions,
          and posts to Instagram every single day — while you focus on your business.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 animate-fade-in-up stagger-3">
          <Link href="/dashboard" className="btn-primary">
            Start Free →
          </Link>
          <Link href="/pricing" className="btn-secondary">See Pricing</Link>
        </div>

        <p className="mt-4 text-xs text-slate-400 animate-fade-in-up stagger-4">
          No credit card required · 3 free posts per week
        </p>
      </section>

      {/* ─── TRUSTED BY ─── */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 pb-12">
        <div className="glass-card p-4 flex items-center justify-center gap-6 text-xs text-slate-400">
          <span>Trusted by</span>
          <span className="font-semibold text-slate-500">500+</span>
          <span>businesses on Instagram</span>
          <span className="hidden md:inline text-slate-300">|</span>
          <span className="hidden md:flex items-center gap-1">
            <span className="text-amber-400">★★★★★</span>
            <span>4.9/5 rating</span>
          </span>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-semibold text-center mb-3">How it works</h2>
        <p className="text-sm text-slate-400 text-center mb-10">3 steps. 2 minutes. Instagram on autopilot.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { step: "01", icon: "🎯", title: "Set Up Your Brand", desc: "Enter your business name, niche, audience, and tone. Takes 30 seconds." },
            { step: "02", icon: "🤖", title: "AI Creates Content", desc: "Nexora generates 7 Instagram posts with AI visuals, captions, and hashtags — every week." },
            { step: "03", icon: "📸", title: "Approve & Post", desc: "Review your content calendar, approve posts, and Nexora publishes them to Instagram." },
          ].map((s, i) => (
            <div key={s.step} className={`glass-card p-6 text-center animate-fade-in-up stagger-${i + 1}`}>
              <div className="text-3xl mb-3">{s.icon}</div>
              <span className="text-[10px] font-bold gradient-text uppercase tracking-wider">{`Step ${s.step}`}</span>
              <h3 className="font-semibold text-base mt-1">{s.title}</h3>
              <p className="mt-2 text-sm text-slate-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-semibold text-center mb-3">Everything you need to dominate Instagram</h2>
        <p className="text-sm text-slate-400 text-center mb-10">Zero design skills. Zero marketing experience. Just results.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: "🖼️", title: "AI Image Generation", desc: "DALL-E creates stunning, on-brand Instagram visuals for every post. No Canva needed.", link: "/calendar" },
            { icon: "📅", title: "Content Calendar", desc: "See your entire week at a glance. Drag, edit, approve — your Instagram, planned.", link: "/calendar" },
            { icon: "🤖", title: "AI Marketing Assistant", desc: "Chat with a marketing expert that knows YOUR business. Get strategy, captions, hashtags on demand.", link: "/assistant" },
            { icon: "✍️", title: "Smart Captions", desc: "AI writes scroll-stopping captions with hooks, CTAs, emojis, and trending hashtags.", link: "/calendar" },
            { icon: "📊", title: "Performance Dashboard", desc: "Track posts, approvals, streaks, and AI credit usage. Know exactly what your autopilot is doing.", link: "/dashboard" },
            { icon: "📸", title: "Instagram Auto-Post", desc: "Connect your Instagram Business account. Nexora publishes approved content automatically.", link: "/store" },
          ].map((f, i) => (
            <div key={f.title} className={`glass-card p-6 animate-fade-in-up stagger-${(i % 3) + 1}`}>
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-base">{f.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{f.desc}</p>
              <Link href={f.link} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-violet-600 hover:text-violet-700">
                Try it free
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ─── COMPARISON ─── */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-semibold text-center mb-3">Why switch to Nexora?</h2>
        <p className="text-sm text-slate-400 text-center mb-8">Other tools make you do the work. Nexora does it for you.</p>
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/[0.06]">
                <th className="p-4 text-left text-slate-400 font-medium">Feature</th>
                <th className="p-4 text-center text-slate-400 font-medium">Buffer / Later</th>
                <th className="p-4 text-center font-medium gradient-text">Nexora</th>
              </tr>
            </thead>
            <tbody>
              {[
                { feature: "AI writes your captions", others: "❌", nexora: "✅" },
                { feature: "AI creates your images", others: "❌", nexora: "✅" },
                { feature: "Weekly content plan (auto)", others: "❌", nexora: "✅" },
                { feature: "AI marketing assistant", others: "❌", nexora: "✅" },
                { feature: "Auto-post to Instagram", others: "✅", nexora: "✅" },
                { feature: "Content calendar", others: "✅", nexora: "✅" },
                { feature: "Starting price", others: "$15/mo", nexora: "Free" },
              ].map(r => (
                <tr key={r.feature} className="border-b border-black/[0.04] last:border-0">
                  <td className="p-4 text-slate-600">{r.feature}</td>
                  <td className="p-4 text-center text-slate-400">{r.others}</td>
                  <td className="p-4 text-center text-emerald-500 font-medium">{r.nexora}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ─── PRICING PREVIEW ─── */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-semibold text-center mb-3">Simple, transparent pricing</h2>
        <p className="text-sm text-slate-400 text-center mb-8">Start free. Upgrade when you&apos;re ready to grow.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card p-6 text-center">
            <div className="text-sm text-slate-400 font-medium mb-1">Starter</div>
            <div className="text-3xl font-bold">$0</div>
            <div className="text-xs text-slate-400 mt-1">forever free</div>
            <ul className="mt-4 space-y-2 text-sm text-slate-500">
              <li>3 posts/week (text only)</li>
              <li>10 AI assistant messages/day</li>
              <li>1 brand</li>
            </ul>
            <Link href="/dashboard" className="mt-5 block btn-secondary text-sm">Get Started</Link>
          </div>

          <div className="glass-card p-6 text-center gradient-border relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-violet-500 to-blue-500 text-white">Most Popular</span>
            </div>
            <div className="text-sm text-slate-400 font-medium mb-1">Growth</div>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-3xl font-bold">$19</span>
              <span className="text-sm text-slate-400">/mo</span>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-slate-500">
              <li>7 posts/week + AI images</li>
              <li>50 AI messages/day</li>
              <li>3 brands + auto-post</li>
            </ul>
            <Link href="/pricing" className="mt-5 block btn-primary text-sm">Start Free Trial</Link>
          </div>

          <div className="glass-card p-6 text-center">
            <div className="text-sm text-slate-400 font-medium mb-1">Pro</div>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-3xl font-bold">$49</span>
              <span className="text-sm text-slate-400">/mo</span>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-slate-500">
              <li>Unlimited posts + DALL-E</li>
              <li>Unlimited AI messages</li>
              <li>10 brands + priority AI</li>
            </ul>
            <Link href="/pricing" className="mt-5 block btn-secondary text-sm">Contact Sales</Link>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 pb-20 text-center">
        <div className="glass-card p-10 bg-gradient-to-br from-violet-50/50 to-blue-50/50">
          <h2 className="text-2xl font-bold mb-2">Stop wasting hours on Instagram</h2>
          <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
            Let AI create your content, write your captions, and post for you.
            Set up in 2 minutes. Your first week is free.
          </p>
          <Link href="/dashboard" className="btn-primary text-base py-3 px-8">
            Start Your Autopilot →
          </Link>
          <p className="mt-3 text-xs text-slate-400">No credit card required</p>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-10 border-t border-black/[0.06]">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-slate-400">
          <div>&copy; {new Date().getFullYear()} Nexora AI · Instagram Marketing Autopilot</div>
          <div className="flex items-center gap-5">
            <Link href="/dashboard" className="hover:text-slate-600 transition-colors">Dashboard</Link>
            <Link href="/calendar" className="hover:text-slate-600 transition-colors">Calendar</Link>
            <Link href="/assistant" className="hover:text-slate-600 transition-colors">Assistant</Link>
            <Link href="/pricing" className="hover:text-slate-600 transition-colors">Pricing</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
