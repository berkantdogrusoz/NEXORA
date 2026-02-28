"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Sparkles, Video, Image as ImageIcon, Zap, Layers, Wand2, PlayCircle } from "lucide-react";

export default function Home() {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });

  const bannerY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const bannerOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div className="relative min-h-screen bg-[#000000] text-white selection:bg-blue-500/30 overflow-hidden font-sans">

      {/* ── Background Noise Texture ── */}
      <div
        className="fixed inset-0 pointer-events-none z-50 opacity-[0.015] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ═══════ HERO SECTION ═══════ */}
      <section className="relative min-h-[100vh] flex flex-col justify-center px-6 overflow-hidden" ref={targetRef}>

        {/* Dynamic Video Banner Background */}
        <motion.div
          className="absolute inset-0 z-0"
          style={{ y: bannerY, opacity: bannerOpacity }}
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-40 mix-blend-screen scale-105"
          >
            {/* High quality cinematic placeholder */}
            <source src="https://videos.pexels.com/video-files/3129595/3129595-uhd_3840_2160_30fps.mp4" type="video/mp4" />
          </video>
          {/* Intense vignette and bottom fade */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)] opacity-80 pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-[40vh] bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none" />
        </motion.div>

        <div className="relative z-10 max-w-[1400px] mx-auto w-full pt-32">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left huge text */}
            <motion.div
              className="lg:col-span-8"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="text-6xl sm:text-7xl md:text-[7rem] lg:text-[8.5rem] font-black tracking-tighter leading-[0.85] mb-8 text-white w-full uppercase">
                Create Media <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/40">
                  Without Limits
                </span>
              </h1>
              <p className="text-lg md:text-xl text-white/60 max-w-2xl leading-relaxed font-medium mb-12">
                Generate high-quality cinematic videos and stunning images from simple prompts. Unmatched aesthetic control, powered by Seedance 2.0 and DALL-E 3.
              </p>

              <div className="flex flex-col sm:flex-row items-start gap-4">
                <Link
                  href="/generate"
                  className="group px-8 py-4 rounded-full bg-white text-black font-bold text-sm hover:scale-[1.02] transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.15)] flex items-center gap-2"
                >
                  Start creating today
                  <Sparkles className="w-4 h-4 ml-1" />
                </Link>
                <Link
                  href="/studio"
                  className="px-8 py-4 rounded-full text-sm font-bold text-white border border-white/20 hover:bg-white/10 transition-colors"
                >
                  Explore Video Studio
                </Link>
              </div>
            </motion.div>

            {/* Right side floating cards/UI mockups */}
            <motion.div
              className="lg:col-span-4 hidden lg:flex flex-col gap-6"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shrink-0">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-white/50 font-bold uppercase tracking-wider">Now Available</p>
                    <p className="text-sm font-bold text-white">Seedance 2.0 API</p>
                  </div>
                </div>
                <p className="text-sm text-white/70 leading-relaxed">
                  Experience director-level camera control and true native audio generation in one prompt.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shrink-0 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="flex items-center gap-3 mb-4 relative z-10">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-white/50 font-bold uppercase tracking-wider">Image Gen</p>
                    <p className="text-sm font-bold text-white">DALL-E 3 Mastery</p>
                  </div>
                </div>
                <p className="text-sm text-white/70 leading-relaxed relative z-10">
                  Flawless prompt adherence and absolute fidelity for concept art, assets, and photography.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════ STICKY SCROLL SECTION ═══════ */}
      <section className="relative px-6 py-24 md:py-32">
        <div className="max-w-[1400px] mx-auto min-h-[150vh] relative">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 relative">
            {/* STICKY LEFT SIDE */}
            <div className="lg:sticky lg:top-48 h-fit self-start mb-16 lg:mb-0">
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9] mb-6"
              >
                Bring Visuals<br />
                <span className="text-blue-400">Into Motion</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-lg text-white/60 leading-relaxed max-w-md mb-10"
              >
                Turn static ideas into dynamic video content with AI-driven animation and motion tools designed for storytelling and cinematic experiences.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Link href="/studio" className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-white/20 hover:bg-white text-sm font-bold group transition-all duration-300">
                  <span className="group-hover:text-black transition-colors">Start Video Studio</span>
                  <div className="w-8 h-8 rounded-full bg-white group-hover:bg-black flex items-center justify-center transition-colors">
                    <PlayCircle className="w-4 h-4 text-black group-hover:text-white ml-0.5" />
                  </div>
                </Link>
              </motion.div>
            </div>

            {/* SCROLLING RIGHT SIDE */}
            <div className="space-y-8 md:space-y-16">
              {/* Card 1 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-200px" }}
                transition={{ duration: 0.8 }}
                className="group relative aspect-video bg-[#0a0a0a] rounded-3xl overflow-hidden border border-white/5"
              >
                <Image
                  src="https://images.unsplash.com/photo-1614729939124-032d1e6c9945?w=1200&q=80"
                  alt="Fashion Video Preview"
                  fill
                  className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="inline-flex px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-white uppercase tracking-wider mb-3">
                    Seedance 2.0
                  </div>
                  <h3 className="text-2xl font-bold text-white">Cinematic Fashion Editorials</h3>
                </div>
              </motion.div>

              {/* Card 2 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-200px" }}
                transition={{ duration: 0.8 }}
                className="group relative aspect-square md:aspect-video bg-[#0a0a0a] rounded-3xl overflow-hidden border border-white/5"
              >
                <Image
                  src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&q=80"
                  alt="AI Robot Preview"
                  fill
                  className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="inline-flex px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-white uppercase tracking-wider mb-3">
                    Seedance 2.0
                  </div>
                  <h3 className="text-2xl font-bold text-white">Complex Character Motion</h3>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ DARK TYPOGRAPHY BREAK ═══════ */}
      <section className="px-6 py-24 md:py-40 bg-[#050505] border-y border-white/[0.03]">
        <div className="max-w-[1400px] mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-6xl md:text-8xl lg:text-[10rem] font-black uppercase tracking-tighter leading-[0.8] text-[#111]"
          >
            Elevate <br />
            Quality <br />
            At Any <br />
            Size
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-white/60 max-w-2xl mx-auto mt-12 text-lg lg:text-xl font-medium"
          >
            Boost resolution and clarity without sacrificing detail, preparing assets for print, high-resolution displays, and professional delivery.
          </motion.p>
        </div>
      </section>

      {/* ═══════ TOP AI MODELS SHOWCASE ═══════ */}
      <section className="px-6 py-24 md:py-32 border-t border-white/[0.05]">
        <div className="max-w-[1400px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-4">Top-Tier AI Models</p>
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9] mb-6">
              Powered By <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">The Best</span>
            </h2>
            <p className="text-white/50 max-w-2xl mx-auto text-lg">
              Access the world&apos;s most advanced AI models — from cinematic video to photorealistic image generation.
            </p>
          </motion.div>

          {/* Large Visual Model Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Seedance 2.0", type: "Video", desc: "Cinematic motion, unmatched quality.", img: "/arts/nexora-1772284253224.mp4", gradient: "from-amber-600/80 to-orange-600/80", link: "/studio" },
              { name: "Kling 3.0", type: "Video", desc: "Fast, sharp, and stunning video creation.", img: "/arts/nexora-1772284437767.mp4", gradient: "from-cyan-600/80 to-blue-600/80", link: "/studio" },
              { name: "Runway Gen-4.5", type: "Video", desc: "Hollywood-grade generation & fidelity.", img: "/arts/nexora-1772284673051.mp4", gradient: "from-purple-600/80 to-pink-600/80", link: "/studio" },
              { name: "Nano Banana 2", type: "Image", desc: "Google's flagship image generation.", img: "/arts/nexora-1772282772787.png", gradient: "from-yellow-500/80 to-amber-600/80", link: "/generate" },
              { name: "DALL-E 3", type: "Image", desc: "Precise prompt adherence with HD quality.", img: "/arts/nexora-1772283081135.png", gradient: "from-emerald-600/80 to-teal-600/80", link: "/generate" },
              { name: "Luma Ray 2", type: "Video", desc: "Surreal visuals & fluid motion design.", img: "/arts/nexora-1772283133285.png", gradient: "from-indigo-600/80 to-violet-600/80", link: "/studio" },
            ].map((model, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <Link href={model.link} className="group block">
                  {/* Media Card */}
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4 bg-white/5">
                    {model.img.endsWith('.mp4') ? (
                      <video
                        src={model.img}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <Image
                        src={model.img}
                        alt={model.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    )}
                    {/* Gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-t ${model.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    {/* Type badge */}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest text-white border border-white/20">
                        {model.type}
                      </span>
                    </div>
                    {/* Try button on hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="px-6 py-2.5 rounded-full bg-white text-black font-bold text-sm shadow-2xl">
                        Try {model.name} →
                      </span>
                    </div>
                  </div>
                  {/* Model Info */}
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors mb-1">
                      {model.name}
                    </h3>
                    <p className="text-sm text-white/40">{model.desc}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="text-center mt-12"
          >
            <Link
              href="/studio"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white/5 border border-white/10 text-sm font-bold text-white hover:bg-white/10 hover:border-white/20 transition-all"
            >
              Explore All Models
              <Sparkles className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>


      {/* ═══════ IMAGE GENERATION SHOWCASE ═══════ */}
      <section className="px-6 py-24 md:py-32">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-4">
                Image <br />Generation
              </h2>
              <p className="text-white/50 max-w-md text-lg">
                DALL-E 3 unlocks unprecedented prompt adherence and lighting control.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Link href="/generate" className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-white text-black font-bold text-sm hover:scale-[1.02] transition-transform">
                Try Image Generator
              </Link>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { img: "https://images.unsplash.com/photo-1634926878768-2a5b3c42f139?w=800&q=80", title: "Cyberpunk Art", tag: "DALL-E 3" },
              { img: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&q=80", title: "Neon Noir", tag: "Photography" },
              { img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80", title: "Abstract Light", tag: "Digital Art" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="group relative aspect-[4/5] bg-black rounded-3xl overflow-hidden border border-white/10"
              >
                <Image src={item.img} alt={item.title} fill className="object-cover opacity-70 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700" />
                <div className="absolute top-6 left-6">
                  <span className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest text-white border border-white/10">
                    {item.tag}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CAPABILITY GRID ═══════ */}
      <section className="px-6 py-24 border-t border-white/[0.05]">
        <div className="max-w-[1400px] mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black mb-16 text-center"
          >
            THE ENGINE ROOM
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: "Lightning Fast", desc: "Our serverless architecture renders your ideas in seconds, not hours." },
              { icon: Wand2, title: "Prompt Adherence", desc: "Advanced LLM pre-processing ensures the models follow your exact instructions." },
              { icon: Layers, title: "Multi-Model Native", desc: "Switch instantly between top-tier models like Seedance, Luma, and DALL-E." },
            ].map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-10 rounded-3xl border border-white/[0.05] bg-white/[0.02]"
              >
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                  <feat.icon className="w-6 h-6 text-white/80" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feat.title}</h3>
                <p className="text-white/50 leading-relaxed font-medium">
                  {feat.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="border-t border-white/[0.06] px-6 py-12 bg-black">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-xl tracking-tighter text-white">NEXORA.AI</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 text-xs font-bold uppercase tracking-widest text-white/50">
            <Link href="/generate" className="hover:text-white transition-colors">Images</Link>
            <Link href="/studio" className="hover:text-white transition-colors">Video</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          </div>
          <div className="text-white/30 text-xs font-medium">
            © 2026 NEXORA INC.
          </div>
        </div>
      </footer>
    </div>
  );
}
