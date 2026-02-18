import Link from "next/link";
import Navbar from "./components/navbar";

export default function Home() {
  return (
    <main className="relative min-h-screen text-slate-100 overflow-hidden font-sans">
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 mt-[-80px]">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
            Automate Your <br />
            Instagram Empire.
          </h1>

          <p className="mt-4 text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
            Nexora creates, schedules, and posts viral content for you.
            Stop grinding, start growing.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center items-center">
            <Link href="/dashboard">
              <span className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-8 py-1 text-sm font-medium text-white backdrop-blur-3xl hover:bg-slate-900 transition-colors">
                  Start for Free
                </span>
              </span>
            </Link>

            <Link href="/pricing" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
              View Pricing →
            </Link>
          </div>
        </div>

        {/* Minimal Footer */}
        <footer className="w-full py-6 text-center text-slate-500 text-xs">
          <div className="flex justify-center gap-6 mb-4">
            <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
          </div>
          <p>© 2026 Nexora AI. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
}
