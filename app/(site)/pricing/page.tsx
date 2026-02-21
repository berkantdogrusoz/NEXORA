"use client";

import Link from "next/link";
import Navbar from "@/app/components/navbar";
import { useState } from "react";
import { useRouter } from "next/navigation";

const CHECK = (
  <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const CROSS = (
  <svg className="w-4 h-4 text-slate-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const PLANS = [
  {
    name: "Free",
    price: "₺0",
    period: "/ay",
    subtitle: "Keşfetmek için",
    highlight: false,
    badge: null,
    features: [
      { text: "15 AI kredi / ay", has: true },
      { text: "GPT-4o Mini (Sohbet)", has: true },
      { text: "Zeroscope (Standart Video)", has: true },
      { text: "DALL-E 3 (Görsel Üretim)", has: true },
      { text: "Temel İçerik Takvimi", has: true },
      { text: "GPT-4o / Gemini (Pro Modeller)", has: false },
      { text: "Cinematic HD Video", has: false },
      { text: "Öncelikli Kuyruk", has: false },
    ],
    cta: "Ücretsiz Başla",
    ctaStyle: "border",
    checkoutPlan: null,
  },
  {
    name: "Nexora",
    price: "₺830",
    period: "/ay",
    subtitle: "İçerik üreticileri için",
    highlight: true,
    badge: "En Popüler",
    features: [
      { text: "200 AI kredi / ay", has: true },
      { text: "GPT-4o + Gemini 1.5 Pro", has: true },
      { text: "Tüm Video Modelleri (HD dahil)", has: true },
      { text: "DALL-E 3 (Sınırsız stil)", has: true },
      { text: "Tam İçerik Takvimi", has: true },
      { text: "Instagram Otomatik Paylaşım", has: true },
      { text: "Öncelikli AI Kuyruğu", has: true },
      { text: "E-posta Destek", has: true },
    ],
    cta: "Nexora'ya Geç",
    ctaStyle: "gradient",
    checkoutPlan: "Growth" as const,
  },
  {
    name: "Pro",
    price: "₺1.749",
    period: "/ay",
    subtitle: "Ajanslar ve markalar için",
    highlight: false,
    badge: null,
    features: [
      { text: "1000 AI kredi / ay", has: true },
      { text: "Tüm AI Modelleri (Sınırsız)", has: true },
      { text: "Cinematic Video (En yüksek kalite)", has: true },
      { text: "Premium DALL-E nesiller", has: true },
      { text: "Gelişmiş Analitik", has: true },
      { text: "Çoklu Marka Yönetimi", has: true },
      { text: "API Erişimi", has: true },
      { text: "Öncelikli Destek (7/24)", has: true },
    ],
    cta: "Pro'ya Yükselt",
    ctaStyle: "border",
    checkoutPlan: "Pro" as const,
  },
];

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  const handleCheckout = async (plan: "Growth" | "Pro") => {
    setLoading(plan);
    try {
      const variantId = plan === "Growth"
        ? process.env.NEXT_PUBLIC_LEMON_VARIANT_GROWTH
        : process.env.NEXT_PUBLIC_LEMON_VARIANT_PRO;

      if (!variantId) {
        alert("Fiyatlandırma yapılandırması eksik. Lütfen destek ile iletişime geçin.");
        setLoading(null);
        return;
      }

      const res = await fetch("/api/lemon/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        if (res.status === 401) {
          router.push("/sign-up");
        } else {
          alert("Ödeme başlatılamadı: " + (data.error || "Bilinmeyen hata"));
        }
      }
    } catch {
      alert("Bir şeyler ters gitti.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <main className="relative min-h-screen text-slate-100 bg-black pb-20">
      <Navbar />

      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative pt-36 px-6 max-w-7xl mx-auto text-center">
        <p className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-4">
          Fiyatlandırma
        </p>
        <h1 className="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40 mb-5">
          AI Gücü, Şeffaf Fiyat
        </h1>
        <p className="text-lg text-slate-400 max-w-xl mx-auto mb-16">
          Ücretsiz başla, büyüdükçe yükselt. Gizli ücret yok.
        </p>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PLANS.map((plan, i) => (
            <div
              key={i}
              className={`relative rounded-2xl p-8 flex flex-col text-left transition-all duration-300 ${plan.highlight
                ? "bg-white/[0.04] border-2 border-violet-500/50 shadow-2xl shadow-violet-500/10 scale-[1.02]"
                : "bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.15]"
                }`}
            >
              {/* Most Popular Badge */}
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                  <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-[11px] uppercase font-bold px-4 py-1.5 rounded-full tracking-wider shadow-lg shadow-violet-500/30 whitespace-nowrap">
                    ⭐ {plan.badge}
                  </span>
                </div>
              )}

              {/* Top gradient line for highlighted plan */}
              {plan.highlight && (
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 rounded-t-2xl" />
              )}

              {/* Plan header */}
              <div className="mb-6 pt-2">
                <h3 className={`text-lg font-semibold ${plan.highlight ? "text-violet-300" : "text-slate-300"}`}>
                  {plan.name}
                </h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">{plan.price}</span>
                  <span className="text-sm text-slate-500">{plan.period}</span>
                </div>
                <p className="text-sm text-slate-500 mt-2">{plan.subtitle}</p>
              </div>

              {/* Features */}
              <ul className="space-y-3.5 mb-8 flex-1">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm">
                    {f.has ? CHECK : CROSS}
                    <span className={f.has ? "text-slate-300" : "text-slate-600 line-through"}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              {plan.checkoutPlan ? (
                <button
                  onClick={() => handleCheckout(plan.checkoutPlan!)}
                  disabled={loading === plan.checkoutPlan}
                  className={`mt-auto w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 ${plan.ctaStyle === "gradient"
                    ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:opacity-90 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 hover:scale-[1.02]"
                    : "border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08] hover:border-white/20"
                    }`}
                >
                  {loading === plan.checkoutPlan ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      İşleniyor...
                    </span>
                  ) : plan.cta}
                </button>
              ) : (
                <Link href="/dashboard" className="mt-auto block w-full">
                  <button className="w-full py-3.5 rounded-xl border border-white/10 bg-white/[0.04] text-white font-semibold text-sm hover:bg-white/[0.08] hover:border-white/20 transition-all">
                    {plan.cta}
                  </button>
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* FAQ / Trust Section */}
        <div className="mt-20 max-w-2xl mx-auto text-center">
          <h3 className="text-xl font-bold text-white mb-6">Sıkça Sorulan Sorular</h3>
          <div className="space-y-4 text-left">
            {[
              {
                q: "Kredi nedir?",
                a: "Her AI üretimi belirli kredi harcar. Örneğin: 1 görsel = 5 kredi, 1 video = 12.5 kredi, 1 sohbet mesajı = 0.5 kredi."
              },
              {
                q: "İstediğim zaman iptal edebilir miyim?",
                a: "Evet, aboneliğinizi dilediğiniz zaman iptal edebilirsiniz. Dönem sonuna kadar erişiminiz devam eder."
              },
              {
                q: "Hangi AI modelleri kullanılıyor?",
                a: "GPT-4o, GPT-4o Mini, Gemini 1.5 Pro (sohbet), DALL-E 3 (görsel), Zeroscope & Cinematic HD (video) kullanılmaktadır."
              },
            ].map((faq, i) => (
              <div key={i} className="p-5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <p className="font-semibold text-white text-sm mb-2">{faq.q}</p>
                <p className="text-sm text-slate-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
