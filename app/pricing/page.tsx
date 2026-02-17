import Link from "next/link";
import Navbar from "@/app/components/navbar";

const CHECK = (
  <svg className="w-4 h-4 text-violet-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const CROSS = (
  <svg className="w-4 h-4 text-slate-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default function PricingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="orb-bg" aria-hidden="true">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>
      <Navbar />

      <section className="relative z-10 max-w-4xl mx-auto px-6 pt-16 pb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight animate-fade-in-up">
          Simple <span className="gradient-text">pricing</span>
        </h1>
        <p className="mt-3 text-slate-500 animate-fade-in-up stagger-1">
          Start free. Upgrade when your Instagram grows.
        </p>
      </section>

      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Starter */}
          <div className="glass-card p-7 animate-fade-in-up stagger-1">
            <div className="text-sm text-slate-400 font-medium">Starter</div>
            <div className="mt-1 text-3xl font-bold">$0</div>
            <div className="text-xs text-slate-400 mt-0.5">forever free</div>
            <ul className="mt-5 space-y-2.5">
              {[
                { text: "3 posts per week (text only)", has: true },
                { text: "10 AI assistant messages/day", has: true },
                { text: "1 brand", has: true },
                { text: "Content calendar (view only)", has: true },
                { text: "AI image generation", has: false },
                { text: "Instagram auto-post", has: false },
              ].map((f) => (
                <li key={f.text} className="flex items-center gap-2 text-sm text-slate-600">
                  {f.has ? CHECK : CROSS}
                  <span className={!f.has ? "text-slate-400" : ""}>{f.text}</span>
                </li>
              ))}
            </ul>
            <Link href="/dashboard" className="mt-6 w-full btn-secondary block text-center">
              Get Started
            </Link>
          </div>

          {/* Growth */}
          <div className="glass-card p-7 gradient-border animate-fade-in-up stagger-2 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-violet-500 to-blue-500 text-white">
                Most Popular
              </span>
            </div>
            <div className="text-sm text-slate-400 font-medium">Growth</div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-3xl font-bold">$19</span>
              <span className="text-sm text-slate-400">/mo</span>
            </div>
            <div className="text-xs text-emerald-500 mt-0.5">Save $48/yr with annual</div>
            <ul className="mt-5 space-y-2.5">
              {[
                { text: "7 posts per week + AI images", has: true },
                { text: "50 AI assistant messages/day", has: true },
                { text: "3 brands", has: true },
                { text: "Full content calendar", has: true },
                { text: "DALL-E image generation", has: true },
                { text: "Instagram auto-post", has: true },
              ].map((f) => (
                <li key={f.text} className="flex items-center gap-2 text-sm text-slate-600">
                  {f.has ? CHECK : CROSS}
                  <span className={!f.has ? "text-slate-400" : ""}>{f.text}</span>
                </li>
              ))}
            </ul>
            <button className="mt-6 w-full btn-primary block text-center">
              Start Free Trial
            </button>
          </div>

          {/* Pro */}
          <div className="glass-card p-7 animate-fade-in-up stagger-3">
            <div className="text-sm text-slate-400 font-medium">Pro</div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-3xl font-bold">$49</span>
              <span className="text-sm text-slate-400">/mo</span>
            </div>
            <div className="text-xs text-emerald-500 mt-0.5">Best value for agencies</div>
            <ul className="mt-5 space-y-2.5">
              {[
                { text: "Unlimited posts + AI images", has: true },
                { text: "Unlimited AI messages", has: true },
                { text: "10 brands", has: true },
                { text: "Full content calendar", has: true },
                { text: "Premium DALL-E images", has: true },
                { text: "Priority AI (GPT-4.1)", has: true },
              ].map((f) => (
                <li key={f.text} className="flex items-center gap-2 text-sm text-slate-600">
                  {f.has ? CHECK : CROSS}
                  <span className={!f.has ? "text-slate-400" : ""}>{f.text}</span>
                </li>
              ))}
            </ul>
            <button className="mt-6 w-full btn-secondary block text-center">
              Start Free Trial
            </button>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-16">
        <h2 className="text-xl font-semibold text-center mb-6">Compare plans</h2>
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/[0.06]">
                <th className="p-4 text-left text-slate-400 font-medium">Feature</th>
                <th className="p-4 text-center text-slate-400 font-medium">Starter</th>
                <th className="p-4 text-center font-medium gradient-text">Growth</th>
                <th className="p-4 text-center text-slate-400 font-medium">Pro</th>
              </tr>
            </thead>
            <tbody>
              {[
                { feature: "Posts per week", starter: "3", growth: "7", pro: "∞" },
                { feature: "AI assistant", starter: "10/day", growth: "50/day", pro: "∞" },
                { feature: "Brands", starter: "1", growth: "3", pro: "10" },
                { feature: "AI images", starter: "—", growth: "✅", pro: "✅ Premium" },
                { feature: "Auto-post", starter: "—", growth: "✅", pro: "✅" },
                { feature: "Content calendar", starter: "View only", growth: "Full", pro: "Full + Bulk" },
                { feature: "AI model", starter: "GPT-4.1 Mini", growth: "GPT-4.1 Mini", pro: "GPT-4.1" },
                { feature: "Support", starter: "—", growth: "Email", pro: "Priority" },
              ].map(r => (
                <tr key={r.feature} className="border-b border-black/[0.04] last:border-0">
                  <td className="p-4 text-slate-600 font-medium">{r.feature}</td>
                  <td className="p-4 text-center text-slate-400">{r.starter}</td>
                  <td className="p-4 text-center text-violet-600 font-medium">{r.growth}</td>
                  <td className="p-4 text-center text-slate-500">{r.pro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 pb-20">
        <h2 className="text-xl font-semibold text-center mb-6">Frequently asked questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { q: "Can I really use it for free?", a: "Yes! The Starter plan gives you 3 posts per week and 10 AI messages per day, forever free." },
            { q: "What counts as a post?", a: "Each post includes an AI-generated caption, hashtags, and (on Growth+) an AI image. One post = one Instagram publish." },
            { q: "How does auto-post work?", a: "Connect your Instagram Business account via Graph API. Nexora publishes approved content at the best time automatically." },
            { q: "Can I cancel anytime?", a: "Yes, no contracts. Cancel your subscription anytime and keep using the free plan. Your content library stays." },
            { q: "What AI creates the images?", a: "We use DALL-E 3 by OpenAI to generate Instagram-optimized visuals (1024×1024) tailored to your brand." },
            { q: "Do I own the content?", a: "Yes. All AI-generated captions, images, and hashtags are yours. Full commercial rights included." },
          ].map((faq) => (
            <div key={faq.q} className="glass-card p-5">
              <div className="font-medium text-sm">{faq.q}</div>
              <p className="mt-1.5 text-sm text-slate-500">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 pb-20 text-center">
        <div className="glass-card p-10 bg-gradient-to-br from-violet-50/50 to-blue-50/50">
          <h2 className="text-2xl font-bold mb-2">Ready to grow your Instagram?</h2>
          <p className="text-sm text-slate-500 mb-6">Start free today. Your first week of AI-powered content is on us.</p>
          <Link href="/dashboard" className="btn-primary text-base py-3 px-8">
            Get Started Free →
          </Link>
        </div>
      </section>

      <footer className="relative z-10 border-t border-black/[0.06]">
        <div className="max-w-6xl mx-auto px-6 py-8 text-sm text-slate-400 flex flex-col md:flex-row items-center justify-between gap-3">
          <div>&copy; {new Date().getFullYear()} Nexora AI</div>
          <div className="flex items-center gap-5">
            <Link href="/" className="hover:text-slate-600 transition-colors">Home</Link>
            <Link href="/dashboard" className="hover:text-slate-600 transition-colors">Dashboard</Link>
            <Link href="/calendar" className="hover:text-slate-600 transition-colors">Calendar</Link>
            <Link href="/terms" className="hover:text-slate-600 transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-slate-600 transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
