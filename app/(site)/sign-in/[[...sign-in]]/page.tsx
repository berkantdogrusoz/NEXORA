import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { clerkAuthCardAppearance } from "@/lib/clerk-appearance";

export default function SignInPage() {
    return (
        <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#06080d] px-4 py-10">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-24 left-1/2 h-[340px] w-[680px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
                <div className="absolute -bottom-24 right-[-120px] h-[300px] w-[380px] rounded-full bg-blue-500/15 blur-3xl" />
                <div className="absolute -bottom-24 left-[-140px] h-[280px] w-[320px] rounded-full bg-emerald-500/10 blur-3xl" />
            </div>

            <div className="relative z-10 w-full max-w-[1100px] rounded-3xl border border-white/10 bg-black/40 p-4 shadow-[0_30px_100px_rgba(0,0,0,0.55)] backdrop-blur-xl md:grid md:grid-cols-[1.1fr,1fr] md:p-8">
                <section className="hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#0c1523] to-[#090d16] p-8 md:flex md:flex-col md:justify-between">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300/90">Nexora</p>
                        <h1 className="mt-4 text-4xl font-black leading-tight text-white">
                            Studioya geri don,
                            <br />
                            <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-blue-400 bg-clip-text text-transparent">
                                uretime devam et.
                            </span>
                        </h1>
                        <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-300">
                            Tum projelerin, API anahtarlarin ve paketlerin tek panelde. Hesabina girip kaldigin yerden devam et.
                        </p>
                    </div>

                    <div className="space-y-2 text-xs text-slate-400">
                        <p>Secure login with Clerk</p>
                        <p>Need an account? <Link href="/sign-up" className="text-cyan-300 hover:text-cyan-200">Create one now</Link></p>
                    </div>
                </section>

                <section className="flex items-center justify-center p-2 md:p-6">
                    <SignIn
                        routing="path"
                        path="/sign-in"
                        signUpUrl="/sign-up"
                        appearance={clerkAuthCardAppearance}
                    />
                </section>
            </div>
        </main>
    );
}
